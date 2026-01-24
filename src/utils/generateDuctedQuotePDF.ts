import { format, addDays } from "date-fns";

// Label mappings
const HOME_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family Home",
  townhouse: "Townhouse",
  condo: "Condo",
  mobile_home: "Mobile Home",
  duplex: "Duplex",
  other: "Other",
};

const HOME_LAYOUT_LABELS: Record<string, string> = {
  "1_story": "1 Story",
  "2_stories": "2 Stories",
  "3_stories": "3+ Stories",
  split_level: "Split Level",
  basement: "With Basement",
  loft: "With Loft",
};

const HEATING_TYPE_LABELS: Record<string, string> = {
  gas_system: "Gas Furnace + AC",
  heat_pump: "Heat Pump System",
};

const INSULATION_LABELS: Record<string, string> = {
  high: "Well Insulated",
  medium: "Standard",
  low: "Poor Insulation",
  not_sure: "Not Sure",
};

const WINDOW_LABELS: Record<string, string> = {
  triple_pane: "Triple Pane",
  double_pane: "Double Pane",
  single_pane: "Single Pane",
  mixed: "Mixed",
};

const HOME_AGE_LABELS: Record<string, string> = {
  after_2010: "Built After 2010",
  "2000_2010": "2000-2010",
  "1980_2000": "1980-2000",
  before_1980: "Before 1980",
};

const SQFT_LABELS: Record<string, string> = {
  under_800: "Under 800 sq ft",
  "800_1200": "800-1,200 sq ft",
  "1200_1600": "1,200-1,600 sq ft",
  "1600_2000": "1,600-2,000 sq ft",
  "2000_2500": "2,000-2,500 sq ft",
  "2500_3000": "2,500-3,000 sq ft",
  "3000_3500": "3,000-3,500 sq ft",
  "3500_4000": "3,500-4,000 sq ft",
  "4000_plus": "4,000+ sq ft",
};

const COVERAGE_LABELS: Record<string, string> = {
  whole_home: "Whole Home",
  partial: "Partial Coverage",
};

