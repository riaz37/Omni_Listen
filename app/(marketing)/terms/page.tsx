import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="lead text-muted-foreground mb-2">
                    <strong>Product:</strong> Omni Listen &mdash; Intelligent Audio Processing and Data Extraction System
                </p>
                <p className="lead text-muted-foreground mb-2">
                    <strong>Legal Entity:</strong> Empowering Energy (trading as ESAP AI)
                </p>
                <p className="lead text-muted-foreground mb-8">Last updated: April 12, 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Agreement</h2>
                        <p>
                            These Terms govern access to Omni Listen at{' '}
                            <a href="https://esap-listen-web.vercel.app" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                esap-listen-web.vercel.app
                            </a>
                            , operated by <strong>Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]). Apply to the
                            Client organization and all Authorized Users. Operate alongside MSA, SOW, and DPA &mdash; MSA/DPA takes
                            precedence in conflicts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Bilingual Arabic/English transcription (real-time and post-session)</li>
                            <li>AI-powered speaker identification and labeling</li>
                            <li>Automated action item extraction and task assignment</li>
                            <li>Role-based meeting analysis (PM, HR, Executive)</li>
                            <li>Meeting history, search, and knowledge archiving</li>
                            <li>Calendar integration and session management</li>
                            <li>Usage analytics and organizational dashboards</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Access and Authorized Users</h2>
                        <p>
                            Access exclusively to Client and designated Authorized Users per signed MSA. Client is responsible for
                            credentials, authorized access, compliance, and ensuring all meeting participants are informed and have
                            consented before recording.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Participant Recording Consent</h2>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                Client bears full responsibility for:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Notifying all participants before recording begins</li>
                                <li>Obtaining explicit, informed consent</li>
                                <li>Ensuring participants are not penalized for declining</li>
                                <li>Maintaining consent records per session</li>
                            </ul>
                            <p className="mt-3 text-sm">
                                Omni Listen provides in-platform recording notifications and session start prompts. Legal responsibility
                                rests with the Client as Data Controller. Failure to obtain consent = violation of PDPL and these Terms.
                                Omni Listen is not liable for the Client&apos;s failure to consent.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Acceptable Use</h2>
                        <p>Prohibited:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Recording without participant consent</li>
                            <li>Personal/non-business recording context</li>
                            <li>Reverse engineering platform or AI models</li>
                            <li>Using outputs for competing products</li>
                            <li>Sharing/reselling access</li>
                            <li>Using AI outputs as the sole basis for formal HR decisions, disciplinary actions, and legal proceedings without human review</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. AI-Generated Content Disclaimer</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Transcription may contain errors (noisy environments, accents, technical language)</li>
                            <li>Speaker ID is AI-generated, not 100% accurate &mdash; human review required</li>
                            <li>Role-based outputs are decision-support only, not professional advice</li>
                            <li>All outputs labeled: <strong>&quot;AI-generated &mdash; review before using in formal decisions.&quot;</strong></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Client Data and Content</h2>
                        <p>Client retains full ownership. Omni Listen commits to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Never selling, licensing, or sharing Client Content</li>
                            <li>Never use Client Content to train AI models without explicit written consent</li>
                            <li>Accessing only for contracted service delivery, security, or legal compliance</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">8. Data Processing and Privacy</h2>
                        <p>
                            Governed by our{' '}
                            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>{' '}
                            and signed DPA. Complies with PDPL Royal Decree M/19, including Sensitive Personal Data provisions under
                            Article 23.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">9. Pricing and Commercial Terms</h2>
                        <p>
                            Defined exclusively in a signed MSA or SOW. These Terms do not govern billing independently.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">10. Intellectual Property</h2>
                        <p>
                            All platform technology, AI models, software, documentation, and trademarks are the exclusive intellectual
                            property of Empowering Energy. Client receives a limited, non-exclusive, non-transferable license to use the
                            Service per the MSA.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">11. Confidentiality</h2>
                        <p>
                            Each party agrees to protect the other&apos;s confidential information for the duration of the agreement and
                            for 3 years post-termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">12. Service Availability</h2>
                        <p>
                            Empowering Energy targets 99.5% service availability, excluding scheduled maintenance and force majeure events.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">13. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Empowering Energy&apos;s aggregate liability is capped at 3 months&apos;
                            fees paid by the Client. We shall not be liable for any indirect, incidental, special, consequential, or
                            punitive damages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">14. Termination</h2>
                        <p>
                            Either party may terminate per the MSA. On termination, Client has a 30-day data export window. Permanent
                            deletion is confirmed in writing.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">15. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes are subject to the exclusive
                            jurisdiction of the courts of Riyadh.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">16. Changes</h2>
                        <p>
                            Empowering Energy may update these Terms with 14 days&apos; written notice to the Client.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">17. Contact</h2>
                        <p>
                            Questions about these Terms: <a href="mailto:legal@esap.ai" className="text-blue-600 hover:underline">legal@esap.ai</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
