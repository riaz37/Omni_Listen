import { AlignJustify } from 'lucide-react';

interface NoteStats {
  total: number;
  general: number;
  decision: number;
  budget: number;
}

interface NoteStatsCardsProps {
  stats: NoteStats;
  onFilterChange: (category: string) => void;
}

export function NoteStatsCards({ stats, onFilterChange }: NoteStatsCardsProps) {
  const cards = [
    { label: 'Total Notes', value: stats.total, onClick: () => onFilterChange('all') },
    { label: 'General', value: stats.general, onClick: () => onFilterChange('general') },
    { label: 'Decision', value: stats.decision, onClick: () => onFilterChange('decision') },
    { label: 'Budget', value: stats.budget, onClick: () => onFilterChange('budget') },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
