import Link from 'next/link';
import { Shield, Lock, Server, Eye, FileCheck, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20">
                <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-6 text-primary dark:text-primary">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Security is our <span className="text-primary">Top Priority</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        We built Omni Listen with a security-first architecture. Your conversation data is sensitive, and protecting it is the foundation of our business.
                    </p>
                </div>
            </div>

            {/* Key Pillars */}
            <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                    {/* Encryption */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">End-to-End Encryption</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Data is encrypted at rest using **AES-256** standards and in transit via **TLS 1.3**. Your audio files and transcripts are stored in secure buckets with strict access logging.
                        </p>
                    </div>

                    {/* Infrastructure */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">Secure Cloud Infrastructure</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We host our infrastructure on **Google Cloud Platform (GCP)**, leveraging their world-class data centers with SOC 2, ISO 27001, and HIPAA compliance accreditations.
                        </p>
                    </div>

                    {/* AI Privacy */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">AI Data Privacy</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Your conversation data is processed by our AI partners (Google Gemini) under strict enterprise agreements. **We do NOT use your data to train our public models**, nor do we allow our AI partners to do so.
                        </p>
                    </div>

                    {/* Access Control */}
                    <div className="bg-card-2 p-8 rounded-3xl border border-border">
                        <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary dark:text-primary mb-6">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">Strict Access Control</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We follow the **Principle of Least Privilege**. Only authorized engineers with 2FA enabled have access to production environments for maintenance purposes, and all access is logged.
                        </p>
                    </div>

                </div>
            </div>

            {/* Reporting Section */}
            <div className="bg-card-2/50 py-20 border-t border-border">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-8">Vulnerability Reporting</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        If you believe you have found a security vulnerability in Omni Listen, please report it to us immediately.
                        We operate a responsible disclosure program.
                    </p>
                    <a
                        href="mailto:security@esap.ai"
                        className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-white px-8 py-4 rounded-full font-medium transition-colors"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Report a Vulnerability
                    </a>
                </div>
            </div>
        </div>
    );
}
