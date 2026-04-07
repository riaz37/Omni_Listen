'use client';

import { motion } from 'framer-motion';

interface HistoryTabsProps {
    activeView: 'meetings' | 'days';
    onViewChange: (view: 'meetings' | 'days') => void;
}

const tabs = [
    { id: 'meetings' as const, label: 'Meetings' },
    { id: 'days' as const, label: 'Days' },
];

export default function HistoryTabs({ activeView, onViewChange }: HistoryTabsProps) {
    return (
        <div className="relative inline-flex border-b border-border">
            {tabs.map((tab) => {
                const isActive = activeView === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onViewChange(tab.id)}
                        className={`relative px-5 pb-2.5 text-sm font-medium transition-colors duration-200 ${
                            isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                        {isActive && (
                            <motion.div
                                layoutId="history-tab-underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
