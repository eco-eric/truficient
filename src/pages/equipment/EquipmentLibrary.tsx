import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Library,
  ScanLine,
  FileText,
  Thermometer,
  Wind,
  Gauge,
  Snowflake,
  Flame,
  Fan,
  Droplets,
  LayoutGrid,
  GitBranch,
  Factory,
} from 'lucide-react';
import { usePageSEO } from '@/hooks/usePageSEO';

interface EquipmentPage {
  id: string;
  slug: string;
  brand: string;
  model_number: string;
  equipment_type: string | null;
  specs: Record<string, unknown>;
  documentation_count: number;
  times_searched: number;
  published: boolean;
  created_at: string;
}

const BRAND_TABS = ['all', 'carrier', 'trane', 'lennox', 'goodman', 'rheem', 'mitsubishi', 'other'];

const EQUIPMENT_TYPES = [
  { value: 'all', label: 'All Types', icon: Factory },
  { value: 'Air Conditioner', label: 'Air Conditioner', icon: Snowflake },
  { value: 'Heat Pump', label: 'Heat Pump', icon: Thermometer },
  { value: 'Furnace', label: 'Furnace', icon: Flame },
  { value: 'Air Handler', label: 'Air Handler', icon: Fan },
  { value: 'Evaporator Coil', label: 'Evaporator Coil', icon: Droplets },
  { value: 'Condenser', label: 'Condenser', icon: Snowflake },
  { value: 'Mini Split', label: 'Mini Split', icon: Wind },
  { value: 'Window Unit', label: 'Window Unit', icon: LayoutGrid },
  { value: 'Branch Box', label: 'Branch Box', icon: GitBranch },
];

export default function EquipmentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  usePageSEO('/equipment');

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment-library', selectedBrand, selectedType, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('equipment_pages')
        .select('*')
        .eq('published', true)
        .order('times_searched', { ascending: false })
        .limit(50);

      if (selectedBrand !== 'all' && selectedBrand !== 'other') {
        query = query.ilike('brand', selectedBrand);
      } else if (selectedBrand === 'other') {
        query = query.not('brand', 'ilike', 'carrier')
          .not('brand', 'ilike', 'trane')
          .not('brand', 'ilike', 'lennox')
          .not('brand', 'ilike', 'goodman')
          .not('brand', 'ilike', 'rheem')
          .not('brand', 'ilike', 'mitsubishi');
      }

      if (selectedType !== 'all') {
        query = query.ilike('equipment_type', selectedType);
      }

      if (searchQuery) {
        query = query.or(`model_number.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EquipmentPage[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['equipment-stats'],
    queryFn: async () => {
      const { count: equipmentCount } = await supabase
        .from('equipment_pages')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      const { count: docsCount } = await supabase
        .from('equipment_documentation')
        .select('*', { count: 'exact', head: true });

      return {
        equipmentCount: equipmentCount || 0,
        documentsCount: docsCount || 0,
      };
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                <Library className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Free Equipment Database</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                HVAC Equipment Library
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Find specifications, manuals, and documentation for heating and cooling equipment
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by model number or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white text-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">{stats?.equipmentCount || 0}</span>
                <span className="text-muted-foreground">Equipment Models</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-secondary" />
                <span className="font-medium">{stats?.documentsCount || 0}</span>
                <span className="text-muted-foreground">Documents Cached</span>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Filters */}
        <section className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Tabs value={selectedBrand} onValueChange={setSelectedBrand} className="flex-1">
              <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
                {BRAND_TABS.map((brand) => (
                  <TabsTrigger
                    key={brand}
                    value={brand}
                    className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {brand === 'all' ? 'All Brands' : brand}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Equipment Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Equipment Type" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Equipment Grid */}
        <section className="container mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-8 w-48 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          ) : equipment && equipment.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => {
                const specs = item.specs as Record<string, unknown>;
                const getEquipmentTypeIcon = (type: string | null) => {
                  const iconClass = "w-4 h-4";
                  switch (type?.toLowerCase()) {
                    case 'furnace':
                      return <Flame className={iconClass} />;
                    case 'air handler':
                      return <Fan className={iconClass} />;
                    case 'condenser':
                    case 'air conditioner':
                      return <Snowflake className={iconClass} />;
                    case 'heat pump':
                      return <Thermometer className={iconClass} />;
                    case 'evaporator coil':
                      return <Droplets className={iconClass} />;
                    case 'mini split':
                      return <Wind className={iconClass} />;
                    default:
                      return <Factory className={iconClass} />;
                  }
                };
                return (
                  <Link
                    key={item.id}
                    to={`/equipment/${item.slug}`}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <Badge variant="secondary" className="capitalize mb-3">
                        {item.brand}
                      </Badge>
                      <h3 className="text-xl font-bold text-foreground mb-2 font-mono">
                        {item.model_number}
                      </h3>
                      {item.equipment_type && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                          {getEquipmentTypeIcon(item.equipment_type)}
                          <span className="capitalize">{item.equipment_type}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {specs?.tonnage && (
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            <span>{String(specs.tonnage)}</span>
                          </div>
                        )}
                        {specs?.refrigerant && (
                          <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3" />
                            <span>{String(specs.refrigerant)}</span>
                          </div>
                        )}
                        {specs?.seer_rating && (
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            <span>{String(specs.seer_rating)} SEER</span>
                          </div>
                        )}
                      </div>
                      {item.documentation_count > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <FileText className="w-4 h-4" />
                            <span>{item.documentation_count} documents available</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Library className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No equipment found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try a different search term or browse all equipment'
                  : 'The library is being built as users scan their equipment'}
              </p>
              <Link to="/scanner">
                <Button size="lg" className="gap-2">
                  <ScanLine className="w-5 h-5" />
                  Scan Your Equipment
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto p-8 text-center">
              <ScanLine className="w-12 h-12 mx-auto text-secondary mb-4" />
              <h2 className="text-2xl font-bold mb-3">Don't See Your Equipment?</h2>
              <p className="text-muted-foreground mb-6">
                Use our free scanner to decode your equipment's data plate and add it to the library
              </p>
              <Link to="/scanner">
                <Button size="lg" className="gap-2">
                  <ScanLine className="w-5 h-5" />
                  Scan Your Equipment
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
