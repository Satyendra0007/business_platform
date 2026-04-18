import React, { useRef, useState } from 'react';
import { Camera, Loader2, Upload, File, Trash2 } from 'lucide-react';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function AvatarUploader({ logo, companyName, onChange }) {
  const fileRef    = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('file',          file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.secure_url) throw new Error(json.error?.message || 'Upload failed');
      onChange(json.secure_url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const initials = (companyName || '?').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
          {logo
            ? <img src={logo} alt="Company logo" className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#173b67,#245c9d)] text-2xl font-black text-white">{initials}</div>
          }
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#245c9d] text-white shadow-md transition hover:bg-[#173b67] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        </button>
      </div>

      <p className="text-xs text-slate-400">Click the camera to upload a logo</p>
      {err && <p className="text-xs font-medium text-rose-500">{err}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function DocumentUploader({ documents, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const handleFiles = async (files) => {
    if (!files?.length) return;
    if (documents.length + files.length > 5) {
      setUploadErr('Maximum 5 documents allowed.');
      return;
    }
    setUploading(true);
    setUploadErr('');
    const uploaded = [];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file',          file);
        fd.append('upload_preset', UPLOAD_PRESET);
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
        const json = await res.json();
        if (!json.secure_url) throw new Error(json.error?.message || 'Upload failed');
        uploaded.push({
          name: file.name,
          url:  json.secure_url,
          type: file.name.split('.').pop().toLowerCase(),
        });
      } catch (e) {
        setUploadErr(`Upload failed for "${file.name}": ${e.message}`);
      }
    }
    onChange([...documents, ...uploaded]);
    setUploading(false);
  };

  const remove = (idx) => onChange(documents.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || documents.length >= 5}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-5 text-center transition hover:border-[#245c9d] hover:bg-blue-50/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading
          ? <Loader2 className="h-5 w-5 animate-spin text-[#245c9d]" />
          : <Upload className="h-5 w-5 text-slate-400" />
        }
        <span className="text-sm font-semibold text-slate-600">
          {uploading ? 'Uploading…' : documents.length >= 5 ? 'Max 5 documents' : 'Click to upload documents'}
        </span>
        <span className="text-xs text-slate-400">PDF, JPG, PNG — max 5 total</span>
      </button>

      <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />

      {uploadErr && <p className="text-xs font-medium text-rose-500">{uploadErr}</p>}

      {documents.length > 0 && (
        <ul className="space-y-2 mt-2">
          {documents.map((doc, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700 truncate">
                <File className="h-4 w-4 shrink-0 text-[#245c9d]" />
                {doc.name}
              </span>
              <button type="button" onClick={() => remove(idx)} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
