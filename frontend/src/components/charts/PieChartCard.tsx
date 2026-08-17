import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export interface PieDatum {
  name: string;
  value: number;
}

interface PieChartCardProps {
  data: PieDatum[];
  height?: number;
  colors?: string[];
}

export function PieChartCard({ data, height = 240, colors = COLORS }: PieChartCardProps) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width="55%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={85}
            strokeWidth={2}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-medium">
              {item.value}
              {total > 0 && (
                <span className="text-slate-400 ml-1">({Math.round((item.value / total) * 100)}%)</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
