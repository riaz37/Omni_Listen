'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import LegalDocument, { type LegalContent } from '@/components/legal/LegalDocument';

type Lang = 'en' | 'ar';

const LAST_UPDATED = { en: 'September 9, 2026', ar: '9 سبتمبر 2026' };

// Inventory verified against the code on 2026-09-09: backend/routers/auth.py
// sets access_token and refresh_token; components/LanguageSwitcher.tsx sets
// NEXT_LOCALE. No analytics or third-party scripts are loaded.
function buildContent(lang: Lang): LegalContent {
  if (lang === 'ar') {
    return {
      title: 'سياسة ملفات تعريف الارتباط',
      lastUpdated: 'آخر تحديث:',
      lastUpdatedDate: LAST_UPDATED.ar,
      intro: 'يستخدم OmniListen عدداً محدوداً من ملفات تعريف الارتباط لإبقائك مسجّل الدخول وتذكّر لغتك. لا نستخدم ملفات تعريف ارتباط إعلانية أو تتبّعية أو تحليلية من أطراف ثالثة.',
      sections: [
        {
          heading: 'ملفات تعريف الارتباط التي نستخدمها',
          items: [
            'access_token (ضروري): يبقيك مسجّل الدخول. مخزَّن بوضع HttpOnly، تنتهي صلاحيته بعد ساعتين.',
            'refresh_token (ضروري): يجدّد جلستك دون إعادة تسجيل الدخول. مخزَّن بوضع HttpOnly، صلاحيته حتى سنة ويُستبدل عند كل استخدام.',
            'NEXT_LOCALE (تفضيل): يتذكّر اللغة التي اخترتها. صلاحيته سنة.',
          ],
        },
        {
          heading: 'التخزين المحلي في المتصفح',
          paragraphs: ['إلى جانب ملفات تعريف الارتباط، يحفظ التطبيق في التخزين المحلي لمتصفحك ما يلي، ولا يُرسَل منها شيء إلى أطراف ثالثة:'],
          items: [
            'cached_user: نسخة من ملفك الشخصي لعرض الواجهة فوراً عند التحميل.',
            'theme: السمة الفاتحة أو الداكنة.',
            'processing_config: إعدادات المعالجة التي اخترتها.',
            'processingJobId: معرّف آخر تسجيل قيد المعالجة لاستئناف المتابعة بعد إعادة التحميل.',
            'github_oauth_state: قيمة مؤقتة لتأمين تسجيل الدخول عبر GitHub.',
            'NEXT_LOCALE: نسخة من تفضيل اللغة.',
            'خزنة تسجيل في IndexedDB بالمتصفح (esap-recording-vault): صوت التسجيل الجاري، يُحفظ ليمكن استرجاعه إذا أُعيد تحميل الصفحة، ويُحذف عند رفع التسجيل أو تجاهله.',
          ],
        },
        {
          heading: 'ما لا نستخدمه',
          paragraphs: ['لا ملفات تعريف ارتباط إعلانية أو لإعادة الاستهداف أو للتتبّع السلوكي، ولا نصوص تحليلات من أطراف ثالثة. لا تُخزَّن تسجيلات الاجتماعات أو نصوصها في ملفات تعريف الارتباط.'],
        },
        {
          heading: 'التحكم',
          paragraphs: ['يمكنك حذف ملفات تعريف الارتباط من إعدادات متصفحك. حذف الملفات الضرورية يسجّل خروجك.'],
        },
        {
          heading: 'التواصل',
          paragraphs: ['للاستفسارات حول هذه السياسة: legal@esap.ai'],
        },
      ],
      footer: 'Empowering Energy (تعمل تحت اسم ESAP AI). جميع الحقوق محفوظة.',
    };
  }

  return {
    title: 'Cookie Policy',
    lastUpdated: 'Last Updated:',
    lastUpdatedDate: LAST_UPDATED.en,
    intro: 'OmniListen uses a small number of cookies to keep you signed in and remember your language. We do not use advertising, tracking or third-party analytics cookies.',
    sections: [
      {
        heading: 'Cookies we use',
        items: [
          'access_token (essential): keeps you signed in. Stored HttpOnly; expires after 2 hours.',
          'refresh_token (essential): renews your session without signing in again. Stored HttpOnly; valid for up to 1 year and replaced each time it is used.',
          'NEXT_LOCALE (preference): remembers the language you chose. Valid for 1 year.',
        ],
      },
      {
        heading: 'Browser local storage',
        paragraphs: ['Besides cookies, the app keeps the following in your browser’s local storage. None of it is sent to third parties:'],
        items: [
          'cached_user: a copy of your profile so the interface renders immediately on load.',
          'theme: light or dark theme.',
          'processing_config: the processing settings you chose.',
          'processingJobId: the id of the last recording being processed, so progress resumes after a reload.',
          'github_oauth_state: a temporary value that secures sign-in with GitHub.',
          'NEXT_LOCALE: a copy of your language preference.',
          "A recording vault in the browser's IndexedDB (esap-recording-vault): the audio of a recording in progress, kept so it can be recovered if the page reloads, and cleared when the recording is uploaded or discarded.",
        ],
      },
      {
        heading: 'What we do not use',
        paragraphs: ['No advertising, retargeting or behavioural tracking cookies, and no third-party analytics scripts. Meeting recordings and transcripts are never stored in cookies.'],
      },
      {
        heading: 'Your controls',
        paragraphs: ['You can delete cookies in your browser settings. Deleting the essential cookies signs you out.'],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions about this policy: legal@esap.ai'],
      },
    ],
    footer: 'Empowering Energy (trading as ESAP AI). All rights reserved.',
  };
}

export default function CookiesPage() {
  const { locale } = useTranslation();
  const lang: Lang = locale === 'ar' ? 'ar' : 'en';
  return <LegalDocument lang={lang} content={buildContent(lang)} />;
}
