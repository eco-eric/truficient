import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, Eye, Phone, Mail, MapPin, Calendar, Flame, Snowflake } from "lucide-react";
import { format } from "date-fns";

interface DuctedSubmission {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  home_type: string;
  home_layout: string;
  square_footage: string;
  heating_type: string;
  coverage: string;
  system_count: number;
  recommended_tonnage: number | null;
  efficiency_tier_id: string | null;
  equipment_id: string | null;
  selected_addons: unknown[] | null;
  equipment_cost: number | null;
  installation_cost: number | null;
  addons_cost: number | null;
  tax_amount: number | null;
  final_total: number | null;
  status: string;
  ghl_sync_status: string | null;
  created_at: string;
  best_time_to_call: string | null;
}

const formatMoney = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));

const DuctedSubmissions = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<DuctedSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<DuctedSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<DuctedSubmission | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from("ducted_estimate_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSubmissions((data || []) as DuctedSubmission[]);
        setFilteredSubmissions((data || []) as DuctedSubmission[]);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    let filtered = [...submissions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.customer_name.toLowerCase().includes(query) ||
          s.customer_email.toLowerCase().includes(query) ||
          (s.customer_phone && s.customer_phone.includes(query))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchQuery, statusFilter, submissions]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const openDetail = (submission: DuctedSubmission) => {
    setSelectedSubmission(submission);
    setSheetOpen(true);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("ducted_estimate_submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      if (selectedSubmission?.id === id) {
        setSelectedSubmission((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      reviewed: "secondary",
      contacted: "outline",
      quoted: "outline",
      closed: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout title="Ducted Submissions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ducted Submissions">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ducted HVAC Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Manage estimate requests from the ducted HVAC estimator.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "all") && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </p>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Tonnage</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GHL</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="text-sm">
                    {format(new Date(sub.created_at), "MMM d, yyyy")}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(sub.created_at), "h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sub.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{sub.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {sub.heating_type === "gas_system" ? (
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                      ) : (
                        <Snowflake className="h-3.5 w-3.5 text-blue-500" />
                      )}
                      <span className="text-sm">
                        {sub.heating_type === "gas_system" ? "Gas + AC" : "Heat Pump"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{sub.recommended_tonnage ? `${sub.recommended_tonnage}T` : "—"}</TableCell>
                  <TableCell className="font-medium">{formatMoney(sub.final_total)}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      sub.ghl_sync_status === "synced" 
                        ? "bg-green-100 text-green-700" 
                        : sub.ghl_sync_status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {sub.ghl_sync_status || "pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openDetail(sub)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredSubmissions.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No submissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedSubmission && (
              <>
                <SheetHeader>
                  <SheetTitle>Submission Details</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#1e3a5f]">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedSubmission.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${selectedSubmission.customer_email}`} className="hover:underline">
                          {selectedSubmission.customer_email}
                        </a>
                      </div>
                      {selectedSubmission.customer_phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${selectedSubmission.customer_phone}`} className="hover:underline">
                            {selectedSubmission.customer_phone}
                          </a>
                        </div>
                      )}
                      {selectedSubmission.customer_address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedSubmission.customer_address}</span>
                        </div>
                      )}
                      {selectedSubmission.best_time_to_call && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Best time: {selectedSubmission.best_time_to_call}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Home Details */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#1e3a5f]">Home Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2">{selectedSubmission.home_type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Layout:</span>
                        <span className="ml-2">{selectedSubmission.home_layout}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2">{selectedSubmission.square_footage} sq ft</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="ml-2">{selectedSubmission.coverage}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Details */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#1e3a5f]">System Configuration</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 flex items-center gap-1">
                          {selectedSubmission.heating_type === "gas_system" ? (
                            <>
                              <Flame className="h-3.5 w-3.5 text-orange-500" />
                              Gas + AC
                            </>
                          ) : (
                            <>
                              <Snowflake className="h-3.5 w-3.5 text-blue-500" />
                              Heat Pump
                            </>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tonnage:</span>
                        <span className="ml-2">{selectedSubmission.recommended_tonnage || "—"} Ton</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Systems:</span>
                        <span className="ml-2">{selectedSubmission.system_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#1e3a5f]">Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equipment</span>
                        <span>{formatMoney(selectedSubmission.equipment_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Installation</span>
                        <span>{formatMoney(selectedSubmission.installation_cost)}</span>
                      </div>
                      {(selectedSubmission.addons_cost || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Add-ons</span>
                          <span>{formatMoney(selectedSubmission.addons_cost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatMoney(selectedSubmission.tax_amount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total</span>
                        <span className="text-[#1e3a5f]">{formatMoney(selectedSubmission.final_total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#1e3a5f]">Update Status</h3>
                    <Select
                      value={selectedSubmission.status}
                      onValueChange={(v) => updateStatus(selectedSubmission.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    <div>Submitted: {format(new Date(selectedSubmission.created_at), "PPpp")}</div>
                    <div>GHL Status: {selectedSubmission.ghl_sync_status || "pending"}</div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
};

export default DuctedSubmissions;
