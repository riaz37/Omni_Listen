import { useState, useRef, useEffect } from 'react';
import { meetingsAPI } from '@/lib/api';
import { Send, Bot, User, Loader2, MessageSquare, X, ChevronDown } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface FloatingChatProps {
    jobId: string;
}

export default function FloatingChat({ jobId }: FloatingChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

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
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <h3 className="font-semibold">Meeting Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-8">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bot className="w-6 h-6 text-primary" />
                                </div>
                                <p className="font-medium text-foreground">How can I help?</p>
                                <p className="text-sm mt-1">Ask me anything about this meeting.</p>
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => setQuery("What were the key decisions?")}
                                        className="block w-full text-left text-xs bg-card p-2 rounded border border-border hover:border-primary/30 hover:text-primary transition-colors"
                                    >
                                        "What were the key decisions?"
                                    </button>
                                    <button
                                        onClick={() => setQuery("List all action items")}
                                        className="block w-full text-left text-xs bg-card p-2 rounded border border-border hover:border-primary/30 hover:text-primary transition-colors"
                                    >
                                        "List all action items"
                                    </button>
                                </div>
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
                                        <User className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-primary" />
                                    )}
                                </div>
                                <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card text-foreground border border-border rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-card rounded-2xl rounded-bl-none px-4 py-2 border border-border shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-card border-t border-border">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 bg-muted border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card text-sm"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!query.trim() || isLoading}
                                className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${isOpen
                        ? 'bg-muted text-muted-foreground rotate-90'
                        : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                    }`}
            >
                {isOpen ? <ChevronDown className="w-8 h-8" /> : <MessageSquare className="w-7 h-7" />}
            </button>
        </div>
    );
}
