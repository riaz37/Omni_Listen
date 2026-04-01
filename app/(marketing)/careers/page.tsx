import Link from 'next/link';
import { Rocket, Mail } from 'lucide-react';

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-orange-600 dark:text-orange-400 animate-pulse">
                    <Rocket className="w-10 h-10" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    We're Hiring Soon!
                </h1>

                <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                    We are growing fast and always looking for talented individuals to help us build the future of meeting intelligence. Check back here for open positions.
                </p>

                <div className="bg-card-2 p-8 rounded-2xl border border-border inline-block w-full max-w-md">
                    <h3 className="font-bold text-foreground mb-2">Can't wait?</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Send us your resume and tell us why you'd be a great fit.
                    </p>
                    <a
                        href="mailto:careers@esap.ai"
                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                        <Mail className="w-5 h-5" />
                        careers@esap.ai
                    </a>
                </div>

                <div className="mt-12">
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
