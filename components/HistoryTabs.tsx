'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/use-translation';

interface HistoryTabsProps {
    activeView: 'conversations' | 'days';
    onViewChange: (view: 'conversations' | 'days') => void;
}

const tabs = [
    { id: 'conversations' as const, labelKey: 'history.tabs.conversations' },
    { id: 'days' as const, labelKey: 'history.tabs.days' },
];

export default function HistoryTabs({ activeView, onViewChange }: HistoryTabsProps) {
    const { t } = useTranslation();
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
                        {t(tab.labelKey)}
                        {isActive && (
                            <motion.div
                                layoutId="history-tab-underline"
                                className="absolute bottom-0 start-0 end-0 h-0.5 bg-primary"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
