import { Layout } from 'react-grid-layout';
import React from 'react';

export interface DashboardWidgetDefinition {
  id: string;
  title: string;
  element: React.ReactNode;
}

export interface DashboardSavedLayout {
  name: string;
  layout: Layout[];
}
