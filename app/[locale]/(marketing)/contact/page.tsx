import { Mail, MapPin, Phone, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

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
                        <p className="text-primary font-medium">123 Innovation Drive, Tech City</p>
                    </div>

                    <div className="bg-card-2 p-8 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{m['contact.phone_title']}</h3>
                        <p className="text-muted-foreground mb-4">{m['contact.phone_subtitle']}</p>
                        <a href="tel:+15550000000" className="text-primary font-medium hover:underline">+1 (555) 000-0000</a>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-8">{m['contact.follow_us']}</h2>
                    <div className="flex justify-center gap-6">
                        <a href="https://x.com/esap_ai" target="_blank" rel="noopener noreferrer" className="bg-card-2 p-4 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/company/esapai/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="bg-card-2 p-4 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                            <Linkedin className="w-6 h-6" />
                        </a>
                        <a href="https://www.facebook.com/esapai.official" target="_blank" rel="noopener noreferrer" className="bg-card-2 p-4 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                            <Facebook className="w-6 h-6" />
                        </a>
                        <a href="https://www.instagram.com/esapai.official/" target="_blank" rel="noopener noreferrer" className="bg-card-2 p-4 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="https://www.youtube.com/channel/UC7LyRbfXwb7at1gCQpUMzGg" target="_blank" rel="noopener noreferrer" className="bg-card-2 p-4 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                            <Youtube className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
