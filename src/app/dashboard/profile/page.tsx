'use client';

import React, { useState, useEffect } from 'react';
import { usePortalStore } from '@/lib/store';
import {
  User, Phone, MapPin, Briefcase, Landmark, CreditCard,
  Key, CheckCircle2, Edit3, Paperclip, X, Send, AlertCircle,
  FileText, Upload, Loader2, Clock, XCircle
} from 'lucide-react';
import { LinkedInIcon } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 2;

// Compress image file via canvas
async function compressImage(file: File, maxWidthPx = 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, file.type, 0.82);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ProfilePage() {
  const { saathis, currentSaathiId } = usePortalStore();
  const currentSaathi = saathis.find(s => s.id === currentSaathiId);

  // Modification Request Modal
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Existing requests
  const [existingRequests, setExistingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchMyRequests = async (saathiId: string) => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`/api/change-requests?saathiId=${saathiId}`);
      if (res.ok) {
        const data = await res.json();
        setExistingRequests(data);
      }
    } catch {}
    finally { setLoadingRequests(false); }
  };

  useEffect(() => {
    if (currentSaathi?.id) fetchMyRequests(currentSaathi.id);
  }, [currentSaathi?.id]);

  const hasPending = existingRequests.some(r => r.status === 'pending');

  const infoField = (label: string, value: string, icon: React.ReactNode) => (
    <div className="space-y-1">
      <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>
        <div className="w-full bg-white/[0.02] border border-glass-border rounded-xl py-2.5 pl-11 pr-4 text-sm text-white/80 select-text cursor-default">
          {value || <span className="text-text-muted italic">Not provided</span>}
        </div>
      </div>
    </div>
  );

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFileError('');
    const newFiles = Array.from(incoming);
    const combined = [...attachments, ...newFiles];

    if (combined.length > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`Each file must be under ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
    }

    setAttachments(combined);
  };

  const removeFile = (i: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setFileError('Please provide both Subject and Description.');
      return;
    }
    if (!currentSaathi) return;
    setSubmitting(true);
    setFileError('');

    try {
      // Upload attachments first
      const uploadedUrls: string[] = [];
      for (const file of attachments) {
        let blob: Blob = file;
        if (file.type.startsWith('image/')) {
          blob = await compressImage(file);
        }
        const formData = new FormData();
        formData.append('file', blob, file.name);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }

      // Submit request
      const res = await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saathiId: currentSaathi.id,
          wid: currentSaathi.wid,
          subject: subject.trim(),
          description: description.trim(),
          attachments: uploadedUrls
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      setShowModal(false);
      setSubject('');
      setDescription('');
      setAttachments([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      // Refresh requests list
      if (currentSaathi?.id) fetchMyRequests(currentSaathi.id);
    } catch (err: any) {
      setFileError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const profession = currentSaathi?.profession || '';
  const payoutDetails = currentSaathi?.payoutDetails || { bankName: '', accountNumber: '', ifsc: '', upiId: '' };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 md:right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-950/90 text-emerald-400 text-sm font-semibold shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Modification request submitted to admin!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5 text-xs text-amber-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Profile is read-only.</span> To modify any details, raise a request below. An admin will review and update your profile within 2–3 business days.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* General Info Card */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-outfit text-white">General Information</h3>
              <p className="text-xs text-text-muted mt-0.5">Your personal profile and business identity details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoField('Full Name', currentSaathi?.name || '', <User className="w-4 h-4" />)}
            {infoField('Email Address', currentSaathi?.email || '', <Key className="w-4 h-4" />)}
            {infoField('Phone Number', currentSaathi?.phone || '', <Phone className="w-4 h-4" />)}
            {infoField('Pincode', currentSaathi?.pincode || '', <MapPin className="w-4 h-4" />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoField('Address', currentSaathi?.address || '', <MapPin className="w-4 h-4" />)}
            {infoField('City', currentSaathi?.city || '', <MapPin className="w-4 h-4" />)}
            {infoField('State', currentSaathi?.state || '', <MapPin className="w-4 h-4" />)}
            {infoField('LinkedIn Profile', currentSaathi?.linkedin || '', <LinkedInIcon className="w-4 h-4" />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoField('Profession / Role', profession, <Briefcase className="w-4 h-4" />)}
            {infoField('Company Role / Designation', currentSaathi?.companyRole || '', <Briefcase className="w-4 h-4" />)}
          </div>

          {/* Partner Code */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary-bright" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Partner Code</p>
              <p className="text-lg font-bold font-mono text-primary-bright">{currentSaathi?.partnerCode || 'Pending Assignment'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Status + Action */}
        <div className="space-y-4">

          {/* Request Modification */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="text-base font-bold font-outfit text-white">Need to Update Details?</h3>
            <p className="text-xs text-text-muted">Raise a modification request with your new information and we'll process it for you.</p>

            <div className="relative group">
              <button
                onClick={() => !hasPending && setShowModal(true)}
                disabled={hasPending}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-xl transition-all text-sm ${
                  hasPending
                    ? 'bg-white/5 border border-glass-border text-text-muted cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:opacity-90 cursor-pointer'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Raise Modification Request</span>
              </button>
              {hasPending && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-bg-accent border border-glass-border text-xs text-amber-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                  ⏳ Already a request is raised
                </div>
              )}
            </div>

            {/* Existing Requests List */}
            {loadingRequests ? (
              <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading requests...
              </div>
            ) : existingRequests.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Your Requests</p>
                {existingRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl border border-glass-border bg-white/[0.02] space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-white font-medium truncate flex-1">{req.subject}</p>
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">
                          <Clock className="w-2.5 h-2.5" />Pending
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5" />Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-500/10 text-red-400 border-red-500/20 shrink-0">
                          <XCircle className="w-2.5 h-2.5" />Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {req.adminNote && (
                      <p className="text-[10px] text-white/60 italic border-t border-glass-border pt-1 mt-1">Admin: {req.adminNote}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Details (Read-Only) */}
      <div className="glass-card p-6 rounded-2xl space-y-5">
        <div>
          <h3 className="text-lg font-bold font-outfit text-white">Payout / Bank Details</h3>
          <p className="text-xs text-text-muted mt-0.5">Your bank information for commission disbursements.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoField('Bank Name', payoutDetails.bankName, <Landmark className="w-4 h-4" />)}
          {infoField('Account Number', payoutDetails.accountNumber ? '••••' + payoutDetails.accountNumber.slice(-4) : '', <CreditCard className="w-4 h-4" />)}
          {infoField('IFSC Code', payoutDetails.ifsc, <Landmark className="w-4 h-4" />)}
          {infoField('UPI ID', payoutDetails.upiId, <CreditCard className="w-4 h-4" />)}
        </div>
      </div>

      {/* Emergency Contact (Read-Only) */}
      <div className="glass-card p-6 rounded-2xl space-y-5">
        <div>
          <h3 className="text-lg font-bold font-outfit text-white">Emergency Contact</h3>
          <p className="text-xs text-text-muted mt-0.5">Person to contact in case of an emergency. Provided during signup.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoField('Contact Name', currentSaathi?.emergencyName || '', <User className="w-4 h-4" />)}
          {infoField('Contact Phone', currentSaathi?.emergencyPhone || '', <Phone className="w-4 h-4" />)}
          {infoField('Relationship', currentSaathi?.emergencyRelation || '', <Briefcase className="w-4 h-4" />)}
          {infoField('Contact Email', currentSaathi?.emergencyEmail || '', <Key className="w-4 h-4" />)}
        </div>
      </div>

      {/* Modification Request Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !submitting && setShowModal(false)} />
            <motion.div
              className="relative bg-bg-dark border border-glass-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-glass-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-primary-bright" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-outfit text-white">Raise Modification Request</h2>
                    <p className="text-xs text-text-muted">Specify the changes you need</p>
                  </div>
                </div>
                <button onClick={() => !submitting && setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white cursor-pointer transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase tracking-wider">Subject / Fields to Change <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Phone number, Bank account details, Address"
                    className="w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all"
                    disabled={submitting}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted font-semibold uppercase tracking-wider">Description / New Details <span className="text-red-400">*</span></label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Please describe exactly what needs to be changed and provide the new correct details..."
                    rows={4}
                    className="w-full bg-white/[0.03] border border-glass-border focus:border-primary rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none transition-all resize-none"
                    disabled={submitting}
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                    Attachments <span className="text-text-muted font-normal">(optional, max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)</span>
                  </label>

                  {/* Drop zone */}
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    attachments.length >= MAX_FILES ? 'opacity-40 pointer-events-none border-glass-border' : 'border-glass-border hover:border-primary/50 hover:bg-primary/5'
                  }`}>
                    <Upload className="w-5 h-5 text-text-muted" />
                    <span className="text-xs text-text-muted text-center">Click to upload or drag & drop<br /><span className="text-[10px]">Images, PDFs, Word docs accepted</span></span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      disabled={submitting || attachments.length >= MAX_FILES}
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </label>

                  {/* File list */}
                  {attachments.length > 0 && (
                    <ul className="space-y-2">
                      {attachments.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-glass-border text-xs text-white">
                          <FileText className="w-3.5 h-3.5 text-primary-bright shrink-0" />
                          <span className="truncate flex-1">{f.name}</span>
                          <span className="text-text-muted shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                          <button type="button" onClick={() => removeFile(i)} className="p-0.5 rounded hover:text-red-400 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {fileError && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fileError}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl border border-glass-border text-text-muted hover:text-white hover:bg-white/5 text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !subject.trim() || !description.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
