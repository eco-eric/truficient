import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Loader2, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackGetQuoteClick, trackPhoneCallClick } from '@/utils/conversionTracking';

interface CalculatorOption {
  id: string;
  option_name: string;
  label: string;
  help_text: string | null;
  options: Array<{ value: string; label: string; price_modifier: number }>;
  sort_order: number;
  is_required: boolean;
}

interface CalculatorConfig {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  config: {
    base_price?: number;
    currency?: string;
    disclaimer?: string;
  };
}

interface EstimateCalculatorProps {
  slug?: string;
  className?: string;
}

export const EstimateCalculator = ({ slug = 'hvac-estimate', className = '' }: EstimateCalculatorProps) => {
  const [loading, setLoading] = useState(true);
  const [calculator, setCalculator] = useState<CalculatorConfig | null>(null);
  const [options, setOptions] = useState<CalculatorOption[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [estimate, setEstimate] = useState<number | null>(null);

  useEffect(() => {
    const fetchCalculator = async () => {
      try {
        const { data: calcData, error: calcError } = await supabase
          .from('calculator_configs')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (calcError || !calcData) {
          console.log('Calculator not found or inactive');
          setLoading(false);
          return;
        }

        setCalculator({
          ...calcData,
          config: calcData.config as CalculatorConfig['config'] || {},
        });

        const { data: optionsData, error: optionsError } = await supabase
          .from('calculator_options')
          .select('*')
          .eq('calculator_id', calcData.id)
          .order('sort_order');

        if (optionsError) throw optionsError;

        setOptions(optionsData.map(opt => ({
          ...opt,
          options: opt.options as CalculatorOption['options'] || [],
        })) || []);
      } catch (error) {
        console.error('Error fetching calculator:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculator();
  }, [slug]);

  useEffect(() => {
    if (!calculator || options.length === 0) {
      setEstimate(null);
      return;
    }

    // Check if all required fields are filled
    const allRequiredFilled = options
      .filter(opt => opt.is_required)
      .every(opt => selections[opt.option_name]);

    if (!allRequiredFilled) {
      setEstimate(null);
      return;
    }

    // Calculate estimate
    let total = calculator.config.base_price || 0;

    options.forEach(option => {
      const selectedValue = selections[option.option_name];
      if (selectedValue) {
        const choice = option.options.find(o => o.value === selectedValue);
        if (choice) {
          total += choice.price_modifier;
        }
      }
    });

    setEstimate(total);
  }, [selections, calculator, options]);

  const handleSelectionChange = (optionName: string, value: string) => {
    setSelections(prev => ({ ...prev, [optionName]: value }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!calculator) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6" />
          <div>
            <CardTitle>{calculator.name}</CardTitle>
            {calculator.description && (
              <CardDescription className="text-primary-foreground/80">
                {calculator.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Options */}
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              <Label htmlFor={option.option_name}>
                {option.label}
                {option.is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Select
                value={selections[option.option_name] || ''}
                onValueChange={(value) => handleSelectionChange(option.option_name, value)}
              >
                <SelectTrigger id={option.option_name}>
                  <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {option.options.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.label}
                      {choice.price_modifier > 0 && (
                        <span className="text-muted-foreground ml-2">
                          (+${choice.price_modifier.toLocaleString()})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {option.help_text && (
                <p className="text-xs text-muted-foreground">{option.help_text}</p>
              )}
            </div>
          ))}
        </div>

        {/* Estimate Display */}
        {estimate !== null && (
          <div className="bg-secondary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
            <p className="text-3xl font-bold text-secondary">
              ${estimate.toLocaleString()}
              {estimate === 0 && <span className="text-lg font-normal"> (Quote Required)</span>}
            </p>
            {calculator.config.disclaimer && (
              <p className="text-xs text-muted-foreground mt-2">
                {calculator.config.disclaimer}
              </p>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            asChild 
            className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => trackGetQuoteClick(estimate || undefined)}
          >
            <Link to="/contact">
              Get Exact Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <a 
              href="tel:214-238-4349"
              onClick={() => trackPhoneCallClick('HVAC Estimate Calculator')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
