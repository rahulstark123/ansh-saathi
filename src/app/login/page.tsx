'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, User, Phone, MapPin, Briefcase,
  ArrowRight, ShieldCheck, Key, Unlock, Eye, EyeOff,
  Camera, Building, CreditCard, Users, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { LinkedInIcon } from '@/components/icons';
import CustomSelect from '@/components/custom-select';
import { supabase } from '@/lib/supabase';
import { compressFile } from '@/lib/compression';

// ─── Step indicator ──────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Profile' },
  { number: 2, label: 'Bank Details' },
  { number: 3, label: 'Emergency' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setRole, upsertSaathi, setCurrentSaathiId, saathis } = usePortalStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [error, setError] = useState('');

  // ── Signup step ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Admin Passcode ────────────────────────────────────────────────────────
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const CORRECT_PASSCODE = 'Simran@Khushi@123';
  const isPasscodeVerified = adminPasscode === CORRECT_PASSCODE;

  // ── Step 1 – Profile ─────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [profession, setProfession] = useState('Chartered Accountant (CA)');
  const [customProfession, setCustomProfession] = useState('');
  const [companyRole, setCompanyRole] = useState('Owner');
  const [linkedin, setLinkedin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);

  // ── Step 2 – Bank Details (all optional) ─────────────────────────────────
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  // ── Step 3 – Emergency Contact ────────────────────────────────────────────
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');

  // ── Profile Picture ────────────────────────────────────────────────────────
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState('');

  const professionOptions = [
    'Chartered Accountant (CA)', 'Company Secretary (CS)', 'Cost Accountant (CMA)',
    'GST Practitioner / Tax Consultant', 'HR Consultant / Recruitment Agency',
    'Business Consultant / Advisor', 'Software Vendor / IT Service Provider',
    'Digital Marketing Agency / Freelancer', 'Financial Planner / Wealth Advisor',
    'Insurance Agent / Broker', 'Corporate Trainer / Coach', 'Lawyer / Legal Advisor', 'Other'
  ];
  const companyRoleOptions = ['Employee', 'Manager', 'Director', 'Admin', 'Owner'];

  // ─── Pincode auto-fill ────────────────────────────────────────────────────
  const handlePincodeChange = async (val: string) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 6);
    setPincode(numericVal);
    if (numericVal.length === 6) {
      setLoadingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${numericVal}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice) {
          const po = data[0].PostOffice[0];
          setCity(po.District || po.Division || '');
          setState(po.State || '');
          setAddress(po.Name || '');
        }
      } catch { /* silent */ } finally { setLoadingPincode(false); }
    }
  };

  // ─── Profile picture ──────────────────────────────────────────────────────
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    setCompressionInfo('Compressing image...');
    try {
      const compressed = await compressFile(file);
      const origSize = (file.size / 1024).toFixed(0);
      const compSize = (compressed.size / 1024).toFixed(0);
      const pctSaved = ((1 - compressed.size / file.size) * 100).toFixed(0);
      setCompressionInfo(`Compressed: ${origSize}KB → ${compSize}KB (-${pctSaved}%)`);
      const formData = new FormData();
      formData.append('file', compressed);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProfilePicUrl(data.url);
    } catch (err: any) {
      setError(`Profile picture upload failed: ${err.message}`);
      setCompressionInfo('');
    } finally { setUploading(false); }
  };

  // ─── Sign In ──────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email === 'admin@anshapps.com') { setRole('admin'); router.push('/admin'); return; }
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (!authError && authData.user) {
        let saathi = saathis.find(s => s.id === authData.user.id || s.email.toLowerCase() === email.toLowerCase());
        if (!saathi) {
          const meta = authData.user.user_metadata || {};
          saathi = {
            id: authData.user.id, wid: 1, name: meta.name || 'Founding Partner', email,
            phone: meta.phone || '', profession: meta.profession || 'Business Consultant',
            companyRole: meta.companyRole || 'Owner', pincode: meta.pincode || '',
            address: meta.address || '', city: meta.city || '', state: meta.state || '',
            linkedin: meta.linkedin || '', status: 'approved',
            partnerCode: 'SAATHI-' + authData.user.id.slice(0, 4).toUpperCase(),
            joinedDate: new Date().toISOString().split('T')[0],
            profilePicture: meta.profilePicture || null,
            payoutDetails: { bankName: '', accountNumber: '', ifsc: '', upiId: '' }
          };
          upsertSaathi(saathi);
        }
        setRole('saathi');
        setCurrentSaathiId(saathi.id);
        router.push('/dashboard');
        return;
      }
      const saathi = saathis.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (saathi) {
        setRole('saathi');
        setCurrentSaathiId(saathi.id);
        router.push('/dashboard');
      } else {
        setError(authError?.message || 'Invalid email or password.');
      }
    } catch (err: any) { setError(err.message || 'Authentication error'); }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('Forgot password? No issue - Ask your admin to reset the password.');
  };

  // ─── Step validation ──────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!isPasscodeVerified) { setError('Invalid admin verification passcode.'); return false; }
    if (!name || !regEmail || !phone || !pincode || !address || !city || !state || !regPassword || !confirmPassword || !companyRole) {
      setError('Please fill in all required fields.'); return false;
    }
    if (profession === 'Other' && !customProfession) { setError('Please specify your profession.'); return false; }
    if (regPassword !== confirmPassword) { setError('Passwords do not match.'); return false; }
    return true;
  };

  const goToStep2 = () => { setError(''); if (validateStep1()) setStep(2); };
  const goToStep3 = () => { setError(''); setStep(3); };
  const goBack = () => { setError(''); setStep(s => s - 1); };

  // ─── Final Submit ─────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail, password: regPassword,
        options: {
          data: {
            name, phone,
            profession: profession === 'Other' ? customProfession : profession,
            companyRole, pincode, address, city, state, linkedin,
            profilePicture: profilePicUrl || null,
            bankName, accountNumber, ifsc, upiId, accountHolderName,
            emergencyName, emergencyPhone, emergencyRelation, emergencyEmail
          }
        }
      });
      if (authError) throw new Error(authError.message);

      const workspaceRes = await fetch('/api/workspace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saathiName: name, saathiEmail: regEmail })
      });
      const workspaceData = await workspaceRes.json();
      if (workspaceData.error) throw new Error(workspaceData.error);
      const wid = workspaceData.workspace?.wid;

      const profileRes = await fetch('/api/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authData.user?.id || `saathi-${Date.now()}`,
          email: regEmail, name, phone,
          profession: profession === 'Other' ? customProfession : profession,
          companyRole, pincode, address, city, state, linkedin,
          profilePicture: profilePicUrl || null,
          wid: wid,
          emergencyName, emergencyPhone, emergencyRelation, emergencyEmail
        })
      });
      const profileData = await profileRes.json();
      if (profileData.error) throw new Error(profileData.error);
      const dbSaathi = profileData.saathi;

      // Upsert the partner record locally with the server-generated sequential partnerCode
      upsertSaathi({
        id: dbSaathi.id,
        wid: dbSaathi.wid,
        name: dbSaathi.name,
        email: dbSaathi.email,
        phone: dbSaathi.phone,
        profession: dbSaathi.profession,
        companyRole: dbSaathi.companyRole,
        pincode: dbSaathi.pincode,
        address: dbSaathi.address,
        city: dbSaathi.city,
        state: dbSaathi.state,
        linkedin: dbSaathi.linkedin,
        status: dbSaathi.status,
        partnerCode: dbSaathi.partnerCode,
        joinedDate: dbSaathi.joinedDate ? dbSaathi.joinedDate.split('T')[0] : new Date().toISOString().split('T')[0],
        profilePicture: dbSaathi.profilePicture,
        payoutDetails: { bankName, accountNumber, ifsc, upiId },
        emergencyName: dbSaathi.emergencyName || emergencyName,
        emergencyPhone: dbSaathi.emergencyPhone || emergencyPhone,
        emergencyRelation: dbSaathi.emergencyRelation || emergencyRelation,
        emergencyEmail: dbSaathi.emergencyEmail || emergencyEmail,
      });
      
      setRole('saathi');
      setCurrentSaathiId(dbSaathi.id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setUploading(false); }
  };

  // ─── Input className helper ───────────────────────────────────────────────
  const inputCls = "w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-text-muted focus:outline-none transition-all";
  const inputNoPadCls = "w-full bg-white/[0.02] border border-glass-border focus:border-primary rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col justify-between relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-25%] right-[-15%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_60%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-25%] left-[-15%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.07),transparent_60%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.01] via-transparent to-orange-500/[0.01] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between relative z-10 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logoAnshapps.png" alt="ANSH logo" className="h-7 object-contain" />
          <span className="text-primary-bright font-medium text-sm font-outfit uppercase tracking-widest mt-0.5">Saathi</span>
        </div>
        <div className="text-[11px] text-text-muted flex items-center gap-1.5 px-3 py-1 rounded-full border border-glass-border bg-bg-accent/40 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured Partner Login</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg">
          <div className="glass-card rounded-2xl p-6 md:p-8 shadow-2xl relative border border-glass-border">

            {/* Card title */}
            <div className="text-center mb-5 space-y-1">
              <h2 className="text-2xl font-bold font-outfit text-white">
                {isLogin ? 'Saathi Partner Login' : 'Create Partner Account'}
              </h2>
              <p className="text-xs text-text-muted">
                {isLogin ? 'Enter your credentials to access your dashboard' : 'Complete all steps to create your account'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-glass-border mb-5">
              <button onClick={() => { setIsLogin(true); setError(''); setStep(1); }}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${isLogin ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}>
                Sign In
              </button>
              <button onClick={() => { setIsLogin(false); setError(''); setStep(1); }}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${!isLogin ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}>
                Register
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ════════════ SIGN IN ════════════ */}
              {isLogin ? (
                <motion.form key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        className="w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
                        placeholder="you@domain.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Password</label>
                      <button type="button" onClick={handleForgotPassword} className="text-[10px] text-primary-bright hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type={showLoginPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                        className="w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 pl-11 pr-10 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white cursor-pointer bg-transparent border-none p-0 focus:outline-none">
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 text-sm">
                    <span>Sign In</span><ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>

              ) : (
                /* ════════════ REGISTER — 3-STEP ════════════ */
                <div key="register">

                  {/* Step progress bar */}
                  <div className="flex items-center justify-between mb-5 px-1">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s.number}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                            step > s.number ? 'bg-emerald-500 border-emerald-500 text-white' :
                            step === s.number ? 'bg-primary border-primary text-white' :
                            'border-glass-border text-text-muted'
                          }`}>
                            {step > s.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.number}
                          </div>
                          <span className={`text-[9px] font-semibold tracking-wider uppercase ${step >= s.number ? 'text-white' : 'text-text-muted'}`}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-px mx-2 transition-all ${step > s.number ? 'bg-emerald-500' : 'bg-glass-border'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">

                    {/* ── STEP 1: PROFILE ────────────────────────────────── */}
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">

                          {/* Passcode */}
                          <div className="space-y-1 pb-2 border-b border-glass-border/30">
                            <label className="text-[10px] text-amber-400 font-bold tracking-wider uppercase flex items-center gap-1">
                              {isPasscodeVerified ? <><Unlock className="w-3 h-3 text-emerald-400 animate-pulse" /><span className="text-emerald-400">Passcode Verified</span></> : <><Lock className="w-3 h-3" /><span>Admin Passcode Required</span></>}
                            </label>
                            <div className="relative">
                              <Key className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isPasscodeVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
                              <input type={showPasscode ? 'text' : 'password'} value={adminPasscode} onChange={e => setAdminPasscode(e.target.value)}
                                className={`w-full bg-white/[0.02] border focus:outline-none rounded-lg py-2.5 pl-9 pr-10 text-xs text-white placeholder-text-muted transition-all font-mono ${isPasscodeVerified ? 'border-emerald-500/40 focus:border-emerald-500' : 'border-amber-500/20 focus:border-amber-500'}`}
                                placeholder="Enter admin passcode" required />
                              <button type="button" onClick={() => setShowPasscode(!showPasscode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white cursor-pointer">
                                {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className={`space-y-3 transition-opacity duration-300 ${isPasscodeVerified ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            {!isPasscodeVerified && <div className="p-2.5 rounded-lg border border-amber-500/10 bg-amber-500/5 text-[10px] text-amber-400 font-medium text-center">Fields are locked. Enter valid passcode above.</div>}

                            {/* Avatar */}
                            <div className="flex flex-col items-center space-y-1.5 pb-1">
                              <div className="relative">
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-glass-border bg-white/[0.03] flex items-center justify-center shadow-inner">
                                  {profilePicUrl ? <img src={profilePicUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-text-muted" />}
                                  {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div></div>}
                                </div>
                                <label className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white border border-[#050508] cursor-pointer hover:scale-105 transition-transform">
                                  <Camera className="w-3 h-3" />
                                  <input type="file" accept="image/*" disabled={!isPasscodeVerified || uploading} onChange={handleProfilePicChange} className="hidden" />
                                </label>
                              </div>
                              {compressionInfo && <p className="text-[9px] text-primary-bright font-mono">{compressionInfo}</p>}
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Full Name <span className="text-red-400">*</span></label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Rajesh Kumar" required disabled={!isPasscodeVerified} />
                              </div>
                            </div>

                            {/* Email & Phone */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Email <span className="text-red-400">*</span></label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className={inputCls} placeholder="you@domain.com" required disabled={!isPasscodeVerified} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Phone <span className="text-red-400">*</span></label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" required disabled={!isPasscodeVerified} />
                                </div>
                              </div>
                            </div>

                            {/* Profession */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Profession <span className="text-red-400">*</span></label>
                              <CustomSelect value={profession} onChange={setProfession} options={professionOptions} disabled={!isPasscodeVerified} />
                            </div>
                            {profession === 'Other' && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Specify Profession <span className="text-red-400">*</span></label>
                                <input type="text" value={customProfession} onChange={e => setCustomProfession(e.target.value)} className={inputNoPadCls} placeholder="Your profession" disabled={!isPasscodeVerified} />
                              </div>
                            )}

                            {/* Role */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Role at Company <span className="text-red-400">*</span></label>
                              <CustomSelect value={companyRole} onChange={setCompanyRole} options={['Employee','Manager','Director','Admin','Owner']} disabled={!isPasscodeVerified} />
                            </div>

                            {/* Pincode / Address */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase flex justify-between"><span>Pincode <span className="text-red-400">*</span></span>{loadingPincode && <span className="text-[9px] text-primary-bright animate-pulse">Loading…</span>}</label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                  <input type="text" value={pincode} onChange={e => handlePincodeChange(e.target.value)} className={inputCls} placeholder="110001" maxLength={6} required disabled={!isPasscodeVerified} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Address <span className="text-red-400">*</span></label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputNoPadCls} placeholder="Area / Colony" required disabled={!isPasscodeVerified} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">City <span className="text-red-400">*</span></label>
                                <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputNoPadCls} placeholder="City" required disabled={!isPasscodeVerified} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">State <span className="text-red-400">*</span></label>
                                <input type="text" value={state} onChange={e => setState(e.target.value)} className={inputNoPadCls} placeholder="State" required disabled={!isPasscodeVerified} />
                              </div>
                            </div>

                            {/* LinkedIn (optional) */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">LinkedIn <span className="text-text-muted/40 font-normal normal-case">(optional)</span></label>
                              <div className="relative">
                                <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className={inputCls} placeholder="linkedin.com/in/username" disabled={!isPasscodeVerified} />
                              </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Password <span className="text-red-400">*</span></label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                  <input type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} className={inputCls} placeholder="Password" required disabled={!isPasscodeVerified} />
                                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white cursor-pointer" disabled={!isPasscodeVerified}>
                                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Confirm <span className="text-red-400">*</span></label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                  <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} placeholder="Confirm" required disabled={!isPasscodeVerified} />
                                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white cursor-pointer" disabled={!isPasscodeVerified}>
                                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button type="button" onClick={goToStep2} disabled={!isPasscodeVerified}
                          className="w-full mt-5 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                          Next: Bank Details <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {/* ── STEP 2: BANK DETAILS ────────────────────────────── */}
                    {step === 2 && (
                      <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} onSubmit={e => { e.preventDefault(); goToStep3(); }}>
                        <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 mb-1">
                            <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                            <p className="text-[10px] text-blue-300">All bank details are optional. You can fill these later from your Profile settings.</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Account Holder Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} className={inputCls} placeholder="Name on bank account" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Bank Name</label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className={inputCls} placeholder="e.g. HDFC Bank, SBI" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Account Number</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={`${inputCls} font-mono`} placeholder="xxxxxxxxxxxx" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">IFSC Code</label>
                              <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} className={`${inputNoPadCls} font-mono uppercase`} placeholder="HDFC0001234" maxLength={11} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">UPI ID</label>
                              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className={inputNoPadCls} placeholder="name@upi" />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                          <button type="button" onClick={goBack} className="px-4 py-3 rounded-xl border border-glass-border hover:bg-white/5 text-xs font-semibold text-text-muted hover:text-white transition-all cursor-pointer flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" /> Back
                          </button>
                          <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">
                            Next: Emergency Contact <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* ── STEP 3: EMERGENCY CONTACT ───────────────────────── */}
                    {step === 3 && (
                      <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} onSubmit={handleRegister}>
                        <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-1">
                            <Users className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-[10px] text-amber-300">Emergency contact details. All fields are optional.</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Contact Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input type="text" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className={inputCls} placeholder="e.g. Priya Kumar" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Phone Number</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Relation</label>
                              <input type="text" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} className={inputNoPadCls} placeholder="e.g. Spouse, Parent" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input type="email" value={emergencyEmail} onChange={e => setEmergencyEmail(e.target.value)} className={inputCls} placeholder="contact@email.com" />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                          <button type="button" onClick={goBack} className="px-4 py-3 rounded-xl border border-glass-border hover:bg-white/5 text-xs font-semibold text-text-muted hover:text-white transition-all cursor-pointer flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" /> Back
                          </button>
                          <button type="submit" disabled={uploading}
                            className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-60">
                            {uploading ? (
                              <><div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> Creating Account…</>
                            ) : (
                              <><CheckCircle2 className="w-4 h-4" /> Create My Account</>
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}

                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[11px] text-text-muted relative z-10">
        © {new Date().getFullYear()} ANSH Apps. All rights reserved. · Partner Portal v2.0
      </footer>
    </div>
  );
}
