import Link from 'next/link';
import { Check } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);
    const m = dict.marketing;

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    {m['pricing.page_title']}
                </h1>
                <p className="text-xl text-muted-foreground mb-16">
                    {m['pricing.page_subtitle']}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Tier */}
                    <div className="bg-card-2 p-8 rounded-3xl border-2 border-primary shadow-xl relative scale-105 z-10">
                        <div className="absolute top-0 end-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-es-xl rounded-se-2xl">
                            {m['pricing.badge_active']}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{m['pricing.beta_title']}</h3>
                        <div className="text-4xl font-extrabold text-primary mb-6">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                        <ul className="space-y-4 text-start text-muted-foreground mb-8">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> {m['pricing.beta_feature1']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> {m['pricing.beta_feature2']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> {m['pricing.beta_feature3']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> {m['pricing.beta_feature4']}</li>
                        </ul>
                        <Link href={`/${locale}/signup`} className="block w-full py-3 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors">
                            {m['pricing.beta_cta']}
                        </Link>
                    </div>

                    {/* Pro Tier Placeholder */}
                    <div className="bg-card-2/50 p-8 rounded-3xl border border-border opacity-75 blur-[1px]">
                        <h3 className="text-xl font-bold text-muted-foreground mb-2">{m['pricing.pro_title']}</h3>
                        <div className="text-3xl font-bold text-muted-foreground mb-6">{m['pricing.coming_soon']}</div>
                        <ul className="space-y-4 text-start text-muted-foreground mb-8">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> {m['pricing.pro_feature1']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> {m['pricing.pro_feature2']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> {m['pricing.pro_feature3']}</li>
                        </ul>
                        <button disabled className="block w-full py-3 px-6 bg-muted text-muted-foreground font-bold rounded-xl cursor-not-allowed">
                            {m['pricing.notify_me']}
                        </button>
                    </div>

                    {/* Enterprise Tier Placeholder */}
                    <div className="bg-card-2/50 p-8 rounded-3xl border border-border opacity-75 blur-[1px]">
                        <h3 className="text-xl font-bold text-muted-foreground mb-2">{m['pricing.enterprise_title']}</h3>
                        <div className="text-3xl font-bold text-muted-foreground mb-6">{m['pricing.coming_soon']}</div>
                        <ul className="space-y-4 text-start text-muted-foreground mb-8">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> {m['pricing.enterprise_feature1']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> {m['pricing.enterprise_feature2']}</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5" /> {m['pricing.enterprise_feature3']}</li>
                        </ul>
                        <button disabled className="block w-full py-3 px-6 bg-muted text-muted-foreground font-bold rounded-xl cursor-not-allowed">
                            {m['pricing.contact_sales']}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
