'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { SITE } from '@/lib/site';
import LegalDocument, { type LegalContent } from '@/components/legal/LegalDocument';

type Lang = 'en' | 'ar';

const LAST_UPDATED = { en: 'September 9, 2026', ar: '9 سبتمبر 2026' };

function siteLink() {
  return (
    <a href={SITE.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" dir="ltr">
      {SITE.host}
    </a>
  );
}

function crClause(lang: Lang): string {
  if (!SITE.commercialRegistration) return '';
  return lang === 'ar'
    ? ` (رقم السجل التجاري ${SITE.commercialRegistration})`
    : ` (CR No. ${SITE.commercialRegistration})`;
}

function buildContent(lang: Lang, privacyHref: string): LegalContent {
  if (lang === 'ar') {
    return {
      title: 'شروط الخدمة',
      lastUpdated: 'آخر تحديث:',
      lastUpdatedDate: LAST_UPDATED.ar,
      intro: (
        <>
          تنظّم هذه الشروط استخدامك لخدمة OmniListen المتاحة على {siteLink()} وتطبيق سطح المكتب وإضافة المتصفح التابعة لها
          (يُشار إليها معاً بـ«الخدمة»)، والتي تشغّلها شركة <strong>Empowering Energy (تعمل تحت اسم ESAP AI)</strong>{crClause('ar')}
          («نحن»). باستخدامك الخدمة فإنك توافق على هذه الشروط وعلى{' '}
          <Link href={privacyHref} className="text-primary hover:underline">سياسة الخصوصية</Link>.
        </>
      ),
      sections: [
        {
          heading: '1. الأهلية والحسابات',
          paragraphs: [
            'يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام الخدمة. إذا كنت تستخدمها نيابةً عن مؤسسة، فإنك تقرّ بأن لديك الصلاحية لإلزامها بهذه الشروط.',
            'أنت مسؤول عن الحفاظ على سرية بيانات الدخول إلى حسابك وعن كل نشاط يتم من خلاله. أبلغنا فوراً على support@esap.ai عند اشتباهك بأي استخدام غير مصرّح به.',
          ],
        },
        {
          heading: '2. الخدمة والمرحلة التجريبية',
          paragraphs: [
            'تتيح الخدمة تسجيل الاجتماعات أو رفع ملفاتها الصوتية، وتفريغها نصياً بالعربية والإنجليزية، وتوليد ملخصات ومهام وأحداث بمساعدة الذكاء الاصطناعي، مع تكامل اختياري مع التقويم.',
            'الخدمة متاحة حالياً كنسخة تجريبية عامة. قد نغيّر الميزات أو نضيفها أو نزيلها أو نعلّقها أثناء هذه المرحلة، وقد تحتوي الخدمة على أخطاء.',
          ],
        },
        {
          heading: '3. مسؤولية التسجيل وموافقة المشاركين',
          paragraphs: [
            'تختلف قوانين تسجيل المحادثات من بلد إلى آخر، وقد تتطلب موافقة جميع الأطراف. قبل أن تسجّل أو ترفع أي محادثة، يجب عليك إبلاغ جميع المشاركين بأنها تُسجَّل والحصول على موافقتهم حيثما يتطلب القانون ذلك.',
            'تعرض الخدمة إشعاراً بهذا الالتزام قبل أول تسجيل («قبل أن تسجّل») وتذكيراً دائماً بجوار زر التسجيل. ومع ذلك، تبقى المسؤولية القانونية عن الحصول على الموافقة عليك وحدك. لا نتحمّل أي مسؤولية عن تسجيل تم دون الموافقة المطلوبة.',
          ],
        },
        {
          heading: '4. المحتوى الخاص بك وترخيص المعالجة',
          paragraphs: [
            'تحتفظ بجميع حقوقك في التسجيلات والنصوص والملاحظات التي ترفعها أو تنشئها («المحتوى»). تمنحنا ترخيصاً محدوداً وغير حصري لتخزين المحتوى ومعالجته ونقله إلى مزودي الخدمات لدينا بالقدر اللازم لتقديم الخدمة لك فقط.',
            'لا نستخدم المحتوى الخاص بك لتدريب نماذج الذكاء الاصطناعي، ولا نسمح لمزودينا بذلك.',
          ],
        },
        {
          heading: '5. الاستخدام المقبول',
          items: [
            'عدم رفع محتوى ليس لديك الحق في تسجيله أو مشاركته.',
            'عدم استخدام الخدمة للمراقبة أو المضايقة أو انتهاك خصوصية الآخرين.',
            'عدم محاولة الوصول غير المصرّح به إلى الخدمة أو أنظمتها أو حسابات المستخدمين الآخرين.',
            'عدم إعادة بيع الخدمة أو إعادة توزيعها دون موافقتنا الكتابية.',
          ],
        },
        {
          heading: '6. المخرجات المولّدة بالذكاء الاصطناعي',
          paragraphs: [
            'تُنتَج النصوص والملخصات والمهام والأحداث تلقائياً وقد تحتوي على أخطاء أو حذف أو تفسيرات غير دقيقة. راجع المخرجات قبل الاعتماد عليها في أي قرار. لا تُعد المخرجات استشارة قانونية أو مالية أو مهنية.',
          ],
        },
        {
          heading: '7. الخطط والفوترة',
          paragraphs: [
            'الخدمة مجانية خلال المرحلة التجريبية العامة. عند إطلاق الخطط المدفوعة، تُنشر الأسعار وحدود الاستخدام في صفحة الأسعار، وتتم معالجة المدفوعات عبر مزود الدفع لدينا. ستُخطر مسبقاً بأي تغيير يؤثر على حسابك.',
          ],
        },
        {
          heading: '8. الخصوصية وحماية البيانات',
          paragraphs: [
            <>
              يخضع جمع بياناتك الشخصية ومعالجتها لـ<Link href={privacyHref} className="text-primary hover:underline">سياسة الخصوصية</Link>،
              التي تتوافق مع نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL).
            </>,
          ],
        },
        {
          heading: '9. الملكية الفكرية',
          paragraphs: [
            'تبقى المنصة وبرمجياتها وعلاماتها التجارية ملكاً لشركة Empowering Energy أو مرخّصيها. تحصل على حق محدود وغير حصري وغير قابل للنقل لاستخدام الخدمة وفقاً لهذه الشروط.',
          ],
        },
        {
          heading: '10. الخدمات ومزودو الطرف الثالث',
          paragraphs: [
            'نعتمد على مزودين خارجيين للاستضافة وتحويل الكلام إلى نص ونماذج اللغة والبريد الإلكتروني والدفع. ترد قائمتهم في سياسة الخصوصية. قد يؤثر انقطاع خدماتهم على توفر الخدمة.',
          ],
        },
        {
          heading: '11. الإنهاء والتصدير والحذف',
          paragraphs: [
            'لإغلاق حسابك، راسلنا على support@esap.ai. يجوز لنا تعليق حسابك أو إنهاؤه عند مخالفة هذه الشروط بعد إشعارك ما لم تكن المخالفة جسيمة. يمكنك تصدير المحادثات والأحداث والسجل من داخل الخدمة قبل الإغلاق. عند طلبك الحذف الدائم نُكمله خلال 30 يوماً.',
          ],
        },
        {
          heading: '12. إخلاء المسؤولية وحدودها',
          paragraphs: [
            'تُقدَّم الخدمة «كما هي» دون ضمانات من أي نوع بالقدر الذي يسمح به القانون. لا نضمن أن تكون الخدمة خالية من الأخطاء أو متاحة دون انقطاع. بالقدر الذي يسمح به القانون، لا نتحمّل مسؤولية أي خسائر غير مباشرة أو تبعية، وتقتصر مسؤوليتنا الإجمالية على المبالغ التي دفعتها لنا خلال الاثني عشر شهراً السابقة للمطالبة.',
          ],
        },
        {
          heading: '13. القانون الحاكم',
          paragraphs: [
            'تخضع هذه الشروط لأنظمة المملكة العربية السعودية. تختصّ محاكم الرياض بالنظر في أي نزاع.',
          ],
        },
        {
          heading: '14. التعديلات على هذه الشروط',
          paragraphs: [
            'قد نحدّث هذه الشروط. عند إجراء تغيير جوهري سنخطرك عبر البريد الإلكتروني أو داخل الخدمة قبل 14 يوماً على الأقل من سريانه. استمرارك في استخدام الخدمة بعد ذلك يعني قبولك للشروط المحدّثة.',
          ],
        },
        {
          heading: '15. عملاء المؤسسات',
          paragraphs: [
            'إذا كانت مؤسستك قد أبرمت اتفاقية خدمات رئيسية أو اتفاقية معالجة بيانات موقّعة مع Empowering Energy، فإن تلك الاتفاقية تسود على هذه الشروط في حال التعارض.',
          ],
        },
        {
          heading: '16. التواصل',
          paragraphs: ['للاستفسارات حول هذه الشروط: legal@esap.ai'],
        },
      ],
      footer: 'Empowering Energy (تعمل تحت اسم ESAP AI). جميع الحقوق محفوظة.',
    };
  }

  return {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated:',
    lastUpdatedDate: LAST_UPDATED.en,
    intro: (
      <>
        These Terms govern your use of OmniListen at {siteLink()}, its desktop app and its browser extension (together, the
        &quot;Service&quot;), operated by <strong>Empowering Energy (trading as ESAP AI)</strong>{crClause('en')} (&quot;we&quot;).
        By using the Service you agree to these Terms and to our{' '}
        <Link href={privacyHref} className="text-primary hover:underline">Privacy Policy</Link>.
      </>
    ),
    sections: [
      {
        heading: '1. Eligibility and accounts',
        paragraphs: [
          'You must be at least 18 years old to use the Service. If you use it on behalf of an organisation, you confirm that you have authority to bind that organisation to these Terms.',
          'You are responsible for keeping your sign-in details confidential and for all activity under your account. Tell us at support@esap.ai as soon as you suspect unauthorised use.',
        ],
      },
      {
        heading: '2. The Service and beta status',
        paragraphs: [
          'The Service lets you record or upload meeting audio, transcribe it in Arabic and English, and generate AI-assisted summaries, tasks and events, with optional calendar integration.',
          'The Service is currently in public beta. We may change, add, remove or suspend features during this period, and the Service may contain errors.',
        ],
      },
      {
        heading: '3. Recording responsibility and participant consent',
        paragraphs: [
          'Laws on recording conversations differ by country and may require the consent of every participant. Before you record or upload a conversation, you must tell everyone taking part that it is being recorded and obtain their consent where the law requires it.',
          'The Service shows a notice of this obligation before your first recording ("Before you record") and a permanent reminder next to the record button. The legal responsibility for obtaining consent nevertheless rests with you alone. We accept no liability for recordings made without the required consent.',
        ],
      },
      {
        heading: '4. Your content and our licence to process it',
        paragraphs: [
          'You keep all rights in the recordings, transcripts and notes you upload or create ("Content"). You grant us a limited, non-exclusive licence to store, process and transmit Content to our service providers only as needed to provide the Service to you.',
          'We do not use your Content to train AI models, and we do not permit our providers to do so.',
        ],
      },
      {
        heading: '5. Acceptable use',
        items: [
          'Do not upload content you have no right to record or share.',
          'Do not use the Service to surveil, harass or invade the privacy of others.',
          'Do not attempt unauthorised access to the Service, its systems or other users’ accounts.',
          'Do not resell or redistribute the Service without our written consent.',
        ],
      },
      {
        heading: '6. AI-generated output',
        paragraphs: [
          'Transcripts, summaries, tasks and events are generated automatically and may contain errors, omissions or misinterpretations. Review output before relying on it for any decision. Output is not legal, financial or professional advice.',
        ],
      },
      {
        heading: '7. Plans and billing',
        paragraphs: [
          'The Service is free during the public beta. When paid plans launch, prices and usage limits will be published on the Pricing page and payments processed by our payment provider. You will be notified in advance of any change that affects your account.',
        ],
      },
      {
        heading: '8. Privacy and data protection',
        paragraphs: [
          <>
            How we collect and process personal data is described in our{' '}
            <Link href={privacyHref} className="text-primary hover:underline">Privacy Policy</Link>, which follows the Personal
            Data Protection Law of the Kingdom of Saudi Arabia (PDPL).
          </>,
        ],
      },
      {
        heading: '9. Intellectual property',
        paragraphs: [
          'The platform, its software and its trademarks remain the property of Empowering Energy or its licensors. You receive a limited, non-exclusive, non-transferable right to use the Service under these Terms.',
        ],
      },
      {
        heading: '10. Third-party services and providers',
        paragraphs: [
          'We rely on third-party providers for hosting, speech-to-text, language models, email and payments. They are listed in the Privacy Policy. An outage at a provider may affect the availability of the Service.',
        ],
      },
      {
        heading: '11. Termination, export and deletion',
        paragraphs: [
          'To close your account, email support@esap.ai. We may suspend or terminate your account for a breach of these Terms, with notice unless the breach is serious. You can export conversations, events and history from within the Service before closing. When you request permanent deletion we complete it within 30 days.',
        ],
      },
      {
        heading: '12. Disclaimers and limitation of liability',
        paragraphs: [
          'The Service is provided "as is" without warranties of any kind to the extent permitted by law. We do not guarantee that the Service will be error-free or uninterrupted. To the extent permitted by law, we are not liable for indirect or consequential losses, and our total liability is limited to the amounts you paid us in the twelve months before the claim.',
        ],
      },
      {
        heading: '13. Governing law',
        paragraphs: [
          'These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes are subject to the jurisdiction of the courts of Riyadh.',
        ],
      },
      {
        heading: '14. Changes to these Terms',
        paragraphs: [
          'We may update these Terms. For a material change we will notify you by email or within the Service at least 14 days before it takes effect. Continuing to use the Service after that date means you accept the updated Terms.',
        ],
      },
      {
        heading: '15. Enterprise customers',
        paragraphs: [
          'If your organisation has a signed master services agreement or data processing agreement with Empowering Energy, that agreement prevails over these Terms where they conflict.',
        ],
      },
      {
        heading: '16. Contact',
        paragraphs: ['Questions about these Terms: legal@esap.ai'],
      },
    ],
    footer: 'Empowering Energy (trading as ESAP AI). All rights reserved.',
  };
}

export default function TermsPage() {
  const { locale } = useTranslation();
  const lp = useLocalePath();
  const lang: Lang = locale === 'ar' ? 'ar' : 'en';
  return <LegalDocument lang={lang} content={buildContent(lang, lp('/privacy'))} />;
}
