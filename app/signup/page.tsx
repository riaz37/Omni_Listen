'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authAPI, calendarAPI } from '@/lib/api';
import CalendarConnectModal from '@/components/CalendarConnectModal';
import { toast } from 'sonner';
import FeatureHighlights from '@/components/FeatureHighlights';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isConnectingCalendarModal, setIsConnectingCalendarModal] = useState(false);

  const redirectAfterLogin = async (userData: any) => {
    // Show modal asking if user wants to connect calendar (for new users, they won't have it connected)
    if (!userData.user.calendar_connected) {
      setShowCalendarModal(true);
    } else {
      // Calendar already connected, go to dashboard
      router.push('/listen');
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnectingCalendarModal(true);
    try {
      const { authorization_url } = await calendarAPI.getAuthUrl();
      window.location.href = authorization_url;
    } catch (error) {
      setShowCalendarModal(false);
      router.push('/listen');
    } finally {
      setIsConnectingCalendarModal(false);
    }
  };

  const handleSkipCalendar = () => {
    setShowCalendarModal(false);
    router.push('/listen');
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password strength validation
  const passwordLength = formData.password.length;
  const hasMinLength = passwordLength >= 8;
  const hasMaxLength = passwordLength <= 128;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;
  const isPasswordValid = hasMinLength && hasMaxLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      const errorMsg = 'Please enter your name';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (passwordLength < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (passwordLength > 128) {
      const errorMsg = `Password is too long (${passwordLength} characters). Maximum is 128 characters.`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.emailRegister(
        formData.email,
        formData.password,
        formData.name
      );
      login(result);
      toast.success('Account created successfully! Welcome to Omni Listen');

      // Set a timeout to clear loading state in case redirect fails
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 second safety timeout

      try {
        await redirectAfterLogin(result);
        clearTimeout(timeoutId);
      } catch (redirectError) {
        clearTimeout(timeoutId);
        // If redirect fails, still go to dashboard
        router.push('/listen');
      }
    } catch (error: any) {
      let errorMessage = error.response?.data?.detail || 'Sign up failed. Please try again.';

      // Provide helpful messaging for common conflicts
      if (errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('email is already in use')) {
        errorMessage = `This email is already registered. If you signed up with Google or GitHub, please use the "Sign in with Google" or "Sign in with GitHub" button instead.`;
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.toLowerCase().includes('password')) {
        errorMessage = `Password error: ${errorMessage}`;
      }

      setError(errorMessage);
      toast.error(errorMessage);
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

  return (
    <div className="min-h-screen bg-background-2 flex items-center justify-center p-4 relative overflow-hidden font-sans">
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
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
          <p className="text-muted-foreground">Join thousands of professionals changing how they meet</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all font-medium ${formData.password.length > 0 && !isPasswordValid
                    ? 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive'
                    : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2 bg-muted p-3 rounded-xl border border-border">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level
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
                    <PasswordRequirement met={hasMinLength} text="8+ characters" />
                    <PasswordRequirement met={hasUpperCase} text="Uppercase" />
                    <PasswordRequirement met={hasLowerCase} text="Lowercase" />
                    <PasswordRequirement met={hasNumber} text="Number" />
                  </div>
                  {formData.password.length > 0 && (
                    <p className={`text-xs ${passwordLength > 128 ? 'text-destructive' :
                      passwordLength > 110 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-muted-foreground'
                      }`}>
                      {passwordLength} / 128 characters
                      {passwordLength > 128 && ' - Too long!'}
                      {passwordLength > 110 && passwordLength <= 128 && ' - Getting close to limit'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all font-medium ${formData.confirmPassword.length > 0 && !passwordsMatch
                    ? 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive'
                    : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`text-xs mt-2 font-medium ${passwordsMatch ? 'text-primary' : 'text-destructive'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-primary hover:text-text-primary font-bold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Calendar Connect Modal */}
        <CalendarConnectModal
          isOpen={showCalendarModal}
          onConnect={handleConnectCalendar}
          onSkip={handleSkipCalendar}
          isConnecting={isConnectingCalendarModal}
        />

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          By creating an account, you agree to our <Link href="/terms" className="hover:text-foreground underline">Terms</Link> and <Link href="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
