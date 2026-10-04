import React from 'react';
import { UserProfile } from '../types';
import { 
  signInUser, signUpUser, requestPasswordReset, 
  sendMagicLinkOrOtp, verifyEmailOtp, verifySignupOtp 
} from '../lib/authService';
import { 
  X, Mail, Lock, User, Phone, FileText, CheckCircle2, 
  AlertCircle, Shield, ArrowRight, KeyRound, Sparkles, RefreshCw, Send 
} from 'lucide-react';

export type AuthTab = 'signin' | 'magic_otp' | 'signup' | 'verify_signup_otp' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: AuthTab;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onOpenResetPassword?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'signin',
  onClose,
  onSuccess,
  onOpenResetPassword,
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = React.useState<AuthTab>(initialTab);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Form fields
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dlNumber, setDlNumber] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);

  // Reset errors when tab changes
  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    setError(null);
    setSuccessMsg(null);
    setOtpSent(false);
  };

  // 1. Password Login
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signInUser(email, password);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign Up (Transition to OTP verification)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const result = await signUpUser({
        email,
        password,
        fullName,
        phone,
        dlNumber,
      });

      if (result.confirmationRequired) {
        setSuccessMsg(result.message);
        setTab('verify_signup_otp');
      } else if (result.user) {
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Confirm Signup OTP
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await verifySignupOtp(email, otpCode.trim());
      setSuccessMsg('Email successfully verified! Welcome to Wheels4Rent.');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired confirmation OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Send Magic Link / OTP
  const handleSendMagicOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await sendMagicLinkOrOtp(email);
      setSuccessMsg(res.message);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send Magic Link / OTP');
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify Magic Link / OTP
  const handleVerifyMagicOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await verifyEmailOtp(email, otpCode.trim());
      setSuccessMsg('Logged in successfully via Supabase OTP!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Request Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick Customer Demo Shortcut
  const handleQuickCustomerLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInUser('customer@example.com', 'customer123');
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 mb-3">
            <span className="font-display font-black text-xl text-white">Wheels<span className="text-brand-500">4</span>Rent</span>
            <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2.5 py-0.5 rounded-full border border-brand-500/20 font-bold uppercase tracking-wider">
              Supabase Auth
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Emails dispatched via <strong className="text-slate-200">wheels4rent@cyberforage.space</strong>
          </p>

          {/* Navigation Mode Pills */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition whitespace-nowrap ${
                tab === 'signin' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('magic_otp')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition whitespace-nowrap ${
                tab === 'magic_otp' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Magic Link / OTP
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition whitespace-nowrap ${
                tab === 'signup' || tab === 'verify_signup_otp' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => switchTab('forgot')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition whitespace-nowrap ${
                tab === 'forgot' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: STANDARD PASSWORD SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="text-[11px] text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTab('magic_otp')}
                  className="text-xs text-slate-400 hover:text-brand-400 flex items-center justify-center space-x-1 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Or sign in with Magic Link / Email OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MAGIC LINK / EMAIL OTP SIGN IN */}
          {tab === 'magic_otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendMagicOtp} className="space-y-3.5">
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                    <p className="font-semibold text-white mb-1 flex items-center space-x-1.5">
                      <KeyRound className="w-4 h-4 text-brand-400" />
                      <span>Passwordless Supabase Login</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      We'll send a 6-digit OTP and instant login link from <strong className="text-slate-300">wheels4rent@cyberforage.space</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Your Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
                  >
                    <span>{loading ? 'Dispatching OTP...' : 'Send Magic Link & 6-Digit OTP'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyMagicOtp} className="space-y-3.5">
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                    <p className="font-bold text-white mb-0.5">Enter 6-Digit Code</p>
                    <p className="text-[11px] text-slate-400">
                      Dispatched to <strong className="text-brand-400">{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Log In'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-white"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendMagicOtp}
                      className="text-brand-400 hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mobile Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Driving License Number</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="DL0420190082341"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Send Confirmation OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 4: CONFIRM SIGNUP VIA OTP */}
          {tab === 'verify_signup_otp' && (
            <form onSubmit={handleVerifySignupOtp} className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <p className="font-bold text-white mb-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verify Your Email</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Supabase has dispatched a 6-digit confirmation OTP from <strong className="text-slate-300">wheels4rent@cyberforage.space</strong> to <strong className="text-brand-400">{email}</strong>.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Enter 6-Digit Email Confirmation Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono text-xl font-black tracking-widest text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Validating Token...' : 'Confirm Account & Proceed'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Didn't receive email? Check spam or{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="text-brand-400 hover:underline"
                >
                  re-enter details
                </button>
              </p>
            </form>
          )}

          {/* TAB 5: RESET PASSWORD REQUEST */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">Supabase Password Recovery</p>
                <p className="text-[11px] text-slate-400">
                  Enter your email. Supabase will send a password reset link & OTP code from <strong className="text-slate-300">wheels4rent@cyberforage.space</strong>.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Your Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Dispatching Reset...' : 'Send Password Reset Code / Link'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>

              {onOpenResetPassword && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenResetPassword();
                    }}
                    className="text-xs text-brand-400 hover:underline font-semibold"
                  >
                    Already have a 6-digit Recovery Code? Click here to set new password →
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Quick Demo Credentials Footer */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleQuickCustomerLogin}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Test Customer 1-Click Login</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2.5">
              Admin Portal access requires password authentication for <span className="text-slate-300 font-mono">wheels4rent@cyberforage.space</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
