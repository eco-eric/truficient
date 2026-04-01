import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin, Wrench, FileText, Calendar, MessageSquare, Loader2, ChevronRight, Clock, Kanban } from 'lucide-react';
import { useGlobalSearch, type SearchResult, type GlobalSearchResults } from '@/hooks/useGlobalSearch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SECTION_CONFIG: {
  key: keyof GlobalSearchResults;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'customers', label: 'CUSTOMERS', icon: User },
  { key: 'locations', label: 'LOCATIONS', icon: MapPin },
  { key: 'jobs', label: 'JOBS', icon: Wrench },
  { key: 'pipeline', label: 'PIPELINE', icon: Kanban },
  { key: 'interactions', label: 'INTERACTIONS', icon: MessageSquare },
  { key: 'estimates', label: 'ESTIMATES', icon: FileText },
  { key: 'appointments', label: 'APPOINTMENTS', icon: Calendar },
];

export const GlobalSearch = () => {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, close, recentSearches } = useGlobalSearch();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    close();
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
  };

  const totalCount = results
    ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  const hasResults = totalCount > 0;
  const showDropdown = isOpen;

  return (
    <>
      {/* Desktop inline search */}
      <div ref={containerRef} className="relative hidden md:block">
        <div
          className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 cursor-text w-[320px]"
          onClick={() => setIsOpen(true)}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          {isOpen ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, jobs, locations..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          ) : (
            <span className="flex-1 text-sm text-muted-foreground">Search...</span>
          )}
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-[480px] max-h-[70vh] overflow-y-auto rounded-lg border bg-popover shadow-xl z-50">
            <SearchDropdownContent
              query={query}
              results={results}
              isLoading={isLoading}
              totalCount={totalCount}
              hasResults={hasResults}
              recentSearches={recentSearches}
              onResultClick={handleResultClick}
              onRecentClick={handleRecentClick}
            />
          </div>
        )}
      </div>

      {/* Mobile search icon */}
      <button
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Mobile full-screen overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, jobs, locations..."
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={close}
              className="text-sm text-muted-foreground hover:text-foreground px-2 py-1"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SearchDropdownContent
              query={query}
              results={results}
              isLoading={isLoading}
              totalCount={totalCount}
              hasResults={hasResults}
              recentSearches={recentSearches}
              onResultClick={handleResultClick}
              onRecentClick={handleRecentClick}
            />
          </div>
        </div>
      )}
    </>
  );
};

interface SearchDropdownContentProps {
  query: string;
  results: GlobalSearchResults | null;
  isLoading: boolean;
  totalCount: number;
  hasResults: boolean;
  recentSearches: string[];
  onResultClick: (result: SearchResult) => void;
  onRecentClick: (q: string) => void;
}

const SearchDropdownContent = ({
  query,
  results,
  isLoading,
  totalCount,
  hasResults,
  recentSearches,
  onResultClick,
  onRecentClick,
}: SearchDropdownContentProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Searching...</span>
      </div>
    );
  }

  // Empty query — show recents
  if (query.trim().length < 2) {
    if (recentSearches.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search
        </div>
      );
    }
    return (
      <div className="py-2">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Recent Searches
        </div>
        {recentSearches.map((q) => (
          <button
            key={q}
            onClick={() => onRecentClick(q)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    );
  }

  // No results
  if (results && !hasResults) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No results for "<span className="font-medium text-foreground">{query}</span>"
        </p>
        <p className="text-xs text-muted-foreground mt-1">Try a shorter or different search term</p>
      </div>
    );
  }

  // Results
  if (results && hasResults) {
    return (
      <div className="py-1">
        {SECTION_CONFIG.map(({ key, label, icon: Icon }) => {
          const items = results[key];
          if (!items || items.length === 0) return null;
          return (
            <div key={key}>
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-t first:border-t-0">
                {label}
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onResultClick(item)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-[#1e3a5f]/5 transition-colors text-left group"
                >
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    {item.sublabel && (
                      <div className="text-xs text-muted-foreground truncate">{item.sublabel}</div>
                    )}
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
            </div>
          );
        })}
        {totalCount > 15 && (
          <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t">
            Showing top results — refine your search for more
          </div>
        )}
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground/50 text-center border-t">
          Powered by global search
        </div>
      </div>
    );
  }

  return null;
};
