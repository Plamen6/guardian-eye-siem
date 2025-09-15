import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface SearchTimeSelectorProps {
  timeRange: string;
  customStartDate?: Date;
  customEndDate?: Date;
  onChange: (range: string, startDate?: Date, endDate?: Date) => void;
}

const quickRanges = [
  { value: 'last-15m', label: 'Last 15m', icon: Zap },
  { value: 'last-1h', label: 'Last 1h', icon: Clock },
  { value: 'last-4h', label: 'Last 4h', icon: Clock },
  { value: 'last-24h', label: 'Last 24h', icon: CalendarIcon },
  { value: 'last-7d', label: 'Last 7d', icon: CalendarIcon },
  { value: 'last-30d', label: 'Last 30d', icon: CalendarIcon },
  { value: 'custom', label: 'Custom', icon: CalendarIcon },
];

export const SearchTimeSelector = ({ 
  timeRange, 
  customStartDate, 
  customEndDate, 
  onChange 
}: SearchTimeSelectorProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(customStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(customEndDate);

  const handleQuickRange = (range: string) => {
    onChange(range);
  };

  const handleCustomRange = () => {
    if (startDate && endDate) {
      onChange('custom', startDate, endDate);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">Time Range:</span>
      
      {/* Quick Range Buttons */}
      <div className="flex gap-1">
        {quickRanges.map(range => {
          const Icon = range.icon;
          return (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickRange(range.value)}
              className="h-8"
            >
              <Icon className="w-3 h-3 mr-1" />
              {range.label}
            </Button>
          );
        })}
      </div>

      {/* Custom Date Pickers */}
      {timeRange === 'custom' && (
        <div className="flex items-center gap-2 ml-4 pl-4 border-l">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {startDate ? format(startDate, "MMM dd, HH:mm") : "Start"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {endDate ? format(endDate, "MMM dd, HH:mm") : "End"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button 
            size="sm" 
            onClick={handleCustomRange}
            disabled={!startDate || !endDate}
            className="h-8"
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
};