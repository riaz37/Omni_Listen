'use client';

import Navigation from '@/components/Navigation';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="bg-card rounded-xl shadow-lg p-8 md:p-12">
                    <header className="mb-10 border-b pb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
                        <p className="text-muted-foreground">
                            <strong>Product:</strong> Omni Listen &mdash; Intelligent Audio Processing and Data Extraction System<br />
                            <strong>Legal Entity:</strong> Empowering Energy (trading as ESAP AI)<br />
                            <strong>Last Updated:</strong> April 12, 2026
                        </p>
                    </header>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies on Omni Listen</h2>
                        <p className="text-foreground leading-relaxed mb-4">
                            This platform uses cookies to keep your session secure, maintain your preferences, and provide your
                            organization with anonymous usage analytics.
                        </p>
                        <ul className="list-disc pl-6 text-foreground space-y-2">
                            <li>
                                <strong>Essential Cookies</strong> &mdash; Required for login, session security, platform functionality.
                                Cannot be disabled.
                            </li>
                            <li>
                                <strong>Analytics Cookies</strong> &mdash; Anonymous, aggregated platform usage data. No personal data
                                included.
                            </li>
                        </ul>
                        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-yellow-800 dark:text-yellow-200">
                                <strong>&#9888; Important:</strong> Meeting recordings and transcriptions are NOT stored in cookies. They
                                are handled separately under your organization&apos;s signed DPA.
                            </p>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies We Use</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Cookie Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground">
                                    <tr className="border-b">
                                        <td className="py-3 px-4 font-mono text-sm">session_token</td>
                                        <td className="py-3 px-4">Essential</td>
                                        <td className="py-3 px-4">Authenticated user session</td>
                                        <td className="py-3 px-4">Session end</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 px-4 font-mono text-sm">csrf_token</td>
                                        <td className="py-3 px-4">Essential</td>
                                        <td className="py-3 px-4">Cross-site request forgery protection</td>
                                        <td className="py-3 px-4">Session end</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 px-4 font-mono text-sm">user_prefs</td>
                                        <td className="py-3 px-4">Essential</td>
                                        <td className="py-3 px-4">Language and display preferences</td>
                                        <td className="py-3 px-4">1 year</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 px-4 font-mono text-sm">_analytics_id</td>
                                        <td className="py-3 px-4">Analytics</td>
                                        <td className="py-3 px-4">Anonymous platform usage tracking (no PII)</td>
                                        <td className="py-3 px-4">6 months</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-mono text-sm">cookie_consent</td>
                                        <td className="py-3 px-4">Essential</td>
                                        <td className="py-3 px-4">Records cookie consent choice</td>
                                        <td className="py-3 px-4">1 year</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">What We Do Not Use</h2>
                        <p className="text-foreground">
                            No advertising, retargeting, or behavioral tracking cookies. No cookie data shared with marketing platforms or
                            data brokers.
                        </p>
                    </section>

                    <footer className="mt-12 pt-8 border-t text-center text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} Empowering Energy (trading as ESAP AI). All rights reserved.</p>
                    </footer>
                </article>
            </div>
        </div>
    );
}
