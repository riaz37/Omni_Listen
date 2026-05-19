'use client';

import Link from 'next/link';
import { useLang } from '@/lib/language-context';

type Lang = 'en' | 'ar';

function LanguageToggle() {
    const { lang, setLang } = useLang();
    return (
        <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
            <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    lang === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                EN
            </button>
            <button
                onClick={() => setLang('ar')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    lang === 'ar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                عربي
            </button>
        </div>
    );
}

const content = {
    en: {
        title: 'Terms of Service',
        lastUpdated: 'Last Updated:',
        lastUpdatedDate: 'April 12, 2026',
        toggle: { en: 'EN', ar: 'عربي' },
        s1: {
            heading: '1. Agreement',
            body: (link: React.ReactNode) => (
                <>
                    These Terms govern access to OmniListen at {link}, operated by <strong>Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]). Apply to the Client organization and all Authorized Users. Operate alongside MSA, SOW, and DPA &mdash; MSA/DPA takes precedence in conflicts.
                </>
            ),
        },
        s2: {
            heading: '2. Description of Service',
            items: [
                'Bilingual Arabic/English transcription (real-time and post-session)',
                'AI-powered speaker identification and labeling',
                'Automated action item extraction and task assignment',
                'Role-based meeting analysis (PM, HR, Executive)',
                'Meeting history, search, and knowledge archiving',
                'Calendar integration and session management',
                'Usage analytics and organizational dashboards',
            ],
        },
        s3: {
            heading: '3. Access and Authorized Users',
            body: 'Access exclusively to Client and designated Authorized Users per signed MSA. Client is responsible for credentials, authorized access, compliance, and ensuring all meeting participants are informed and have consented before recording.',
        },
        s4: {
            heading: '4. Participant Recording Consent',
            intro: 'Client bears full responsibility for:',
            items: [
                'Notifying all participants before recording begins',
                'Obtaining explicit, informed consent',
                'Ensuring participants are not penalized for declining',
                'Maintaining consent records per session',
            ],
            note: 'OmniListen provides in-platform recording notifications and session start prompts. Legal responsibility rests with the Client as Data Controller. Failure to obtain consent = violation of PDPL and these Terms. OmniListen is not liable for the Client\u2019s failure to consent.',
        },
        s5: {
            heading: '5. Acceptable Use',
            intro: 'Prohibited:',
            items: [
                'Recording without participant consent',
                'Personal/non-business recording context',
                'Reverse engineering platform or AI models',
                'Using outputs for competing products',
                'Sharing/reselling access',
                'Using AI outputs as the sole basis for formal HR decisions, disciplinary actions, and legal proceedings without human review',
            ],
        },
        s6: {
            heading: '6. AI-Generated Content Disclaimer',
            items: [
                'Transcription may contain errors (noisy environments, accents, technical language)',
                'Speaker ID is AI-generated, not 100% accurate \u2014 human review required',
                'Role-based outputs are decision-support only, not professional advice',
            ],
            labelPrefix: 'All outputs labeled:',
            label: '"AI-generated — review before using in formal decisions."',
        },
        s7: {
            heading: '7. Client Data and Content',
            intro: 'Client retains full ownership. OmniListen commits to:',
            items: [
                'Never selling, licensing, or sharing Client Content',
                'Never use Client Content to train AI models without explicit written consent',
                'Accessing only for contracted service delivery, security, or legal compliance',
            ],
        },
        s8: {
            heading: '8. Data Processing and Privacy',
            body: (link: React.ReactNode) => (
                <>
                    Governed by our {link} and signed DPA. Complies with PDPL Royal Decree M/19, including Sensitive Personal Data provisions under Article 23.
                </>
            ),
            linkText: 'Privacy Policy',
        },
        s9: { heading: '9. Pricing and Commercial Terms', body: 'Defined exclusively in a signed MSA or SOW. These Terms do not govern billing independently.' },
        s10: { heading: '10. Intellectual Property', body: 'All platform technology, AI models, software, documentation, and trademarks are the exclusive intellectual property of Empowering Energy. Client receives a limited, non-exclusive, non-transferable license to use the Service per the MSA.' },
        s11: { heading: '11. Confidentiality', body: 'Each party agrees to protect the other\u2019s confidential information for the duration of the agreement and for 3 years post-termination.' },
        s12: { heading: '12. Service Availability', body: 'Empowering Energy targets 99.5% service availability, excluding scheduled maintenance and force majeure events.' },
        s13: { heading: '13. Limitation of Liability', body: 'To the maximum extent permitted by law, Empowering Energy\u2019s aggregate liability is capped at 3 months\u2019 fees paid by the Client. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.' },
        s14: { heading: '14. Termination', body: 'Either party may terminate per the MSA. On termination, Client has a 30-day data export window. Permanent deletion is confirmed in writing.' },
        s15: { heading: '15. Governing Law', body: 'These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes are subject to the exclusive jurisdiction of the courts of Riyadh.' },
        s16: { heading: '16. Changes', body: 'Empowering Energy may update these Terms with 14 days\u2019 written notice to the Client.' },
        s17: {
            heading: '17. Contact',
            team: 'Empowering Energy — Legal Team',
            questionsLabel: 'Questions about these Terms:',
        },
        footer: 'Empowering Energy (trading as ESAP AI). All rights reserved.',
    },
    ar: {
        title: 'شروط الخدمة',
        lastUpdated: 'آخر تحديث:',
        lastUpdatedDate: '12 أبريل 2026',
        toggle: { en: 'EN', ar: 'عربي' },
        s1: {
            heading: '1. الاتفاقية',
            body: (link: React.ReactNode) => (
                <>
                    تنظّم هذه الشروط الوصول إلى OmniListen على {link}، المشغّلة من قِبَل <strong>Empowering Energy (تعمل تحت اسم ESAP AI)</strong> (رقم السجل التجاري [أدخل رقم السجل]). تنطبق على المؤسسة العميلة وجميع المستخدمين المعتمدين. تعمل جنبًا إلى جنب مع اتفاقيات MSA وSOW وDPA &mdash; وتسود اتفاقية MSA/DPA في حال التعارض.
                </>
            ),
        },
        s2: {
            heading: '2. وصف الخدمة',
            items: [
                'تفريغ ثنائي اللغة (عربي/إنجليزي) في الوقت الفعلي وبعد انتهاء الجلسة',
                'تحديد المتحدث ووضع العلامات بواسطة الذكاء الاصطناعي',
                'استخراج بنود العمل وتعيين المهام تلقائيًا',
                'تحليل الاجتماعات حسب الدور (مدير مشروع، موارد بشرية، تنفيذي)',
                'سجل الاجتماعات والبحث وأرشفة المعرفة',
                'التكامل مع التقويم وإدارة الجلسات',
                'تحليلات الاستخدام ولوحات المعلومات التنظيمية',
            ],
        },
        s3: {
            heading: '3. الوصول والمستخدمون المعتمدون',
            body: 'الوصول حصراً للعميل والمستخدمين المعتمدين المحددين وفقًا لاتفاقية MSA الموقّعة. يتحمّل العميل المسؤولية عن بيانات الاعتماد، والوصول المصرّح به، والامتثال، والتأكد من إبلاغ جميع المشاركين في الاجتماع وموافقتهم قبل التسجيل.',
        },
        s4: {
            heading: '4. موافقة المشاركين على التسجيل',
            intro: 'يتحمّل العميل المسؤولية الكاملة عن:',
            items: [
                'إبلاغ جميع المشاركين قبل بدء التسجيل',
                'الحصول على موافقة صريحة ومستنيرة',
                'ضمان عدم معاقبة المشاركين عند الرفض',
                'الاحتفاظ بسجلات الموافقة لكل جلسة',
            ],
            note: 'يوفّر OmniListen إشعارات التسجيل داخل المنصّة وتنبيهات بدء الجلسة. تقع المسؤولية القانونية على عاتق العميل بصفته المتحكّم في البيانات. عدم الحصول على الموافقة = انتهاك لنظام PDPL ولهذه الشروط. لا يتحمّل OmniListen المسؤولية عن إخفاق العميل في الحصول على الموافقة.',
        },
        s5: {
            heading: '5. الاستخدام المقبول',
            intro: 'يُحظر:',
            items: [
                'التسجيل دون موافقة المشاركين',
                'التسجيل في سياقات شخصية أو غير تجارية',
                'الهندسة العكسية للمنصّة أو لنماذج الذكاء الاصطناعي',
                'استخدام المخرجات في منتجات منافسة',
                'مشاركة الوصول أو إعادة بيعه',
                'استخدام مخرجات الذكاء الاصطناعي كأساس وحيد للقرارات الرسمية للموارد البشرية أو الإجراءات التأديبية أو الإجراءات القانونية دون مراجعة بشرية',
            ],
        },
        s6: {
            heading: '6. إخلاء مسؤولية المحتوى المُنشأ بالذكاء الاصطناعي',
            items: [
                'قد يحتوي التفريغ على أخطاء (بيئات مزعجة، لهجات، لغة تقنية)',
                'تحديد المتحدث مُنشأ بالذكاء الاصطناعي وليس دقيقًا بنسبة 100% — مطلوبة مراجعة بشرية',
                'المخرجات المستندة إلى الدور هي لدعم القرار فقط وليست استشارة مهنية',
            ],
            labelPrefix: 'جميع المخرجات موسومة بـ:',
            label: '"مُنشأ بالذكاء الاصطناعي — يُرجى المراجعة قبل الاستخدام في القرارات الرسمية."',
        },
        s7: {
            heading: '7. بيانات ومحتوى العميل',
            intro: 'يحتفظ العميل بالملكية الكاملة. يلتزم OmniListen بـ:',
            items: [
                'عدم بيع محتوى العميل أو ترخيصه أو مشاركته مطلقًا',
                'عدم استخدام محتوى العميل لتدريب نماذج الذكاء الاصطناعي دون موافقة خطّية صريحة',
                'الوصول فقط لتقديم الخدمة التعاقدية أو لأغراض الأمن أو الامتثال القانوني',
            ],
        },
        s8: {
            heading: '8. معالجة البيانات والخصوصية',
            body: (link: React.ReactNode) => (
                <>
                    تخضع لـ{link} الخاصة بنا واتفاقية معالجة البيانات (DPA) الموقّعة. تتوافق مع نظام حماية البيانات الشخصية (PDPL) الصادر بالمرسوم الملكي م/19، بما في ذلك أحكام البيانات الشخصية الحسّاسة وفقًا للمادة 23.
                </>
            ),
            linkText: 'سياسة الخصوصية',
        },
        s9: { heading: '9. التسعير والشروط التجارية', body: 'تُحدَّد حصراً في اتفاقية MSA أو SOW موقّعة. لا تنظّم هذه الشروط الفوترة بشكل مستقل.' },
        s10: { heading: '10. الملكية الفكرية', body: 'جميع تقنيات المنصّة، ونماذج الذكاء الاصطناعي، والبرمجيات، والوثائق، والعلامات التجارية هي ملكية فكرية حصرية لشركة Empowering Energy. يحصل العميل على ترخيص محدود، غير حصري، وغير قابل للنقل لاستخدام الخدمة وفقًا لاتفاقية MSA.' },
        s11: { heading: '11. السرّية', body: 'يوافق كل طرف على حماية المعلومات السرّية للطرف الآخر طوال مدّة الاتفاقية ولمدة 3 سنوات بعد إنهائها.' },
        s12: { heading: '12. توفّر الخدمة', body: 'تستهدف Empowering Energy توفّر الخدمة بنسبة 99.5%، باستثناء فترات الصيانة المجدوَلة وحالات القوة القاهرة.' },
        s13: { heading: '13. تحديد المسؤولية', body: 'إلى أقصى حد يسمح به القانون، تقتصر المسؤولية الإجمالية لـ Empowering Energy على رسوم 3 أشهر يدفعها العميل. لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية.' },
        s14: { heading: '14. الإنهاء', body: 'يجوز لأي طرف الإنهاء وفقًا لاتفاقية MSA. عند الإنهاء، يحصل العميل على مهلة 30 يومًا لتصدير البيانات. يتم تأكيد الحذف الدائم كتابيًا.' },
        s15: { heading: '15. القانون الحاكم', body: 'تخضع هذه الشروط لأنظمة المملكة العربية السعودية. تختصّ محاكم الرياض حصرياً بالنظر في أي نزاعات.' },
        s16: { heading: '16. التعديلات', body: 'يجوز لـ Empowering Energy تحديث هذه الشروط بإشعار كتابي للعميل قبل 14 يومًا.' },
        s17: {
            heading: '17. التواصل',
            team: 'Empowering Energy — الفريق القانوني',
            questionsLabel: 'استفسارات حول هذه الشروط:',
        },
        footer: 'Empowering Energy (تعمل تحت اسم ESAP AI). جميع الحقوق محفوظة.',
    },
} as const;

