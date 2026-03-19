import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Download, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancingPlan {
  id: string;
  plan_name: string;
  tran_code: string | null;
  promotional_offer: string;
  interest_rate: number;
  payment_factor: number;
  months_to_payoff: number | null;
  contractor_fee: number;
  is_active: boolean;
  sort_order: number;
  notes: string | null;
}

const fmtCur = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtFactor = (n: number) => `${(n * 100).toFixed(3)}%`;

// Full Synchrony disclosure text per plan code
const PLAN_DISCLOSURES: Record<string, { intro: string; disc: string }> = {
  "943": {
    intro: "On qualifying purchases with your Synchrony Bank credit card. A $29 account activation fee may apply. Fixed monthly payments equal to 1.25% of promo purchase amount until paid in full.",
    disc: "*Interest will be charged on promo purchase from the purchase date at a reduced 9.99% APR and fixed monthly payments are required equal to 1.25% of initial promo purchase amount until promo is paid in full. The fixed monthly payment will be rounded to the next highest whole dollar and may be higher than the minimum payment that would be required if the purchase was a non-promotional purchase. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
  },
  "960": {
    intro: "On qualifying purchases with your Synchrony Bank credit card. A $29 account activation fee may apply. Fixed monthly payments equal to 1.75% of promo purchase amount until paid in full.",
    disc: "*Interest will be charged on promo purchase from the purchase date at a reduced 3.99% APR and fixed monthly payments are required equal to 1.75% of initial promo purchase amount until promo is paid in full. The fixed monthly payment will be rounded to the next highest whole dollar and may be higher than the minimum payment that would be required if the purchase was a non-promotional purchase. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
  },
  "980": {
    intro: "On qualifying purchases with your Synchrony Bank credit card. $29 account activation fee may apply. Fixed monthly payments equal to 3.00% of promo purchase amount until paid in full.",
    disc: "*Interest will be charged on promo purchase from the purchase date at a reduced 5.99% APR and fixed monthly payments are required equal to 3.00% of initial promo purchase amount until promo is paid in full. The fixed monthly payment will be rounded to the next highest whole dollar and may be higher than the minimum payment that would be required if the purchase was a non-promotional purchase. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
  },
  "924": {
    intro: "On qualifying purchases with your Synchrony Bank credit card. A $29 account activation fee may apply. No monthly interest if paid in full within the promotional period. Fixed monthly payments equal to 2.50% of promo purchase amount.",
    disc: "*If the promotional purchase balance (including applicable fees) is not paid in full within the promotional period, interest will be assessed on the promotional purchase from the purchase date. The required minimum monthly payment equals 2.50% of the amount financed. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
  },
  "933": {
    intro: "On qualifying purchases with your Synchrony Bank credit card. A $29 account activation fee may apply. 0% interest for 60 months. Fixed monthly payments equal to 1.67% of promo purchase amount until paid in full.",
    disc: "*0% APR for 60 months. Fixed monthly payments are required equal to 1.67% of initial promo purchase amount until promo is paid in full. The fixed monthly payment will be rounded to the next highest whole dollar and may be higher than the minimum payment that would be required if the purchase was a non-promotional purchase. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
  },
  "920": {
    intro: "On qualifying purchases with your Synchrony Bank credit card. A $29 account activation fee may apply. No interest if paid in full within 37 months. Fixed monthly payments equal to 2.50% of promo purchase amount until paid in full.",
    disc: "*If the promotional purchase balance (including applicable fees) is not paid in full within 37 months, interest will be assessed on the promotional purchase from the purchase date at the standard purchase APR. Fixed monthly payments are required equal to 2.50% of initial promo purchase amount. The fixed monthly payment will be rounded to the next highest whole dollar. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
  },
};

