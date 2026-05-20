import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

interface ConversationTranscriptProps {
    transcript: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export function ConversationTranscript({ transcript, isExpanded, onToggleExpand }: ConversationTranscriptProps) {
    const { t } = useTranslation();
    return (
        <div className="bg-card rounded-lg border border-border p-6">
            <button
                onClick={onToggleExpand}
                className="w-full flex justify-between items-center group"
            >
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">{t('conversation.transcript_title')}</h2>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                )}
            </button>

            {isExpanded && (
                <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto mt-4">
                    <pre className="whitespace-pre-wrap text-sm text-foreground">
                        {transcript}
                    </pre>
                </div>
            )}
        </div>
    );
}
