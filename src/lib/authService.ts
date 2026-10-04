import { isSupabaseConfigured, supabase } from './supabase';
import { UserProfile } from '../types';

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const CURRENT_USER_KEY = 'w4r_current_user_v1';
const PENDING_OTP_EMAIL_KEY = 'w4r_pending_otp_email_v1';

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  // If Supabase is connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) return profile as UserProfile;
        
        return {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Customer',
          phone: session.user.user_metadata?.phone,
          dl_number: session.user.user_metadata?.dl_number,
          role: (session.user.email?.toLowerCase() === 'wheels4rent@cyberforage.space' || session.user.user_metadata?.role === 'admin')
            ? 'admin'
            : 'customer',
          created_at: session.user.created_at,
        };
      }
    } catch (e) {
      console.warn('Error reading supabase session:', e);
    }
  }

  // Fallback to local user
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

// 1. SIGN UP (WITH EMAIL CONFIRMATION / OTP)
export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dlNumber?: string;
}): Promise<{ user: UserProfile | null; confirmationRequired: boolean; message: string }> {
  const { email, password, fullName, phone, dlNumber } = params;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          dl_number: dlNumber,
          role: email.toLowerCase() === 'wheels4rent@cyberforage.space' ? 'admin' : 'customer',
        },
        emailRedirectTo: `${window.location.origin}/#email-confirmed`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);

    // Save profile to database
    try {
      if (data.user?.id) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
          dl_number: dlNumber,
          role: email.toLowerCase() === 'wheels4rent@cyberforage.space' ? 'admin' : 'customer',
        });
      }
    } catch (e) {
      // ignore
    }

    const confirmationRequired = !data.session;
    const profile: UserProfile = {
      id: data.user?.id || `user-${Date.now()}`,
      email,
      full_name: fullName,
      phone,
      dl_number: dlNumber,
      role: email.toLowerCase() === 'wheels4rent@cyberforage.space' ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
    };

    if (data.session) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    }

    return {
      user: data.session ? profile : null,
      confirmationRequired,
      message: confirmationRequired 
        ? `Confirmation email dispatched from wheels4rent@cyberforage.space to ${email}! Enter your 6-digit OTP code below or click the link in your email.`
        : 'Account created and verified successfully!',
    };
  }

  // Local sandbox simulation
  localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
  const newProfile: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    full_name: fullName,
    phone,
    dl_number: dlNumber,
    role: email.toLowerCase() === 'wheels4rent@cyberforage.space' ? 'admin' : 'customer',
    created_at: new Date().toISOString(),
  };

  return {
    user: null,
    confirmationRequired: true,
    message: `[Supabase Demo] Confirmation email sent from wheels4rent@cyberforage.space to ${email}. Use OTP code: 123456 or click confirm below.`,
  };
}

// 2. CONFIRM SIGNUP VIA OTP
export async function verifySignupOtp(email: string, token: string): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
        phone: data.user.user_metadata?.phone,
        dl_number: data.user.user_metadata?.dl_number,
        role: (data.user.email?.toLowerCase() === 'wheels4rent@cyberforage.space' || data.user.user_metadata?.role === 'admin')
          ? 'admin'
          : 'customer',
        created_at: data.user.created_at,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
      return profile;
    }
  }

  // Local simulation
  const profile: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    full_name: email.split('@')[0],
    role: email.toLowerCase() === 'wheels4rent@cyberforage.space' ? 'admin' : 'customer',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
  return profile;
}

// 3. MAGIC LINK / EMAIL OTP SIGN IN
export async function sendMagicLinkOrOtp(email: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/#magic-login`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
    return {
      success: true,
      message: `A Magic Link and 6-digit OTP have been sent from wheels4rent@cyberforage.space to ${email}! Enter the code below or click the link in your email.`,
    };
  }

  localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
  return {
    success: true,
    message: `[Supabase Demo] Magic link / OTP dispatched from wheels4rent@cyberforage.space to ${email}. You can use OTP code: 123456 to verify.`,
  };
}

