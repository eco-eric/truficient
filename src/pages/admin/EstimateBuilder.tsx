import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Package, 
  Users, 
  Receipt, 
  Wrench,
  Search,
  FileDown,
  LayoutTemplate,
  History
} from 'lucide-react';
import { generateEstimatePDF } from '@/utils/generateEstimatePDF';
import { VersionHistoryDialog } from '@/components/admin/estimates/VersionHistoryDialog';
import { 
  EstimateSectionComponent, 
  SECTION_CONFIGS, 
  getDefaultSection,
  type EstimateSection,
  type LineItem 
} from '@/components/admin/estimates/EstimateSection';

type JobType = 'residential_new' | 'residential_replacement' | 'commercial_new' | 'commercial_replacement' | 'maintenance' | 'repair';
type HeatingType = 'gas' | 'electric' | 'heat_pump' | 'dual_fuel';
type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
type LineItemType = 'equipment' | 'material' | 'labor' | 'admin_cost' | 'custom';

interface EstimateData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  job_type: JobType;
  heating_type: HeatingType;
  job_notes: string;
  status: EstimateStatus;
  profit_margin: number;
  tax_rate: number;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'residential_new', label: 'Residential - New Construction' },
  { value: 'residential_replacement', label: 'Residential - Replacement' },
  { value: 'commercial_new', label: 'Commercial - New Construction' },
  { value: 'commercial_replacement', label: 'Commercial - Replacement' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
];

const HEATING_TYPES: { value: HeatingType; label: string }[] = [
  { value: 'gas', label: 'Gas Furnace' },
  { value: 'electric', label: 'Electric' },
  { value: 'heat_pump', label: 'Heat Pump' },
  { value: 'dual_fuel', label: 'Dual Fuel' },
];

const STATUS_OPTIONS: { value: EstimateStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
];

const EstimateBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<EstimateData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    job_type: 'residential_replacement',
    heating_type: 'gas',
    job_notes: '',
    status: 'draft',
    profit_margin: 1.60,
    tax_rate: 0.0825,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<LineItemType>('material');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [materialCategory, setMaterialCategory] = useState('all');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Fetch estimate templates
  const { data: templates = [] } = useQuery({
    queryKey: ['estimate-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch estimate if editing
  const { data: estimate, isLoading: isLoadingEstimate } = useQuery({
    queryKey: ['estimate', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  // Fetch line items
  const { data: existingLineItems = [] } = useQuery({
    queryKey: ['estimate-line-items', id],
    queryFn: async () => {
      if (isNew) return [];
      const { data, error } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  // Fetch materials
  const { data: materials = [] } = useQuery({
    queryKey: ['materials-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials_catalog')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch labor rates
  const { data: laborRates = [] } = useQuery({
    queryKey: ['labor-rates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labor_rates')
        .select('*')
        .eq('is_active', true)
        .order('rate_type')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch admin costs
  const { data: adminCosts = [] } = useQuery({
    queryKey: ['admin-costs-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_costs')
        .select('*')
        .eq('is_active', true)
        .order('is_required', { ascending: false })
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch equipment systems
  const { data: equipmentSystems = [] } = useQuery({
    queryKey: ['equipment-systems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_systems')
        .select('*')
        .order('system_name');
      if (error) throw error;
      return data;
    },
  });

  // Set form data when estimate loads
  useEffect(() => {
    if (estimate) {
      setFormData({
        customer_name: estimate.customer_name || '',
        customer_email: estimate.customer_email || '',
        customer_phone: estimate.customer_phone || '',
        customer_address: estimate.customer_address || '',
        job_type: estimate.job_type,
        heating_type: estimate.heating_type,
        job_notes: estimate.job_notes || '',
        status: estimate.status,
        profit_margin: Number(estimate.profit_margin) || 1.60,
        tax_rate: Number(estimate.tax_rate) || 0.0825,
      });
    }
  }, [estimate]);

  // Set line items when they load
  useEffect(() => {
    if (existingLineItems.length > 0) {
      setLineItems(existingLineItems.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
        line_total: Number(item.line_total),
      })));
    }
  }, [existingLineItems]);

  // Auto-add required admin costs for new estimates
  useEffect(() => {
    if (isNew && adminCosts.length > 0 && lineItems.length === 0) {
      const requiredCosts = adminCosts.filter(c => c.is_required);
      if (requiredCosts.length > 0) {
        const newItems: LineItem[] = requiredCosts.map((cost, index) => ({
          item_type: 'admin_cost' as LineItemType,
          name: cost.name,
          description: cost.description,
          material_id: null,
          labor_rate_id: null,
          admin_cost_id: cost.id,
          equipment_system_id: null,
          quantity: 1,
          unit: 'each',
          unit_cost: Number(cost.amount),
          line_total: Number(cost.amount),
          sort_order: index,
          section: 'admin_costs' as EstimateSection,
          isNew: true,
        }));
        setLineItems(newItems);
      }
    }
  }, [isNew, adminCosts, lineItems.length]);

  // Calculate totals
  const totals = useMemo(() => {
    const activeItems = lineItems.filter(item => !item.isDeleted);
    const subtotalCost = activeItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const subtotalCharge = subtotalCost * formData.profit_margin;
    const taxAmount = subtotalCharge * formData.tax_rate;
    const grandTotal = subtotalCharge + taxAmount;
    const netProfit = subtotalCharge - subtotalCost;

    return {
      subtotalCost,
      subtotalCharge,
      taxAmount,
      grandTotal,
      netProfit,
      profitPercent: subtotalCost > 0 ? ((netProfit / subtotalCost) * 100) : 0,
    };
  }, [lineItems, formData.profit_margin, formData.tax_rate]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      let estimateId = id;

      if (isNew) {
        // Create new estimate
        const { data: newEstimate, error: createError } = await supabase
          .from('estimates')
          .insert({
            estimate_number: '', // Auto-generated
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            customer_address: formData.customer_address || null,
            job_type: formData.job_type,
            heating_type: formData.heating_type,
            job_notes: formData.job_notes || null,
            status: formData.status,
            profit_margin: formData.profit_margin,
            tax_rate: formData.tax_rate,
          })
          .select()
          .single();

        if (createError) throw createError;
        estimateId = newEstimate.id;
      } else {
        // Update existing estimate
        const { error: updateError } = await supabase
          .from('estimates')
          .update({
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            customer_phone: formData.customer_phone || null,
            customer_address: formData.customer_address || null,
            job_type: formData.job_type,
            heating_type: formData.heating_type,
            job_notes: formData.job_notes || null,
            status: formData.status,
            profit_margin: formData.profit_margin,
            tax_rate: formData.tax_rate,
          })
          .eq('id', id);

        if (updateError) throw updateError;
      }

      // Handle line items
      const itemsToDelete = lineItems.filter(item => item.id && item.isDeleted).map(item => item.id!);
      const itemsToCreate = lineItems.filter(item => item.isNew && !item.isDeleted);
      const itemsToUpdate = lineItems.filter(item => item.id && !item.isNew && !item.isDeleted);

      // Delete removed items
      if (itemsToDelete.length > 0) {
        const { error } = await supabase
          .from('estimate_line_items')
          .delete()
          .in('id', itemsToDelete);
        if (error) throw error;
      }

      // Create new items
      if (itemsToCreate.length > 0) {
        const newItems = itemsToCreate.map(item => ({
          estimate_id: estimateId,
          item_type: item.item_type,
          name: item.name,
          description: item.description,
          material_id: item.material_id,
          labor_rate_id: item.labor_rate_id,
          admin_cost_id: item.admin_cost_id,
          equipment_system_id: item.equipment_system_id,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          sort_order: item.sort_order,
          section: item.section || getDefaultSection(item.item_type),
        }));

        const { error } = await supabase
          .from('estimate_line_items')
          .insert(newItems);
        if (error) throw error;
      }

      // Update existing items
      for (const item of itemsToUpdate) {
        const { error } = await supabase
          .from('estimate_line_items')
          .update({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_cost: item.unit_cost,
            sort_order: item.sort_order,
            section: item.section || getDefaultSection(item.item_type),
          })
          .eq('id', item.id);
        if (error) throw error;
      }

      return estimateId;
    },
    onSuccess: (estimateId) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['estimate', estimateId] });
      toast.success(isNew ? 'Estimate created successfully' : 'Estimate saved successfully');
      if (isNew) {
        navigate(`/admin/estimates/${estimateId}`);
      }
    },
    onError: (error) => {
      toast.error('Failed to save estimate: ' + error.message);
    },
  });

  // State to track which section we're adding to
  const [currentAddSection, setCurrentAddSection] = useState<EstimateSection>('miscellaneous_inside');

  // Handle add item from section
  const handleSectionAddItem = (type: LineItemType, section: EstimateSection) => {
    setCurrentAddSection(section);
    if (type === 'custom') {
      handleAddCustomItem(section);
    } else {
      setAddDialogType(type);
      setIsAddDialogOpen(true);
    }
  };

  // Map material category to section
  const getMaterialSection = (category: string): EstimateSection => {
    const categoryLower = (category || '').toLowerCase();
    
    // Outdoor materials - refrigerant lines, copper, supports for outdoor units
    if (['refrigerant', 'copper', 'supports'].includes(categoryLower)) {
      return 'miscellaneous_outside';
    }
    
    // Ductwork goes to ducting section
    if (categoryLower === 'ductwork') {
      return 'ducting';
    }
    
    // Everything else (electrical, controls, misc) goes inside
    return 'miscellaneous_inside';
  };

  // Add line item handlers
  const handleAddMaterial = (material: any, section?: EstimateSection) => {
    // Auto-map section based on material category, but allow override
    const autoSection = getMaterialSection(material.category);
    const targetSection = section || autoSection;
    
    const newItem: LineItem = {
      item_type: 'material',
      name: material.name,
      description: material.description,
      material_id: material.id,
      labor_rate_id: null,
      admin_cost_id: null,
      equipment_system_id: null,
      quantity: 1,
      unit: material.unit,
      unit_cost: parseFloat(material.unit_cost),
      line_total: parseFloat(material.unit_cost),
      sort_order: lineItems.length,
      section: targetSection,
      isNew: true,
    };
    setLineItems([...lineItems, newItem]);
    toast.success(`Added ${material.name} to ${SECTION_CONFIGS.find(s => s.key === targetSection)?.title || targetSection}`);
  };

  const handleAddLabor = (labor: any) => {
    const newItem: LineItem = {
      item_type: 'labor',
      name: labor.name,
      description: labor.description,
      material_id: null,
      labor_rate_id: labor.id,
      admin_cost_id: null,
      equipment_system_id: null,
      quantity: 1,
      unit: labor.rate_type === 'hourly' ? 'hr' : labor.rate_type === 'daily' ? 'day' : 'job',
      unit_cost: parseFloat(labor.rate),
      line_total: parseFloat(labor.rate),
      sort_order: lineItems.length,
      section: 'labor',
      isNew: true,
    };
    setLineItems([...lineItems, newItem]);
    toast.success(`Added ${labor.name}`);
  };

  const handleAddAdminCost = (cost: any) => {
    // Check if already added
    if (lineItems.some(item => item.admin_cost_id === cost.id && !item.isDeleted)) {
      toast.error(`${cost.name} is already added`);
      return;
    }

    const newItem: LineItem = {
      item_type: 'admin_cost',
      name: cost.name,
      description: cost.description,
      material_id: null,
      labor_rate_id: null,
      admin_cost_id: cost.id,
      equipment_system_id: null,
      quantity: 1,
      unit: 'each',
      unit_cost: parseFloat(cost.amount),
      line_total: parseFloat(cost.amount),
      sort_order: lineItems.length,
      section: 'admin_costs',
      isNew: true,
    };
    setLineItems([...lineItems, newItem]);
    toast.success(`Added ${cost.name}`);
  };

  const handleAddEquipment = (equipment: any) => {
    const totalPrice = (parseFloat(equipment.system_price) || 0) +
      (parseFloat(equipment.condenser_price) || 0) +
      (parseFloat(equipment.furnace_air_handler_price) || 0) +
      (parseFloat(equipment.evap_coil_price) || 0) +
      (parseFloat(equipment.heat_kit_price) || 0);

    const newItem: LineItem = {
      item_type: 'equipment',
      name: equipment.system_name,
      description: `${equipment.system_type} - ${equipment.tonnage}T - SEER2: ${equipment.seer2}`,
      material_id: null,
      labor_rate_id: null,
      admin_cost_id: null,
      equipment_system_id: equipment.id,
      quantity: 1,
      unit: 'system',
      unit_cost: totalPrice,
      line_total: totalPrice,
      sort_order: lineItems.length,
      section: 'equipment_controls',
      isNew: true,
    };
    setLineItems([...lineItems, newItem]);
    setIsAddDialogOpen(false);
    toast.success(`Added ${equipment.system_name}`);
  };

  const handleAddCustomItem = (section: EstimateSection = 'miscellaneous_inside') => {
    const newItem: LineItem = {
      item_type: 'custom',
      name: 'Custom Item',
      description: null,
      material_id: null,
      labor_rate_id: null,
      admin_cost_id: null,
      equipment_system_id: null,
      quantity: 1,
      unit: 'each',
      unit_cost: 0,
      line_total: 0,
      sort_order: lineItems.length,
      section: section,
      isNew: true,
    };
    setLineItems([...lineItems, newItem]);
  };

  // Apply template to estimate
  const handleApplyTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Update form data with template settings
    setFormData(prev => ({
      ...prev,
      job_type: template.job_type as JobType,
      heating_type: template.heating_type as HeatingType,
      profit_margin: Number(template.profit_margin),
    }));

    // Fetch template items
    const { data: templateItems, error } = await supabase
      .from('estimate_template_items')
      .select('*')
      .eq('template_id', templateId)
      .order('sort_order');

    if (error) {
      toast.error('Failed to load template items');
      return;
    }

    if (templateItems && templateItems.length > 0) {
      const newItems: LineItem[] = templateItems.map((item, index) => ({
        item_type: item.item_type as LineItemType,
        name: item.name,
        description: item.description,
        material_id: item.material_id,
        labor_rate_id: item.labor_rate_id,
        admin_cost_id: item.admin_cost_id,
        equipment_system_id: item.equipment_system_id,
        quantity: Number(item.quantity),
        unit: item.unit,
        unit_cost: Number(item.unit_cost),
        line_total: Number(item.quantity) * Number(item.unit_cost),
        sort_order: lineItems.length + index,
        isNew: true,
      }));

      setLineItems(prev => [...prev, ...newItems]);
    }

    setIsTemplateDialogOpen(false);
    toast.success(`Applied template: ${template.name}`);
  };

  // Generate PDF
  const handleExportPDF = () => {
    if (!estimate && isNew) {
      toast.error('Please save the estimate first before exporting');
      return;
    }

    const estimateData = {
      estimate_number: estimate?.estimate_number || 'NEW',
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || null,
      customer_phone: formData.customer_phone || null,
      customer_address: formData.customer_address || null,
      job_type: formData.job_type,
      heating_type: formData.heating_type,
      job_notes: formData.job_notes || null,
      created_at: estimate?.created_at || new Date().toISOString(),
      valid_until: estimate?.valid_until || null,
    };

    const pdfLineItems = activeLineItems.map(item => ({
      item_type: item.item_type,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_cost: item.unit_cost,
      section: item.section || getDefaultSection(item.item_type),
    }));

    generateEstimatePDF(estimateData, pdfLineItems, totals, formData.tax_rate);
  };

  const handleRemoveItem = (index: number) => {
    const item = lineItems[index];
    if (item.id) {
      // Mark for deletion
      const updated = [...lineItems];
      updated[index] = { ...item, isDeleted: true };
      setLineItems(updated);
    } else {
      // Remove immediately if not saved
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_cost') {
      updated[index].line_total = updated[index].quantity * updated[index].unit_cost;
    }
    setLineItems(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filter equipment by search
  const filteredEquipment = equipmentSystems.filter(eq =>
    eq.system_name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    eq.condenser_heat_pump_model?.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    eq.ahri_number?.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  // Filter materials by category
  const filteredMaterials = materialCategory === 'all' 
    ? materials 
    : materials.filter(m => m.category === materialCategory);

  const activeLineItems = lineItems.filter(item => !item.isDeleted);

  if (!isNew && isLoadingEstimate) {
    return (
      <AdminLayout title="Loading...">
        <div className="text-center py-8 text-muted-foreground">Loading estimate...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? 'New Estimate' : `Estimate ${estimate?.estimate_number || ''}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/estimates')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isNew ? 'New Estimate' : `Estimate ${estimate?.estimate_number}`}
              </h1>
              {!isNew && (
                <p className="text-muted-foreground">
                  Created {estimate?.created_at && format(new Date(estimate.created_at), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isNew && templates.length > 0 && (
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            )}
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v as EstimateStatus })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isNew && (
              <>
                <Button variant="outline" onClick={() => setIsVersionHistoryOpen(true)}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </>
            )}
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Customer Name *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Phone</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_address">Address</Label>
                    <Input
                      id="customer_address"
                      value={formData.customer_address}
                      onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                      placeholder="123 Main St, Dallas, TX 75001"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(v) => setFormData({ ...formData, job_type: v as JobType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heating_type">Heating Type</Label>
                    <Select
                      value={formData.heating_type}
                      onValueChange={(v) => setFormData({ ...formData, heating_type: v as HeatingType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HEATING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_notes">Job Notes</Label>
                  <Textarea
                    id="job_notes"
                    value={formData.job_notes}
                    onChange={(e) => setFormData({ ...formData, job_notes: e.target.value })}
                    placeholder="Additional notes about the job..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items - Sectioned */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Line Items</h2>
                <span className="text-sm text-muted-foreground">
                  {activeLineItems.length} items
                </span>
              </div>
              
              {SECTION_CONFIGS.map((config) => {
                const sectionItems = activeLineItems.filter(
                  item => (item.section || getDefaultSection(item.item_type)) === config.key
                );
                return (
                  <EstimateSectionComponent
                    key={config.key}
                    config={config}
                    items={sectionItems}
                    onAddItem={handleSectionAddItem}
                    onRemoveItem={handleRemoveItem}
                    onUpdateItem={handleUpdateItem}
                    getActualIndex={(item) => 
                      lineItems.findIndex(li => li === item || (li.id && li.id === item.id))
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profit Margin Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Profit Margin</Label>
                    <span className="text-sm font-medium">
                      {((formData.profit_margin - 1) * 100).toFixed(0)}% ({formData.profit_margin.toFixed(2)}x)
                    </span>
                  </div>
                  <Slider
                    value={[formData.profit_margin]}
                    min={1.2}
                    max={2.0}
                    step={0.05}
                    onValueChange={([value]) => setFormData({ ...formData, profit_margin: value })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>20%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Tax Rate */}
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    value={(formData.tax_rate * 100).toFixed(2)}
                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) / 100 || 0 })}
                  />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (Cost)</span>
                    <span className="font-mono">{formatCurrency(totals.subtotalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (Charge)</span>
                    <span className="font-mono">{formatCurrency(totals.subtotalCharge)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sales Tax ({(formData.tax_rate * 100).toFixed(2)}%)</span>
                    <span className="font-mono">{formatCurrency(totals.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Grand Total</span>
                    <span className="font-mono text-primary">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Profit Analysis</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net Profit</span>
                    <span className="font-mono text-green-600">{formatCurrency(totals.netProfit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profit %</span>
                    <span className="font-mono text-green-600">{totals.profitPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {addDialogType === 'equipment' && 'Add Equipment'}
              {addDialogType === 'material' && 'Add Material'}
              {addDialogType === 'labor' && 'Add Labor'}
              {addDialogType === 'admin_cost' && 'Add Admin Cost'}
            </DialogTitle>
          </DialogHeader>

          {/* Equipment Search */}
          {addDialogType === 'equipment' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by system name, model, or AHRI..."
                  value={equipmentSearch}
                  onChange={(e) => setEquipmentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredEquipment.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No equipment found</p>
                ) : (
                  filteredEquipment.map((eq) => {
                    const totalPrice = (Number(eq.system_price) || 0) +
                      (Number(eq.condenser_price) || 0) +
                      (Number(eq.furnace_air_handler_price) || 0) +
                      (Number(eq.evap_coil_price) || 0) +
                      (Number(eq.heat_kit_price) || 0);
                    
                    return (
                      <div
                        key={eq.id}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleAddEquipment(eq)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{eq.system_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {eq.system_type} • {eq.tonnage}T • SEER2: {eq.seer2}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold">{formatCurrency(totalPrice)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Materials */}
          {addDialogType === 'material' && (
            <div className="space-y-4">
              <Select value={materialCategory} onValueChange={setMaterialCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="refrigerant">Refrigerant</SelectItem>
                  <SelectItem value="copper">Copper</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="ductwork">Ductwork</SelectItem>
                  <SelectItem value="controls">Controls</SelectItem>
                  <SelectItem value="supports">Supports</SelectItem>
                  <SelectItem value="misc">Misc</SelectItem>
                </SelectContent>
              </Select>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => { handleAddMaterial(mat); }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{mat.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">{mat.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">{formatCurrency(Number(mat.unit_cost))}</div>
                        <div className="text-xs text-muted-foreground">per {mat.unit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labor */}
          {addDialogType === 'labor' && (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {laborRates.map((labor) => (
                <div
                  key={labor.id}
                  className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => { handleAddLabor(labor); setIsAddDialogOpen(false); }}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{labor.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{labor.rate_type} rate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">{formatCurrency(Number(labor.rate))}</div>
                      <div className="text-xs text-muted-foreground">
                        {labor.rate_type === 'hourly' ? '/hr' : labor.rate_type === 'daily' ? '/day' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin Costs */}
          {addDialogType === 'admin_cost' && (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {adminCosts.map((cost) => {
                const isAdded = lineItems.some(item => item.admin_cost_id === cost.id && !item.isDeleted);
                return (
                  <div
                    key={cost.id}
                    className={`p-3 border rounded-lg transition-colors ${
                      isAdded 
                        ? 'bg-muted opacity-50 cursor-not-allowed' 
                        : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => !isAdded && handleAddAdminCost(cost)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {cost.name}
                          {cost.is_required && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Required</span>
                          )}
                          {isAdded && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Added</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">{cost.cost_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {cost.cost_type === 'percentage' 
                            ? `${cost.amount}%` 
                            : formatCurrency(Number(cost.amount))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select a Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No active templates available</p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleApplyTemplate(template.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {JOB_TYPES.find(t => t.value === template.job_type)?.label} • {HEATING_TYPES.find(t => t.value === template.heating_type)?.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-primary">
                        {((Number(template.profit_margin) - 1) * 100).toFixed(0)}% margin
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      {!isNew && id && (
        <VersionHistoryDialog
          open={isVersionHistoryOpen}
          onOpenChange={setIsVersionHistoryOpen}
          estimateId={id}
          currentEstimate={{
            customer_name: formData.customer_name,
            status: formData.status,
            job_type: formData.job_type,
            heating_type: formData.heating_type,
            profit_margin: formData.profit_margin,
            tax_rate: formData.tax_rate,
            grand_total: totals.grandTotal,
          }}
          onRestoreVersion={(versionData) => {
            // Restore form data from version
            setFormData({
              customer_name: versionData.customer_name || '',
              customer_email: versionData.customer_email || '',
              customer_phone: versionData.customer_phone || '',
              customer_address: versionData.customer_address || '',
              job_type: versionData.job_type as JobType,
              heating_type: versionData.heating_type as HeatingType,
              job_notes: versionData.job_notes || '',
              status: versionData.status as EstimateStatus,
              profit_margin: Number(versionData.profit_margin) || 1.60,
              tax_rate: Number(versionData.tax_rate) || 0.0825,
            });
            
            // Restore line items - mark existing as deleted and add version items as new
            const restoredItems: LineItem[] = (versionData.line_items || []).map((item, index) => ({
              item_type: item.item_type as LineItemType,
              name: item.name,
              description: item.description,
              material_id: null,
              labor_rate_id: null,
              admin_cost_id: null,
              equipment_system_id: null,
              quantity: Number(item.quantity),
              unit: item.unit,
              unit_cost: Number(item.unit_cost),
              line_total: Number(item.line_total),
              sort_order: index,
              isNew: true,
            }));
            
            // Mark all current items for deletion and add restored items
            const deletedItems = lineItems.filter(item => item.id).map(item => ({
              ...item,
              isDeleted: true,
            }));
            
            setLineItems([...deletedItems, ...restoredItems]);
          }}
        />
      )}
    </AdminLayout>
  );
};

// Need to import format from date-fns at the top
import { format } from 'date-fns';

export default EstimateBuilder;
