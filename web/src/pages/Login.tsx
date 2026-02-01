// web/src/pages/Login.tsx

import React, { useState } from 'react';
import { Anchor, ShieldCheck, Ship, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Primary branding color
  const primaryColor = "#3194A0";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Shore Admin credentials from project spec
    if (email === 'admin@keel.com' && password === 'admin123') {
      console.log("Login Successful");
      window.location.href = "/dashboard";
    } else {
      setError("Invalid maritime credentials. Please contact System Admin.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side: Branding & Info */}
      <div style={{ ...styles.brandSection, backgroundColor: primaryColor }}>
        <div style={styles.brandContent}>
          <div style={styles.logoCircle}>
            <Ship size={48} color={primaryColor} />
          </div>
          <h1 style={styles.brandTitle}>KEELSAFE</h1>
          <p style={styles.brandSubtitle}>Shore-Side Administrative Command</p>
          <div style={styles.featureList}>
             <div style={styles.featureItem}><ShieldCheck size={20} /> SIMOPS Rule Management</div>
             <div style={styles.featureItem}><Anchor size={20} /> Fleet Permit Oversight</div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div style={styles.formSection}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Admin Portal Access</h2>
          <p style={styles.formSub}>Enter your credentials to manage vessel safety protocols.</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Shore Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@keel.com" 
                  style={styles.input} 
                  required 
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Security Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  style={styles.input} 
                  required 
                />
              </div>
            </div>

            <button type="submit" style={{ ...styles.loginBtn, backgroundColor: primaryColor }}>
              AUTHORIZE ACCESS
            </button>
          </form>

          <p style={styles.footerText}>
            © 2026 KeelSafe Maritime Systems. Encrypted Connection.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: '100vh', width: '100vw', fontFamily: 'Inter, system-ui, sans-serif' },
  brandSection: { flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  brandContent: { textAlign: 'center', padding: '40px' },
  logoCircle: { backgroundColor: 'white', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
  brandTitle: { fontSize: '3rem', fontWeight: '900', letterSpacing: '2px', margin: 0 },
  brandSubtitle: { fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px' },
  featureList: { textAlign: 'left', display: 'inline-block' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '1rem' },
  formSection: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  formCard: { width: '100%', maxWidth: '400px', padding: '40px' },
  formTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1E293B', marginBottom: '8px' },
  formSub: { color: '#64748B', marginBottom: '32px', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' },
  input: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', boxSizing: 'border-box' },
  loginBtn: { padding: '14px', borderRadius: '8px', color: 'white', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' },
  errorBox: { backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #FECACA' },
  footerText: { marginTop: '40px', fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center' }
};