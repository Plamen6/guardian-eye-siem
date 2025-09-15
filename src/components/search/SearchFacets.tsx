import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Filter,
  Database,
  Server,
  Globe,
  User,
  Shield,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

interface FacetData {
  field: string;
  values: Array<{ value: string; count: number }>;
}

interface SearchFacetsProps {
  facets: FacetData[];
  activeFilters: Record<string, string[]>;
  onFilter: (field: string, value: string) => void;
}

const fieldIcons = {
  'event.dataset': Database,
  'host.name': Server,
  'source.ip': Globe,
  'user.name': User,
  'rule.name': Shield,
  'event.severity': TrendingUp,
};

const fieldLabels = {
  'event.dataset': 'Datasets',
  'host.name': 'Hosts',
  'source.ip': 'Source IPs',
  'user.name': 'Users',
  'rule.name': 'Rules',
  'event.severity': 'Severity',
};

export const SearchFacets = ({ facets, activeFilters, onFilter }: SearchFacetsProps) => {
  return (
    <div className="h-full border-r bg-muted/20">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">Faceted Search</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Click values to filter results
        </p>
      </div>

      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {facets.map(facet => {
            const Icon = fieldIcons[facet.field] || Database;
            const label = fieldLabels[facet.field] || facet.field;
            const activeValues = activeFilters[facet.field] || [];
            
            return (
              <Card key={facet.field} className="border-0 shadow-none bg-background/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {facet.values.slice(0, 10).map(item => {
                      const isActive = activeValues.includes(item.value);
                      const percentage = facet.values.length > 0 
                        ? Math.round((item.count / facet.values.reduce((sum, v) => sum + v.count, 0)) * 100)
                        : 0;
                      
                      return (
                        <Button
                          key={item.value}
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onFilter(facet.field, item.value)}
                          className="w-full justify-between h-auto p-2 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate max-w-[100px]">
                              {item.value}
                            </span>
                            {isActive && (
                              <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs px-1">
                              {item.count}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>
                        </Button>
                      );
                    })}
                    
                    {facet.values.length > 10 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-muted-foreground"
                      >
                        +{facet.values.length - 10} more...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};