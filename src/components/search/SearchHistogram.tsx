import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp } from 'lucide-react';

interface HistogramData {
  time: string;
  total: number;
  [dataset: string]: string | number;
}

interface SearchHistogramProps {
  data: HistogramData[];
  onTimeRangeSelect: (startTime: Date, endTime: Date) => void;
}

export const SearchHistogram = ({ data, onTimeRangeSelect }: SearchHistogramProps) => {
  const datasets = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const allDatasets = new Set<string>();
    for (const item of data) {
      for (const key of Object.keys(item)) {
        if (key !== 'time' && key !== 'total') {
          allDatasets.add(key);
        }
      }
    }
    return Array.from(allDatasets);
  }, [data]);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const totalEvents = data.reduce((sum, item) => sum + item.total, 0);
  const peakEPS = Math.max(...data.map(item => item.total));
  const avgEPS = Math.round(totalEvents / data.length);

  const handleBrushChange = (brushData: any) => {
    if (brushData?.startIndex !== undefined && brushData?.endIndex !== undefined) {
      const startTime = new Date(data[brushData.startIndex].time);
      const endTime = new Date(data[brushData.endIndex].time);
      onTimeRangeSelect(startTime, endTime);
    }
  };

  return (
    <Card className="h-full border-0 rounded-none">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Event Timeline</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Peak: {peakEPS} EPS</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Avg: {avgEPS} EPS</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Total: {totalEvents.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="time"
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              fontSize={10}
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              fontSize={10}
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value as string).toLocaleString()}
              formatter={(value, name) => [value, name === 'total' ? 'Total Events' : name]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            
            {/* Stacked bars for each dataset */}
            {datasets.map((dataset, index) => (
              <Bar 
                key={dataset}
                dataKey={dataset}
                stackId="events"
                fill={colors[index % colors.length]}
                opacity={0.8}
              />
            ))}
            
            {/* Brush for time selection */}
            <Brush 
              dataKey="time"
              height={20}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              onChange={handleBrushChange}
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dataset Legend */}
      <div className="p-2 border-t">
        <div className="flex flex-wrap gap-1">
          {datasets.map((dataset, index) => (
            <Badge 
              key={dataset}
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: colors[index % colors.length],
                color: colors[index % colors.length]
              }}
            >
              {dataset}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};