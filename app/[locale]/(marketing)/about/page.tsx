import Link from 'next/link';
import { Users, Shield, Zap, Heart } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);
    const m = dict.marketing;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-primary/5 border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
                        {m['about.hero_title']} <span className="text-primary">{m['about.hero_title_highlight']}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        {m['about.hero_subtitle']}
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-6">{m['about.story_title']}</h2>
                        <div className="prose dark:prose-invert text-lg text-muted-foreground space-y-6">
                            <p>
                                {m['about.story_p1']} <strong>{m['about.story_p1_bold']}</strong>
                            </p>
                            <p>{m['about.story_p2']}</p>
                            <p>
                                {m['about.story_p3_prefix']} <em>{m['about.story_p3_em']}</em> {m['about.story_p3_suffix']}
                            </p>
                        </div>
                    </div>
                    <div className="bg-card-2 rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Users className="w-24 h-24 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">{m['about.team_caption']}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="bg-card-2/50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">{m['about.values_title']}</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">{m['about.values_subtitle']}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card-2 p-8 rounded-2xl shadow-sm border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{m['about.value1_title']}</h3>
                            <p className="text-muted-foreground">{m['about.value1_body']}</p>
                        </div>

                        <div className="bg-card-2 p-8 rounded-2xl shadow-sm border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{m['about.value2_title']}</h3>
                            <p className="text-muted-foreground">{m['about.value2_body']}</p>
                        </div>

                        <div className="bg-card-2 p-8 rounded-2xl shadow-sm border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{m['about.value3_title']}</h3>
                            <p className="text-muted-foreground">{m['about.value3_body']}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-20 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-8">{m['about.cta_title']}</h2>
                <Link
                    href={`/${locale}/signup`}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-foreground bg-primary rounded-full hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/30"
                >
                    {m['about.cta_btn']}
                </Link>
            </div>
        </div>
    );
}
