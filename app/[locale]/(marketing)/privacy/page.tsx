'use client';

import { useState } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import Footer from '@/components/landing/Footer';

type Lang = 'en' | 'ar';

const content = {
    en: {
        title: 'Privacy Policy',
        lastUpdated: 'Last Updated:',
        lastUpdatedDate: 'April 12, 2026',
        toggle: { en: 'EN', ar: 'عربي' },
        whoWeAre: {
            heading: 'Who We Are',
            body: (
                <>
                    OmniListen is an AI-powered meeting transcription and intelligence platform developed and operated by{' '}
                    <strong>Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]). We help enterprise teams
                    capture, transcribe, and extract actionable insights from Arabic and English meetings with speaker
                    identification, role-based analysis, and automated action item generation.
                </>
            ),
        },
        role: {
            heading: 'Our Role: Data Processor',
            body: (
                <>
                    OmniListen operates exclusively in a B2B enterprise context. Your organization is the{' '}
                    <strong>Data Controller</strong> &mdash; you determine who uses the platform and for what purpose.
                    Empowering Energy (OmniListen) acts solely as a <strong>Data Processor</strong>, processing meeting data
                    only on your organization&apos;s behalf and strictly under your documented instructions.
                </>
            ),
        },
        sensitive: {
            heading: 'Important: Sensitive Personal Data',
            intro: (
                <>
                    OmniListen processes voice recordings and performs speaker identification &mdash; both classified as{' '}
                    <strong>Sensitive Personal Data</strong> under PDPL Article 23.
                </>
            ),
            meansLabel: 'This means:',
            items: [
                <>Your organization must obtain <strong>explicit, informed consent</strong> from all meeting participants before any recording begins</>,
                'Participants must be clearly informed that their voice is being recorded, transcribed, and analyzed by AI',
                'Sensitive data is subject to stricter processing, storage, and transfer rules',
                'Empowering Energy will process voice and speaker data only within the scope defined in your signed DPA',
            ],
        },
        whatData: {
            heading: 'What Data We Process',
            items: [
                { b: 'Authorized User Identity Data', t: 'Names, work emails, job titles, employee IDs' },
                { b: 'Voice and Audio Data', t: 'Audio recordings of meetings (Sensitive Personal Data)' },
                { b: 'Transcription Data', t: 'Text transcriptions in Arabic and English' },
                { b: 'Speaker Identification Data', t: 'AI-powered voice analysis labels (biometric-adjacent, treated as Sensitive Personal Data)' },
                { b: 'Meeting Metadata', t: 'Title, date, time, duration, participant count, language, platform source' },
                { b: 'Role-Based Analysis Outputs', t: 'Summaries, action items, decisions for PM/HR/Executive roles' },
                { b: 'Technical and Security Data', t: 'IP addresses, device types, session timestamps, access logs' },
                { b: 'Support Communications', t: 'Messages exchanged with the support team' },
            ],
        },
        whyProcess: {
            heading: 'Why We Process Your Data',
            col: { purpose: 'Purpose', basis: 'Lawful Basis' },
            rows: [
                ['Meeting transcription and AI analysis', 'Performance of contract'],
                ['Speaker identification and role-based outputs', 'Explicit consent (via your organization)'],
                ['User authentication and access', 'Performance of contract'],
                ['Platform security', 'Legitimate interest'],
                ['Service quality improvement', 'Legitimate interest'],
                ['Legal and regulatory compliance', 'Legal obligation'],
            ],
            footer: 'We never process data for advertising, profiling, or any purpose outside the contracted scope.',
        },
        ai: {
            heading: 'How We Use AI',
            items: [
                'All outputs are assistance tools — not final records or legal documents',
                <>Every AI output is labeled: <strong>&quot;AI-generated — review before using in formal decisions.&quot;</strong></>,
                'Speaker identification accuracy is high but not infallible — human review required',
                'Role-based analysis is for decision-support only — does not constitute HR advice, legal opinion, or management instruction',
                'We do not use your meeting recordings or transcriptions to train AI models without explicit written consent',
                'We maintain full documentation of AI models, language capabilities, and processing logic',
            ],
        },
        consent: {
            heading: 'Participant Consent Obligation',
            intro: 'Because OmniListen records voices of all participants — including non-registered users — your organization must:',
            items: [
                'Inform all participants before the recording begins',
                'Obtain explicit consent, particularly for sensitive topics (HR, legal, financial)',
                'Provide the ability to opt out without professional consequences',
                'Maintain records of consent for each session',
            ],
        },
        sharing: {
            heading: 'Data Sharing and Sub-Processors',
            col: { provider: 'Provider', purpose: 'Purpose', location: 'Location' },
            rows: [
                ['Cloud Hosting Provider', 'Infrastructure and encrypted audio storage', 'USA'],
                ['AI Transcription / NLP Provider', 'Speech-to-text and language processing', 'USA'],
                ['AI Model Provider', 'Meeting analysis and output generation', 'USA'],
                ['Analytics Platform', 'Anonymous usage analytics', 'USA'],
            ],
            footer: "30 days' advance notice for any sub-processor changes. Right to object included.",
        },
        googleDisclosure: {
            heading: 'Data Processing and Third-Party Disclosures',
            body: 'To provide the features of OmniListen, we engage limited third-party service providers to act as data processors. These sub-processors are utilized solely for technical processing required to deliver the service (such as data analysis and processing).',
            noSellBody: 'We do not sell or share your Google user data for any purposes outside of these core functional requirements. All third-party processors are contractually bound to maintain data confidentiality and are strictly prohibited from using your data to train their own models or for any secondary purposes.',
            limitedUse: {
                heading: 'Limited Use Disclosure',
                body: "OmniListen’s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
                linkText: 'Google API Services User Data Policy',
                link: 'https://developers.google.com/terms/api-services-user-data-policy',
            },
        },
        transfers: {
            heading: 'Cross-Border Data Transfers',
            intro: 'All transfers are protected by:',
            items: [
                'SDAIA-approved Standard Contractual Clauses (SCCs)',
                'Encrypted transmission and storage at all international points',
                'Contractual prohibition on secondary use',
            ],
        },
        rights: {
            heading: 'Your Organization\u2019s Rights Under PDPL',
            items: [
                { b: 'Access', t: 'Copy of all personal and sensitive data' },
                { b: 'Correction', t: 'Fix inaccurate metadata, speaker labels, and identity data' },
                { b: 'Deletion', t: 'Specific recordings, transcriptions, or all data' },
                { b: 'Portability', t: 'JSON or CSV export' },
                { b: 'Objection', t: 'Object to processing not in DPA' },
                { b: 'Restriction', t: 'Restrict processing during dispute' },
                { b: 'Audit', t: 'Evidence of PDPL compliance' },
            ],
        },
        retention: {
            heading: 'Data Retention',
            col: { type: 'Data Type', period: 'Retention Period' },
            rows: [
                ['Voice recordings (audio files)', '90 days, then auto-deleted'],
                ['Transcription text', 'Contract duration + 6 months'],
                ['Speaker identification labels', 'Contract duration + 6 months'],
                ['Role-based analysis outputs', 'Contract duration + 6 months'],
                ['Meeting metadata', 'Contract duration + 1 year'],
                ['User account data', 'Contract duration + 1 year'],
                ['Support communications', '2 years'],
                ['Security and access logs', '6 months'],
            ],
            footer: '30-day data export window on termination. Permanent deletion confirmed in writing.',
        },
        security: {
            heading: 'Data Security',
            items: [
                'AES-256 encryption at rest for all audio and transcriptions',
                'TLS 1.3 encryption in transit',
                'Audio files in isolated, access-controlled storage buckets',
                'Role-based access controls — only authorized personnel',
                'No employee access to raw audio without a logged reason',
                'Regular security audits and vulnerability assessments',
                '72-hour SDAIA breach notification + immediate client notification',
            ],
        },
        contact: {
            heading: 'Contact and Complaints',
            team: 'Empowering Energy — Data Privacy Team',
            complaintsLabel: 'Complaints: SDAIA at',
        },
        footer: 'Empowering Energy (trading as ESAP AI). All rights reserved.',
    },
    ar: {
        title: 'سياسة الخصوصية',
        lastUpdated: 'آخر تحديث:',
        lastUpdatedDate: '12 أبريل 2026',
        toggle: { en: 'EN', ar: 'عربي' },
        whoWeAre: {
            heading: 'من نحن',
            body: (
                <>
                    OmniListen هو منصّة لتفريغ الاجتماعات وتحليلها مدعومة بالذكاء الاصطناعي، مطوّرة ومشغّلة من قِبَل{' '}
                    <strong>Empowering Energy (تعمل تحت اسم ESAP AI)</strong> (رقم السجل التجاري [أدخل رقم السجل]). نساعد فرق المؤسسات على التقاط الاجتماعات العربية والإنجليزية وتفريغها واستخلاص رؤى قابلة للتنفيذ، مع تحديد المتحدّث، والتحليل حسب الدور، وتوليد بنود العمل تلقائيًا.
                </>
            ),
        },
        role: {
            heading: 'دورنا: معالِج البيانات',
            body: (
                <>
                    يعمل OmniListen حصراً في سياق المؤسسات (B2B). مؤسستك هي{' '}
                    <strong>المتحكِّم في البيانات</strong> &mdash; فهي تحدّد من يستخدم المنصّة ولأي غرض.
                    وتعمل Empowering Energy (OmniListen) بصفتها{' '}
                    <strong>معالِج البيانات</strong> فقط، حيث تعالج بيانات الاجتماعات نيابةً عن مؤسستك وحصراً وفقًا لتعليماتها الموثّقة.
                </>
            ),
        },
        sensitive: {
            heading: 'هام: البيانات الشخصية الحسّاسة',
            intro: (
                <>
                    يعالج OmniListen التسجيلات الصوتية ويُجري تحديد المتحدّث &mdash; وكلاهما مصنّف بوصفه{' '}
                    <strong>بيانات شخصية حسّاسة</strong> وفقًا للمادة 23 من نظام حماية البيانات الشخصية (PDPL).
                </>
            ),
            meansLabel: 'وهذا يعني:',
            items: [
                <>يجب على مؤسستك الحصول على <strong>موافقة صريحة ومستنيرة</strong> من جميع المشاركين في الاجتماع قبل بدء أي تسجيل</>,
                'يجب إبلاغ المشاركين بوضوح بأن أصواتهم تُسجَّل وتُفرَّغ وتُحلَّل بواسطة الذكاء الاصطناعي',
                'تخضع البيانات الحسّاسة لقواعد أكثر صرامة في المعالجة والتخزين والنقل',
                'ستعالج Empowering Energy البيانات الصوتية وبيانات المتحدّث فقط ضمن النطاق المحدّد في اتفاقية معالجة البيانات (DPA) الموقّعة معك',
            ],
        },
        whatData: {
            heading: 'البيانات التي نعالجها',
            items: [
                { b: 'بيانات هوية المستخدمين المعتمدين', t: 'الأسماء، وعناوين البريد المهني، والمسميات الوظيفية، ومعرّفات الموظفين' },
                { b: 'البيانات الصوتية', t: 'تسجيلات صوتية للاجتماعات (بيانات شخصية حسّاسة)' },
                { b: 'بيانات التفريغ', t: 'تفريغات نصّية باللغتين العربية والإنجليزية' },
                { b: 'بيانات تحديد المتحدّث', t: 'عناوين تحليل صوتي مدعوم بالذكاء الاصطناعي (شبيهة بالبيومترية وتُعامَل كبيانات شخصية حسّاسة)' },
                { b: 'البيانات الوصفية للاجتماع', t: 'العنوان، والتاريخ، والوقت، والمدة، وعدد المشاركين، واللغة، ومصدر المنصّة' },
                { b: 'مخرجات التحليل حسب الدور', t: 'الملخّصات، وبنود العمل، والقرارات لأدوار مدير المشروع والموارد البشرية والتنفيذيين' },
                { b: 'البيانات التقنية والأمنية', t: 'عناوين IP، وأنواع الأجهزة، والطوابع الزمنية للجلسات، وسجلات الوصول' },
                { b: 'مراسلات الدعم', t: 'الرسائل المتبادَلة مع فريق الدعم' },
            ],
        },
        whyProcess: {
            heading: 'لماذا نعالج بياناتك',
            col: { purpose: 'الغرض', basis: 'الأساس القانوني' },
            rows: [
                ['تفريغ الاجتماعات وتحليلها بالذكاء الاصطناعي', 'تنفيذ العقد'],
                ['تحديد المتحدّث والمخرجات المستندة إلى الدور', 'موافقة صريحة (عبر مؤسستك)'],
                ['مصادقة المستخدم والوصول', 'تنفيذ العقد'],
                ['أمن المنصّة', 'المصلحة المشروعة'],
                ['تحسين جودة الخدمة', 'المصلحة المشروعة'],
                ['الامتثال القانوني والتنظيمي', 'التزام قانوني'],
            ],
            footer: 'لا نعالج البيانات لأغراض الإعلان أو التنميط أو أي غرض خارج نطاق العقد.',
        },
        ai: {
            heading: 'كيف نستخدم الذكاء الاصطناعي',
            items: [
                'جميع المخرجات أدوات مساعدة — وليست سجلات نهائية أو وثائق قانونية',
                <>كل مخرج من الذكاء الاصطناعي موسوم بـ: <strong>&quot;مُنشأ بالذكاء الاصطناعي — يُرجى المراجعة قبل الاستخدام في القرارات الرسمية.&quot;</strong></>,
                'دقّة تحديد المتحدّث عالية لكنها ليست معصومة — مطلوبة مراجعة بشرية',
                'التحليل المستند إلى الدور لدعم القرار فقط — ولا يُعدّ استشارة للموارد البشرية أو رأيًا قانونيًا أو تعليمات إدارية',
                'لا نستخدم تسجيلات الاجتماعات أو التفريغات لتدريب نماذج الذكاء الاصطناعي دون موافقة خطّية صريحة',
                'نحتفظ بتوثيق كامل لنماذج الذكاء الاصطناعي وقدرات اللغة ومنطق المعالجة',
            ],
        },
        consent: {
            heading: 'التزام الموافقة من المشاركين',
            intro: 'نظرًا لأن OmniListen يسجّل أصوات جميع المشاركين — بمن فيهم المستخدمون غير المسجّلين — يجب على مؤسستك:',
            items: [
                'إبلاغ جميع المشاركين قبل بدء التسجيل',
                'الحصول على موافقة صريحة، لا سيما في المواضيع الحسّاسة (الموارد البشرية، القانون، المالية)',
                'توفير إمكانية الرفض دون أي تبعات مهنية',
                'الاحتفاظ بسجلات الموافقة لكل جلسة',
            ],
        },
        sharing: {
            heading: 'مشاركة البيانات والمعالِجون من الباطن',
            col: { provider: 'المزوِّد', purpose: 'الغرض', location: 'الموقع' },
            rows: [
                ['مزوِّد الاستضافة السحابية', 'البنية التحتية والتخزين الصوتي المشفّر', 'الولايات المتحدة'],
                ['مزوِّد التفريغ ومعالجة اللغة الطبيعية بالذكاء الاصطناعي', 'تحويل الكلام إلى نص ومعالجة اللغة', 'الولايات المتحدة'],
                ['مزوِّد نموذج الذكاء الاصطناعي', 'تحليل الاجتماعات وتوليد المخرجات', 'الولايات المتحدة'],
                ['منصّة التحليلات', 'تحليلات استخدام مجهولة الهوية', 'الولايات المتحدة'],
            ],
            footer: 'إشعار مسبق مدّته 30 يومًا لأي تغيير في المعالِجين من الباطن. مع حق الاعتراض.',
        },
        googleDisclosure: {
            heading: 'معالجة البيانات والإفصاح عن الأطراف الثالثة',
            body: 'لتقديم ميزات OmniListen، نتعاقد مع عدد محدود من مزوّدي الخدمات الخارجيين بوصفهم معالِجين للبيانات. يُستخدم هؤلاء المعالِجون من الباطن حصراً للمعالجة التقنية اللازمة لتقديم الخدمة (مثل تحليل البيانات ومعالجتها).',
            noSellBody: 'لا نبيع بيانات مستخدمي Google ولا نشاركها لأي أغراض خارج نطاق هذه المتطلبات الوظيفية الأساسية. ويلتزم جميع المعالِجون من الباطن تعاقديًا بالحفاظ على سرية البيانات، ويُحظر عليهم صراحةً استخدام بياناتك لتدريب نماذجهم الخاصة أو لأي أغراض ثانوية.',
            limitedUse: {
                heading: 'إفصاح الاستخدام المحدود',
                body: 'يلتزم استخدام OmniListen ونقله إلى أي تطبيق آخر للمعلومات المستلَمة من واجهات برمجة تطبيقات Google بسياسة بيانات المستخدم لخدمات Google API، بما في ذلك متطلبات الاستخدام المحدود.',
                linkText: 'سياسة بيانات المستخدم لخدمات Google API',
                link: 'https://developers.google.com/terms/api-services-user-data-policy',
            },
        },
        transfers: {
            heading: 'نقل البيانات عبر الحدود',
            intro: 'جميع عمليات النقل محمية بـ:',
            items: [
                'الشروط التعاقدية النموذجية (SCCs) المعتمدة من SDAIA',
                'إرسال وتخزين مشفّر في جميع نقاط التبادل الدولية',
                'حظر تعاقدي على أي استخدام ثانوي',
            ],
        },
        rights: {
            heading: 'حقوق مؤسستك بموجب نظام حماية البيانات الشخصية (PDPL)',
            items: [
                { b: 'الاطلاع', t: 'نسخة من جميع البيانات الشخصية والحسّاسة' },
                { b: 'التصحيح', t: 'تصحيح البيانات الوصفية غير الدقيقة، وعناوين المتحدّث، وبيانات الهوية' },
                { b: 'الحذف', t: 'تسجيلات أو تفريغات محددة، أو جميع البيانات' },
                { b: 'قابلية النقل', t: 'تصدير بصيغة JSON أو CSV' },
                { b: 'الاعتراض', t: 'الاعتراض على أي معالجة خارج نطاق اتفاقية DPA' },
                { b: 'تقييد المعالجة', t: 'تقييد المعالجة أثناء النزاع' },
                { b: 'التدقيق', t: 'إثبات الامتثال لنظام PDPL' },
            ],
        },
        retention: {
            heading: 'الاحتفاظ بالبيانات',
            col: { type: 'نوع البيانات', period: 'مدّة الاحتفاظ' },
            rows: [
                ['التسجيلات الصوتية (ملفات الصوت)', '90 يومًا، ثم تُحذف تلقائيًا'],
                ['نص التفريغ', 'مدّة العقد + 6 أشهر'],
                ['عناوين تحديد المتحدّث', 'مدّة العقد + 6 أشهر'],
                ['مخرجات التحليل حسب الدور', 'مدّة العقد + 6 أشهر'],
                ['البيانات الوصفية للاجتماع', 'مدّة العقد + سنة'],
                ['بيانات حساب المستخدم', 'مدّة العقد + سنة'],
                ['مراسلات الدعم', 'سنتان'],
                ['سجلات الأمن والوصول', '6 أشهر'],
            ],
            footer: 'نافذة تصدير بيانات لمدة 30 يومًا عند الإنهاء. ويؤكَّد الحذف الدائم كتابيًا.',
        },
        security: {
            heading: 'أمن البيانات',
            items: [
                'تشفير AES-256 أثناء الراحة لجميع الصوتيات والتفريغات',
                'تشفير TLS 1.3 أثناء الإرسال',
                'ملفات صوتية في مستودعات تخزين معزولة وخاضعة للتحكم بالوصول',
                'ضوابط وصول مستندة إلى الدور — للموظفين المعتمدين فقط',
                'عدم وصول أي موظف إلى الصوت الخام دون تسجيل السبب',
                'عمليات تدقيق أمنية منتظمة وتقييم للثغرات',
                'إشعار SDAIA خلال 72 ساعة + إشعار فوري للعميل عند أي خرق',
            ],
        },
        contact: {
            heading: 'التواصل والشكاوى',
            team: 'Empowering Energy — فريق خصوصية البيانات',
            complaintsLabel: 'الشكاوى: SDAIA عبر',
        },
        footer: 'Empowering Energy (تعمل تحت اسم ESAP AI). جميع الحقوق محفوظة.',
    },
} as const;

