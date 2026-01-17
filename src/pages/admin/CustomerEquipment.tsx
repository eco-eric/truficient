import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Award, Zap, Flame, Snowflake } from "lucide-react";

type JsonArrayStrings = string[];

type DuctedEquipment = {
  id: string;
  brand: string;
  tonnage: number;
  seer_rating: number;
  system_type: string;
  equipment_cost: number;
  installation_labor: number;
  warranty_years: number;
  is_best_value: boolean;
  is_energy_star: boolean;
  is_active: boolean;
  efficiency_tier_id: string | null;
  features: JsonArrayStrings | null;
  model_number: string | null;
  afue_rating: number | null;
  hspf_rating: number | null;
  display_order: number;
};

type DuctedEfficiencyTier = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  seer_min: number;
  seer_max: number;
  features: JsonArrayStrings | null;
  sort_order: number;
  is_active: boolean;
};

type DuctedAddon = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon_name: string | null;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
};

const formatMoney = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));

const linesToArray = (value: string): string[] =>
  value.split("\n").map((s) => s.trim()).filter(Boolean);

const arrayToLines = (arr: unknown): string => {
  if (!Array.isArray(arr)) return "";
  return arr.map((s) => String(s)).join("\n");
};

const CustomerEquipment = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"equipment" | "tiers" | "addons">("equipment");

  // -------- Equipment --------
  const equipmentQuery = useQuery({
    queryKey: ["ducted_equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_equipment")
        .select("*")
        .order("display_order")
        .order("brand");
      if (error) throw error;
      return data as DuctedEquipment[];
    },
  });

  const tiersQuery = useQuery({
    queryKey: ["ducted_efficiency_tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_efficiency_tiers")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as DuctedEfficiencyTier[];
    },
  });

  const addonsQuery = useQuery({
    queryKey: ["ducted_addons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_addons")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as DuctedAddon[];
    },
  });

  // Equipment Dialog State
  const [equipDialogOpen, setEquipDialogOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<DuctedEquipment | null>(null);
  const [equipForm, setEquipForm] = useState({
    brand: "",
    model_number: "",
    tonnage: 3,
    seer_rating: 14,
    afue_rating: "",
    hspf_rating: "",
    system_type: "gas_furnace_ac",
    equipment_cost: 0,
    installation_labor: 0,
    warranty_years: 10,
    is_best_value: false,
    is_energy_star: false,
    is_active: true,
    efficiency_tier_id: "",
    featuresText: "",
    display_order: 0,
  });

  const resetEquipForm = () => {
    setEditingEquip(null);
    setEquipForm({
      brand: "",
      model_number: "",
      tonnage: 3,
      seer_rating: 14,
      afue_rating: "",
      hspf_rating: "",
      system_type: "gas_furnace_ac",
      equipment_cost: 0,
      installation_labor: 0,
      warranty_years: 10,
      is_best_value: false,
      is_energy_star: false,
      is_active: true,
      efficiency_tier_id: "",
      featuresText: "",
      display_order: 0,
    });
  };

  const openCreateEquip = () => {
    resetEquipForm();
    setEquipDialogOpen(true);
  };

  const openEditEquip = (e: DuctedEquipment) => {
    setEditingEquip(e);
    setEquipForm({
      brand: e.brand,
      model_number: e.model_number || "",
      tonnage: e.tonnage,
      seer_rating: e.seer_rating,
      afue_rating: e.afue_rating?.toString() || "",
      hspf_rating: e.hspf_rating?.toString() || "",
      system_type: e.system_type,
      equipment_cost: e.equipment_cost,
      installation_labor: e.installation_labor,
      warranty_years: e.warranty_years,
      is_best_value: e.is_best_value,
      is_energy_star: e.is_energy_star,
      is_active: e.is_active,
      efficiency_tier_id: e.efficiency_tier_id || "",
      featuresText: arrayToLines(e.features),
      display_order: e.display_order,
    });
    setEquipDialogOpen(true);
  };

  const saveEquipMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brand: equipForm.brand.trim(),
        model_number: equipForm.model_number.trim() || null,
        tonnage: Number(equipForm.tonnage),
        seer_rating: Number(equipForm.seer_rating),
        afue_rating: equipForm.afue_rating ? Number(equipForm.afue_rating) : null,
        hspf_rating: equipForm.hspf_rating ? Number(equipForm.hspf_rating) : null,
        system_type: equipForm.system_type,
        equipment_cost: Number(equipForm.equipment_cost),
        installation_labor: Number(equipForm.installation_labor),
        warranty_years: Number(equipForm.warranty_years),
        is_best_value: equipForm.is_best_value,
        is_energy_star: equipForm.is_energy_star,
        is_active: equipForm.is_active,
        efficiency_tier_id: equipForm.efficiency_tier_id || null,
        features: linesToArray(equipForm.featuresText),
        display_order: Number(equipForm.display_order),
      };

      if (!payload.brand) throw new Error("Brand is required");

      if (editingEquip) {
        const { error } = await supabase.from("ducted_equipment").update(payload).eq("id", editingEquip.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ducted_equipment").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ducted_equipment"] });
      toast.success(editingEquip ? "Equipment updated" : "Equipment created");
      setEquipDialogOpen(false);
      resetEquipForm();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const deleteEquipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ducted_equipment").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ducted_equipment"] });
      toast.success("Equipment deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  // Tier Dialog State
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<DuctedEfficiencyTier | null>(null);
  const [tierForm, setTierForm] = useState({
    name: "",
    display_name: "",
    description: "",
    seer_min: 14,
    seer_max: 16,
    featuresText: "",
    sort_order: 0,
    is_active: true,
  });

  const resetTierForm = () => {
    setEditingTier(null);
    setTierForm({
      name: "",
      display_name: "",
      description: "",
      seer_min: 14,
      seer_max: 16,
      featuresText: "",
      sort_order: 0,
      is_active: true,
    });
  };

  const openCreateTier = () => {
    resetTierForm();
    setTierDialogOpen(true);
  };

  const openEditTier = (t: DuctedEfficiencyTier) => {
    setEditingTier(t);
    setTierForm({
      name: t.name,
      display_name: t.display_name,
      description: t.description || "",
      seer_min: t.seer_min,
      seer_max: t.seer_max,
      featuresText: arrayToLines(t.features),
      sort_order: t.sort_order,
      is_active: t.is_active,
    });
    setTierDialogOpen(true);
  };

  const saveTierMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: tierForm.name.trim(),
        display_name: tierForm.display_name.trim(),
        description: tierForm.description.trim() || null,
        seer_min: Number(tierForm.seer_min),
        seer_max: Number(tierForm.seer_max),
        features: linesToArray(tierForm.featuresText),
        sort_order: Number(tierForm.sort_order),
        is_active: tierForm.is_active,
      };

      if (!payload.name || !payload.display_name) {
        throw new Error("Name and Display Name are required");
      }

      if (editingTier) {
        const { error } = await supabase.from("ducted_efficiency_tiers").update(payload).eq("id", editingTier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ducted_efficiency_tiers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ducted_efficiency_tiers"] });
      toast.success(editingTier ? "Tier updated" : "Tier created");
      setTierDialogOpen(false);
      resetTierForm();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ducted_efficiency_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ducted_efficiency_tiers"] });
      toast.success("Tier deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  // Addon Dialog State
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<DuctedAddon | null>(null);
  const [addonForm, setAddonForm] = useState({
    name: "",
    description: "",
    price: 0,
    icon_name: "",
    is_popular: false,
    sort_order: 0,
    is_active: true,
  });

  const resetAddonForm = () => {
    setEditingAddon(null);
    setAddonForm({
      name: "",
      description: "",
      price: 0,
      icon_name: "",
      is_popular: false,
      sort_order: 0,
      is_active: true,
    });
  };

  const openCreateAddon = () => {
    resetAddonForm();
    setAddonDialogOpen(true);
  };

  const openEditAddon = (a: DuctedAddon) => {
    setEditingAddon(a);
    setAddonForm({
      name: a.name,
      description: a.description || "",
      price: a.price,
      icon_name: a.icon_name || "",
      is_popular: a.is_popular,
      sort_order: a.sort_order,
      is_active: a.is_active,
    });
    setAddonDialogOpen(true);
  };

  const saveAddonMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: addonForm.name.trim(),
        description: addonForm.description.trim() || null,
        price: Number(addonForm.price),
        icon_name: addonForm.icon_name.trim() || null,
        is_popular: addonForm.is_popular,
        sort_order: Number(addonForm.sort_order),
        is_active: addonForm.is_active,
      };

      if (!payload.name) throw new Error("Name is required");

      if (editingAddon) {
        const { error } = await supabase.from("ducted_addons").update(payload).eq("id", editingAddon.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ducted_addons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ducted_addons"] });
      toast.success(editingAddon ? "Add-on updated" : "Add-on created");
      setAddonDialogOpen(false);
      resetAddonForm();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const deleteAddonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ducted_addons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ducted_addons"] });
      toast.success("Add-on deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  const getTierName = (tierId: string | null) => {
    if (!tierId) return "—";
    const tier = tiersQuery.data?.find((t) => t.id === tierId);
    return tier?.display_name || "—";
  };

  return (
    <AdminLayout title="Customer Equipment">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Equipment</h1>
            <p className="text-sm text-muted-foreground">
              Manage ducted HVAC equipment, efficiency tiers, and add-ons for customer estimates.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="tiers">Efficiency Tiers</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
          </TabsList>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">{equipmentQuery.data?.length || 0} records</div>
              <Dialog open={equipDialogOpen} onOpenChange={(open) => { if (!open) resetEquipForm(); setEquipDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateEquip}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEquip ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Brand *</Label>
                        <Input value={equipForm.brand} onChange={(e) => setEquipForm((p) => ({ ...p, brand: e.target.value }))} placeholder="Carrier" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Model Number</Label>
                        <Input value={equipForm.model_number} onChange={(e) => setEquipForm((p) => ({ ...p, model_number: e.target.value }))} placeholder="24ACC636A003" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>System Type</Label>
                        <Select value={equipForm.system_type} onValueChange={(v) => setEquipForm((p) => ({ ...p, system_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gas_furnace_ac">Gas Furnace + AC</SelectItem>
                            <SelectItem value="heat_pump">Heat Pump</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Tonnage</Label>
                        <Select value={String(equipForm.tonnage)} onValueChange={(v) => setEquipForm((p) => ({ ...p, tonnage: Number(v) }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1.5, 2, 2.5, 3, 3.5, 4, 5].map((t) => (
                              <SelectItem key={t} value={String(t)}>{t} Ton</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Efficiency Tier</Label>
                        <Select value={equipForm.efficiency_tier_id} onValueChange={(v) => setEquipForm((p) => ({ ...p, efficiency_tier_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                          <SelectContent>
                            {tiersQuery.data?.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.display_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>SEER Rating</Label>
                        <Input type="number" value={equipForm.seer_rating} onChange={(e) => setEquipForm((p) => ({ ...p, seer_rating: Number(e.target.value) }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>AFUE Rating</Label>
                        <Input type="number" value={equipForm.afue_rating} onChange={(e) => setEquipForm((p) => ({ ...p, afue_rating: e.target.value }))} placeholder="96" />
                      </div>
                      <div className="grid gap-2">
                        <Label>HSPF Rating</Label>
                        <Input type="number" value={equipForm.hspf_rating} onChange={(e) => setEquipForm((p) => ({ ...p, hspf_rating: e.target.value }))} placeholder="9.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Equipment Cost</Label>
                        <Input type="number" value={equipForm.equipment_cost} onChange={(e) => setEquipForm((p) => ({ ...p, equipment_cost: Number(e.target.value) }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Installation Labor</Label>
                        <Input type="number" value={equipForm.installation_labor} onChange={(e) => setEquipForm((p) => ({ ...p, installation_labor: Number(e.target.value) }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Warranty (years)</Label>
                        <Input type="number" value={equipForm.warranty_years} onChange={(e) => setEquipForm((p) => ({ ...p, warranty_years: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Features (one per line)</Label>
                      <Textarea value={equipForm.featuresText} onChange={(e) => setEquipForm((p) => ({ ...p, featuresText: e.target.value }))} placeholder="Variable speed blower&#10;Two-stage compressor" rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Display Order</Label>
                        <Input type="number" value={equipForm.display_order} onChange={(e) => setEquipForm((p) => ({ ...p, display_order: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Switch checked={equipForm.is_best_value} onCheckedChange={(c) => setEquipForm((p) => ({ ...p, is_best_value: c }))} />
                        <Label>Best Value</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={equipForm.is_energy_star} onCheckedChange={(c) => setEquipForm((p) => ({ ...p, is_energy_star: c }))} />
                        <Label>Energy Star</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={equipForm.is_active} onCheckedChange={(c) => setEquipForm((p) => ({ ...p, is_active: c }))} />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setEquipDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => saveEquipMutation.mutate()} disabled={saveEquipMutation.isPending}>
                        {saveEquipMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tonnage</TableHead>
                    <TableHead>SEER</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Labor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentQuery.data?.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {eq.brand}
                          {eq.is_best_value && <Award className="h-3.5 w-3.5 text-yellow-500" />}
                          {eq.is_energy_star && <Zap className="h-3.5 w-3.5 text-green-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{eq.model_number || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {eq.system_type === "gas_furnace_ac" ? (
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                          ) : (
                            <Snowflake className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          <span className="text-xs">{eq.system_type === "gas_furnace_ac" ? "Gas" : "HP"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{eq.tonnage}T</TableCell>
                      <TableCell>{eq.seer_rating}</TableCell>
                      <TableCell className="text-xs">{getTierName(eq.efficiency_tier_id)}</TableCell>
                      <TableCell className="text-xs">{formatMoney(eq.equipment_cost)}</TableCell>
                      <TableCell className="text-xs">{formatMoney(eq.installation_labor)}</TableCell>
                      <TableCell className="font-medium">{formatMoney(eq.equipment_cost + eq.installation_labor)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${eq.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {eq.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditEquip(eq)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteEquipMutation.mutate(eq.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!equipmentQuery.data?.length && (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">No equipment configured</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Efficiency Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">{tiersQuery.data?.length || 0} records</div>
              <Dialog open={tierDialogOpen} onOpenChange={(open) => { if (!open) resetTierForm(); setTierDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateTier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingTier ? "Edit Tier" : "Add Tier"}</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Name (internal)</Label>
                        <Input value={tierForm.name} onChange={(e) => setTierForm((p) => ({ ...p, name: e.target.value }))} placeholder="standard" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Display Name</Label>
                        <Input value={tierForm.display_name} onChange={(e) => setTierForm((p) => ({ ...p, display_name: e.target.value }))} placeholder="Standard Efficiency" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea value={tierForm.description} onChange={(e) => setTierForm((p) => ({ ...p, description: e.target.value }))} placeholder="Reliable and affordable" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>SEER Min</Label>
                        <Input type="number" value={tierForm.seer_min} onChange={(e) => setTierForm((p) => ({ ...p, seer_min: Number(e.target.value) }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>SEER Max</Label>
                        <Input type="number" value={tierForm.seer_max} onChange={(e) => setTierForm((p) => ({ ...p, seer_max: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Features (one per line)</Label>
                      <Textarea value={tierForm.featuresText} onChange={(e) => setTierForm((p) => ({ ...p, featuresText: e.target.value }))} rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Sort Order</Label>
                        <Input type="number" value={tierForm.sort_order} onChange={(e) => setTierForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch checked={tierForm.is_active} onCheckedChange={(c) => setTierForm((p) => ({ ...p, is_active: c }))} />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => saveTierMutation.mutate()} disabled={saveTierMutation.isPending}>
                        {saveTierMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>SEER Range</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiersQuery.data?.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.name}</TableCell>
                      <TableCell>{tier.display_name}</TableCell>
                      <TableCell>{tier.seer_min} - {tier.seer_max}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{Array.isArray(tier.features) ? tier.features.length : 0} features</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tier.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {tier.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditTier(tier)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteTierMutation.mutate(tier.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!tiersQuery.data?.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No tiers configured</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Add-ons Tab */}
          <TabsContent value="addons" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">{addonsQuery.data?.length || 0} records</div>
              <Dialog open={addonDialogOpen} onOpenChange={(open) => { if (!open) resetAddonForm(); setAddonDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateAddon}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Add-on
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingAddon ? "Edit Add-on" : "Add Add-on"}</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input value={addonForm.name} onChange={(e) => setAddonForm((p) => ({ ...p, name: e.target.value }))} placeholder="Smart Thermostat" />
                    </div>

                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea value={addonForm.description} onChange={(e) => setAddonForm((p) => ({ ...p, description: e.target.value }))} placeholder="WiFi-enabled thermostat with app control" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Price</Label>
                        <Input type="number" value={addonForm.price} onChange={(e) => setAddonForm((p) => ({ ...p, price: Number(e.target.value) }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Icon Name (Lucide)</Label>
                        <Input value={addonForm.icon_name} onChange={(e) => setAddonForm((p) => ({ ...p, icon_name: e.target.value }))} placeholder="Thermometer" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Sort Order</Label>
                        <Input type="number" value={addonForm.sort_order} onChange={(e) => setAddonForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Switch checked={addonForm.is_popular} onCheckedChange={(c) => setAddonForm((p) => ({ ...p, is_popular: c }))} />
                        <Label>Popular</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={addonForm.is_active} onCheckedChange={(c) => setAddonForm((p) => ({ ...p, is_active: c }))} />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setAddonDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => saveAddonMutation.mutate()} disabled={saveAddonMutation.isPending}>
                        {saveAddonMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addonsQuery.data?.map((addon) => (
                    <TableRow key={addon.id}>
                      <TableCell className="font-medium">{addon.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{addon.description}</TableCell>
                      <TableCell>{formatMoney(addon.price)}</TableCell>
                      <TableCell>{addon.is_popular ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${addon.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {addon.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditAddon(addon)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAddonMutation.mutate(addon.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!addonsQuery.data?.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No add-ons configured</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default CustomerEquipment;
