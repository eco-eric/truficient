import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  route: string;
  entity_type: string;
  badge?: string;
  badge_color?: string;
}

export interface GlobalSearchResults {
  customers: SearchResult[];
  locations: SearchResult[];
  jobs: SearchResult[];
  pipeline: SearchResult[];
  interactions: SearchResult[];
  estimates: SearchResult[];
  appointments: SearchResult[];
}

const RECENT_KEY = 'global_search_recent';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter(q => q !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('global-search', {
          body: { query: query.trim() },
        });
        if (!error && data?.results) {
          setResults(data.results);
          addRecentSearch(query.trim());
          setRecentSearches(getRecentSearches());
        }
      } catch (e) {
        console.error('Global search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
  }, []);

  return { query, setQuery, results, isLoading, isOpen, setIsOpen, close, recentSearches };
}