export default function TermsPage() {
    const { lang } = useLang();
    const t = content[lang];

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
            <div className="h-16" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="bg-card rounded-xl shadow-lg p-8 md:p-12">
                    <header className="mb-10 border-b pb-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-4xl font-bold text-foreground">{t.title}</h1>
                            <LanguageToggle />
                        </div>
                        <p className="text-muted-foreground">
                            <strong>{t.lastUpdated}</strong> {t.lastUpdatedDate}
                        </p>
                    </header>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s1.heading}</h2>
                        <p className="text-foreground leading-relaxed">
                            {t.s1.body(
                                <a href="https://omni-listen.vercel.app" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" dir="ltr">
                                    omni-listen.vercel.app
                                </a>
                            )}
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s2.heading}</h2>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.s2.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s3.heading}</h2>
                        <p className="text-foreground leading-relaxed">{t.s3.body}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s4.heading}</h2>
                        <div className="bg-muted rounded-lg p-6">
                            <p className="font-semibold text-foreground mb-3">{t.s4.intro}</p>
                            <ul className="list-disc ps-6 text-foreground space-y-2">
                                {t.s4.items.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                            <p className="mt-4 text-sm text-muted-foreground">{t.s4.note}</p>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s5.heading}</h2>
                        <p className="text-foreground mb-2">{t.s5.intro}</p>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.s5.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s6.heading}</h2>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.s6.items.map((item) => <li key={item}>{item}</li>)}
                            <li>{t.s6.labelPrefix} <strong>{t.s6.label}</strong></li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s7.heading}</h2>
                        <p className="text-foreground mb-2">{t.s7.intro}</p>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.s7.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s8.heading}</h2>
                        <p className="text-foreground leading-relaxed">
                            {t.s8.body(
                                <Link href="/privacy" className="text-primary hover:underline">{t.s8.linkText}</Link>
                            )}
                        </p>
                    </section>

                    {[t.s9, t.s10, t.s11, t.s12, t.s13, t.s14, t.s15, t.s16].map((s) => (
                        <section key={s.heading} className="mb-10">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">{s.heading}</h2>
                            <p className="text-foreground leading-relaxed">{s.body}</p>
                        </section>
                    ))}

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.s17.heading}</h2>
                        <div className="bg-muted rounded-lg p-6 space-y-2">
                            <p className="text-foreground"><strong>{t.s17.team}</strong></p>
                            <p className="text-foreground">
                                {t.s17.questionsLabel}{' '}
                                <a href="mailto:legal@esap.ai" className="text-primary hover:underline" dir="ltr">legal@esap.ai</a>
                            </p>
                        </div>
                    </section>

                    <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} {t.footer}</p>
                    </footer>
                </article>
            </div>
        </div>
    );
}