export interface DuctedQuotePDFData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    formattedAddress?: string;
  };
  homeType: string | null;
  homeLayout: string | null;
  squareFootage: string | null;
  systemCount: number;
  coverage: string | null;
  atticInsulation: string | null;
  windowType: string | null;
  homeAge: string | null;
  heatingType: string | null;
  selectedTonnage: number | null;
  equipment: {
    brand: string;
    systemName: string | null;
    seer2Rating: number | null;
    hspf2Rating: number | null;
    warrantyYears: number;
  } | null;
  tier: {
    displayName: string;
  } | null;
  addonsBreakdown: Array<{ name: string; price: number }>;
  pricing: {
    equipmentCost: number;
    installationCost: number;
    addonsCost: number;
    finalTotal: number;
    monthlyFinancing: number;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateDuctedQuotePDF(data: DuctedQuotePDFData): void {
  const generatedDate = format(new Date(), "MMMM d, yyyy");
  const validUntilDate = format(addDays(new Date(), 30), "MMMM d, yyyy");
  
  const customerAddress = data.customerInfo.formattedAddress || data.customerInfo.address || "Not provided";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>HVAC System Estimate - Truficient</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e3a5f;
          line-height: 1.5;
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #1e3a5f;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #1e3a5f;
        }
        .company-tagline {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        .quote-title {
          text-align: right;
        }
        .quote-title h1 {
          font-size: 20px;
          color: #1e3a5f;
          margin-bottom: 4px;
        }
        .quote-date {
          font-size: 12px;
          color: #666;
        }
        .section {
          margin-bottom: 24px;
          break-inside: avoid;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e3a5f;
          background: #f0f4f8;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 24px;
          font-size: 13px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
        }
        .info-label {
          color: #666;
        }
        .info-value {
          font-weight: 500;
          color: #1e3a5f;
          text-align: right;
        }
        .pricing-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .pricing-table th {
          text-align: left;
          padding: 8px 12px;
          background: #f0f4f8;
          color: #1e3a5f;
          font-weight: 600;
        }
        .pricing-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .pricing-table .amount {
          text-align: right;
          font-weight: 500;
        }
        .total-row {
          background: #1e3a5f;
          color: white;
        }
        .total-row td {
          padding: 12px;
          font-size: 16px;
          font-weight: bold;
          border-bottom: none;
        }
        .financing-box {
          background: linear-gradient(135deg, #d4a84b 0%, #c49a40 100%);
          color: #1e3a5f;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin-top: 16px;
        }
        .financing-amount {
          font-size: 28px;
          font-weight: bold;
        }
        .financing-note {
          font-size: 12px;
          opacity: 0.9;
        }
        .included-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 13px;
        }
        .included-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checkmark {
          color: #22c55e;
          font-weight: bold;
        }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 2px solid #1e3a5f;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .contact-info {
          font-size: 14px;
          color: #1e3a5f;
          font-weight: 600;
          margin-top: 8px;
        }
        .valid-until {
          background: #fef3c7;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          color: #92400e;
          margin-bottom: 24px;
        }
        @media print {
          body { padding: 0; }
          .section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company-name">TRUFICIENT</div>
          <div class="company-tagline">True Comfort. True Efficiency. True Service.</div>
        </div>
        <div class="quote-title">
          <h1>HVAC System Estimate</h1>
          <div class="quote-date">Generated: ${generatedDate}</div>
        </div>
      </div>

      <div class="valid-until">
        ⏰ This estimate is valid until <strong>${validUntilDate}</strong>
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${data.customerInfo.name || "Not provided"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${data.customerInfo.phone || "Not provided"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">${data.customerInfo.email || "Not provided"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value">${customerAddress}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Home Details</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Home Type</span>
            <span class="info-value">${data.homeType ? HOME_TYPE_LABELS[data.homeType] || data.homeType : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Layout</span>
            <span class="info-value">${data.homeLayout ? HOME_LAYOUT_LABELS[data.homeLayout] || data.homeLayout : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Square Footage</span>
            <span class="info-value">${data.squareFootage ? SQFT_LABELS[data.squareFootage] || data.squareFootage : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Coverage</span>
            <span class="info-value">${data.coverage ? COVERAGE_LABELS[data.coverage] || data.coverage : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Systems</span>
            <span class="info-value">${data.systemCount} System${data.systemCount > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Efficiency Factors</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Attic Insulation</span>
            <span class="info-value">${data.atticInsulation ? INSULATION_LABELS[data.atticInsulation] || data.atticInsulation : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Window Type</span>
            <span class="info-value">${data.windowType ? WINDOW_LABELS[data.windowType] || data.windowType : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Home Age</span>
            <span class="info-value">${data.homeAge ? HOME_AGE_LABELS[data.homeAge] || data.homeAge : "—"}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">System Configuration</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">System Type</span>
            <span class="info-value">${data.heatingType ? HEATING_TYPE_LABELS[data.heatingType] || data.heatingType : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Capacity</span>
            <span class="info-value">${data.selectedTonnage ? `${data.selectedTonnage} Ton` : "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Efficiency Tier</span>
            <span class="info-value">${data.tier?.displayName || "—"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Brand</span>
            <span class="info-value">${data.equipment?.brand || "—"}</span>
          </div>
          ${data.equipment?.seer2Rating ? `
          <div class="info-row">
            <span class="info-label">SEER2 Rating</span>
            <span class="info-value">${data.equipment.seer2Rating}</span>
          </div>
          ` : ""}
          ${data.equipment?.hspf2Rating ? `
          <div class="info-row">
            <span class="info-label">HSPF2 Rating</span>
            <span class="info-value">${data.equipment.hspf2Rating}</span>
          </div>
          ` : ""}
          <div class="info-row">
            <span class="info-label">Warranty</span>
            <span class="info-value">${data.equipment?.warrantyYears ? `${data.equipment.warrantyYears} Years` : "—"}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Investment Breakdown</div>
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Equipment Package</td>
              <td class="amount">${formatCurrency(data.pricing.equipmentCost)}</td>
            </tr>
            <tr>
              <td>Professional Installation</td>
              <td class="amount">${formatCurrency(data.pricing.installationCost)}</td>
            </tr>
            ${data.addonsBreakdown.map(addon => `
            <tr>
              <td>${addon.name}</td>
              <td class="amount">${formatCurrency(addon.price)}</td>
            </tr>
            `).join("")}
            <tr class="total-row">
              <td>Total Investment</td>
              <td class="amount">${formatCurrency(data.pricing.finalTotal)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="financing-box">
          <div class="financing-amount">${formatCurrency(data.pricing.monthlyFinancing)}/mo</div>
          <div class="financing-note">with financing at 5.99% APR for 60 months</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">What's Included</div>
        <div class="included-list">
          <div class="included-item"><span class="checkmark">✓</span> Professional Installation</div>
          <div class="included-item"><span class="checkmark">✓</span> Premium Equipment Package</div>
          <div class="included-item"><span class="checkmark">✓</span> Smart Thermostat</div>
          <div class="included-item"><span class="checkmark">✓</span> Removal & Disposal of Old System</div>
          <div class="included-item"><span class="checkmark">✓</span> All Permits & Inspections</div>
          <div class="included-item"><span class="checkmark">✓</span> 1-Year Labor Warranty</div>
          <div class="included-item"><span class="checkmark">✓</span> System Commissioning</div>
          <div class="included-item"><span class="checkmark">✓</span> Customer Training</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Next Steps</div>
        <div style="font-size: 13px;">
          <p style="margin-bottom: 8px;"><strong>1. Expert Consultation</strong> — A comfort advisor will call within 1 business day.</p>
          <p style="margin-bottom: 8px;"><strong>2. In-Home Assessment</strong> — We'll confirm sizing and discuss any questions.</p>
          <p style="margin-bottom: 8px;"><strong>3. Schedule Installation</strong> — Pick a date that works for you.</p>
          <p><strong>4. Enjoy Comfort</strong> — Professional installation by licensed technicians.</p>
        </div>
      </div>

      <div class="footer">
        <div class="contact-info">
          📞 (214) 238-4349 &nbsp;|&nbsp; ✉ info@truficient.com &nbsp;|&nbsp; 🌐 truficient.com
        </div>
        <p style="margin-top: 8px;">
          TACLA134302C • Fully Licensed & Insured • Serving the DFW Metroplex
        </p>
        <p style="margin-top: 4px; font-size: 11px; color: #999;">
          This is an estimate based on the information provided. Final pricing may vary based on in-home assessment.
        </p>
      </div>
    </body>
    </html>
  `;

  // Open new window and print
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
