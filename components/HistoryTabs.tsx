'use client';

import { Calendar, FileText } from 'lucide-react';

interface HistoryTabsProps {
    activeView: 'meetings' | 'days';
    onViewChange: (view: 'meetings' | 'days') => void;
}

export default function HistoryTabs({ activeView, onViewChange }: HistoryTabsProps) {
    return (
        <div className="inline-flex p-1 bg-muted rounded-xl border border-border">
            <button
                onClick={() => onViewChange('meetings')}
                className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeView === 'meetings'
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                <FileText className={`w-4 h-4 ${activeView === 'meetings' ? 'fill-current' : ''}`} />
                Meetings
            </button>
            <button
                onClick={() => onViewChange('days')}
                className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeView === 'days'
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                <Calendar className={`w-4 h-4 ${activeView === 'days' ? 'fill-current' : ''}`} />
                Days
            </button>
        </div>
    );
}