// Fallback disclosure for plans not in the hardcoded map
const DEFAULT_DISCLOSURE = {
  intro: "On qualifying purchases with your Synchrony Bank credit card. A $29 account activation fee may apply.",
  disc: "*Subject to credit approval. Minimum monthly payments required. Regular account terms apply to non-promotional purchases. For new accounts: Purchase APR is 26.99%; Minimum Interest Charge is $2. One-time Account Activation Fee of $29 charged at time of first purchase posts to account. Existing cardholders should see their credit card agreement for their applicable terms. Subject to credit approval.",
};

export const SynchronyDisclosureGenerator = () => {
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [billStreet, setBillStreet] = useState("");
  const [billCity, setBillCity] = useState("");
  const [billState, setBillState] = useState("");
  const [billZip, setBillZip] = useState("");
  const [sameAddr, setSameAddr] = useState(true);
  const [jobStreet, setJobStreet] = useState("");
  const [jobCity, setJobCity] = useState("");
  const [jobState, setJobState] = useState("");
  const [jobZip, setJobZip] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  const { data: plans = [] } = useQuery({
    queryKey: ["financing_options_disclosure"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financing_options")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as FinancingPlan[];
    },
  });

  const amountNum = useMemo(() => {
    const v = parseFloat(amount);
    return isNaN(v) ? 0 : v;
  }, [amount]);

  const togglePlan = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else if (next.size < 3) {
        next.add(code);
      }
      return next;
    });
  };

  const generatePDF = () => {
    if (!amountNum || !customerName.trim() || !billStreet.trim() || !billCity.trim() || !billZip.trim() || selectedCodes.size === 0) {
      toast.error("Please fill in all required fields and select at least one financing plan.");
      return;
    }

    const selPlans = plans.filter((p) => selectedCodes.has(p.tran_code || ""));
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const W = 612, H = 792, ML = 50, MR = 50, CW = W - ML - MR;
    const NAVY = [11, 31, 58] as const;
    const GOLD = [201, 168, 76] as const;
    const WHITE = [255, 255, 255] as const;
    const DGRAY = [60, 60, 60] as const;
    const GRAY = [110, 120, 140] as const;
    const LGRAY = [210, 215, 225] as const;
    const OFFWHT = [248, 249, 251] as const;

    const setColor = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const setFill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const setDraw = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);

    const drawHeader = () => {
      setFill(NAVY); doc.rect(0, 0, W, 70, "F");
      setFill(GOLD); doc.rect(0, 70, W, 3, "F");

      // Logo dots
      const sx = ML, sy = 18, gX = 7, gY = 7, dotR = 2.8;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          setFill(GOLD);
          doc.circle(sx + c * gX, sy + r * gY, dotR, "F");
        }
      }

      doc.setFont("helvetica", "bold"); doc.setFontSize(17); setColor(WHITE);
      doc.text("truficient", ML + 37, 32);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.setTextColor(201, 168, 76);
      doc.text("ENERGY SOLUTIONS", ML + 37, 46);
      doc.setTextColor(180, 148, 60);
      doc.text("TACLB77247C", ML + 37, 58);

      doc.setFont("helvetica", "bold"); doc.setFontSize(13); setColor(WHITE);
      doc.text("SYNCHRONY", W - MR - 55, 28, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); setColor(GOLD);
      doc.text("FINANCING DISCLOSURE", W - MR - 55, 40, { align: "right" });
      doc.setFont("helvetica", "italic"); doc.setFontSize(8);
      doc.setTextColor(180, 148, 60);
      doc.text("Subject to credit approval", W - MR - 55, 52, { align: "right" });
    };

    const drawFooter = () => {
      setDraw(GOLD); doc.setLineWidth(0.5);
      doc.line(ML, H - 48, W - MR, H - 48);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); setColor(GRAY);
      doc.text("www.truficient.com", ML, H - 32);
      doc.text("TACLB77247C", ML + 120, H - 32);
      doc.text("info@truficient.com", ML + 220, H - 32);
      doc.setFont("helvetica", "bold");
      doc.text("Financing provided by Synchrony Bank", W - MR, H - 32, { align: "right" });
    };

    const textBlock = (text: string, x: number, y: number, maxW: number, size?: number, style?: string, color?: readonly number[], lineH?: number) => {
      doc.setFont("helvetica", style || "normal");
      doc.setFontSize(size || 10);
      setColor(color || DGRAY);
      const lines = doc.splitTextToSize(text, maxW);
      doc.text(lines, x, y);
      return y + lines.length * (lineH || 13.5);
    };

    const hLine = (y: number, color?: readonly number[], thick?: number) => {
      setDraw(color || LGRAY); doc.setLineWidth(thick || 0.5);
      doc.line(ML, y, W - MR, y);
    };

    // === PAGE 1: COVER ===
    drawHeader();
    let y = 88;

    doc.setFont("helvetica", "bold"); doc.setFontSize(21); setColor(NAVY);
    doc.text("Synchrony Financing Information", ML, y); y += 8;
    setDraw(GOLD); doc.setLineWidth(2.5);
    doc.line(ML, y, W - MR, y); y += 16;

    doc.setFont("helvetica", "italic"); doc.setFontSize(11); setColor(GRAY);
    doc.text("High-Efficiency Heat Pump & HVAC System", ML, y); y += 22;

    // Customer info box
    const finalJobStreet = sameAddr ? billStreet : (jobStreet || billStreet);
    const finalJobCity = sameAddr ? billCity : (jobCity || billCity);
    const finalJobState = sameAddr ? billState : (jobState || billState);
    const finalJobZip = sameAddr ? billZip : (jobZip || billZip);

    const boxH = sameAddr ? 66 : 88;
    setFill(OFFWHT); setDraw(LGRAY); doc.setLineWidth(0.5);
    doc.roundedRect(ML, y, CW, boxH, 4, 4, "FD");
    setFill(GOLD); doc.rect(ML + 14, y + 10, 2, boxH - 20, "F");

    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); setColor(GRAY);
    doc.text("CUSTOMER", ML + 24, y + 20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); setColor([20, 20, 20]);
    doc.text(customerName, ML + 90, y + 20);

    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); setColor(GRAY);
    doc.text("BILLING", ML + 24, y + 38);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); setColor([20, 20, 20]);
    doc.text(`${billStreet}, ${billCity}, ${billState.toUpperCase()} ${billZip}`, ML + 62, y + 38);

    if (!sameAddr) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); setColor(GRAY);
      doc.text("JOB SITE", ML + 24, y + 56);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); setColor([20, 20, 20]);
      doc.text(`${finalJobStreet}, ${finalJobCity}, ${finalJobState.toUpperCase()} ${finalJobZip}`, ML + 67, y + 56);
    }
    y += boxH + 14;

    // Disclaimer
    const discNote = "All monthly payments shown are an estimate only. Actual monthly fixed or equal payments will be rounded to the next highest whole dollar.";
    y = textBlock(discNote, ML, y, CW, 9, "italic", GRAY, 12) + 10;

    // Amount financed hero
    setFill(NAVY); doc.roundedRect(ML, y, CW, 52, 5, 5, "F");
    setFill(GOLD); doc.rect(ML + 14, y + 10, 3, 32, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); setColor(WHITE);
    doc.text("Total Amount Financed:", ML + 26, y + 22);
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); setColor(GOLD);
    doc.text(fmtCur(amountNum), ML + 26, y + 44);
    y += 68;

    // Plans section
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); setColor(NAVY);
    doc.text("Plans Available with this Purchase", ML, y); y += 6;
    setDraw(GOLD); doc.setLineWidth(2);
    doc.line(ML, y, ML + 250, y); y += 16;

    selPlans.forEach((plan, i) => {
      const monthly = Math.ceil(amountNum * plan.payment_factor);
      const total = plan.months_to_payoff ? monthly * plan.months_to_payoff : null;
      const code = plan.tran_code || "";
      const disclosure = PLAN_DISCLOSURES[code] || DEFAULT_DISCLOSURE;

      if (i % 2 === 0) { setFill(OFFWHT); doc.rect(ML, y - 4, CW, 76, "F"); }

      setFill(NAVY); doc.roundedRect(ML, y - 2, CW, 22, 3, 3, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); setColor(WHITE);
      doc.text(`Plan ${code}  —  ${plan.promotional_offer}`, ML + 10, y + 13); y += 26;

      y = textBlock(disclosure.intro, ML + 10, y, CW - 20, 9.5, "normal", DGRAY, 12.5) + 6;

      setFill(GOLD); doc.rect(ML + 10, y, 2.5, 38, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); setColor(GRAY);
      doc.text("ESTIMATED MONTHLY PAYMENT", ML + 20, y + 10);
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); setColor(NAVY);
      doc.text(fmtCur(monthly), ML + 20, y + 28);

      if (plan.months_to_payoff) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(GRAY);
        doc.text(`Payoff period: ${plan.months_to_payoff} months`, ML + 155, y + 10);
        if (total) doc.text(`Total payments: ${fmtCur(total)}`, ML + 155, y + 22);
      }
      y += 48;
    });

    drawFooter();

    // === PLAN DETAIL PAGES ===
    selPlans.forEach((plan) => {
      doc.addPage();
      drawHeader();
      y = 88;
      const code = plan.tran_code || "";
      const disclosure = PLAN_DISCLOSURES[code] || DEFAULT_DISCLOSURE;

      doc.setFont("helvetica", "bold"); doc.setFontSize(20); setColor(NAVY);
      doc.text(`Plan ${code}  —  ${plan.promotional_offer}`, ML, y); y += 8;
      setDraw(GOLD); doc.setLineWidth(2.5);
      doc.line(ML, y, W - MR, y); y += 20;

      y = textBlock(disclosure.intro, ML, y, CW, 10.5, "normal", DGRAY, 14) + 10;
      y = textBlock(disclosure.disc, ML, y, CW, 9.5, "normal", GRAY, 13.5) + 24;

      doc.setFont("helvetica", "bold"); doc.setFontSize(12); setColor(NAVY);
      doc.text("Estimated Payment Information", ML, y); y += 4;
      hLine(y, NAVY, 1); y += 16;

      const monthly = Math.ceil(amountNum * plan.payment_factor);
      const total = plan.months_to_payoff ? monthly * plan.months_to_payoff : null;

      const rows = [
        { label: "Fixed Monthly Payments", value: fmtCur(monthly), highlight: true },
        { label: "Payoff Period", value: plan.months_to_payoff ? `${plan.months_to_payoff} Months` : "N/A", highlight: false },
        { label: "Total Payments", value: total ? fmtCur(total) : "N/A", highlight: false },
      ];

      rows.forEach((row) => {
        if (row.highlight) {
          setFill(GOLD); doc.rect(ML, y - 12, CW, 20, "F");
          doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); setColor(NAVY);
          doc.text(row.label, ML + 8, y + 1);
          doc.text(row.value, W - MR - 8, y + 1, { align: "right" });
          y += 24;
        } else {
          doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); setColor(DGRAY);
          doc.text(row.label, ML + 8, y + 1);
          doc.text(row.value, W - MR - 8, y + 1, { align: "right" });
          hLine(y + 8, LGRAY, 0.4); y += 22;
        }
      });

      y += 22;
      const note = "The Fixed Monthly Payment should allow you to pay in full the amount to be financed within the estimated Payoff Period if this amount is and will be the only balance on your account during the promotional period and you make your monthly payment by the due date each month. If You have any additional balances on your account at any time during the promo period, the monthly required payments applicable to those balances will be added to the fixed payment required and such balance may impact how payments are applied to your promotional purchase.";
      textBlock(note, ML, y, CW, 9.5, "italic", GRAY, 13.5);

      drawFooter();
    });

    const fname = `Synchrony_Disclosure_${customerName.trim().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fname);
    toast.success("Disclosure PDF downloaded successfully!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        Synchrony Disclosure Generator
      </h2>
      <p className="text-sm text-muted-foreground">
        Enter transaction details, select up to 3 financing plans, then generate a Synchrony disclosure PDF.
      </p>

      {/* Transaction Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Transaction Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Total Amount Financed *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7 text-lg font-bold"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Customer Name *</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Smith" />
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Billing Address — Street *</Label>
            <Input value={billStreet} onChange={(e) => setBillStreet(e.target.value)} placeholder="123 Main Street" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>City *</Label>
              <Input value={billCity} onChange={(e) => setBillCity(e.target.value)} placeholder="Dallas" />
            </div>
            <div className="grid gap-2">
              <Label>State</Label>
              <Input value={billState} onChange={(e) => setBillState(e.target.value)} placeholder="TX" maxLength={2} className="uppercase" />
            </div>
            <div className="grid gap-2">
              <Label>ZIP Code *</Label>
              <Input value={billZip} onChange={(e) => setBillZip(e.target.value)} placeholder="75001" maxLength={5} />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 cursor-pointer">
            <Checkbox checked={sameAddr} onCheckedChange={(c) => setSameAddr(!!c)} />
            <span className="text-sm font-medium">Job location is the same as billing address</span>
          </label>

          {!sameAddr && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid gap-2">
                <Label>Job Location — Street</Label>
                <Input value={jobStreet} onChange={(e) => setJobStreet(e.target.value)} placeholder="456 Oak Avenue" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Input value={jobCity} onChange={(e) => setJobCity(e.target.value)} placeholder="Plano" />
                </div>
                <div className="grid gap-2">
                  <Label>State</Label>
                  <Input value={jobState} onChange={(e) => setJobState(e.target.value)} placeholder="TX" maxLength={2} className="uppercase" />
                </div>
                <div className="grid gap-2">
                  <Label>ZIP Code</Label>
                  <Input value={jobZip} onChange={(e) => setJobZip(e.target.value)} placeholder="75024" maxLength={5} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Select Financing Plans</CardTitle>
            <Badge variant="secondary">{selectedCodes.size} of 3 selected</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose up to <strong>3 plans</strong> to include in the disclosure document.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const code = plan.tran_code || "";
              const isSelected = selectedCodes.has(code);
              const isDisabled = !isSelected && selectedCodes.size >= 3;
              const monthly = amountNum ? Math.ceil(amountNum * plan.payment_factor) : null;

              return (
                <div
                  key={plan.id}
                  onClick={() => !isDisabled && code && togglePlan(code)}
                  className={cn(
                    "relative rounded-xl border-2 p-4 cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50",
                    isDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Plan {code}
                  </div>
                  <div className="text-sm font-bold text-foreground mb-3 pr-7 leading-tight">
                    {plan.promotional_offer}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wide">APR</div>
                      <div className="font-bold">{plan.interest_rate.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wide">Factor</div>
                      <div className="font-bold">{fmtFactor(plan.payment_factor)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wide">Payoff</div>
                      <div className="font-bold">{plan.months_to_payoff ? `${plan.months_to_payoff} mo` : "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wide">Fee</div>
                      <div className="font-bold">{plan.contractor_fee.toFixed(2)}%</div>
                    </div>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Est. Monthly</span>
                    {monthly ? (
                      <span className="text-lg font-bold text-primary">{fmtCur(monthly)}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Enter amount above</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Generate */}
      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Button size="lg" onClick={generatePDF} className="font-bold text-base px-10">
            <Download className="h-5 w-5 mr-2" />
            Generate Synchrony Disclosure PDF
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Produces a multi-page PDF — one summary cover page + one detailed disclosure page per selected plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
