'use client';

import type { ReactNode } from 'react';

export interface LegalSection {
  heading: string;
  paragraphs?: ReactNode[];
  items?: ReactNode[];
  /** Paragraphs rendered after the items list (e.g. a closing sentence that belongs below a list). */
  trailing?: ReactNode[];
}

export interface LegalContent {
  title: string;
  lastUpdated: string;
  lastUpdatedDate: string;
  intro: ReactNode;
  sections: LegalSection[];
  footer: string;
}

interface LegalDocumentProps {
  content: LegalContent;
  lang: 'en' | 'ar';
  /** Optional element rendered beside the title (e.g. a language toggle). */
  toolbar?: ReactNode;
}

// One renderer for Terms, Privacy and Cookies so the three documents share
// structure and styling, and so content is plain data that counsel can
// review without reading JSX.
export default function LegalDocument({ content, lang, toolbar }: LegalDocumentProps) {
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <div className="h-16" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-card rounded-xl shadow-lg p-8 md:p-12">
          <header className="mb-10 border-b pb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold text-foreground">{content.title}</h1>
              {toolbar}
            </div>
            <p className="text-muted-foreground">
              <strong>{content.lastUpdated}</strong> {content.lastUpdatedDate}
            </p>
            <div className="mt-6 text-foreground leading-relaxed">{content.intro}</div>
          </header>

          {content.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{section.heading}</h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="text-foreground leading-relaxed mb-3">{p}</p>
              ))}
              {section.items && (
                <ul className="list-disc ps-6 space-y-2 text-foreground">
                  {section.items.map((item, i) => (
                    <li key={typeof item === 'string' ? item : i}>{item}</li>
                  ))}
                </ul>
              )}
              {section.trailing?.map((p, i) => (
                <p key={i} className="text-foreground leading-relaxed mt-3">{p}</p>
              ))}
            </section>
          ))}

          <footer className="pt-8 border-t text-sm text-muted-foreground">{content.footer}</footer>
        </article>
      </div>
    </div>
  );
}
