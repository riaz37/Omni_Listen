'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Lock, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';


export default function ResetPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Invalid reset link');
    }
  }, [searchParams]);

  // Password strength validation
  const passwordLength = password.length;
  const hasMinLength = passwordLength >= 8;
  const hasMaxLength = passwordLength <= 128;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;
  const isPasswordValid = hasMinLength && hasMaxLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordLength < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      toast.error(errorMsg);
      return;
    }

    if (passwordLength > 128) {
      const errorMsg = `Password is too long (${passwordLength} characters). Maximum is 128 characters.`;
      toast.error(errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully!');
      setResetSuccess(true);

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to reset password. The link may be invalid or expired.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${met ? 'text-primary' : 'text-muted-foreground'}`}>
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      <span>{text}</span>
    </div>
  );

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-background-2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('auth.reset.success_title')}</h2>
            <p className="text-muted-foreground mb-4">{t('auth.reset.success_subtitle')}</p>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-2 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -top-20 -start-20"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -bottom-20 -end-20"
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
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('auth.reset.title')}</h2>
          <p className="text-muted-foreground">{t('auth.reset.subtitle')}</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          {!token ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-destructive text-sm font-medium mb-2">{t('auth.reset.invalid_link_title')}</p>
                <p className="text-muted-foreground text-xs">
                  {t('auth.reset.invalid_link_body')}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {t('auth.reset.new_password_label')}
                </label>
                <div className="relative group">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ps-12 pe-12 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all font-medium ${
                      password.length > 0 && !isPasswordValid
                        ? 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder={t('auth.reset.new_password_placeholder')}
                    required
                    minLength={8}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2 bg-muted p-3 rounded-xl border border-border">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength === 3
                                ? 'bg-yellow-500'
                                : 'bg-primary'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <PasswordRequirement met={hasMinLength} text={t('auth.reset.pw_req_length')} />
                      <PasswordRequirement met={hasUpperCase} text={t('auth.reset.pw_req_uppercase')} />
                      <PasswordRequirement met={hasLowerCase} text={t('auth.reset.pw_req_lowercase')} />
                      <PasswordRequirement met={hasNumber} text={t('auth.reset.pw_req_number')} />
                    </div>
                    {password.length > 0 && (
                      <p className={`text-xs ${
                        passwordLength > 128 ? 'text-destructive' :
                        passwordLength > 110 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-muted-foreground'
                      }`}>
                        {passwordLength} / 128 characters
                        {passwordLength > 128 && ' ' + t('auth.reset.pw_too_long')}
                        {passwordLength > 110 && passwordLength <= 128 && ' ' + t('auth.reset.pw_near_limit')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {t('auth.reset.confirm_password_label')}
                </label>
                <div className="relative group">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full ps-12 pe-12 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all font-medium ${
                      confirmPassword.length > 0 && !passwordsMatch
                        ? 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder={t('auth.reset.confirm_password_placeholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`text-xs mt-2 font-medium ${passwordsMatch ? 'text-primary' : 'text-destructive'}`}>
                    {passwordsMatch ? '✓ ' + t('common.passwords_match') : '✗ ' + t('common.passwords_no_match')}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('auth.reset.submitting')}</span>
                  </>
                ) : (
                  <span>{t('auth.reset.submit')}</span>
                )}
              </button>
            </form>
          )}

          {/* Back to Sign In */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              href="/signin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('auth.reset.back_to_signin')}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          {t('auth.reset.remember_password')}{' '}
          <Link href="/signin" className="text-primary hover:text-text-primary font-bold transition-colors">
            {t('auth.reset.signin_link')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
