import { CheckCircle, AlertCircle } from 'lucide-react';
import { getUrgencyStyles } from '@/lib/urgency-detector';

interface MeetingSidebarProps {
    datedEvents: any[];
    notes: any[];
    onToggleCompletion: (noteId: number, currentCompleted: boolean) => void;
}

export function MeetingSidebar({ datedEvents, notes, onToggleCompletion }: MeetingSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Events */}
            {datedEvents && datedEvents.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        Events ({datedEvents.length})
                    </h3>
                    <div className="space-y-4">
                        {datedEvents.map((event: any, index: number) => {
                            // Handle both old and new field names
                            const title = event.title || event.task;
                            const date = event.date || event.due_date;
                            const formattedDate = event.formatted_date;
                            const description = event.description || event.context;

                            return (
                                <div key={index} className="border-l-4 border-primary pl-3 py-2">
                                    <p className="text-sm font-semibold text-foreground">{title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        📅 {formattedDate || date || 'TBD'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        👤 {event.assignee || 'Unassigned'}
                                    </p>
                                    {description && (
                                        <p className="text-xs text-muted-foreground mt-2">{description}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notes */}
            {notes && notes.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        Notes ({notes.length})
                    </h3>
                    <div className="space-y-4">
                        {notes.map((note: any, index: number) => {
                            // Handle both old and new field names
                            const category = note.category || note.note_type || 'GENERAL';
                            const description = note.description || note.details;

                            const isUrgent = note.urgency && note.urgency.toLowerCase() === 'yes';

                            // Determine border color based on completion and urgency
                            const styles = getUrgencyStyles(isUrgent);

                            // 4. Determine border color
                            // Priority: Completed -> Urgent -> Category Specific -> Default
                            let borderColor = 'border-yellow-500'; // Default

                            if (note.completed) {
                                borderColor = 'border-primary';
                            } else if (isUrgent) {
                                borderColor = styles.border;
                            } else if (category === 'BUDGET' || category === 'BUDGET_REQUEST') {
                                borderColor = 'border-primary';
                            } else if (category === 'DECISION') {
                                borderColor = 'border-blue-500';
                            }

                            // 5. Determine background
                            const bgClass = !note.completed && isUrgent ? styles.cardBg : '';

                            return (
                                <div
                                    key={note.id || index}
                                    className={`border-l-4 ${borderColor} pl-3 py-2 ${bgClass} ${note.completed ? 'opacity-75' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                                    {category.replace(/_/g, ' ')}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    {note.completed && (
                                                        <span className="px-2 py-0.5 bg-primary/10 text-text-primary rounded text-xs font-medium flex-shrink-0">
                                                            ✓ Done
                                                        </span>
                                                    )}
                                                    {!note.completed && isUrgent && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${styles.badge}`}>
                                                            {styles.icon}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-sm font-semibold text-foreground mt-1 ${note.completed ? 'line-through' : ''}`}>
                                                {note.title}
                                            </p>
                                            {description && (
                                                <p className="text-xs text-muted-foreground mt-2">{description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
