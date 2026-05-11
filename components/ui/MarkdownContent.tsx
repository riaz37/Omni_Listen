'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
    return (
        <div className={className || undefined}>
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="italic">{children}</em>
                ),
                ul: ({ children }) => (
                    <ul className="mb-2 ml-4 space-y-1 list-disc">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="mb-2 ml-4 space-y-1 list-decimal">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                ),
                h1: ({ children }) => (
                    <h1 className="text-base font-bold mb-2 mt-3 first:mt-0 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-foreground">{children}</h3>
                ),
                h4: ({ children }) => (
                    <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-muted-foreground">{children}</h4>
                ),
                code: ({ children, className: codeClass }) => {
                    const isBlock = codeClass?.includes('language-');
                    if (isBlock) {
                        return (
                            <code className="block w-full font-mono text-xs leading-relaxed">
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs text-foreground">
                            {children}
                        </code>
                    );
                },
                pre: ({ children }) => (
                    <pre className="mb-2 p-3 rounded-lg bg-muted border border-border overflow-x-auto font-mono text-xs text-foreground">
                        {children}
                    </pre>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="mb-2 pl-3 border-l-2 border-primary/40 text-muted-foreground italic">
                        {children}
                    </blockquote>
                ),
                table: ({ children }) => (
                    <div className="mb-2 overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-muted/60">{children}</thead>
                ),
                tbody: ({ children }) => (
                    <tbody className="divide-y divide-border">{children}</tbody>
                ),
                tr: ({ children }) => (
                    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="px-3 py-2 text-foreground/90 align-top">{children}</td>
                ),
                hr: () => <hr className="my-2 border-border" />,
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                        {children}
                    </a>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
        </div>
    );
}