// 4. VERIFY MAGIC LINK / EMAIL OTP
export async function verifyEmailOtp(email: string, token: string): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
        phone: data.user.user_metadata?.phone,
        dl_number: data.user.user_metadata?.dl_number,
        role: (data.user.email?.toLowerCase() === 'wheels4rent@cyberforage.space' || data.user.user_metadata?.role === 'admin')
          ? 'admin'
          : 'customer',
        created_at: data.user.created_at,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
      return profile;
    }
  }

  // Local simulation
  const isAdmin = email.toLowerCase() === 'wheels4rent@cyberforage.space';
  const profile: UserProfile = {
    id: isAdmin ? 'admin-001' : `usr-${Date.now()}`,
    email,
    full_name: isAdmin ? 'Wheels4Rent Operations (Admin)' : email.split('@')[0],
    role: isAdmin ? 'admin' : 'customer',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
  return profile;
}

// 5. STANDARD SIGN IN WITH PASSWORD
export async function signInUser(email: string, password: string): Promise<UserProfile> {
  // Primary Administrator Account Check
  if (
    (email.toLowerCase() === 'wheels4rent@cyberforage.space' && password === 'Suraj@5141') ||
    (email === 'admin@wheels4rent.com' && password === 'admin123')
  ) {
    const adminProfile: UserProfile = {
      id: 'admin-001',
      email: 'wheels4rent@cyberforage.space',
      full_name: 'Wheels4Rent Operations (Admin)',
      phone: '+91 97589 25637',
      role: 'admin',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminProfile));
    return adminProfile;
  }

  if (email === 'customer@example.com' && password === 'customer123') {
    const demoProfile: UserProfile = {
      id: 'user-demo-1',
      email: 'customer@example.com',
      full_name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      dl_number: 'DL0420190082341',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoProfile));
    return demoProfile;
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const profile: UserProfile = dbProfile || {
        id: data.user.id,
        email: data.user.email || '',
        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        phone: data.user.user_metadata?.phone,
        dl_number: data.user.user_metadata?.dl_number,
        role: data.user.user_metadata?.role || (
          data.user.email?.toLowerCase() === 'wheels4rent@cyberforage.space' ||
          data.user.email?.includes('admin')
            ? 'admin'
            : 'customer'
        ),
        created_at: data.user.created_at,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      return profile;
    }
  }

  // Local fallback: Check if user exists or simulate customer
  const isAdmin = email.toLowerCase() === 'wheels4rent@cyberforage.space' || email.toLowerCase().includes('admin');
  const localProfile: UserProfile = {
    id: isAdmin ? 'admin-001' : `usr-${Date.now()}`,
    email,
    full_name: isAdmin ? 'Wheels4Rent Operations (Admin)' : email.split('@')[0],
    role: isAdmin ? 'admin' : 'customer',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localProfile));
  return localProfile;
}

// 6. SIGN OUT
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout error:', e);
    }
  }
  localStorage.removeItem(CURRENT_USER_KEY);
}

// 7. REQUEST PASSWORD RESET (SEND RESET LINK / OTP)
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
    return {
      success: true,
      message: `Password reset instructions and 6-digit OTP code dispatched from wheels4rent@cyberforage.space to ${email}! Check your inbox or enter your recovery code below.`
    };
  }

  localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
  return {
    success: true,
    message: `[Supabase Demo] Password reset link & code sent from wheels4rent@cyberforage.space to ${email}! Enter your new password below.`
  };
}

// 8. VERIFY PASSWORD RESET VIA RECOVERY OTP
export async function verifyPasswordResetOtp(email: string, token: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  return true;
}

// 9. UPDATE PASSWORD
export async function updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Your password has been successfully updated with Supabase Auth.'
    };
  }

  return {
    success: true,
    message: 'Your password has been successfully updated!'
  };
}
