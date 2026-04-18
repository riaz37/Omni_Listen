'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authAPI.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
      setSubmitted(true);

      // For development: show the reset URL
      if (result.reset_url) {
        setResetUrl(result.reset_url);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to send reset instructions';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-2 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -top-20 -left-20"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -bottom-20 -right-20"
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <img
              src="/mainlogo.webp"
              alt="Omni Listen"
              className="h-12 w-12 rounded-xl shadow-lg"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              <span className="text-primary">Omni</span>
              <span className="text-primary">Listen</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-foreground mb-2">Reset Password</h2>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          {!submitted ? (
            <>
              <div className="mb-6 text-center">
                <p className="text-muted-foreground">
                  Enter your email address and we&apos;ll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              {/* Success Message */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Check your email</h3>
                  <p className="text-muted-foreground">
                    If an account exists with <span className="font-medium text-primary">{email}</span>,
                    you will receive password reset instructions shortly.
                  </p>
                </div>
              </div>

              {/* Development Only: Show Reset URL */}
              {resetUrl && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <div className="flex items-start gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium mb-2">Email Not Configured</p>
                      <p className="text-muted-foreground text-xs mb-2">
                        SMTP is not configured. Click the link below to reset your password:
                      </p>
                      <Link
                        href={resetUrl.replace(window.location.origin, '')}
                        className="text-primary hover:text-primary text-sm break-all underline"
                      >
                        {resetUrl}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Back to Sign In */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Remember your password?{' '}
          <Link href="/signin" className="text-primary hover:text-text-primary font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
