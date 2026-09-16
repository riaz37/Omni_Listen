import { Mail, MapPin, Phone } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import { seoMetadata } from '@/lib/seo/metadata';
import SocialLinks from '@/components/SocialLinks';

export const generateMetadata = seoMetadata('contact');

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);
    const m = dict.marketing;

    return (
        <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-foreground mb-4">{m['contact.title']}</h1>
                    <p className="text-lg text-muted-foreground">{m['contact.subtitle']}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-card-2 p-8 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{m['contact.email_title']}</h3>
                        <p className="text-muted-foreground mb-4">{m['contact.email_subtitle']}</p>
                        <a href="mailto:support@esap.ai" className="text-primary font-medium hover:underline">support@esap.ai</a>
                    </div>

                    <div className="bg-card-2 p-8 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{m['contact.office_title']}</h3>
                        <p className="text-muted-foreground mb-4">{m['contact.office_subtitle']}</p>
                        <address className="text-primary font-medium not-italic">
                            Al Imam Saud Ibn Abdul Aziz Branch Rd, An Nakheel
                            <br />
                            Riyadh 12381, Saudi Arabia
                        </address>
                    </div>

                    <div className="bg-card-2 p-8 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{m['contact.phone_title']}</h3>
                        <p className="text-muted-foreground mb-4">{m['contact.phone_subtitle']}</p>
                        <a href="tel:+966114933906" className="text-primary font-medium hover:underline">+966 11 493 3906</a>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-8">{m['contact.follow_us']}</h2>
                    <SocialLinks variant="button" />
                                </div>
            </div>
        </div>
    );
}
