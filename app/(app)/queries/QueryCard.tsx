import { Calendar, ExternalLink, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface QueryCardProps {
  query: {
    meetingId: string;
    meetingDate: Date;
    question: string;
    answer: string;
    type: string;
  };
  globalIndex: number;
  isExpanded: boolean;
  copiedIndex: number | null;
  onToggleExpand: (index: number | null) => void;
  onCopy: (text: string, index: number) => void;
  onNavigateToMeeting: (meetingId: string) => void;
}

export function QueryCard({
  query,
  globalIndex,
  isExpanded,
  copiedIndex,
  onToggleExpand,
  onCopy,
  onNavigateToMeeting,
}: QueryCardProps) {
  const typeLabels: Record<string, string> = {
    summary: 'SUMMARY',
    analysis: 'ANALYSIS',
    list: 'LIST',
    comparison: 'COMPARISON',
    search: 'SEARCH',
    question: 'QUESTION',
  };
  const label = typeLabels[query.type] ?? 'ANALYSIS';
  const answerPreview = query.answer.length > 200 ? query.answer.substring(0, 200) + '...' : query.answer;
  const needsExpand = query.answer.length > 200;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-200">
      {/* Meeting Info & Type Badge */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">{format(query.meetingDate, 'MMM dd, yyyy • h:mm a')}</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold border border-border bg-muted text-foreground">
          {label}
        </span>
        <button
          onClick={() => onNavigateToMeeting(query.meetingId)}
          className="ml-auto text-primary hover:text-text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View Meeting
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Analysis Request Input */}
      <div className="mb-4 bg-background/60 rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-primary uppercase tracking-wide">
            ✨ Your Analysis Request
          </div>
          <button
            onClick={() => onCopy(query.question, globalIndex * 2)}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Copy request"
          >
            {copiedIndex === globalIndex * 2 ? (
              <span className="text-xs text-primary font-medium">✓ Copied</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-foreground font-medium">
          {query.question}
        </div>
      </div>

      {/* Result */}
      <div className="bg-background/60 rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-primary uppercase tracking-wide">
            💡 AI Analysis
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCopy(query.answer, globalIndex * 2 + 1)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Copy answer"
            >
              {copiedIndex === globalIndex * 2 + 1 ? (
                <span className="text-xs text-primary font-medium">✓ Copied</span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            {needsExpand && (
              <button
                onClick={() => onToggleExpand(isExpanded ? null : globalIndex)}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-xs font-medium">Show more</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="text-foreground whitespace-pre-wrap">
          {isExpanded || !needsExpand ? query.answer : answerPreview}
        </div>
      </div>
    </div>
  );
}