export default function PrivacyPage() {
    const [lang, setLang] = useState<Lang>('en');
    const t = content[lang];

    return (
        <div className="min-h-screen bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
            <LandingNav />
            <div className="h-16" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="bg-card rounded-xl shadow-lg p-8 md:p-12">
                    <header className="mb-10 border-b pb-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-4xl font-bold text-foreground">{t.title}</h1>
                            <LanguageToggle lang={lang} setLang={setLang} labels={t.toggle} />
                        </div>
                        <p className="text-muted-foreground">
                            <strong>{t.lastUpdated}</strong> {t.lastUpdatedDate}
                        </p>
                    </header>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.whoWeAre.heading}</h2>
                        <p className="text-foreground leading-relaxed">{t.whoWeAre.body}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.role.heading}</h2>
                        <p className="text-foreground leading-relaxed">{t.role.body}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sensitive.heading}</h2>
                        <p className="text-foreground mb-4">{t.sensitive.intro}</p>
                        <p className="text-foreground mb-2">{t.sensitive.meansLabel}</p>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.sensitive.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.whatData.heading}</h2>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.whatData.items.map((it) => (
                                <li key={it.b}><strong>{it.b}</strong> &mdash; {it.t}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.whyProcess.heading}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.whyProcess.col.purpose}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.whyProcess.col.basis}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    {t.whyProcess.rows.map((row, i) => (
                                        <tr key={i} className={i < t.whyProcess.rows.length - 1 ? 'border-b' : ''}>
                                            <td className="py-3 px-4">{row[0]}</td>
                                            <td className="py-3 px-4">{row[1]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-foreground mt-4">{t.whyProcess.footer}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.ai.heading}</h2>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.ai.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.consent.heading}</h2>
                        <p className="text-foreground mb-4">{t.consent.intro}</p>
                        <ol className="list-decimal ps-6 text-foreground space-y-2">
                            {t.consent.items.map((item) => <li key={item}>{item}</li>)}
                        </ol>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.sharing.heading}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.sharing.col.provider}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.sharing.col.purpose}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.sharing.col.location}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    {t.sharing.rows.map((row, i) => (
                                        <tr key={i} className={i < t.sharing.rows.length - 1 ? 'border-b' : ''}>
                                            <td className="py-3 px-4">{row[0]}</td>
                                            <td className="py-3 px-4">{row[1]}</td>
                                            <td className="py-3 px-4">{row[2]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-foreground mt-4">{t.sharing.footer}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.googleDisclosure.heading}</h2>
                        <p className="text-foreground leading-relaxed mb-4">{t.googleDisclosure.body}</p>
                        <p className="text-foreground leading-relaxed mb-6">{t.googleDisclosure.noSellBody}</p>
                        <div className="border border-primary/30 bg-primary/5 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-3">{t.googleDisclosure.limitedUse.heading}</h3>
                            <p className="text-foreground leading-relaxed">
                                {t.googleDisclosure.limitedUse.body}{' '}
                                <a
                                    href={t.googleDisclosure.limitedUse.link}
                                    className="text-primary hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    dir="ltr"
                                >
                                    {t.googleDisclosure.limitedUse.linkText}
                                </a>
                                .
                            </p>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.transfers.heading}</h2>
                        <p className="text-foreground mb-2">{t.transfers.intro}</p>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.transfers.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.rights.heading}</h2>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.rights.items.map((it) => (
                                <li key={it.b}><strong>{it.b}</strong> &mdash; {it.t}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.retention.heading}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.retention.col.type}</th>
                                        <th className="text-start py-3 px-4 font-semibold text-foreground">{t.retention.col.period}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    {t.retention.rows.map((row, i) => (
                                        <tr key={i} className={i < t.retention.rows.length - 1 ? 'border-b' : ''}>
                                            <td className="py-3 px-4">{row[0]}</td>
                                            <td className="py-3 px-4">{row[1]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-foreground mt-4">{t.retention.footer}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.security.heading}</h2>
                        <ul className="list-disc ps-6 text-foreground space-y-2">
                            {t.security.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.contact.heading}</h2>
                        <div className="bg-muted rounded-lg p-6 space-y-2">
                            <p className="text-foreground"><strong>{t.contact.team}</strong></p>
                            <p className="text-foreground">
                                {t.contact.complaintsLabel}{' '}
                                <a href="https://sdaia.gov.sa" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" dir="ltr">
                                    sdaia.gov.sa
                                </a>
                            </p>
                        </div>
                    </section>

                    <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} {t.footer}</p>
                    </footer>
                </article>
            </div>
            <Footer />
        </div>
    );
}

function LanguageToggle({
    lang,
    setLang,
    labels,
}: {
    lang: Lang;
    setLang: (l: Lang) => void;
    labels: { en: string; ar: string };
}) {
    return (
        <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
            <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    lang === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                {labels.en}
            </button>
            <button
                onClick={() => setLang('ar')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    lang === 'ar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                {labels.ar}
            </button>
        </div>
    );
}
