'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, CheckCircle2, Calendar, MessageSquare, Mic, BarChart3, Shield, Zap, FileText, CheckSquare, Search, Briefcase, User, Play, Linkedin, Facebook, Instagram, Youtube, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

export default function LandingPage() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary-foreground overflow-x-hidden">
      {/* Search Bar / Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <img
                src="/esapai_logo.png"
                alt="ESAPListen Logo"
                className="h-10 w-10 rounded-lg shadow-sm"
              />
              <span className="text-xl font-bold tracking-tight">
                <span className="text-text-primary">ESAP</span>
                <span className="text-primary-foreground">AI</span>
                <span className="text-text-primary">Listen</span>
              </span>
            </motion.div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/dashboard" className="px-5 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all text-sm font-medium">Dashboard</Link>
              ) : (
                <>
                  <Link href="/signin" className="text-sm font-medium text-muted-foreground hover:text-text-primary transition-colors hidden sm:block">Sign In</Link>
                  <Link href="/signup" className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-all shadow-lg shadow-primary/20 hover:scale-105">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Scroll Progress */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left" style={{ scaleX }} />
      </nav>

      {/* HERO SECTION with Clip Animation (Light Version) */}
      <section className="min-h-screen flex flex-col justify-center items-center relative pt-20">
        {/* Animated Background Elements (Subtle for Light Mode) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] left-[20%] w-[600px] h-[600px] bg-green-200/40 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground">
              Never Miss a Detail
              <br />
              <ClipText>From Your Meetings</ClipText>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl sm:text-3xl font-medium text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            AI that listens, so you don&apos;t have to take notes. <br className="hidden sm:block" />
            Record, transcribe, and extract <span className="text-foreground font-bold">actionable insights</span> instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={user ? "/dashboard" : "/signup"} className="group relative px-8 py-4 rounded-full bg-primary hover:bg-primary-hover transition-all text-white font-bold text-lg flex items-center gap-2 overflow-hidden shadow-xl shadow-primary/20 hover:shadow-primary/40">
              <span className="relative z-10">Start Recording Free</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://drive.google.com/file/d/1V_z19U0EcrcjAvs89mjHNadClQaG8xvo/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold text-lg flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              <Download className="w-5 h-5" />
              Install Desktop App
            </a>
            <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full bg-background border border-border hover:bg-muted text-muted-foreground transition-all font-semibold flex items-center gap-2 shadow-sm hover:shadow-md">
              <Play className="w-4 h-4 fill-current" /> See Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* PROCESSING DEMO SECTION */}
      <section id="demo" className="py-32 relative bg-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-bold mb-6 text-foreground"
            >
              How It Works
            </motion.h2>
            <p className="text-muted-foreground text-lg">Watch raw audio transform into structured data.</p>
          </div>

          <ProcessAnimation />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl sm:text-6xl font-bold mb-6 text-foreground">Built for <span className="text-text-primary">Modern Teams</span></h2>
            <p className="text-xl text-muted-foreground max-w-2xl">Replace your notebook with an intelligent system that remembers everything and organizes it for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Mic className="w-5 h-5 text-text-primary" />}
              title="Real-Time Transcription"
              description="Capture every word in English or Arabic with 99% accuracy using Gemini 2.0 Flash."
            />
            <FeatureCard
              icon={<Calendar className="w-5 h-5 text-orange-600" />}
              title="Auto-Sync to Calendar"
              description="Deadlines detected and pushed straight to your Google Calendar."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
              title="Deep Insights"
              description="Track speaker time, sentiment, and key decisions automatically."
            />
            <FeatureCard
              icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
              title="Custom Query Engine"
              description='Ask "Did we discuss budget limits?" and get a cited answer from your meetings.'
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted text-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/esapai_logo.png" alt="Logo" className="h-6 w-6" />
              <span className="font-bold text-foreground">ESAPAIListen</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your intelligent meeting companion. Capture, analyze, and sync every conversation.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#features" className="hover:text-text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/about" className="hover:text-text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-text-primary transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ESAPAIListen. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://x.com/ESAP2030" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/esapai/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="https://www.facebook.com/esapai.official" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/esapai.official/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="https://www.youtube.com/channel/UC7LyRbfXwb7at1gCQpUMzGg" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- COMPONENTS ---

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-50px", once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card-2 border border-border rounded-2xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
    >
      <div className="mt-1 shrink-0">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function ClipText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-teal-600 animate-gradient pb-2">
      {children}
      <motion.span
        className="absolute inset-0 bg-background"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1.2, ease: "circIn", delay: 0.2 }}
        style={{ originX: 0 }}
      />
    </span>
  );
}

// --- ORIGINAL PROCESS ANIMATION (Light Mode Style - Restored Details) ---

function ProcessAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const getDuration = (s: number) => {
      switch (s) {
        case 0: return 1000;
        case 1: return 1200;
        case 2: return 800;
        case 3: return 1300;
        case 4: return 1200;
        default: return 1000;
      }
    };

    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % 5);
    }, getDuration(step));

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-5xl mx-auto h-[500px] bg-background rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col items-center justify-start p-8 sm:p-12 mb-20"
    >
      <style jsx>{`
        @keyframes music-bar {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
        .animate-music-bar {
          animation: music-bar 1s ease-in-out infinite;
        }
      `}</style>

      {/* Pipeline Header */}
      <div className="relative z-10 w-full max-w-4xl mb-16">
        <div className="absolute top-7 left-6 right-6 sm:left-7 sm:right-7 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary"
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex justify-between items-start relative w-full">
          {/* Step 0: Context */}
          <StepItem active={step >= 0} current={step === 0} icon={<Briefcase className="w-5 h-5" />} label="Role Selection" color="purple" />
          <StepItem active={step >= 1} current={step === 1} icon={<Mic className="w-5 h-5" />} label="Record" color="red" />
          <StepItem active={step >= 2} current={step === 2} icon={<Zap className="w-5 h-5" />} label="Process" color="blue" />
          <StepItem active={step >= 3} current={step === 3} icon={<BarChart3 className="w-5 h-5" />} label="Extract" color="orange" />
          <StepItem active={step >= 4} current={step === 4} icon={<Calendar className="w-5 h-5" />} label="Sync" color="green" />
        </div>
      </div>

      {/* Dynamic Central Display */}
      <div className="w-full max-w-3xl h-64 relative flex items-center justify-center">

        {/* Step 0: Context Role Selection */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 ${step === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="relative space-y-4 text-center">
            <div className="text-muted-foreground/40 text-lg font-medium blur-[1px]">Software Engineer</div>
            <div className="bg-primary/5 text-text-primary px-8 py-3 rounded-xl font-bold text-2xl shadow-sm border border-primary/10 scale-110 flex items-center gap-3">
              <Briefcase className="w-6 h-6" />
              Project Manager
            </div>
            <div className="text-muted-foreground/40 text-lg font-medium blur-[1px]">Product Designer</div>
          </div>
          <p className="mt-8 text-muted-foreground font-medium">Applying Role Preset...</p>
        </div>

        {/* Step 1: Recording */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="flex items-end justify-center gap-2 h-24 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 bg-red-500 rounded-full animate-music-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-red-500 font-bold animate-pulse tracking-widest">RECORDING LIVE AUDIO</p>
        </div>

        {/* Step 2: Processing */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 ${step === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <Zap className="w-24 h-24 text-blue-500 animate-bounce" />
          <p className="mt-8 text-blue-600 font-mono text-sm font-medium">Transcribing... Recognizing Speakers... Analyzing Sentiment...</p>
        </div>

        {/* Step 3: Extraction (Rich Cards & Optional AI) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 ${step === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl mb-6">
            <motion.div
              animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0 }}
              className="bg-background p-3 rounded-xl border border-orange-100 shadow-md flex flex-col items-center text-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><CheckSquare className="w-4 h-4" /></div>
              <div><div className="text-xs text-muted-foreground font-bold uppercase">Task</div><div className="text-sm font-medium text-foreground">Update UI</div></div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="bg-background p-3 rounded-xl border border-blue-100 shadow-md flex flex-col items-center text-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Calendar className="w-4 h-4" /></div>
              <div><div className="text-xs text-muted-foreground font-bold uppercase">Event</div><div className="text-sm font-medium text-foreground">Sprint Demo</div></div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="bg-background p-3 rounded-xl border border-primary/10 shadow-md flex flex-col items-center text-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-text-primary"><FileText className="w-4 h-4" /></div>
              <div><div className="text-xs text-muted-foreground font-bold uppercase">Note</div><div className="text-sm font-medium text-foreground">Budget Safe</div></div>
            </motion.div>
          </div>

          {/* Optional AI Query - Distinct "Search Bar" Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-md bg-background rounded-full border border-border border-dashed py-3 px-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow group cursor-default"
          >
            <div className="bg-purple-100 p-1.5 rounded-full text-purple-600">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-sm font-medium group-hover:text-purple-600 transition-colors">Optional: Ask AI anything...</span>
            <div className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">CMD+K</div>
          </motion.div>
        </div>

        {/* Step 4: Sync (Native + GCal) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 ${step === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="flex gap-8 items-center justify-center w-full">

            {/* Native DB Card */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-background p-6 rounded-2xl border border-border shadow-xl flex flex-col items-center w-48 relative"
            >
              <div className="w-16 h-16 bg-muted rounded-xl mb-4 flex items-center justify-center">
                <img src="/esapai_logo.png" className="w-10 h-10 opacity-80" />
              </div>
              <div className="font-bold text-foreground">ESAP Dashboard</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Local History</div>

              {/* Status Badge */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}
                className="absolute -top-3 -right-3 bg-primary text-white rounded-full p-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            </motion.div>

            {/* Google Calendar Card */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-background p-6 rounded-2xl border border-border shadow-xl flex flex-col items-center w-48 relative"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-xl mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="font-bold text-foreground">Google Calendar</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Auto-Scheduled</div>

              {/* Status Badge */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}
                className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-12 text-xl font-bold text-muted-foreground"
          >
            Synced across your ecosystem
          </motion.p>
        </div>

      </div>
    </motion.div>

  );
}

function StepItem({ active, current, icon, label, color }: { active: boolean, current: boolean, icon: React.ReactNode, label: string, color: string }) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700',
    green: 'bg-primary/10 text-text-primary border-primary/20',
  };

  const activeClass = colorClasses[color];

  return (
    <div className={`flex flex-col items-center gap-3 relative z-10 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 shadow-sm
          ${active ? activeClass : 'bg-background border-border text-muted-foreground'}
          ${current ? 'scale-125 ring-4 ring-offset-2 ring-muted shadow-lg z-20' : 'scale-100'}
        `}
      >
        {icon}
      </div>
      <span className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${current ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
