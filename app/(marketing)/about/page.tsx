import Link from 'next/link';
import { Users, Target, Shield, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-primary/5 border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
                        Your Personal <span className="text-primary">AI Listener</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        We are building the AI assistant that captures every conversation, turning spoken words into organized, actionable knowledge.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                        <div className="prose dark:prose-invert text-lg text-muted-foreground space-y-6">
                            <p>
                                It started with a simple problem: <strong>Where did that note go?</strong>
                            </p>
                            <p>
                                We realized that millions of brilliant ideas, critical decisions, and action items were being lost every day in the chaos of conversations. Notebooks get lost, memories fade, and manual transcription is a chore that no one enjoys.
                            </p>
                            <p>
                                Omini Listen was born from the desire to capture that value. We wanted to build a personal AI assistant that didn't just record audio, but actually <em>understood</em> it—giving you back the context and clarity you need to move forward.
                            </p>
                        </div>
                    </div>
                    <div className="bg-card-2 rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
                        {/* Placeholder for Team Image or Illustration */}
                        <div className="text-center">
                            <Users className="w-24 h-24 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">Omini Listen Team at work</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="bg-card-2/50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These principles guide every decision we make, from product features to how we handle your data.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card-2 p-8 rounded-2xl shadow-sm border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Privacy First</h3>
                            <p className="text-muted-foreground">
                                Your conversations are sacred. We design our systems to ensure your data remains private, secure, and under your control.
                            </p>
                        </div>

                        <div className="bg-card-2 p-8 rounded-2xl shadow-sm border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">User Centric</h3>
                            <p className="text-muted-foreground">
                                We don't build features for the sake of technology. We build them to solve real human problems and make your work life happier.
                            </p>
                        </div>

                        <div className="bg-card-2 p-8 rounded-2xl shadow-sm border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Continuous Innovation</h3>
                            <p className="text-muted-foreground">
                                The world of AI is moving fast, and so are we. We are constantly pushing the boundaries of what's possible in audio intelligence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-20 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-8">Join us on this journey</h2>
                <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-foreground bg-primary rounded-full hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/30"
                >
                    Get Started Free
                </Link>
            </div>
        </div>
    );
}
