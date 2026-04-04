'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authAPI, calendarAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import FeatureHighlights from '@/components/FeatureHighlights';
import LoadingScreen from '@/components/LoadingScreen';
import CalendarConnectModal from '@/components/CalendarConnectModal';
import Link from 'next/link';
import { Loader2, Mail, Lock, Github, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';


// Removed conflicting global declaration



export default function SignInPage() {
  const router = useRouter();
  const { user, login, refreshUser } = useAuth();
  const toast = useToast();
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isConnectingCalendarModal, setIsConnectingCalendarModal] = useState(false);
  const [signinMode, setSigninMode] = useState<'oauth' | 'email'>('oauth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const processedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const handleOAuthCallback = async () => {
      if (processedRef.current) return; // Prevent double execution

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      // Desktop App Relay: If state starts with 'desktop:', it's a deep link flow
      // Redirect to backend callback to handle token exchange and protocol launch
      if (state && state.startsWith('desktop:')) {
        processedRef.current = true; // Mark as processed
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        // Construct full backend callback URL
        // e.g. https://.../api/auth/google/callback?code=...&state=...
        const callbackUrl = `${apiUrl}/api/auth/google/callback?code=${encodeURIComponent(code || '')}&state=${encodeURIComponent(state)}`;
        window.location.href = callbackUrl;
        return;
      }

      const githubState = localStorage.getItem('github_oauth_state');
      if (code && state && githubState === state) {
        localStorage.removeItem('github_oauth_state');
        if (!cancelled) {
          await handleGitHubCallback(code);
        }
        return;
      }

      if (code && state && !githubState) {
        if (!cancelled) {
          await handleCalendarCallback(code, state);
        }
        return;
      }

      if (user) {
        router.push('/dashboard');
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        if ((window as any).google && !cancelled) {
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          });

          // Render button as "outline" or "filled_blue" to suit light theme
          (window as any).google.accounts.id.renderButton(
            document.getElementById('googleSignInButton'),
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              // width removed to prevent stretching
            }
          );
        }
      };

      return () => {
        cancelled = true;
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };

    const isElectronEnv = typeof window !== 'undefined' && (window as any).electron;
    if (isElectronEnv) {
      setIsElectron(true);
      // Skip Google Script injection in Electron, as we use Deep Linking
    } else {
      // Only load Google Script if NOT Electron
      handleOAuthCallback();
    }
  }, [user, router]);

  // Deep Link Listener for Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electron && (window as any).electron.onDeepLinkAuth) {
      (window as any).electron.onDeepLinkAuth((url: string) => {
        try {
          // Parse URL using DOM URL API (or manual string parsing if needed)
          // The URL comes as 'esapai-listen://auth/callback?access_token=...'
          // Browsers/Node might stumble on custom protocol in new URL()?
          // Let's replace protocol to http for parsing
          const httpUrl = url.replace('esapai-listen://', 'http://localhost/');
          const parsed = new URL(httpUrl);

          const accessToken = parsed.searchParams.get('access_token');
          const refreshToken = parsed.searchParams.get('refresh_token');
          const errorParam = parsed.searchParams.get('error');

          if (errorParam) {
            toast.error("Login failed: " + decodeURIComponent(errorParam));
            return;
          }

          if (accessToken && refreshToken) {
            // Store tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Fetch User Details to complete login context
            authAPI.getCurrentUser().then(userData => {
              login({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: userData
              });
              toast.success("Signed in with Google!");
              redirectAfterLogin({ user: userData });
            }).catch(err => {
              toast.error("Login incomplete. Please try again.");
            });
          }
        } catch (e) {
        }
      });
    }
  }, [login, router]);

  const handleElectronGoogleLogin = async () => {
    try {
      const { authorization_url } = await authAPI.getGoogleAuthUrl();
      // Open in default browser
      window.open(authorization_url, '_blank');
    } catch (err) {
      toast.error("Could not start login process.");
    }
  };

  const redirectAfterLogin = async (userData: any) => {
    // Check if calendar is connected
    if (!userData.user.calendar_connected) {
      // Show modal asking if user wants to connect calendar
      setShowCalendarModal(true);
    } else {
      // Calendar already connected, go to dashboard
      router.push('/dashboard');
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnectingCalendarModal(true);
    try {
      const { authorization_url } = await calendarAPI.getAuthUrl();
      window.location.href = authorization_url;
    } catch (error) {
      toast.error('Failed to connect calendar. Please try again from Settings.');
      setShowCalendarModal(false);
      router.push('/dashboard');
    } finally {
      setIsConnectingCalendarModal(false);
    }
  };

  const handleSkipCalendar = () => {
    setShowCalendarModal(false);
    router.push('/dashboard');
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const result = await authAPI.googleAuth(response.credential);
      login(result);
      toast.success('Welcome back! Signed in successfully');
      await redirectAfterLogin(result);
    } catch (error) {
      const errorMsg = 'Failed to sign in with Google';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleGitHubCallback = async (code: string) => {
    try {
      const result = await authAPI.githubAuth(code);
      login(result);
      toast.success('Welcome back! Signed in with GitHub');
      await redirectAfterLogin(result);
    } catch (error) {
      const errorMsg = 'Failed to authenticate with GitHub';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleCalendarCallback = async (code: string, state: string) => {
    setIsConnectingCalendar(true);
    try {
      await calendarAPI.handleCallback(code, state);
      await refreshUser();
      toast.success('Calendar connected successfully!');
      window.history.replaceState({}, document.title, '/dashboard');
      router.push('/dashboard');
    } catch (error) {
      const errorMsg = 'Failed to connect calendar';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleGitHubSignIn = () => {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('github_oauth_state', state);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${window.location.origin}/signin&state=${state}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authAPI.emailLogin(formData.email, formData.password);
      login(result);
      toast.success('Welcome back! Signed in successfully');
      await redirectAfterLogin(result);
    } catch (error: any) {
      let errorMsg = error.response?.data?.detail || 'Invalid email or password';

      // Provide helpful messaging for common auth conflicts
      if (errorMsg.toLowerCase().includes('google') ||
        errorMsg.toLowerCase().includes('github') ||
        errorMsg.toLowerCase().includes('oauth')) {
        errorMsg = `This account was created with Google or GitHub. Please use the corresponding sign-in button above.`;
      } else if (errorMsg.toLowerCase().includes('not found') ||
        errorMsg.toLowerCase().includes('does not exist')) {
        errorMsg = `No account found with this email. Please sign up first or try signing in with Google/GitHub.`;
      } else if (errorMsg.toLowerCase().includes('password')) {
        errorMsg = `Incorrect password. Please try again or use "Forgot Password" to reset it.`;
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnectingCalendar) {
    return <LoadingScreen />;
  }

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
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your intelligent workspace</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 bg-muted p-1.5 rounded-xl">
            {!isElectron && (
              <button
                onClick={() => {
                  setSigninMode('oauth');
                  setError('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${signinMode === 'oauth'
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Quick Sign In
              </button>
            )}
            {isElectron && (
              <button
                onClick={() => {
                  setSigninMode('oauth');
                  setError('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${signinMode === 'oauth'
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Google Sign In
              </button>
            )}
            <button
              onClick={() => {
                setSigninMode('email');
                setError('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${signinMode === 'email'
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Email / Password
            </button>
          </div>

          {/* OAuth Mode */}
          {signinMode === 'oauth' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Google Sign In */}
              <div className="flex justify-center w-full">
                {!isElectron ? (
                  <div id="googleSignInButton" className="w-full"></div>
                ) : (
                  <button
                    onClick={handleElectronGoogleLogin}
                    className="flex items-center justify-center gap-3 px-6 py-2.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg transition-colors w-full font-medium shadow-sm"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="px-4 bg-card text-muted-foreground font-bold">Or continue with</span>
                </div>
              </div>

              {/* GitHub Sign In */}
              <button
                onClick={handleGitHubSignIn}
                className="flex items-center justify-center gap-3 px-6 py-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-lg transition-colors w-full font-medium"
              >
                <Github className="w-5 h-5" />
                <span>Sign in with GitHub</span>
              </button>
            </div>
          )}

          {/* Email/Password Mode */}
          {signinMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
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
                    className="w-full pl-12 pr-12 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary hover:text-text-primary transition-colors"
                >
                  Forgot password?
                </Link>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-text-primary font-bold transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        {/* Calendar Connect Modal */}
        <CalendarConnectModal
          isOpen={showCalendarModal}
          onConnect={handleConnectCalendar}
          onSkip={handleSkipCalendar}
          isConnecting={isConnectingCalendarModal}
        />

        <p className="text-center text-muted-foreground text-xs mt-6">
          By signing in, you agree to our <Link href="/terms" className="hover:text-foreground underline">Terms</Link> and <Link href="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
