import { useEffect, useState } from 'react';
import type { Layout } from 'react-grid-layout';
import { useLocalStorage } from './useLocalStorage';
import type { DashboardSavedLayout } from '../types/dashboard';

const DEFAULT_NAME = 'Default view';

// Hook managing dashboard layouts with persistence in localStorage
export function useDashboardLayout(defaultLayout: Layout[]) {
  const [savedLayouts, setSavedLayouts] = useLocalStorage<DashboardSavedLayout[]>(
    'dashboardLayouts',
    [{ name: DEFAULT_NAME, layout: defaultLayout }]
  );
  const [currentLayoutName, setCurrentLayoutName] = useLocalStorage<string>(
    'dashboardCurrentLayout',
    DEFAULT_NAME
  );
  const [layout, setLayout] = useState<Layout[]>(() => {
    const found = savedLayouts.find(l => l.name === currentLayoutName);
    return found ? found.layout : defaultLayout;
  });

  useEffect(() => {
    const found = savedLayouts.find(l => l.name === currentLayoutName);
    if (found) setLayout(found.layout);
  }, [currentLayoutName, savedLayouts]);

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    setSavedLayouts(prev => prev.map(l => (l.name === currentLayoutName ? { ...l, layout: newLayout } : l)));
  };

  const saveLayoutAs = (name: string) => {
    setSavedLayouts(prev => {
      const others = prev.filter(l => l.name !== name);
      return [...others, { name, layout }];
    });
    setCurrentLayoutName(name);
  };

  const loadLayout = (name: string) => {
    const found = savedLayouts.find(l => l.name === name);
    if (found) {
      setCurrentLayoutName(name);
      setLayout(found.layout);
    }
  };

  const deleteLayout = (name: string) => {
    setSavedLayouts(prev => prev.filter(l => l.name !== name));
    if (currentLayoutName === name) {
      setCurrentLayoutName(DEFAULT_NAME);
    }
  };

  return {
    layout,
    onLayoutChange,
    saveLayoutAs,
    loadLayout,
    deleteLayout,
    savedLayouts,
    currentLayoutName
  };
}
