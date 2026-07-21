'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, UserX, UserPlus, Search, ShieldCheck, Mail, Phone, MapPin, X, Check, Landmark, AlertCircle } from 'lucide-react';
import { LinkedInIcon } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '@/components/custom-select';

interface Saathi {
  id: string;
  wid: number;
  name: string;
  email: string;
  phone: string;
  profession: string;
  companyRole: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  linkedin: string;
  profilePicture: string | null;
  status: 'pending' | 'approved' | 'rejected';
  partnerCode: string | null;
  joinedDate: string;
  customersCount: number;
  totalEarnings: number;
  payoutDetails: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
}

export default function AdminSaathisPage() {
  const [saathis, setSaathis] = useState<Saathi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Approval Modal states
  const [approvingSaathiId, setApprovingSaathiId] = useState<string | null>(null);
  const [assignedCode, setAssignedCode] = useState('');

  // Create Partner Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newProfession, setNewProfession] = useState('Chartered Accountant (CA)');
  const [newCustomProfession, setNewCustomProfession] = useState('');
  const [newCompanyRole, setNewCompanyRole] = useState('Owner');
  const [newLinkedin, setNewLinkedin] = useState('');
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const professionOptions = [
    'Chartered Accountant (CA)',
    'Company Secretary (CS)',
    'Cost Accountant (CMA)',
    'GST Practitioner / Tax Consultant',
    'HR Consultant / Recruitment Agency',
    'Business Consultant / Advisor',
    'Software Vendor / IT Service Provider',
    'Digital Marketing Agency / Freelancer',
    'Financial Planner / Wealth Advisor',
    'Insurance Agent / Broker',
    'Corporate Trainer / Coach',
    'Lawyer / Legal Advisor',
    'Other'
  ];

  // Fetch Saathis list
  const fetchSaathis = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/saathis');
      if (!res.ok) throw new Error('Failed to fetch partners');
      const data = await res.json();
      setSaathis(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaathis();
  }, []);

  const handlePincodeChange = async (val: string) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 6);
    setNewPincode(numericVal);
    
    if (numericVal.length === 6) {
      setLoadingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${numericVal}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
          const postOffice = data[0].PostOffice[0];
          setNewCity(postOffice.District || postOffice.Division || '');
          setNewState(postOffice.State || '');
          setNewAddress(postOffice.Name || '');
        } else {
          autofillLocalPincode(numericVal);
        }
      } catch (e) {
        autofillLocalPincode(numericVal);
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  const autofillLocalPincode = (code: string) => {
    const fallbackMap: Record<string, { address: string; city: string; state: string }> = {
      '110001': { address: 'Connaught Place', city: 'New Delhi', state: 'Delhi' },
      '380009': { address: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat' },
      '560001': { address: 'MG Road', city: 'Bengaluru', state: 'Karnataka' },
      '400001': { address: 'Fort', city: 'Mumbai', state: 'Maharashtra' },
      '600001': { address: 'Parrys', city: 'Chennai', state: 'Tamil Nadu' },
      '700001': { address: 'Dalhousie Square', city: 'Kolkata', state: 'West Bengal' },
      '500001': { address: 'Afzal Gunj', city: 'Hyderabad', state: 'Telangana' },
    };
    if (fallbackMap[code]) {
      setNewAddress(fallbackMap[code].address);
      setNewCity(fallbackMap[code].city);
      setNewState(fallbackMap[code].state);
    }
  };

  // Calculations
  const filteredSaathis = useMemo(() => {
    return saathis.filter(s => {
      const nameMatch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = s.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const cityMatch = s.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || emailMatch || cityMatch;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [saathis, searchTerm, statusFilter]);

  const handleOpenApproveModal = (saathi: Saathi) => {
    // Propose a partner code
    const index = saathis.filter(s => s.partnerCode !== null).length + 1;
    const formattedCode = `SAATHI-${String(index).padStart(5, '0')}`;
    setAssignedCode(formattedCode);
    setApprovingSaathiId(saathi.id);
  };

  const handleConfirmApprove = async () => {
    if (!approvingSaathiId || !assignedCode) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/saathis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvingSaathiId, status: 'approved', partnerCode: assignedCode })
      });
      if (!res.ok) throw new Error('Failed to approve partner');
      setApprovingSaathiId(null);
      fetchSaathis();
    } catch (err: any) {
      setError(err.message || 'Failed to approve Saathi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSaathi = async (id: string) => {
    if (!confirm('Are you sure you want to reject this partner application?')) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/saathis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' })
      });
      if (!res.ok) throw new Error('Failed to reject partner');
      fetchSaathis();
    } catch (err: any) {
      setError(err.message || 'Failed to reject Saathi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSaathi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone || !newPincode || !newAddress || !newCity || !newState || !newCompanyRole) return;
    if (newProfession === 'Other' && !newCustomProfession) return;

    try {
      setActionLoading(true);
      const partnerCode = `SAATHI-${String(saathis.filter(s => s.partnerCode !== null).length + 1).padStart(5, '0')}`;
      const res = await fetch('/api/admin/saathis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          pincode: newPincode,
          address: newAddress,
          city: newCity,
          state: newState,
          profession: newProfession === 'Other' ? newCustomProfession : newProfession,
          companyRole: newCompanyRole,
          linkedin: newLinkedin,
          partnerCode
        })
      });
      if (!res.ok) throw new Error('Failed to provision new partner');
      
      // Reset create form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPincode('');
      setNewAddress('');
      setNewCity('');
      setNewState('');
      setNewProfession('Chartered Accountant (CA)');
      setNewCustomProfession('');
      setNewCompanyRole('Owner');
      setNewLinkedin('');
      setShowCreateModal(false);
      fetchSaathis();
    } catch (err: any) {
      setError(err.message || 'Failed to provision partner');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Description header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">
            Manage partner onboarding profiles. Review applications from business advisors worldwide, approve them with a unique code, or provision new accounts.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 font-semibold text-sm text-white shadow-lg cursor-pointer w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Partner</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, or city..."
            className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-accent/80 border border-glass-border text-white text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 transition-all w-full md:w-auto"
        >
          <option value="all">All Partner Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Application</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <div className="w-8 h-8 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
          <span className="text-xs text-text-muted">Loading partner directory...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSaathis.length > 0 ? (
            filteredSaathis.map((saathi) => (
              <div key={saathi.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-5 relative overflow-hidden">
                
                {/* Top info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white font-outfit">{saathi.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        {saathi.companyRole ? `${saathi.companyRole} • ` : ''}{saathi.profession}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      saathi.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      saathi.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {saathi.status === 'approved' ? (saathi.partnerCode || 'Approved') : saathi.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-text-muted">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{saathi.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{saathi.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        {saathi.address ? `${saathi.address}, ` : ''}
                        {saathi.city}, {saathi.state || ''} {saathi.pincode ? `(${saathi.pincode})` : ''}
                      </span>
                    </div>
                    {saathi.linkedin && (
                      <div className="flex items-center gap-2">
                        <LinkedInIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <a href={saathi.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-300 truncate">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank summary (Only if approved) */}
                {saathi.status === 'approved' && saathi.payoutDetails.bankName && (
                  <div className="bg-bg-accent/40 border border-glass-border p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Landmark className="w-3.5 h-3.5 text-purple-400" />
                      <span>{saathi.payoutDetails.bankName}</span>
                    </div>
                    <span className="font-mono text-white">•••• {saathi.payoutDetails.accountNumber.slice(-4)}</span>
                  </div>
                )}

                {/* Operations Actions */}
                {saathi.status === 'pending' ? (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-glass-border/40">
                    <button
                      onClick={() => handleRejectSaathi(saathi.id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleOpenApproveModal(saathi)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-[10px] text-text-muted/60 mt-1 border-t border-glass-border/20 pt-2 font-mono">
                    Registered: {saathi.joinedDate}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-text-muted">
              No partners found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {approvingSaathiId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApprovingSaathiId(null)}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-accent border border-glass-border p-6 rounded-2xl max-w-sm w-full relative z-10 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold font-outfit text-white">Assign Partner Code</h4>
                <button onClick={() => setApprovingSaathiId(null)} className="p-1 rounded hover:bg-white/5 text-text-muted cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-text-muted leading-relaxed">
                  Enter a unique partner code to associate with this Saathi. This code will form their referral links.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Referral Code</label>
                  <input
                    type="text"
                    value={assignedCode}
                    onChange={(e) => setAssignedCode(e.target.value.toUpperCase())}
                    className="w-full bg-white/[0.03] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-sm text-white font-mono tracking-widest text-center"
                    required
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmApprove}
                disabled={actionLoading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs rounded-xl hover:opacity-90 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Confirm Approval & Assign Code'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Partner Provisioning Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-accent border border-glass-border p-6 rounded-2xl max-w-md w-full relative z-10 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold font-outfit text-white">Provision Partner Account</h4>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-white/5 text-text-muted cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSaathi} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Rajesh Kumar"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rajesh@domain.com"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex justify-between">
                      <span>Pincode</span>
                      {loadingPincode && <span className="text-[8px] text-purple-400 animate-pulse">Loading...</span>}
                    </label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 110001"
                      maxLength={6}
                      className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Role</label>
                    <CustomSelect
                      options={['Employee', 'Manager', 'Director', 'Admin', 'Owner']}
                      value={newCompanyRole}
                      onChange={(val) => setNewCompanyRole(val)}
                    />
                  </div>
                </div>

                {/* Profession (Full Width) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Profession</label>
                  <CustomSelect
                    options={professionOptions}
                    value={newProfession}
                    onChange={(val) => {
                      setNewProfession(val);
                      if (val !== 'Other') setNewCustomProfession('');
                    }}
                  />
                </div>

                {/* Specify Profession (Conditional) */}
                {newProfession === 'Other' && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Specify Profession</label>
                    <input
                      type="text"
                      value={newCustomProfession}
                      onChange={(e) => setNewCustomProfession(e.target.value)}
                      placeholder="e.g. Real Estate Agent"
                      className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                      required
                    />
                  </div>
                )}

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Address / Locality</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="e.g. Connaught Place"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                      required
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">LinkedIn Link</label>
                  <input
                    type="url"
                    value={newLinkedin}
                    onChange={(e) => setNewLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs rounded-xl hover:opacity-90 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Provisioning...' : 'Create & Auto-Approve Partner'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
