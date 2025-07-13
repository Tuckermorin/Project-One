import React from 'react';

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, children }) => {
  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      {/* drag handle for react-grid-layout */}
      <div className="drag-handle cursor-move px-3 py-2 border-b border-gray-200 bg-gray-50 text-sm font-medium">
        {title}
      </div>
      <div className="p-4 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardWidget;
