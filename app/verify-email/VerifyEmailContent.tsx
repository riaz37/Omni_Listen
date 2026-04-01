'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth-context';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { refreshUser } = useAuth();

  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

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

      // Refresh user data to update email_verified status
      await refreshUser();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to verify email. The link may be invalid or expired.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
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
              src="/esapai_logo.png"
              alt="ESAPListen"
              className="h-12 w-12 rounded-xl shadow-lg"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              <span className="text-primary">ESAP</span>
              <span>AI</span>
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
                <p className="text-muted-foreground">Your email has been successfully verified. Redirecting to dashboard...</p>
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

              <div className="w-full space-y-3">
                <Link
                  href="/signin"
                  className="block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-medium transition-colors text-center"
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
