import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  ArrowUpDown, 
  Filter,
  Clock,
  Server,
  User,
  Globe,
  Shield,
  Activity
} from 'lucide-react';
import type { NormalizedEvent } from '@/lib/types';
import { getSeverityBadgeClass } from '@/lib/mockData';
import { format } from 'date-fns';

interface SearchResultsTableProps {
  events: NormalizedEvent[];
  onEventClick: (event: NormalizedEvent) => void;
  isLoading?: boolean;
}

type SortField = 'timestamp' | 'severity' | 'host.name' | 'user.name' | 'event.action';
type SortDirection = 'asc' | 'desc';

export const SearchResultsTable = ({ events, onEventClick, isLoading }: SearchResultsTableProps) => {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [density, setDensity] = useState<'compact' | 'normal'>('normal');

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, informational: 0 };
          aValue = severityOrder[a.event.severity || 'informational'];
          bValue = severityOrder[b.event.severity || 'informational'];
          break;
        case 'host.name':
          aValue = a.host.name || '';
          bValue = b.host.name || '';
          break;
        case 'user.name':
          aValue = a.user?.name || '';
          bValue = b.user?.name || '';
          break;
        case 'event.action':
          aValue = a.event.action || '';
          bValue = b.event.action || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return <ArrowUpDown className={`w-3 h-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />;
  };

  const getRowHeight = () => density === 'compact' ? 'h-8' : 'h-12';

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span>Searching events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Table Controls */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Events ({events.length.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={density === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDensity('compact')}
            >
              Compact
            </Button>
            <Button
              variant={density === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDensity('normal')}
            >
              Normal
            </Button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Timestamp
                    {getSortIcon('timestamp')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Severity
                    {getSortIcon('severity')}
                  </div>
                </TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('host.name')}
                >
                  <div className="flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    Host
                    {getSortIcon('host.name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('user.name')}
                >
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    User
                    {getSortIcon('user.name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('event.action')}
                >
                  <div className="flex items-center gap-1">
                    Action
                    {getSortIcon('event.action')}
                  </div>
                </TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Details</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.map((event) => (
                <TableRow 
                  key={event.id} 
                  className={`${getRowHeight()} cursor-pointer hover:bg-muted/50 transition-colors`}
                  onClick={() => onEventClick(event)}
                >
                  <TableCell className="font-mono text-xs">
                    {format(new Date(event.timestamp), 'MMM dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-xs ${getSeverityBadgeClass(event.event.severity || 'informational')}`}
                    >
                      {event.event.severity?.toUpperCase() || 'INFO'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {event.event.dataset}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {event.host.name}
                  </TableCell>
                  <TableCell>
                    {event.user?.name && (
                      <span className="text-primary">{event.user.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {event.event.action || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {event.source?.ip && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {event.source.ip}
                        {event.destination?.ip && (
                          <span> → {event.destination.ip}</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {event.event.id}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {events.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Filter className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">Try adjusting your search criteria or time range</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};