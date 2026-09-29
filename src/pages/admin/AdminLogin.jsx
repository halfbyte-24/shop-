import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Lock, ArrowLeft, ShieldCheck, Store } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (import.meta.env.DEV) console.log("[DIAG] signIn attempt for:", email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.session) {
        if (import.meta.env.DEV) console.error("[DIAG] signIn failure:", authError);
        throw new Error("Invalid email or password.");
      }

      // 2. Verify admin authorization with explicit token injection to prevent race condition
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role, shop_id')
        .eq('user_id', authData.session.user.id)
        .setHeader('Authorization', `Bearer ${authData.session.access_token}`)
        .maybeSingle();

      if (adminError) {
        if (import.meta.env.DEV) {
          console.error('[AUTH DEBUG]', {
            message: adminError?.message,
            code: adminError?.code,
            details: adminError?.details,
            hint: adminError?.hint,
            status: adminError?.status
          });
        }
        throw new Error("Authentication succeeded, but authorization check failed. Please try again.");
      }

      if (!adminData) {
        // User is authenticated but has no admin mapping
        await supabase.auth.signOut();
        throw new Error("You are not authorized to access the admin panel.");
      }

      const validRoles = ['admin', 'superadmin'];
      if (!validRoles.includes(adminData.role)) {
        await supabase.auth.signOut();
        throw new Error("You are not authorized to access the admin panel.");
      }

      // 3. Authorized - App.jsx handles the redirect automatically when useAuth updates,
      // but we manually navigate to ensure smooth UX
      navigate('/admin');

    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="login-nav-link">
          <ArrowLeft size={16} />
          Back to Website
        </Link>
        <div className="login-header-brand">
          <Store size={16} />
          Store Admin
        </div>
      </header>

      <main className="login-container">
        <div className="login-card">
          <div className="login-icon-container">
            <Lock size={24} />
          </div>
          
          <div className="login-title-primary">Welcome back</div>
          <img src="/images/logo.png" alt="Janata Shoe Store" className="login-logo" style={{ margin: '0 auto 8px auto', display: 'block', maxHeight: '60px' }} />
          <p className="login-subtitle">Sign in to manage your catalogue</p>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-group mb-0">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              style={{ marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <ShieldCheck size={14} />
            Secure admin access
          </div>
        </div>
      </main>
    </div>
  );
}
