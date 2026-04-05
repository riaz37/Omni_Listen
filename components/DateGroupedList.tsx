import React from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

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

    return (
        <div className="space-y-6">
            {sortedDates.map(dateStr => (
                <div key={dateStr} className="space-y-2">
                    <div className="flex items-center gap-2 py-2 px-1">
                        <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {formatDateHeader(dateStr)}
                        </h3>
                    </div>
                    <div className="space-y-2 ml-[7px] border-l-2 border-border pl-[13px]">
                        {groupedItems[dateStr].map((item, index) => (
                            <React.Fragment key={index}>
                                {renderItem(item)}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
