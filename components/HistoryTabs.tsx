'use client';

import { Calendar, FileText } from 'lucide-react';

interface HistoryTabsProps {
    activeView: 'meetings' | 'days';
    onViewChange: (view: 'meetings' | 'days') => void;
}

export default function HistoryTabs({ activeView, onViewChange }: HistoryTabsProps) {
    return (
        <div className="grid grid-cols-2 p-1 bg-muted rounded-xl border border-border max-w-sm">
            <button
                onClick={() => onViewChange('meetings')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeView === 'meetings'
                        ? 'bg-card text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
            >
                <FileText className={`w-4 h-4 ${activeView === 'meetings' ? 'fill-current' : ''}`} />
                Meetings
            </button>
            <button
                onClick={() => onViewChange('days')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeView === 'days'
                        ? 'bg-card text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
            >
                <Calendar className={`w-4 h-4 ${activeView === 'days' ? 'fill-current' : ''}`} />
                Days
            </button>
        </div>
    );
}
