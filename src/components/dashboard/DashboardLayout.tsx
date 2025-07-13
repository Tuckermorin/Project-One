import React, { useState } from 'react';
import GridLayout, { WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DashboardWidget from './DashboardWidget';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import type { DashboardWidgetDefinition } from '../../types/dashboard';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const ReactGridLayout = WidthProvider(GridLayout);

interface DashboardLayoutProps {
  widgets: DashboardWidgetDefinition[];
}

// Component rendering a draggable/resizable dashboard and controls for saving layouts
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ widgets }) => {
  const defaultLayout: Layout[] = widgets.map((w, idx) => ({
    i: w.id,
    x: (idx % 2) * 6,
    y: Math.floor(idx / 2) * 4,
    w: 6,
    h: 4
  }));

  const {
    layout,
    onLayoutChange,
    saveLayoutAs,
    loadLayout,
    savedLayouts,
    currentLayoutName
  } = useDashboardLayout(defaultLayout);

  const [newName, setNewName] = useState('');

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="w-40">
          <Select
            label="Layouts"
            value={currentLayoutName}
            onChange={(val) => loadLayout(val)}
            options={savedLayouts.map(l => ({ value: l.name, label: l.name }))}
          />
        </div>
        <div className="flex-1 max-w-xs">
          <Input
            label="Save As"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            if (newName.trim()) {
              saveLayoutAs(newName.trim());
              setNewName('');
            }
          }}
        >
          Save Layout
        </Button>
      </div>
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
      >
        {widgets.map(widget => (
          <div key={widget.id} data-grid={layout.find(l => l.i === widget.id)}>
            <DashboardWidget title={widget.title}>{widget.element}</DashboardWidget>
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
};

export default DashboardLayout;
