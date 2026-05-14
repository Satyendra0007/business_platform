import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Phone,
  Building2,
  Upload,
  X,
  Loader2,
} from 'lucide-react';
import { submitDealSupportRequest } from '../../../lib/dealSupportService';
import { createServiceCheckoutSession } from '../../../lib/billingService';
import { getUser } from '../../../lib/api';
import { usePlan } from '../../../hooks/usePlan';
import DealSupportCardShell from '../DealSupportCardShell';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{hint}</p> : null}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
    />
  );
}

export default function LegalDocumentReviewCard({ compact = false, action, onOpenForm }) {
  const user = getUser();
  const { plan } = usePlan();
  const isPremium = plan === 'premium';

  const [form, setForm] = useState({
    companyName: '',
    name: '',
    phoneNumber: user?.phone || '',
    documentType: '',
  });
  const [files, setFiles] = useState([]); // { file, uploading, uploaded, url, publicId, error }
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setError('');

    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only PDF and DOCX files are allowed.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be under 10 MB.');
        return;
      }
    }

    const newFiles = selected.map((file) => ({
      file,
      uploading: false,
      uploaded: false,
      url: '',
      publicId: '',
      error: '',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileEntry, index) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setFiles((prev) => prev.map((f, i) => i === index ? { ...f, error: 'Upload not configured.' } : f));
      return null;
    }

    setFiles((prev) => prev.map((f, i) => i === index ? { ...f, uploading: true, error: '' } : f));

    try {
      const fd = new FormData();
      fd.append('file', fileEntry.file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'tradify/service-requests');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (!data.secure_url) throw new Error('Upload failed.');

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, uploading: false, uploaded: true, url: data.secure_url, publicId: data.public_id }
            : f
        )
      );
      return {
        url: data.secure_url,
        publicId: data.public_id,
        fileType: fileEntry.file.type,
        originalName: fileEntry.file.name,
      };
    } catch (err) {
      setFiles((prev) => prev.map((f, i) => i === index ? { ...f, uploading: false, error: err.message } : f));
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.companyName.trim() || !form.name.trim() || !form.phoneNumber.trim() || !form.documentType) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Upload any un-uploaded files
      const attachments = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.uploaded && f.url) {
          attachments.push({ url: f.url, publicId: f.publicId, fileType: f.file.type, originalName: f.file.name });
        } else if (!f.uploaded && !f.error) {
          const result = await uploadFile(f, i);
          if (result) attachments.push(result);
        }
      }

      const { paid, url } = await createServiceCheckoutSession('legal_document_review', { ...form, attachments });

      if (paid && url) {
        window.location.href = url;
        return;
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Failed to send the review request.');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <DealSupportCardShell
        icon={FileText}
        title="Legal Document Review"
        description="Submit contracts, LOIs, or SPA drafts for legal review."
        cta="Request Review"
        compact
        action={action}
        onOpenForm={onOpenForm}
      />
    );
  }

  if (submitted) {
    return (
      <article className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fffb,#eefbf5)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Submitted</p>
            <h3 className="mt-1 text-[1.02rem] font-bold tracking-[-0.02em] text-slate-900">Legal review request sent</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your document review request has been submitted. We will contact you shortly.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.05rem] font-bold tracking-[-0.02em] text-slate-900">Legal Document Review</h3>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-sky-700">
              Document Control
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Submit contracts, LOIs, or SPA drafts for legal review. Attach PDF or DOCX files.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-[10px] bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
              {isPremium ? 'Included in Premium' : 'Activate: $5'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" icon={Building2}>
            <Input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Your company name" />
          </Field>
          <Field label="Contact name" icon={FileText}>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your full name" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number" icon={Phone}>
            <Input type="tel" value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="+49 123 456 7890" />
          </Field>
          <Field label="Document type" icon={FileText}>
            <Select value={form.documentType} onChange={(e) => update('documentType', e.target.value)}>
              <option value="">Select document</option>
              <option>LOI</option>
              <option>SPA</option>
              <option>NDA</option>
              <option>Contract Draft</option>
              <option>Invoice / Packing List</option>
              <option>Other</option>
            </Select>
          </Field>
        </div>

        {/* File upload area */}
        <Field label="Attach documents (PDF / DOCX)" icon={Upload} hint="Max 10 MB per file.">
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-[#245c9d]/40">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#edf5ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#245c9d] hover:file:bg-[#dbeafe]"
            />
          </div>
        </Field>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="flex-1 truncate text-sm text-slate-700">{f.file.name}</span>
                {f.uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                {f.uploaded && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {f.error && <span className="text-xs text-rose-500">{f.error}</span>}
                <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-rose-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs leading-5 text-slate-500">
            Legal requests are reviewed by the support team.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Request Review'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </article>
  );
}
