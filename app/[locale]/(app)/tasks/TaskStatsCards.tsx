import { AlignJustify } from 'lucide-react';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  urgent: number;
  normal: number;
}

interface TaskStatsCardsProps {
  stats: TaskStats;
  onFilterChange: (filterType: 'all' | 'pending' | 'completed', filterUrgency: 'all' | 'yes' | 'no') => void;
}

export function TaskStatsCards({ stats, onFilterChange }: TaskStatsCardsProps) {
  const cards = [
    { label: 'Total Task', value: stats.total, onClick: () => onFilterChange('all', 'all') },
    { label: 'Pending', value: stats.pending, onClick: () => onFilterChange('pending', 'all') },
    { label: 'Complete', value: stats.completed, onClick: () => onFilterChange('completed', 'all') },
    { label: 'Urgent', value: stats.urgent, onClick: () => onFilterChange('pending', 'yes') },
    { label: 'Normal', value: stats.normal, onClick: () => onFilterChange('pending', 'no') },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={card.onClick}
          className="bg-card rounded-lg border border-border p-4 cursor-pointer transition-all hover:shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <AlignJustify className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
