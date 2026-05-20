import { Shield, Lock, Server, Eye, FileCheck, AlertTriangle } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

export default async function SecurityPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);
    const m = dict.marketing as Record<string, string>;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20">
                <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-6 text-primary dark:text-primary">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        {m['security.hero_title']}{' '}
                        <span className="text-primary">{m['security.hero_title_highlight']}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        {m['security.hero_subtitle']}
                    </p>
                </div>
            </div>

            {/* Key Pillars */}
            <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                    {/* Encryption */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">{m['security.encryption_title']}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {m['security.encryption_body']}
                        </p>
                    </div>

                    {/* Infrastructure */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">{m['security.infrastructure_title']}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {m['security.infrastructure_body']}
                        </p>
                    </div>

                    {/* AI Privacy */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">{m['security.ai_privacy_title']}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {m['security.ai_privacy_body']}
                        </p>
                    </div>

                    {/* Access Control */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary dark:text-primary mb-6">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">{m['security.access_title']}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {m['security.access_body']}
                        </p>
                    </div>

                </div>
            </div>

            {/* Reporting Section */}
            <div className="bg-card-2/50 py-20 border-t border-border">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-8">{m['security.reporting_title']}</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {m['security.reporting_body']}
                    </p>
                    <a
                        href="mailto:security@esap.ai"
                        className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-white px-8 py-4 rounded-full font-medium transition-colors"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        {m['security.reporting_cta']}
                    </a>
                </div>
            </div>
        </div>
    );
}
