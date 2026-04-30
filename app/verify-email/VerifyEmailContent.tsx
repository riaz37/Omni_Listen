'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams?.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerification(tokenFromUrl);
    } else {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification link - no token provided');
    }
  }, [searchParams]);

  const handleVerification = async (verificationToken: string) => {
    setIsVerifying(true);

    try {
      await authAPI.verifyEmail(verificationToken);
      toast.success('Email verified successfully!');
      setVerificationStatus('success');

      // Redirect to sign in after verification
      redirectTimerRef.current = setTimeout(() => {
        router.push('/signin?verified=true');
      }, 500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to verify email. The link may be invalid or expired.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setIsResending(true);
    try {
      await authAPI.resendVerification(resendEmail.trim());
      toast.success('Verification email sent!');
      setResendCooldown(60);
      cooldownRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current!);
            cooldownRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
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
              src="/logo-black.png"
              alt="Omni Listen"
              className="h-4 w-auto object-contain rounded-xl shadow-lg block dark:hidden"
            />
            <img
              src="/logo.png"
              alt="Omni Listen"
              className="h-4 w-auto object-contain rounded-xl shadow-lg hidden dark:block"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              <span className="text-primary">Omni</span>
              <span className="text-primary">Listen</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-foreground mb-2">Email Verification</h2>
          <p className="text-muted-foreground">Verifying your email address</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          {/* Verifying State */}
          {isVerifying && verificationStatus === 'pending' && (
            <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Verifying your email...</h3>
                <p className="text-muted-foreground">Please wait while we verify your email address.</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in">
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Email Verified!</h3>
                <p className="text-muted-foreground">Your email has been successfully verified. Redirecting to sign in...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in">
              <AlertCircle className="w-16 h-16 text-destructive" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Verification Failed</h3>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
              </div>

              {/* Resend section */}
              <div className="w-full space-y-3">
                <p className="text-sm text-muted-foreground text-left font-medium">Request a new verification link:</p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend verification email'
                  )}
                </button>
                <Link
                  href="/signin"
                  className="block w-full px-6 py-3 border border-border text-foreground rounded-xl font-medium transition-colors text-center hover:bg-muted"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
