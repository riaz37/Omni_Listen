'use client';

import Navigation from '@/components/Navigation';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="bg-card rounded-xl shadow-lg p-8 md:p-12">
                    {/* Header */}
                    <header className="mb-10 border-b pb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
                        <p className="text-muted-foreground">
                            <strong>Effective Date:</strong> December 7, 2024<br />
                            <strong>Last Updated:</strong> December 7, 2024
                        </p>
                    </header>

                    {/* Introduction */}
                    <section className="mb-10">
                        <p className="text-foreground text-lg leading-relaxed">
                            ESAPAIListen (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                            when you use our meeting transcription and analysis service, including our browser extension
                            and web application (collectively, the &quot;Service&quot;).
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">1.1 Information You Provide</h3>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Account Information:</strong> Email address, name, and profile picture when you sign in with Google</li>
                            <li><strong>Meeting Audio:</strong> Audio recordings from meetings you choose to record using our browser extension</li>
                            <li><strong>User Preferences:</strong> Your configured presets, roles, and custom queries</li>
                        </ul>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">1.2 Information Collected Automatically</h3>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Device Information:</strong> Browser type, operating system, and timezone</li>
                            <li><strong>Usage Data:</strong> Features used, meeting duration, and interaction patterns</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                        <p className="text-foreground mb-4">We use the collected information solely for the following purposes:</p>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Service Provision:</strong> To transcribe meeting audio, generate summaries, and extract action items</li>
                            <li><strong>Personalization:</strong> To remember your preferences and provide customized experiences</li>
                            <li><strong>Calendar Integration:</strong> To sync extracted events with your Google Calendar (when authorized)</li>
                            <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our features</li>
                            <li><strong>Communication:</strong> To send important service updates and respond to your requests</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Third-Party Services</h2>
                        <p className="text-foreground mb-4">We use the following third-party services to process your data:</p>

                        <div className="bg-muted rounded-lg p-6 space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground">AssemblyAI</h4>
                                <p className="text-muted-foreground">For audio transcription and speaker detection. Audio is transmitted securely and processed according to their <a href="https://www.assemblyai.com/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Google Gemini AI</h4>
                                <p className="text-muted-foreground">For generating meeting summaries, extracting events, and analyzing content. Processed according to Google&apos;s <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Google OAuth</h4>
                                <p className="text-muted-foreground">For secure authentication. We only request necessary scopes for login and calendar access.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Retention</h2>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Audio Files:</strong> Immediately deleted after transcription is complete (typically within minutes)</li>
                            <li><strong>Transcriptions & Summaries:</strong> Stored in your account until you delete them</li>
                            <li><strong>Account Data:</strong> Retained until you request account deletion</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                        <p className="text-foreground mb-4">We implement industry-standard security measures to protect your data:</p>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li>All data transmission is encrypted using TLS/SSL</li>
                            <li>Audio is streamed over secure WebSocket connections (WSS)</li>
                            <li>Authentication tokens are securely stored and regularly rotated</li>
                            <li>Database access is restricted and monitored</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                        <p className="text-foreground mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct inaccurate data</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                            <li><strong>Export:</strong> Download your meeting data</li>
                            <li><strong>Opt-out:</strong> Disable optional features like calendar sync</li>
                        </ul>
                        <p className="text-foreground mt-4">
                            To exercise these rights, please contact us at <a href="mailto:esaplisten@gmail.com" className="text-primary hover:underline">esaplisten@gmail.com</a>.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">7. Children&apos;s Privacy</h2>
                        <p className="text-foreground">
                            Our Service is not intended for users under 13 years of age. We do not knowingly collect
                            personal information from children under 13. If you become aware that a child has provided
                            us with personal information, please contact us.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to This Policy</h2>
                        <p className="text-foreground">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by
                            posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We
                            encourage you to review this Privacy Policy periodically.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
                        <p className="text-foreground mb-4">
                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-muted rounded-lg p-6">
                            <p className="text-foreground">
                                <strong>Email:</strong> <a href="mailto:esaplisten@gmail.com" className="text-primary hover:underline">esaplisten@gmail.com</a>
                            </p>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>© {new Date().getFullYear()} ESAPAIListen. All rights reserved.</p>
                    </footer>
                </article>
            </div>
        </div>
    );
}
