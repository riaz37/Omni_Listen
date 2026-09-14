'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';
import { useTranslation } from '@/lib/i18n/use-translation';
import LegalDocument, { type LegalContent, type LegalSection } from '@/components/legal/LegalDocument';

type Lang = 'en' | 'ar';

const LAST_UPDATED = { en: 'September 9, 2026', ar: '9 سبتمبر 2026' };

function crClause(lang: Lang): string {
  if (!SITE.commercialRegistration) return '';
  return lang === 'ar'
    ? ` (رقم السجل التجاري ${SITE.commercialRegistration})`
    : ` (CR No. ${SITE.commercialRegistration})`;
}

const PROVIDERS_EN: LegalSection = {
  heading: '7. Who we share data with',
  paragraphs: ['We share personal data only with the providers below, only for the purpose stated, and under contracts that restrict their use of it.'],
  items: [
    'Supabase (database hosting and authentication): account data, meeting records, transcripts and extracted items.',
    'Render (API hosting): all data passing through our backend, including audio while it is processed.',
    'Vercel (web hosting): delivery of the web application; request logs.',
    'AssemblyAI and Deepgram (speech-to-text): audio recordings, to produce transcripts.',
    'Google Gemini (language model): transcripts, to produce summaries, tasks and events.',
    'Google Calendar (only if you connect it): event details you choose to sync.',
    'Email delivery provider (Gmail SMTP or Resend): your email address, for verification, password reset and notifications.',
    'Payment provider (Stripe), when paid plans launch: billing details; we never store card numbers.',
    'Public authorities, where the law requires it.',
  ],
};

const PROVIDERS_AR: LegalSection = {
  heading: '7. مع من نشارك البيانات',
  paragraphs: ['نشارك البيانات الشخصية فقط مع المزودين أدناه، وللغرض المذكور فقط، وبموجب عقود تقيّد استخدامهم لها.'],
  items: [
    'Supabase (استضافة قاعدة البيانات والمصادقة): بيانات الحساب وسجلات الاجتماعات والنصوص والعناصر المستخرجة.',
    'Render (استضافة واجهة البرمجة): جميع البيانات التي تمر عبر خوادمنا، بما فيها الصوت أثناء معالجته.',
    'Vercel (استضافة الويب): تقديم تطبيق الويب وسجلات الطلبات.',
    'AssemblyAI وDeepgram (تحويل الكلام إلى نص): التسجيلات الصوتية لإنتاج النصوص.',
    'Google Gemini (نموذج اللغة): النصوص لإنتاج الملخصات والمهام والأحداث.',
    'Google Calendar (فقط إذا قمت بربطه): تفاصيل الأحداث التي تختار مزامنتها.',
    'مزود البريد الإلكتروني (Gmail SMTP أو Resend): عنوان بريدك الإلكتروني للتحقق واستعادة كلمة المرور والإشعارات.',
    'مزود الدفع (Stripe) عند إطلاق الخطط المدفوعة: بيانات الفوترة؛ لا نخزّن أرقام البطاقات أبداً.',
    'الجهات الرسمية حيثما يوجب القانون ذلك.',
  ],
};

