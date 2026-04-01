import { useState, useRef, useEffect } from 'react';
import { meetingsAPI } from '@/lib/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface MeetingQueryProps {
    jobId: string;
}

export default function MeetingQuery({ jobId }: MeetingQueryProps) {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim() || isLoading) return;

        const userMessage = query.trim();
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await meetingsAPI.queryMeeting(jobId, userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-card rounded-lg shadow-sm border border-border">
            <div className="p-4 border-b border-border bg-muted rounded-t-lg">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Ask AI about this meeting
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground mt-8">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Ask questions like:</p>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>"What were the key decisions?"</li>
                            <li>"Did we discuss the budget?"</li>
                            <li>"Who is responsible for the next steps?"</li>
                        </ul>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary/10' : 'bg-primary/10'
                            }`}>
                            {msg.role === 'user' ? (
                                <User className="w-5 h-5 text-primary" />
                            ) : (
                                <Bot className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className={`rounded-lg p-3 max-w-[80%] text-sm ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about the meeting..."
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || isLoading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
