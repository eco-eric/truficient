import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Download, Upload, Pencil, Trash2, FileText, FileSpreadsheet } from 'lucide-react';

interface EquipmentSystem {
  id: string;
  system_name: string;
  system_type: 'mini_split' | 'ducted';
  tonnage: number | null;
  ahri_number: string | null;
  condenser_heat_pump_model: string | null;
  furnace_air_handler_model: string | null;
  evap_coil_model: string | null;
  heat_kit: string | null;
  condenser_price: number | null;
  furnace_air_handler_price: number | null;
  evap_coil_price: number | null;
  heat_kit_price: number | null;
  system_price: number | null;
  seer2: number | null;
  eer2: number | null;
  hspf2: number | null;
  capacity_btuh: number | null;
  furnace_air_handler_size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PriceBook {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  category: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

type SystemFormData = Omit<EquipmentSystem, 'id' | 'created_at' | 'updated_at'>;

const defaultFormData: SystemFormData = {
  system_name: '',
  system_type: 'ducted',
  tonnage: null,
  ahri_number: null,
  condenser_heat_pump_model: null,
  furnace_air_handler_model: null,
  evap_coil_model: null,
  heat_kit: null,
  condenser_price: null,
  furnace_air_handler_price: null,
  evap_coil_price: null,
  heat_kit_price: null,
  system_price: null,
  seer2: null,
  eer2: null,
  hspf2: null,
  capacity_btuh: null,
  furnace_air_handler_size: null,
  notes: null,
};

const SystemPricing = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<EquipmentSystem | null>(null);
  const [formData, setFormData] = useState<SystemFormData>(defaultFormData);

  // Fetch equipment systems
  const { data: systems = [], isLoading: systemsLoading } = useQuery({
    queryKey: ['equipment-systems', searchTerm, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('equipment_systems')
        .select('*')
        .order('system_name');

      if (searchTerm) {
        query = query.or(`system_name.ilike.%${searchTerm}%,ahri_number.ilike.%${searchTerm}%,condenser_heat_pump_model.ilike.%${searchTerm}%,furnace_air_handler_model.ilike.%${searchTerm}%`);
      }

      if (typeFilter !== 'all') {
        query = query.eq('system_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EquipmentSystem[];
    },
  });

  // Fetch price books
  const { data: priceBooks = [], isLoading: priceBooksLoading } = useQuery({
    queryKey: ['price-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_books')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data as PriceBook[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SystemFormData & { id?: string }) => {
      if (data.id) {
        const { id, ...updateData } = data;
        const { error } = await supabase
          .from('equipment_systems')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('equipment_systems')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-systems'] });
      toast.success(editingSystem ? 'System updated successfully' : 'System added successfully');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment_systems')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-systems'] });
      toast.success('System deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Price book upload mutation
  const uploadPriceBookMutation = useMutation({
    mutationFn: async (file: File) => {
      const filePath = `${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('price-books')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('price_books')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-books'] });
      toast.success('Price book uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload error: ${error.message}`);
    },
  });

  // Delete price book mutation
  const deletePriceBookMutation = useMutation({
    mutationFn: async (priceBook: PriceBook) => {
      const { error: storageError } = await supabase.storage
        .from('price-books')
        .remove([priceBook.file_path]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('price_books')
        .delete()
        .eq('id', priceBook.id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-books'] });
      toast.success('Price book deleted successfully');
    },
    onError: (error) => {
      toast.error(`Delete error: ${error.message}`);
    },
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSystem(null);
    setFormData(defaultFormData);
  };

  const handleEdit = (system: EquipmentSystem) => {
    setEditingSystem(system);
    setFormData({
      system_name: system.system_name,
      system_type: system.system_type,
      tonnage: system.tonnage,
      ahri_number: system.ahri_number,
      condenser_heat_pump_model: system.condenser_heat_pump_model,
      furnace_air_handler_model: system.furnace_air_handler_model,
      evap_coil_model: system.evap_coil_model,
      heat_kit: system.heat_kit,
      condenser_price: system.condenser_price,
      furnace_air_handler_price: system.furnace_air_handler_price,
      evap_coil_price: system.evap_coil_price,
      heat_kit_price: system.heat_kit_price,
      system_price: system.system_price,
      seer2: system.seer2,
      eer2: system.eer2,
      hspf2: system.hspf2,
      capacity_btuh: system.capacity_btuh,
      furnace_air_handler_size: system.furnace_air_handler_size,
      notes: system.notes,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.system_name) {
      toast.error('System name is required');
      return;
    }
    saveMutation.mutate(editingSystem ? { ...formData, id: editingSystem.id } : formData);
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const templateData = [
      {
        'System Name': '',
        'System Type': 'ducted',
        'Tonnage': '',
        'AHRI Number': '',
        'Condenser/Heat Pump Model': '',
        'Furnace/Air Handler Model': '',
        'Evap Coil Model': '',
        'Heat Kit': '',
        'Condenser Price': '',
        'Furnace/Air Handler Price': '',
        'Evap Coil Price': '',
        'Heat Kit Price': '',
        'System Price': '',
        'SEER2': '',
        'EER2': '',
        'HSPF2': '',
        'Capacity BTUh': '',
        'Furnace/Air Handler Size': '',
        'Notes': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment Systems');
    XLSX.writeFile(wb, 'equipment-systems-template.xlsx');
    toast.success('Template downloaded');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const columnMap: Record<string, keyof SystemFormData> = {
          'System Name': 'system_name',
          'system_name': 'system_name',
          'System Type': 'system_type',
          'system_type': 'system_type',
          'Tonnage': 'tonnage',
          'tonnage': 'tonnage',
          'AHRI Number': 'ahri_number',
          'ahri_number': 'ahri_number',
          'Condenser/Heat Pump Model': 'condenser_heat_pump_model',
          'condenser_heat_pump_model': 'condenser_heat_pump_model',
          'Furnace/Air Handler Model': 'furnace_air_handler_model',
          'furnace_air_handler_model': 'furnace_air_handler_model',
          'Evap Coil Model': 'evap_coil_model',
          'evap_coil_model': 'evap_coil_model',
          'Heat Kit': 'heat_kit',
          'heat_kit': 'heat_kit',
          'Condenser Price': 'condenser_price',
          'condenser_price': 'condenser_price',
          'Furnace/Air Handler Price': 'furnace_air_handler_price',
          'furnace_air_handler_price': 'furnace_air_handler_price',
          'Evap Coil Price': 'evap_coil_price',
          'evap_coil_price': 'evap_coil_price',
          'Heat Kit Price': 'heat_kit_price',
          'heat_kit_price': 'heat_kit_price',
          'System Price': 'system_price',
          'system_price': 'system_price',
          'SEER2': 'seer2',
          'seer2': 'seer2',
          'EER2': 'eer2',
          'eer2': 'eer2',
          'HSPF2': 'hspf2',
          'hspf2': 'hspf2',
          'Capacity BTUh': 'capacity_btuh',
          'capacity_btuh': 'capacity_btuh',
          'Furnace/Air Handler Size': 'furnace_air_handler_size',
          'furnace_air_handler_size': 'furnace_air_handler_size',
          'Notes': 'notes',
          'notes': 'notes',
        };

        const systems: SystemFormData[] = jsonData.map((row: any) => {
          const system: any = { ...defaultFormData };
          
          Object.keys(row).forEach((key) => {
            const mappedKey = columnMap[key];
            if (mappedKey) {
              let value = row[key];
              
              // Handle system_type normalization
              if (mappedKey === 'system_type') {
                value = String(value).toLowerCase().replace(/\s+/g, '_');
                if (value !== 'mini_split' && value !== 'ducted') {
                  value = 'ducted';
                }
              }
              
              // Handle numeric fields
              if (['tonnage', 'condenser_price', 'furnace_air_handler_price', 'evap_coil_price', 
                   'heat_kit_price', 'system_price', 'seer2', 'eer2', 'hspf2', 'capacity_btuh'].includes(mappedKey)) {
                value = value ? parseFloat(value) : null;
              }
              
              system[mappedKey] = value || null;
            }
          });
          
          return system as SystemFormData;
        });

        // Filter out invalid entries
        const validSystems = systems.filter(s => s.system_name);
        
        if (validSystems.length === 0) {
          toast.error('No valid systems found in the file');
          return;
        }

        const { error } = await supabase
          .from('equipment_systems')
          .insert(validSystems);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['equipment-systems'] });
        toast.success(`Imported ${validSystems.length} systems successfully`);
      } catch (error: any) {
        toast.error(`Import error: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleUploadPriceBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    uploadPriceBookMutation.mutate(file);
    e.target.value = '';
  };

  const handleDownloadPriceBook = async (priceBook: PriceBook) => {
    const { data, error } = await supabase.storage
      .from('price-books')
      .download(priceBook.file_path);
    
    if (error) {
      toast.error('Download error');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = priceBook.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const updateFormField = (field: keyof SystemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout title="System Pricing">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">System Pricing</h1>
        </div>

        <Tabs defaultValue="equipment" className="space-y-4">
          <TabsList>
            <TabsTrigger value="equipment">Equipment Systems</TabsTrigger>
            <TabsTrigger value="pricebooks">Price Books</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search systems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ducted">Ducted</SelectItem>
                    <SelectItem value="mini_split">Mini Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
                <label>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Import
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                </label>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { setEditingSystem(null); setFormData(defaultFormData); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add System
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingSystem ? 'Edit System' : 'Add New System'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="system_name">System Name *</Label>
                            <Input
                              id="system_name"
                              value={formData.system_name}
                              onChange={(e) => updateFormField('system_name', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="system_type">System Type *</Label>
                            <Select 
                              value={formData.system_type} 
                              onValueChange={(value: 'mini_split' | 'ducted') => updateFormField('system_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ducted">Ducted</SelectItem>
                                <SelectItem value="mini_split">Mini Split</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="tonnage">Tonnage</Label>
                            <Input
                              id="tonnage"
                              type="number"
                              step="0.5"
                              value={formData.tonnage ?? ''}
                              onChange={(e) => updateFormField('tonnage', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ahri_number">AHRI Number</Label>
                            <Input
                              id="ahri_number"
                              value={formData.ahri_number ?? ''}
                              onChange={(e) => updateFormField('ahri_number', e.target.value || null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="capacity_btuh">Capacity (BTUh)</Label>
                            <Input
                              id="capacity_btuh"
                              type="number"
                              value={formData.capacity_btuh ?? ''}
                              onChange={(e) => updateFormField('capacity_btuh', e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Equipment Models & Pricing */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Equipment Models & Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="condenser_heat_pump_model">Condenser/Heat Pump Model</Label>
                            <Input
                              id="condenser_heat_pump_model"
                              value={formData.condenser_heat_pump_model ?? ''}
                              onChange={(e) => updateFormField('condenser_heat_pump_model', e.target.value || null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="condenser_price">Condenser Price</Label>
                            <Input
                              id="condenser_price"
                              type="number"
                              step="0.01"
                              value={formData.condenser_price ?? ''}
                              onChange={(e) => updateFormField('condenser_price', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="furnace_air_handler_model">Furnace/Air Handler Model</Label>
                            <Input
                              id="furnace_air_handler_model"
                              value={formData.furnace_air_handler_model ?? ''}
                              onChange={(e) => updateFormField('furnace_air_handler_model', e.target.value || null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="furnace_air_handler_price">Furnace/Air Handler Price</Label>
                            <Input
                              id="furnace_air_handler_price"
                              type="number"
                              step="0.01"
                              value={formData.furnace_air_handler_price ?? ''}
                              onChange={(e) => updateFormField('furnace_air_handler_price', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="furnace_air_handler_size">Furnace/Air Handler Size</Label>
                            <Input
                              id="furnace_air_handler_size"
                              value={formData.furnace_air_handler_size ?? ''}
                              onChange={(e) => updateFormField('furnace_air_handler_size', e.target.value || null)}
                            />
                          </div>
                          <div></div>
                          <div>
                            <Label htmlFor="evap_coil_model">Evap Coil Model</Label>
                            <Input
                              id="evap_coil_model"
                              value={formData.evap_coil_model ?? ''}
                              onChange={(e) => updateFormField('evap_coil_model', e.target.value || null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="evap_coil_price">Evap Coil Price</Label>
                            <Input
                              id="evap_coil_price"
                              type="number"
                              step="0.01"
                              value={formData.evap_coil_price ?? ''}
                              onChange={(e) => updateFormField('evap_coil_price', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="heat_kit">Heat Kit</Label>
                            <Input
                              id="heat_kit"
                              value={formData.heat_kit ?? ''}
                              onChange={(e) => updateFormField('heat_kit', e.target.value || null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="heat_kit_price">Heat Kit Price</Label>
                            <Input
                              id="heat_kit_price"
                              type="number"
                              step="0.01"
                              value={formData.heat_kit_price ?? ''}
                              onChange={(e) => updateFormField('heat_kit_price', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Efficiency Ratings */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Efficiency Ratings</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="seer2">SEER2</Label>
                            <Input
                              id="seer2"
                              type="number"
                              step="0.1"
                              value={formData.seer2 ?? ''}
                              onChange={(e) => updateFormField('seer2', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="eer2">EER2</Label>
                            <Input
                              id="eer2"
                              type="number"
                              step="0.1"
                              value={formData.eer2 ?? ''}
                              onChange={(e) => updateFormField('eer2', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="hspf2">HSPF2</Label>
                            <Input
                              id="hspf2"
                              type="number"
                              step="0.1"
                              value={formData.hspf2 ?? ''}
                              onChange={(e) => updateFormField('hspf2', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* System Price */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Total System Price</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="system_price">System Price</Label>
                            <Input
                              id="system_price"
                              type="number"
                              step="0.01"
                              value={formData.system_price ?? ''}
                              onChange={(e) => updateFormField('system_price', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-4">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes ?? ''}
                          onChange={(e) => updateFormField('notes', e.target.value || null)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleCloseForm}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saveMutation.isPending}>
                          {saveMutation.isPending ? 'Saving...' : editingSystem ? 'Update' : 'Add System'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Systems Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tonnage</TableHead>
                    <TableHead>Models</TableHead>
                    <TableHead>Ratings</TableHead>
                    <TableHead className="text-right">System Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : systems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No systems found. Add your first system or import from Excel.
                      </TableCell>
                    </TableRow>
                  ) : (
                    systems.map((system) => (
                      <TableRow key={system.id}>
                        <TableCell className="font-medium">{system.system_name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            system.system_type === 'mini_split' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {system.system_type === 'mini_split' ? 'Mini Split' : 'AC/Heat Pump'}
                          </span>
                        </TableCell>
                        <TableCell>{system.tonnage ?? '-'}</TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            {system.condenser_heat_pump_model && (
                              <div className="text-muted-foreground truncate max-w-[200px]" title={system.condenser_heat_pump_model}>
                                C: {system.condenser_heat_pump_model}
                              </div>
                            )}
                            {system.furnace_air_handler_model && (
                              <div className="text-muted-foreground truncate max-w-[200px]" title={system.furnace_air_handler_model}>
                                H: {system.furnace_air_handler_model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            {system.seer2 && <div>SEER2: {system.seer2}</div>}
                            {system.eer2 && <div>EER2: {system.eer2}</div>}
                            {system.hspf2 && <div>HSPF2: {system.hspf2}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(system.system_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(system)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this system?')) {
                                  deleteMutation.mutate(system.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="pricebooks" className="space-y-4">
            <div className="flex justify-end">
              <label>
                <Button size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleUploadPriceBook}
                />
              </label>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceBooksLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : priceBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No price books uploaded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    priceBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            <span className="font-medium">{book.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(book.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatFileSize(book.file_size)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadPriceBook(book)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this price book?')) {
                                  deletePriceBookMutation.mutate(book);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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

export default SystemPricing;