function buildContent(lang: Lang): LegalContent {
  if (lang === 'ar') {
    return {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث:',
      lastUpdatedDate: LAST_UPDATED.ar,
      intro: (
        <>
          OmniListen منصة لتفريغ الاجتماعات وتحليلها بالذكاء الاصطناعي تطوّرها وتشغّلها شركة{' '}
          <strong>Empowering Energy (تعمل تحت اسم ESAP AI)</strong>{crClause('ar')}. توضّح هذه السياسة البيانات التي نجمعها
          عند استخدامك الخدمة، وسبب معالجتها، ومع من نشاركها، وحقوقك بموجب نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL).
        </>
      ),
      sections: [
        {
          heading: '1. دورنا',
          paragraphs: [
            'نحن المتحكّم في بيانات حسابك وبيانات استخدامك. أما محتوى الاجتماعات الذي تسجّله أو ترفعه فنعالجه لتقديم الخدمة لك، وأنت من يقرر ما تسجّله ومن يشارك فيه.',
            'إذا كانت مؤسستك قد أبرمت معنا اتفاقية معالجة بيانات موقّعة، فإن تلك الاتفاقية تحدد الأدوار وتسود عند التعارض.',
          ],
        },
        {
          heading: '2. البيانات التي نجمعها',
          items: [
            'بيانات الحساب: الاسم والبريد الإلكتروني وصورة الملف الشخصي (من Google أو GitHub عند تسجيل الدخول بهما) وكلمة المرور المشفّرة.',
            'محتوى الاجتماعات: التسجيلات الصوتية والنصوص وأسماء المتحدثين والملخصات والمهام والأحداث والملاحظات وأي استعلامات مخصصة تكتبها.',
            'بيانات التقويم: تفاصيل الأحداث، فقط إذا ربطت تقويم Google.',
            'بيانات الاستخدام والجهاز: عناوين IP ونوع المتصفح والمنطقة الزمنية وسجلات الطلبات.',
            'تفضيلاتك: اللغة والسمة وإعدادات المعالجة، وتاريخ إقرارك بإشعار موافقة التسجيل.',
          ],
        },
        {
          heading: '3. البيانات الحساسة والتسجيلات الصوتية',
          paragraphs: [
            'قد تحتوي التسجيلات على بيانات صوتية تُعد بيانات شخصية حساسة بموجب PDPL، وقد تتضمن بيانات أشخاص آخرين. نعالجها فقط لتقديم الخدمة لك، ونعتمد على التزامك (المادة 3 من شروط الخدمة) بإبلاغ المشاركين والحصول على موافقتهم.',
          ],
        },
        {
          heading: '4. لماذا نعالج بياناتك',
          items: [
            'تقديم الخدمة: التفريغ النصي والتحليل والتخزين والمزامنة (تنفيذ العقد بيننا).',
            'أمان الحساب والتحقق من البريد الإلكتروني ومنع إساءة الاستخدام (مصلحتنا المشروعة والالتزامات القانونية).',
            'التواصل معك بشأن الخدمة والتغييرات الجوهرية.',
            'الفوترة عند إطلاق الخطط المدفوعة.',
          ],
        },
        {
          heading: '5. كيف نستخدم الذكاء الاصطناعي',
          paragraphs: [
            'يُرسَل الصوت إلى مزودي تحويل الكلام إلى نص (AssemblyAI أو Deepgram) وتُرسَل النصوص إلى نموذج لغة (Google Gemini) لإنتاج المخرجات. لا نستخدم بياناتك لتدريب أي نموذج، ولا نسمح لمزودينا بذلك. قد تحتوي مخرجات الذكاء الاصطناعي على أخطاء، وننصح بمراجعتها.',
          ],
        },
        {
          heading: '6. تسجيل الآخرين',
          paragraphs: [
            'عندما تسجّل اجتماعاً فإنك تجمع بيانات شخصية عن المشاركين الآخرين. أنت مسؤول عن إبلاغهم والحصول على موافقتهم حيثما يوجب القانون ذلك. إذا كنت مشاركاً في اجتماع سجّله مستخدم لدينا وترغب في الاستفسار عن بياناتك، تواصل معنا وسنوجّه طلبك.',
          ],
        },
        PROVIDERS_AR,
        {
          heading: '8. نقل البيانات خارج المملكة',
          paragraphs: [
            'يعمل بعض مزودينا خارج المملكة العربية السعودية. ننقل البيانات إليهم فقط بالقدر اللازم لتقديم الخدمة وبموجب ضمانات تعاقدية مناسبة وفقاً لمتطلبات PDPL.',
          ],
        },
        {
          heading: '9. بيانات مستخدم Google',
          paragraphs: [
            'يلتزم استخدام OmniListen للمعلومات الواردة من واجهات Google (تسجيل الدخول عبر Google، وتقويم Google إذا قمت بربطه) بسياسة بيانات المستخدم لخدمات Google API، بما في ذلك متطلبات الاستخدام المحدود. نستخدم بيانات مستخدم Google فقط لتقديم الميزات التي تفعّلها، ولا نبيعها، ولا نشاركها مع أطراف ثالثة إلا بالقدر اللازم لتقديم تلك الميزات أو حسبما يقتضيه القانون.',
            <a
              key="google-limited-use-link-ar"
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="text-primary hover:underline"
            >
              سياسة بيانات المستخدم لخدمات Google API
            </a>,
          ],
        },
        {
          heading: '10. الاحتفاظ والحذف',
          paragraphs: [
            'نحتفظ بمحتوى اجتماعاتك ما دام حسابك نشطاً. عند حذف اجتماع يُزال من حسابك فوراً. لطلب المحو الدائم من أنظمتنا، أو لإغلاق حسابك، راسلنا على support@esap.ai وسنُكمل المحو خلال 30 يوماً، مع الاحتفاظ فقط بما يوجب القانون الاحتفاظ به.',
          ],
        },
        {
          heading: '11. حقوقك بموجب PDPL',
          items: [
            'الاطلاع على بياناتك الشخصية والحصول على نسخة منها.',
            'تصحيح البيانات غير الدقيقة.',
            'طلب الإتلاف أو الحذف.',
            'الاعتراض على المعالجة أو سحب الموافقة حيثما تكون الموافقة أساس المعالجة.',
            'تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).',
          ],
          trailing: ['لممارسة أي من هذه الحقوق راسلنا على legal@esap.ai. نرد خلال 30 يوماً.'],
        },
        {
          heading: '12. الأمان',
          paragraphs: [
            'تُشفَّر البيانات أثناء النقل عبر TLS وأثناء التخزين لدى مزودي قواعد البيانات والتخزين لدينا. تُشفَّر رموز التقويم المتصل بشكل إضافي قبل حفظها. يقتصر الوصول إلى أنظمة الإنتاج على المهندسين الذين يشغّلون الخدمة.',
          ],
        },
        {
          heading: '13. الأطفال',
          paragraphs: ['الخدمة غير موجّهة لمن هم دون 18 عاماً ولا نجمع بياناتهم عن قصد.'],
        },
        {
          heading: '14. التغييرات على هذه السياسة',
          paragraphs: ['سنخطرك بأي تغيير جوهري عبر البريد الإلكتروني أو داخل الخدمة قبل سريانه.'],
        },
        {
          heading: '15. التواصل والشكاوى',
          paragraphs: ['Empowering Energy (تعمل تحت اسم ESAP AI)، الرياض، المملكة العربية السعودية. البريد الإلكتروني: legal@esap.ai'],
        },
      ],
      footer: 'Empowering Energy (تعمل تحت اسم ESAP AI). جميع الحقوق محفوظة.',
    };
  }

  return {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated:',
    lastUpdatedDate: LAST_UPDATED.en,
    intro: (
      <>
        OmniListen is an AI meeting transcription and analysis platform developed and operated by{' '}
        <strong>Empowering Energy (trading as ESAP AI)</strong>{crClause('en')}. This policy explains what data we collect
        when you use the Service, why we process it, who we share it with, and your rights under the Personal Data
        Protection Law of the Kingdom of Saudi Arabia (PDPL).
      </>
    ),
    sections: [
      {
        heading: '1. Our role',
        paragraphs: [
          'We are the controller of your account and usage data. Meeting content you record or upload is processed to provide the Service to you; you decide what to record and who takes part.',
          'If your organisation has a signed data processing agreement with us, that agreement defines the roles and prevails where it conflicts with this policy.',
        ],
      },
      {
        heading: '2. What we collect',
        items: [
          'Account data: name, email address, profile picture (from Google or GitHub when you sign in with them) and a hashed password.',
          'Meeting content: audio recordings, transcripts, speaker labels, summaries, tasks, events, notes and any custom queries you write.',
          'Calendar data: event details, only if you connect Google Calendar.',
          'Usage and device data: IP address, browser type, time zone and request logs.',
          'Your preferences: language, theme, processing settings, and the date you acknowledged the recording-consent notice.',
        ],
      },
      {
        heading: '3. Sensitive data and voice recordings',
        paragraphs: [
          'Recordings may contain voice data that counts as sensitive personal data under PDPL, and may include data about other people. We process it only to provide the Service to you, relying on your obligation (Terms of Service section 3) to inform participants and obtain their consent.',
        ],
      },
      {
        heading: '4. Why we process your data',
        items: [
          'To provide the Service: transcription, analysis, storage and sync (performance of our contract with you).',
          'Account security, email verification and abuse prevention (our legitimate interest and legal obligations).',
          'To contact you about the Service and material changes.',
          'Billing, when paid plans launch.',
        ],
      },
      {
        heading: '5. How we use AI',
        paragraphs: [
          'Audio is sent to speech-to-text providers (AssemblyAI or Deepgram) and transcripts to a language model (Google Gemini) to produce output. We do not use your data to train any model, and we do not permit our providers to do so. AI output can contain errors; review it before relying on it.',
        ],
      },
      {
        heading: '6. Recording other people',
        paragraphs: [
          'When you record a meeting you collect personal data about the other participants. You are responsible for informing them and obtaining their consent where the law requires it. If you took part in a meeting recorded by one of our users and want to ask about your data, contact us and we will route your request.',
        ],
      },
      PROVIDERS_EN,
      {
        heading: '8. International transfers',
        paragraphs: [
          'Some of our providers operate outside the Kingdom of Saudi Arabia. We transfer data to them only as needed to provide the Service and under appropriate contractual safeguards as PDPL requires.',
        ],
      },
      {
        heading: '9. Google user data',
        paragraphs: [
          "OmniListen's use of information received from Google APIs (Google sign-in and, if you connect it, Google Calendar) adheres to the Google API Services User Data Policy, including the Limited Use requirements. We use Google user data only to provide the features you enable, we do not sell it, and we do not share it with third parties except as needed to provide those features or as required by law.",
          <a
            key="google-limited-use-link"
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="text-primary hover:underline"
          >
            Google API Services User Data Policy
          </a>,
        ],
      },
      {
        heading: '10. Retention and deletion',
        paragraphs: [
          'We keep your meeting content for as long as your account is active. When you delete a meeting it is removed from your account immediately. To request permanent erasure from our systems, or to close your account, email support@esap.ai and we complete erasure within 30 days, keeping only what the law requires us to retain.',
        ],
      },
      {
        heading: '11. Your rights under PDPL',
        items: [
          'Access your personal data and obtain a copy.',
          'Correct inaccurate data.',
          'Request destruction or deletion.',
          'Object to processing, or withdraw consent where consent is the basis.',
          'Lodge a complaint with the Saudi Data and Artificial Intelligence Authority (SDAIA).',
        ],
        trailing: ['To exercise any of these rights email legal@esap.ai. We respond within 30 days.'],
      },
      {
        heading: '12. Security',
        paragraphs: [
          'Data is encrypted in transit with TLS and at rest by our database and storage providers. Connected calendar tokens are additionally encrypted before storage. Access to production systems is limited to the engineers who operate the Service.',
        ],
      },
      {
        heading: '13. Children',
        paragraphs: ['The Service is not directed at anyone under 18 and we do not knowingly collect their data.'],
      },
      {
        heading: '14. Changes to this policy',
        paragraphs: ['We will notify you of any material change by email or within the Service before it takes effect.'],
      },
      {
        heading: '15. Contact and complaints',
        paragraphs: ['Empowering Energy (trading as ESAP AI), Riyadh, Kingdom of Saudi Arabia. Email: legal@esap.ai'],
      },
    ],
    footer: 'Empowering Energy (trading as ESAP AI). All rights reserved.',
  };
}

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const [lang, setLang] = useState<Lang>(locale === 'ar' ? 'ar' : 'en');
  const content = buildContent(lang);
  return (
    <LegalDocument
      lang={lang}
      content={content}
      toolbar={<LanguageToggle lang={lang} setLang={setLang} labels={{ en: 'EN', ar: 'عربي' }} />}
    />
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
