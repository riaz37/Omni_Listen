import Link from 'next/link';
import { CreditCard, Check } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-muted-foreground mb-16">
                    We are finalizing our plans. For now, enjoy full access during our public beta.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Tier */}
                    <div className="bg-card-2 p-8 rounded-3xl border-2 border-primary shadow-xl relative scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                            CURRENTLY ACTIVE
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Public Beta</h3>
                        <div className="text-4xl font-extrabold text-primary mb-6">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                        <ul className="space-y-4 text-left text-muted-foreground mb-8">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Unlimited Recordings</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Advanced AI Transcription</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Smart Action Items</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Google Calendar Sync</li>
                        </ul>
                        <Link href="/signup" className="block w-full py-3 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors">
                            Start Free Now
                        </Link>
                    </div>

                    {/* Pro Tier Placeholder */}
                    <div className="bg-card-2/50 p-8 rounded-3xl border border-border opacity-75 blur-[1px]">
                        <h3 className="text-xl font-bold text-muted-foreground mb-2">Pro</h3>
                        <div className="text-3xl font-bold text-muted-foreground mb-6">Coming Soon</div>
                        <ul className="space-y-4 text-left text-muted-foreground mb-8">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> All Beta Features</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> Team Collaboration</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> Custom Vocabularies</li>
                        </ul>
                        <button disabled className="block w-full py-3 px-6 bg-muted text-muted-foreground font-bold rounded-xl cursor-not-allowed">
                            Notify Me
                        </button>
                    </div>

                    {/* Enterprise Tier Placeholder */}
                    <div className="bg-card-2/50 p-8 rounded-3xl border border-border opacity-75 blur-[1px]">
                        <h3 className="text-xl font-bold text-muted-foreground mb-2">Enterprise</h3>
                        <div className="text-3xl font-bold text-muted-foreground mb-6">Coming Soon</div>
                        <ul className="space-y-4 text-left text-muted-foreground mb-8">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> SSO & Admin Controls</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> Dedicated Support</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> On-premise Deployment</li>
                        </ul>
                        <button disabled className="block w-full py-3 px-6 bg-muted text-muted-foreground font-bold rounded-xl cursor-not-allowed">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
