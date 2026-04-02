import { FileText } from 'lucide-react';

// Helper function to highlight important keywords in text
const getLineStyle = (text: string) => {
    const categories = [
        {
            id: 'urgent',
            // Added: عاجل (Urgent), ضروري (Necessary), طارئ (Emergency), فورا (Immediately)
            patterns: ['URGENT:', 'عاجل'],
            className: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-900 dark:text-red-200',

        }
    ];

    // Combine English and Arabic detection logic
    for (const cat of categories) {
        // We create a Regex that works for both languages:
        // 1. We join all patterns with OR (|)
        // 2. We use a "Look ahead" or generic boundary to catch words even if they have Arabic prefixes like "Al-" (ال)
        // This regex looks for the pattern appearing at the start of line, after a space, or as a distinct word.
        const pattern = new RegExp(`(?:^|\\s|\\b)(${cat.patterns.join('|')})`, 'i');

        if (pattern.test(text)) {
            return {
                className: `${cat.className} pl-4 py-2 my-2 rounded-r`,

            };
        }
    }

    // Default style (no highlight)
    return {
        className: 'mb-2 leading-relaxed text-foreground',

    };
};

interface MeetingKeyTakeawaysProps {
    summary: {
        english?: string;
        arabic?: string;
        original_language?: string;
    };
}

export function MeetingKeyTakeaways({ summary }: MeetingKeyTakeawaysProps) {
    const englishText = summary?.english;
    const arabicText = summary?.arabic || summary?.original_language;

    return (
        <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Key Takeaways
            </h2>
            <div className="space-y-4">
                {englishText && (
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-2">English</h3>
                        <div className="prose prose-sm max-w-none">
                            {englishText.split('\n').map((line: string, i: number) => {
                                // Calculate style BEFORE rendering
                                const style = getLineStyle(line);

                                return (
                                    <p key={i} className={style.className}>
                                        {<span className="mr-2">{line}</span>}

                                    </p>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* ARABIC SECTION */}
                {arabicText && arabicText !== englishText && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-foreground mb-2">Arabic</h3>
                        <div className="prose prose-sm max-w-none" dir="rtl">
                            {arabicText.split('\n').map((line: string, i: number) => {
                                const style = getLineStyle(line);

                                return (
                                    <p key={i} className={style.className}>
                                        {<span className="ml-2"></span>}
                                        {line}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
