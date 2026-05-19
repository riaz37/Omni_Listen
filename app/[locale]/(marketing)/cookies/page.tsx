'use client';

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
    title: 'Cookie Policy',
    lastUpdated: 'Last Updated:',
    lastUpdatedDate: 'April 12, 2026',
    cookiesOn: {
      heading: 'Cookies on OmniListen',
      intro: 'This platform uses cookies to keep your session secure, maintain your preferences, and provide your organization with anonymous usage analytics.',
      essentialLabel: 'Essential Cookies',
      essentialDesc: 'Required for login, session security, platform functionality. Cannot be disabled.',
      analyticsLabel: 'Analytics Cookies',
      analyticsDesc: 'Anonymous, aggregated platform usage data. No personal data included.',
      importantLabel: 'Important:',
      importantBody: 'Meeting recordings and transcriptions are NOT stored in cookies. They are handled separately under your organization\u2019s signed DPA.',
    },
    table: {
      heading: 'Cookies We Use',
      col: { name: 'Cookie Name', type: 'Type', purpose: 'Purpose', duration: 'Duration' },
      typeEssential: 'Essential',
      typeAnalytics: 'Analytics',
      sessionEnd: 'Session end',
      oneYear: '1 year',
      sixMonths: '6 months',
      purposes: {
        session: 'Authenticated user session',
        csrf: 'Cross-site request forgery protection',
        prefs: 'Language and display preferences',
        analytics: 'Anonymous platform usage tracking (no PII)',
        consent: 'Records cookie consent choice',
      },
    },
    notUse: {
      heading: 'What We Do Not Use',
      body: 'No advertising, retargeting, or behavioral tracking cookies. No cookie data shared with marketing platforms or data brokers.',
    },
    footer: 'Empowering Energy (trading as ESAP AI). All rights reserved.',
    toggle: { en: 'EN', ar: 'عربي' },
  },
  ar: {
    title: 'سياسة ملفات تعريف الارتباط',
    lastUpdated: 'آخر تحديث:',
    lastUpdatedDate: '12 أبريل 2026',
    cookiesOn: {
      heading: 'ملفات تعريف الارتباط في OmniListen',
      intro: 'تستخدم هذه المنصّة ملفات تعريف الارتباط للحفاظ على أمان جلستك، والاحتفاظ بتفضيلاتك، وتزويد مؤسستك بتحليلات استخدام مجهولة الهوية.',
      essentialLabel: 'ملفات تعريف الارتباط الأساسية',
      essentialDesc: 'ضرورية لتسجيل الدخول، وأمن الجلسة، وتشغيل المنصّة. لا يمكن تعطيلها.',
      analyticsLabel: 'ملفات تعريف الارتباط التحليلية',
      analyticsDesc: 'بيانات استخدام مجمّعة ومجهولة الهوية للمنصّة. لا تتضمّن أي بيانات شخصية.',
      importantLabel: 'هام:',
      importantBody: 'لا يتم تخزين تسجيلات الاجتماعات والتفريغات في ملفات تعريف الارتباط. يتم التعامل معها بشكل منفصل بموجب اتفاقية معالجة البيانات الموقّعة مع مؤسستك.',
    },
    table: {
      heading: 'ملفات تعريف الارتباط التي نستخدمها',
      col: { name: 'اسم ملف الارتباط', type: 'النوع', purpose: 'الغرض', duration: 'المدّة' },
      typeEssential: 'أساسي',
      typeAnalytics: 'تحليلي',
      sessionEnd: 'انتهاء الجلسة',
      oneYear: 'سنة واحدة',
      sixMonths: '6 أشهر',
      purposes: {
        session: 'جلسة المستخدم المصادَق عليه',
        csrf: 'الحماية من تزوير الطلبات عبر المواقع',
        prefs: 'تفضيلات اللغة والعرض',
        analytics: 'تتبّع استخدام المنصّة بشكل مجهول (بدون بيانات تعريف شخصية)',
        consent: 'تسجيل اختيار الموافقة على ملفات الارتباط',
      },
    },
    notUse: {
      heading: 'ما لا نستخدمه',
      body: 'لا توجد ملفات إعلانات، أو إعادة استهداف، أو تتبّع سلوكي. لا تتم مشاركة أي بيانات من ملفات الارتباط مع منصّات التسويق أو وسطاء البيانات.',
    },
    footer: 'Empowering Energy (تعمل تحت اسم ESAP AI). جميع الحقوق محفوظة.',
    toggle: { en: 'EN', ar: 'عربي' },
  },
} as const;

export default function CookiePolicyPage() {
    const { lang } = useLang();
    const t = content[lang];
    const rows = [
        { name: 'session_token', type: t.table.typeEssential, purpose: t.table.purposes.session, duration: t.table.sessionEnd },
        { name: 'csrf_token', type: t.table.typeEssential, purpose: t.table.purposes.csrf, duration: t.table.sessionEnd },
        { name: 'user_prefs', type: t.table.typeEssential, purpose: t.table.purposes.prefs, duration: t.table.oneYear },
        { name: '_analytics_id', type: t.table.typeAnalytics, purpose: t.table.purposes.analytics, duration: t.table.sixMonths },
        { name: 'cookie_consent', type: t.table.typeEssential, purpose: t.table.purposes.consent, duration: t.table.oneYear },
    ];

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
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.cookiesOn.heading}</h2>
                        <p className="text-foreground leading-relaxed mb-4">{t.cookiesOn.intro}</p>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            <li>
                                <strong>{t.cookiesOn.essentialLabel}</strong> &mdash; {t.cookiesOn.essentialDesc}
                            </li>
                            <li>
                                <strong>{t.cookiesOn.analyticsLabel}</strong> &mdash; {t.cookiesOn.analyticsDesc}
                            </li>
                        </ul>
                        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-yellow-800 dark:text-yellow-200">
                                <strong>&#9888; {t.cookiesOn.importantLabel}</strong> {t.cookiesOn.importantBody}
                            </p>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.table.heading}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.table.col.name}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.table.col.type}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.table.col.purpose}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.table.col.duration}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    {rows.map((r, i) => (
                                        <tr key={r.name} className={i < rows.length - 1 ? 'border-b' : ''}>
                                            <td className="py-3 px-4 font-mono text-sm" dir="ltr">{r.name}</td>
                                            <td className="py-3 px-4">{r.type}</td>
                                            <td className="py-3 px-4">{r.purpose}</td>
                                            <td className="py-3 px-4">{r.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.notUse.heading}</h2>
                        <p className="text-foreground">{t.notUse.body}</p>
                    </section>

                    <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} {t.footer}</p>
                    </footer>
                </article>
            </div>
        </div>
    );
}
