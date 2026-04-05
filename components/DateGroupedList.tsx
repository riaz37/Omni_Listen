import React from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { motion } from 'framer-motion';
import { DURATIONS, EASINGS, STAGGER } from '@/lib/motion';

interface DateGroupedListProps<T> {
    items: T[];
    dateKey: keyof T;
    renderItem: (item: T) => React.ReactNode;
    emptyMessage?: string;
    sortDirection?: 'asc' | 'desc';
}

export function DateGroupedList<T>({
    items,
    dateKey,
    renderItem,
    emptyMessage = "No items found",
    sortDirection = 'desc'
}: DateGroupedListProps<T>) {

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    // Group items by date
    const groupedItems = items.reduce((groups, item) => {
        const dateValue = item[dateKey];

        if (!dateValue) {
            const noDateKey = 'no-date';
            if (!groups[noDateKey]) {
                groups[noDateKey] = [];
            }
            groups[noDateKey].push(item);
            return groups;
        }

        const dateStr = typeof dateValue === 'string'
            ? dateValue
            : (dateValue as any).toISOString();

        const date = parseISO(dateStr);
        const dateKeyStr = format(date, 'yyyy-MM-dd');

        if (!groups[dateKeyStr]) {
            groups[dateKeyStr] = [];
        }
        groups[dateKeyStr].push(item);
        return groups;
    }, {} as Record<string, T[]>);

    // Sort dates based on direction, with 'no-date' at the end
    const sortedDates = Object.keys(groupedItems)
        .filter(k => k !== 'no-date')
        .sort((a, b) => {
            const dateA = new Date(a).getTime();
            const dateB = new Date(b).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });

    if (groupedItems['no-date']) {
        sortedDates.push('no-date');
    }

    const formatDateHeader = (dateStr: string) => {
        if (dateStr === 'no-date') return 'No Date';
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM dd, yyyy');
    };

    const getDateCount = (dateStr: string) => groupedItems[dateStr].length;

    return (
        <div className="space-y-8">
            {sortedDates.map((dateStr, groupIndex) => (
                <motion.div
                    key={dateStr}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: DURATIONS.normal,
                        ease: EASINGS.easeOut,
                        delay: groupIndex * STAGGER.fast,
                    }}
                >
                    {/* Date header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/60 ring-4 ring-primary/10 flex-shrink-0" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {formatDateHeader(dateStr)}
                        </h3>
                        <span className="text-xs text-muted-foreground/60">
                            {getDateCount(dateStr)} meeting{getDateCount(dateStr) !== 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                    </div>

                    {/* Items */}
                    <div className="space-y-3 ml-[5px] border-l border-border/40 pl-5">
                        {groupedItems[dateStr].map((item, index) => (
                            <React.Fragment key={index}>
                                {renderItem(item)}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
