'use client';

import Navigation from '@/components/Navigation';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="bg-card rounded-xl shadow-lg p-8 md:p-12">
                    <header className="mb-10 border-b pb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
                        <p className="text-muted-foreground">
                            <strong>Product:</strong> Omni Listen &mdash; Intelligent Audio Processing and Data Extraction System<br />
                            <strong>Legal Entity:</strong> Empowering Energy (trading as ESAP AI)<br />
                            <strong>Last Updated:</strong> April 12, 2026
                        </p>
                    </header>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Who We Are</h2>
                        <p className="text-foreground leading-relaxed">
                            Omni Listen is an AI-powered meeting transcription and intelligence platform developed and operated by{' '}
                            <strong>Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]). We help enterprise teams
                            capture, transcribe, and extract actionable insights from Arabic and English meetings with speaker
                            identification, role-based analysis, and automated action item generation.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Our Role: Data Processor</h2>
                        <p className="text-foreground leading-relaxed">
                            Omni Listen operates exclusively in a B2B enterprise context. Your organization is the{' '}
                            <strong>Data Controller</strong> &mdash; you determine who uses the platform and for what purpose.
                            Empowering Energy (Omni Listen) acts solely as a <strong>Data Processor</strong>, processing meeting data
                            only on your organization&apos;s behalf and strictly under your documented instructions.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Important: Sensitive Personal Data</h2>
                        <p className="text-foreground mb-4">
                            Omni Listen processes voice recordings and performs speaker identification &mdash; both classified as{' '}
                            <strong>Sensitive Personal Data</strong> under PDPL Article 23.
                        </p>
                        <p className="text-foreground mb-2">This means:</p>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li>Your organization must obtain <strong>explicit, informed consent</strong> from all meeting participants before any recording begins</li>
                            <li>Participants must be clearly informed that their voice is being recorded, transcribed, and analyzed by AI</li>
                            <li>Sensitive data is subject to stricter processing, storage, and transfer rules</li>
                            <li>Empowering Energy will process voice and speaker data only within the scope defined in your signed DPA</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">What Data We Process</h2>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Authorized User Identity Data</strong> &mdash; Names, work emails, job titles, employee IDs</li>
                            <li><strong>Voice and Audio Data</strong> &mdash; Audio recordings of meetings (Sensitive Personal Data)</li>
                            <li><strong>Transcription Data</strong> &mdash; Text transcriptions in Arabic and English</li>
                            <li><strong>Speaker Identification Data</strong> &mdash; AI-powered voice analysis labels (biometric-adjacent, treated as Sensitive Personal Data)</li>
                            <li><strong>Meeting Metadata</strong> &mdash; Title, date, time, duration, participant count, language, platform source</li>
                            <li><strong>Role-Based Analysis Outputs</strong> &mdash; Summaries, action items, decisions for PM/HR/Executive roles</li>
                            <li><strong>Technical and Security Data</strong> &mdash; IP addresses, device types, session timestamps, access logs</li>
                            <li><strong>Support Communications</strong> &mdash; Messages exchanged with the support team</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Why We Process Your Data</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Lawful Basis</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    <tr className="border-b"><td className="py-3 px-4">Meeting transcription and AI analysis</td><td className="py-3 px-4">Performance of contract</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Speaker identification and role-based outputs</td><td className="py-3 px-4">Explicit consent (via your organization)</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">User authentication and access</td><td className="py-3 px-4">Performance of contract</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Platform security</td><td className="py-3 px-4">Legitimate interest</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Service quality improvement</td><td className="py-3 px-4">Legitimate interest</td></tr>
                                    <tr><td className="py-3 px-4">Legal and regulatory compliance</td><td className="py-3 px-4">Legal obligation</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-foreground mt-4">
                            We never process data for advertising, profiling, or any purpose outside the contracted scope.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use AI</h2>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li>All outputs are assistance tools &mdash; not final records or legal documents</li>
                            <li>Every AI output is labeled: <strong>&quot;AI-generated &mdash; review before using in formal decisions.&quot;</strong></li>
                            <li>Speaker identification accuracy is high but not infallible &mdash; human review required</li>
                            <li>Role-based analysis is for decision-support only &mdash; does not constitute HR advice, legal opinion, or management instruction</li>
                            <li>We do not use your meeting recordings or transcriptions to train AI models without explicit written consent</li>
                            <li>We maintain full documentation of AI models, language capabilities, and processing logic</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Participant Consent Obligation</h2>
                        <p className="text-foreground mb-4">
                            Because Omni Listen records voices of all participants &mdash; including non-registered users &mdash; your
                            organization must:
                        </p>
                        <ol className="list-decimal pl-6 text-foreground space-y-2">
                            <li>Inform all participants before the recording begins</li>
                            <li>Obtain explicit consent, particularly for sensitive topics (HR, legal, financial)</li>
                            <li>Provide the ability to opt out without professional consequences</li>
                            <li>Maintain records of consent for each session</li>
                        </ol>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sharing and Sub-Processors</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Provider</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    <tr className="border-b"><td className="py-3 px-4">Cloud Hosting Provider</td><td className="py-3 px-4">Infrastructure and encrypted audio storage</td><td className="py-3 px-4">USA</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">AI Transcription / NLP Provider</td><td className="py-3 px-4">Speech-to-text and language processing</td><td className="py-3 px-4">USA</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">AI Model Provider</td><td className="py-3 px-4">Meeting analysis and output generation</td><td className="py-3 px-4">USA</td></tr>
                                    <tr><td className="py-3 px-4">Analytics Platform</td><td className="py-3 px-4">Anonymous usage analytics</td><td className="py-3 px-4">USA</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-foreground mt-4">
                            30 days&apos; advance notice for any sub-processor changes. Right to object included.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Cross-Border Data Transfers</h2>
                        <p className="text-foreground mb-2">All transfers are protected by:</p>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li>SDAIA-approved Standard Contractual Clauses (SCCs)</li>
                            <li>Encrypted transmission and storage at all international points</li>
                            <li>Contractual prohibition on secondary use</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Your Organization&apos;s Rights Under PDPL</h2>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Access</strong> &mdash; Copy of all personal and sensitive data</li>
                            <li><strong>Correction</strong> &mdash; Fix inaccurate metadata, speaker labels, and identity data</li>
                            <li><strong>Deletion</strong> &mdash; Specific recordings, transcriptions, or all data</li>
                            <li><strong>Portability</strong> &mdash; JSON or CSV export</li>
                            <li><strong>Objection</strong> &mdash; Object to processing not in DPA</li>
                            <li><strong>Restriction</strong> &mdash; Restrict processing during dispute</li>
                            <li><strong>Audit</strong> &mdash; Evidence of PDPL compliance</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Data Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Retention Period</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    <tr className="border-b"><td className="py-3 px-4">Voice recordings (audio files)</td><td className="py-3 px-4">90 days, then auto-deleted</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Transcription text</td><td className="py-3 px-4">Contract duration + 6 months</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Speaker identification labels</td><td className="py-3 px-4">Contract duration + 6 months</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Role-based analysis outputs</td><td className="py-3 px-4">Contract duration + 6 months</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Meeting metadata</td><td className="py-3 px-4">Contract duration + 1 year</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">User account data</td><td className="py-3 px-4">Contract duration + 1 year</td></tr>
                                    <tr className="border-b"><td className="py-3 px-4">Support communications</td><td className="py-3 px-4">2 years</td></tr>
                                    <tr><td className="py-3 px-4">Security and access logs</td><td className="py-3 px-4">6 months</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-foreground mt-4">
                            30-day data export window on termination. Permanent deletion confirmed in writing.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li>AES-256 encryption at rest for all audio and transcriptions</li>
                            <li>TLS 1.3 encryption in transit</li>
                            <li>Audio files in isolated, access-controlled storage buckets</li>
                            <li>Role-based access controls &mdash; only authorized personnel</li>
                            <li>No employee access to raw audio without a logged reason</li>
                            <li>Regular security audits and vulnerability assessments</li>
                            <li>72-hour SDAIA breach notification + immediate client notification</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact and Complaints</h2>
                        <div className="bg-muted rounded-lg p-6 space-y-2">
                            <p className="text-foreground"><strong>Empowering Energy &mdash; Data Privacy Team</strong></p>
                            <p className="text-foreground">
                                Complaints: SDAIA at{' '}
                                <a href="https://sdaia.gov.sa" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    sdaia.gov.sa
                                </a>
                            </p>
                        </div>
                    </section>

                    <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} Empowering Energy (trading as ESAP AI). All rights reserved.</p>
                    </footer>
                </article>
            </div>
        </div>
    );
}
