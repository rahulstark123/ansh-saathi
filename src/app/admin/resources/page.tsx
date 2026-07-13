'use client';

import React, { useState } from 'react';
import { usePortalStore } from '@/lib/store';
import { Download, FileText, Grid, Layout, PlusCircle, Search, Trash2, Upload } from 'lucide-react';

export default function AdminResourcesPage() {
  const { resources, uploadResource } = usePortalStore();

  // Upload Form states
  const [resName, setResName] = useState('');
  const [category, setCategory] = useState<string>('Brand Assets');
  const [type, setType] = useState<'logo' | 'kit' | 'pdf' | 'doc'>('pdf');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName) return;

    const isLink = downloadUrl && downloadUrl.startsWith('http');
    const computedSize = isLink ? 'Cloud Link' : 'File';

    uploadResource({
      name: resName,
      category,
      type,
      size: computedSize,
      downloadUrl: downloadUrl.trim() || '#'
    });

    setResName('');
    setDownloadUrl('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const getResourceIcon = (resType: string) => {
    switch (resType) {
      case 'logo':
        return <Layout className="w-5 h-5 text-indigo-400" />;
      case 'kit':
        return <Grid className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Left Columns (Col Span 2): Active Resource List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold font-outfit text-white">Active Collaterals & Brand Assets</h3>
          <span className="text-xs text-text-muted">{resources.length} active downloads</span>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-glass-border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border bg-bg-accent/40 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Resource Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6 text-right">Size</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-xs text-white">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bg-accent border border-glass-border flex items-center justify-center shrink-0">
                          {getResourceIcon(res.type)}
                        </div>
                        <span className="font-semibold text-white truncate max-w-[240px]">
                          {res.name}
                        </span>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950/30 text-purple-300 border border-purple-900/30">
                        {res.category}
                      </span>
                    </td>
                    {/* Type */}
                    <td className="py-4 px-6 font-mono uppercase text-text-muted">
                      {res.type}
                    </td>
                    {/* Size */}
                    <td className="py-4 px-6 text-right font-mono text-text-muted">
                      {res.size}
                    </td>
                    {/* Action */}
                    <td className="py-4 px-6 text-center">
                      <button className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Upload Form */}
      <div>
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white">Upload New Resource</h3>
            <p className="text-xs text-text-muted mt-0.5">Publish brand collateral for download on the partner toolkit page.</p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold rounded-xl animate-bounce">
              Resource published successfully to partner toolkit!
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Resource Name */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Resource Title</label>
              <input
                type="text"
                value={resName}
                onChange={(e) => setResName(e.target.value)}
                placeholder="e.g., ANSH CRM Pitch Deck (Hindi)"
                className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-accent border border-glass-border focus:border-purple-500 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                required
              >
                <option value="Brand Assets">Brand Assets</option>
                <option value="Brochures & Pricing">Brochures & Pricing</option>
                <option value="Sales Materials">Sales Materials</option>
                <option value="Drive Folders & Links">Drive Folders & Links</option>
                <option value="Video Tutorials & Demos">Video Tutorials & Demos</option>
                <option value="Marketing Templates">Marketing Templates</option>
                <option value="Training & Onboarding">Training & Onboarding</option>
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Asset Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-bg-accent border border-glass-border focus:border-purple-500 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                required
              >
                <option value="pdf">PDF File</option>
                <option value="doc">PPT / Pitch Deck</option>
                <option value="logo">Brand Logo</option>
                <option value="kit">Zip Identity Kit</option>
              </select>
            </div>

            {/* Download Link / Google Drive */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-semibold tracking-wider uppercase">Resource URL / Drive Link</label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="e.g., https://drive.google.com/drive/folders/..."
                className="w-full bg-white/[0.02] border border-glass-border focus:border-purple-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-text-muted focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-lg cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish to Toolkit</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
