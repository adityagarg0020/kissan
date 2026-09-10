import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialTab); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLang, setPreferredLang] = useState(language || 'en');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn({ email, password });
        navigate(redirectPath, { replace: true });
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const data = await signUp({
          email,
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          preferredLanguage: preferredLang
        });

        if (data?.session) {
          navigate(redirectPath, { replace: true });
        } else {
          setSuccessMsg('Account created successfully! You can now log in.');
          setMode('login');
        }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset instructions have been sent to your email address.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-deep)', fontSize: '0.86rem', fontWeight: 600, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem 1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {/* Redirect Notice */}
        {searchParams.get('redirect') && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Farmer Login Required: Please sign in or create an account to access this feature.</span>
          </div>
        )}

        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '0.3rem' }}>🌾</div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
            {mode === 'login' ? 'Farmer Login' : mode === 'signup' ? 'Create Farmer Account' : 'Reset Password'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {mode === 'login' 
              ? 'Sign in to access your farm records and expenses' 
              : mode === 'signup' 
              ? 'Secure, private agricultural management for your fields' 
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Tab Toggle for Login / Signup */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '0.55rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--primary-deep)' : 'var(--text-muted)',
                fontWeight: mode === 'login' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.88rem'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '0.55rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? 'var(--primary-deep)' : 'var(--text-muted)',
                fontWeight: mode === 'signup' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.88rem'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #ffc9c9',
            color: '#c92a2a',
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#ebfbee',
            border: '1px solid #b2f2bb',
            color: '#2b8a3e',
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Sign-up specific fields */}
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="full-name">Full Name *</label>
                <input
                  id="full-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone-num">Mobile Number (Optional)</label>
                <input
                  id="phone-num"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lang-pref">Preferred Language</label>
                <select
                  id="lang-pref"
                  className="form-select"
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address *</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password (for login and signup) */}
          {mode !== 'forgot' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="password-input" style={{ marginBottom: 0 }}>Password *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-deep)', fontSize: '0.78rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              marginTop: '0.5rem'
            }}
          >
            {loading ? (
              <span>Please wait...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={17} /> Log In
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus size={17} /> Create Account
              </>
            ) : (
              <>
                <KeyRound size={17} /> Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Back to Login option if in forgot mode */}
        {mode === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-deep)', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 600 }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          🔒 Your information is used to personalize your KissanSaathi experience and manage your farm records. We never share your data.
        </div>
      </div>
    </div>
  );
}
