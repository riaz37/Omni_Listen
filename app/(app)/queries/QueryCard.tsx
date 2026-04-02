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
  const typeConfig = {
    summary: { label: 'SUMMARY', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700', gradient: 'from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30' },
    analysis: { label: 'ANALYSIS', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700', gradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30' },
    list: { label: 'LIST', color: 'bg-primary/10 text-text-primary border-primary/20', gradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' },
    comparison: { label: 'COMPARISON', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700', gradient: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30' },
    search: { label: 'SEARCH', color: 'bg-primary/10 text-text-primary border-primary/20', gradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' },
    question: { label: 'QUESTION', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700', gradient: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30' },
  };
  const config = typeConfig[query.type as keyof typeof typeConfig] || typeConfig.analysis;
  const answerPreview = query.answer.length > 200 ? query.answer.substring(0, 200) + '...' : query.answer;
  const needsExpand = query.answer.length > 200;

  return (
    <div
      className={`bg-gradient-to-br ${config.gradient} rounded-lg shadow-sm border-2 border-border p-6 hover:shadow-lg transition-all duration-200`}
    >
      {/* Meeting Info & Type Badge */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">{format(query.meetingDate, 'MMM dd, yyyy • h:mm a')}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
          {config.label}
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
      <div className="mb-4 bg-card/60 rounded-lg p-4 border border-border">
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
      <div className="bg-card rounded-lg p-4 border-2 border-border">
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
