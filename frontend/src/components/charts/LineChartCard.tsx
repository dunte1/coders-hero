import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartCardProps {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  height?: number;
  domain?: [number | 'auto', number | 'auto'];
}

export function LineChartCard({
  data,
  dataKey,
  nameKey = 'name',
  color = '#10b981',
  height = 280,
  domain,
}: LineChartCardProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={domain} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
