import { useContext } from 'react';
import { DatabaseContext } from '@/components/providers';

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider (Providers component)');
  }
  return context;
}
