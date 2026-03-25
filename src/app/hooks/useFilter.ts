import { useState, useMemo } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UseFilterProps<T> {
  items: T[];
  filterKey: keyof T;
  searchKeys?: (keyof T)[];
}

export function useFilter<T>({ items, filterKey, searchKeys = [] }: UseFilterProps<T>) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const normalizeComparable = (value: string) =>
    value
      .toLowerCase()
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[\s/-]+/g, '_')
      .replace(/[^a-z0-9_]+/g, '');

  const filteredItems = useMemo(() => {
    let result = items;

    // Apply category filter
    if (activeFilter !== 'all') {
      result = result.filter((item) => {
        const value = item[filterKey];
        if (typeof value === 'string') {
          return normalizeComparable(value) === normalizeComparable(activeFilter);
        }
        return value === activeFilter;
      });
    }

    // Apply search filter
    if (searchTerm && searchKeys.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return searchKeys.some((key) => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerSearch);
          }
          return false;
        });
      });
    }

    return result;
  }, [items, activeFilter, searchTerm, filterKey, searchKeys]);

  return {
    filteredItems,
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
  };
}

export interface UseSortProps<T> {
  items: T[];
  initialKey: keyof T;
  initialDirection?: 'asc' | 'desc';
}

export function useSort<T>({ items, initialKey, initialDirection = 'asc' }: UseSortProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T>(initialKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialDirection);

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }, [items, sortKey, sortDirection]);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return {
    sortedItems,
    sortKey,
    sortDirection,
    toggleSort,
  };
}
