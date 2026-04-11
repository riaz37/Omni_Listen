import { format } from 'date-fns';
import {
  BarChart3,
  Calendar,
  Link2,
} from 'lucide-react';

interface Conversation {
  job_id: string;
  title: string;
  created_at: string;
  event_count: number;
  final_summary?: any;
}

interface RecentConversationsCardProps {
  conversations: Conversation[];
  totalConversations: number;
  onNavigate: (path: string) => void;
}

export function RecentConversationsCard({ conversations, totalConversations, onNavigate }: RecentConversationsCardProps) {
  return (
    <div className="bg-card-2 rounded-lg border border-border p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Conversations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalConversations} total conversations &middot; {conversations.length} shown
        </p>
      </div>
      <div className="space-y-3">
        {conversations.length > 0 ? conversations.map((conversation) => (
          <div
            key={conversation.job_id}
            className="bg-background rounded-lg border border-border p-4 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => onNavigate(`/conversation/${conversation.job_id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground line-clamp-1">{conversation.title}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary ml-2 flex-shrink-0">
                <Link2 className="w-3 h-3" /> Sync to calendar
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {conversation.final_summary?.summary
                ? conversation.final_summary.summary.substring(0, 120) + '...'
                : 'Conversation analysis summary available.'}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted">
                <Calendar className="w-3 h-3" /> {conversation.event_count} Events
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted">
                <BarChart3 className="w-3 h-3" /> Additional Analysis
              </span>
              <span className="ml-auto">
                {conversation.created_at ? format(new Date(conversation.created_at), 'MMM dd, yyyy') : ''}
              </span>
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center py-6">No conversations yet</p>
        )}
      </div>
    </div>
  );
}
