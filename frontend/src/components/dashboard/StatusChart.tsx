import React from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { StatusMetric } from '../../types';

interface StatusChartProps {
  data: StatusMetric[];
}

export const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  const activeData = data.filter((item) => item.count > 0);

  if (activeData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        No application data to display yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="count"
            nameKey="status"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const metric = payload[0].payload as StatusMetric;
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs shadow-xl">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {metric.status}
                    </span>
                    <div className="mt-1 text-slate-500">
                      <span>{metric.count} applications ({metric.percentage}%)</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
