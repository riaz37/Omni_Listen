'use client';

import { Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryTabsProps {
    activeView: 'meetings' | 'days';
    onViewChange: (view: 'meetings' | 'days') => void;
}

const tabs = [
    { id: 'meetings' as const, label: 'Meetings', icon: FileText },
    { id: 'days' as const, label: 'Days', icon: Calendar },
];

export default function HistoryTabs({ activeView, onViewChange }: HistoryTabsProps) {
    return (
        <div className="relative inline-flex p-1 bg-surface rounded-lg border border-border">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onViewChange(tab.id)}
                        className={`relative z-10 flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="history-tab-bg"
                                className="absolute inset-0 bg-background rounded-md shadow-sm border border-border/50"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
