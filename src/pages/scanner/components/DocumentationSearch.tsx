import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  Loader2,
  BookOpen,
  FileCode,
  ClipboardList,
  File,
  AlertCircle,
} from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { documentationApi, DocumentResult, getBrandSupportUrl } from '@/lib/api/documentation';

const DOCUMENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  submittal: { label: 'Submittal Sheet', icon: ClipboardList },
  manual: { label: 'Installation Manual', icon: BookOpen },
  wiring_diagram: { label: 'Wiring Diagram', icon: FileCode },
  spec_sheet: { label: 'Specification Sheet', icon: FileText },
  other: { label: 'Documentation', icon: File },
};

interface DocumentRowProps {
  document: DocumentResult;
}

function DocumentRow({ document }: DocumentRowProps) {
  const config = DOCUMENT_TYPE_CONFIG[document.document_type] || DOCUMENT_TYPE_CONFIG.other;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">
            {document.document_title || config.label}
          </p>
          {document.source_domain && (
            <p className="text-xs text-muted-foreground truncate">
              {document.source_domain}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="outline" className="text-xs">
          {document.file_type?.toUpperCase() || 'PDF'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-primary hover:text-primary/80"
        >
          <a href={document.document_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            Open
          </a>
        </Button>
      </div>
    </div>
  );
}

export function DocumentationSearch() {
  const { state } = useScanner();
  const { result } = state;
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!result?.specs) {
    return null;
  }

  const { specs } = result;
  const brand = specs.brand || 'Unknown';
  const modelNumber = specs.model_number;

  const handleSearch = async () => {
    if (!brand || !modelNumber) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await documentationApi.searchDocumentation(brand, modelNumber);
      
      if (response.success && response.documents) {
        setDocuments(response.documents);
      } else {
        setError(response.error || 'Failed to search documentation');
      }
    } catch (err) {
      console.error('Documentation search error:', err);
      setError('Failed to search for documentation');
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  // Group documents by type
  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.document_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, DocumentResult[]>);

  const documentTypes = ['submittal', 'manual', 'wiring_diagram', 'spec_sheet', 'other'];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/20">
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Documentation & Manuals</h3>
            <p className="text-sm text-muted-foreground">Find installation guides, wiring diagrams & specs</p>
          </div>
        </div>
      </div>

      <Separator />

      {!hasSearched && !isSearching && (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            Search for manufacturer documentation for your {brand} equipment
          </p>
          <Button onClick={handleSearch} size="lg" className="gap-2">
            <Search className="w-4 h-4" />
            Search for Documentation
          </Button>
        </div>
      )}

      {isSearching && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Searching manufacturer databases...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Search Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {hasSearched && !isSearching && documents.length > 0 && (
        <div className="space-y-4">
          {documentTypes.map(type => {
            const docs = groupedDocuments[type];
            if (!docs || docs.length === 0) return null;

            const config = DOCUMENT_TYPE_CONFIG[type] || DOCUMENT_TYPE_CONFIG.other;

            return (
              <div key={type}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {config.label}s ({docs.length})
                </h4>
                <div className="bg-muted/30 rounded-lg">
                  {docs.map((doc, index) => (
                    <DocumentRow key={`${doc.document_url}-${index}`} document={doc} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasSearched && !isSearching && documents.length === 0 && !error && (
        <div className="text-center py-6">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-2">
            No documentation found for this model
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try searching the manufacturer's website directly:
          </p>
          <Button variant="outline" asChild>
            <a href={getBrandSupportUrl(brand)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit {brand} Support
            </a>
          </Button>
        </div>
      )}

      {hasSearched && documents.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" onClick={handleSearch} disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            Search Again
          </Button>
        </div>
      )}
    </Card>
  );
}
