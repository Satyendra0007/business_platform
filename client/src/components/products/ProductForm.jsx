/**
 * ProductForm.jsx — Shared create / edit form for suppliers.
 *
 * Field definitions are derived directly from the backend Product schema:
 *   Required  : title, category
 *   Optional  : subcategory, description, unit, price, MOQ,
 *               availableQuantity, incoterm, countryOfOrigin, leadTime,
 *               packagingDetails, videoUrl, specSheet
 *   Arrays    : images (max 5 Cloudinary URLs), certifications (max 5 strings)
 *
 * Images are uploaded directly to Cloudinary (unsigned preset) and stored
 * as URL strings — the server never handles raw file bytes.
 */
import React, { useRef, useState } from 'react';
import {
  Loader2, ImagePlus, X, Plus, AlertCircle, Upload
} from 'lucide-react';

// ─── Constants derived from backend schema ─────────────────────────────────

const MAX_IMAGES = 5;      // product.model.js arrayLimit
const MAX_CERTS  = 5;      // product.model.js arrayLimit

const CATEGORIES = [
  'Food & Agriculture', 'Metals & Mining', 'Energy & Petrochemicals',
  'Industrial Equipment', 'Electronics & Technology', 'Textiles & Apparel',
  'Chemicals', 'Shipping & Logistics',
];

const INCOTERMS = ['EXW','FOB'];
const UNIT_OPTIONS = ['MT', 'KG', 'pcs', 'L'];

// ─── Field config — maps directly to schema fields ────────────────────────
// type: 'text' | 'number' | 'textarea' | 'select'
// required flag matches backend validator

const TEXT_FIELDS = [
  { key: 'title',          label: 'Product Title',        type: 'text',     required: true,  placeholder: 'e.g. Premium Basmati Rice 25 kg Bags' },
  { key: 'subcategory',    label: 'Subcategory',           type: 'text',     required: false, placeholder: 'e.g. Long-grain Rice' },
  { key: 'description',    label: 'Description',           type: 'textarea', required: false, placeholder: 'Describe quality, specs, certifications…' },
  { key: 'unit',           label: 'Unit of Measure',       type: 'select',   required: false, placeholder: 'Select unit of measure' },
  { key: 'countryOfOrigin',label: 'Country of Origin',     type: 'text',     required: false, placeholder: 'e.g. India' },
  { key: 'leadTime',       label: 'Lead Time',             type: 'text',     required: false, placeholder: 'e.g. 14-21 days' },
  { key: 'packagingDetails',label:'Packaging Details',     type: 'textarea', required: false, placeholder: 'Packing type, box size, pallet info…' },
  { key: 'videoUrl',       label: 'Product Video URL',     type: 'text',     required: false, placeholder: 'https://…' },
  { key: 'specSheet',      label: 'Spec Sheet URL',        type: 'text',     required: false, placeholder: 'https://cloudinary…' },
];

const NUMBER_FIELDS = [
  { key: 'price',             label: 'Price (USD)',            placeholder: 'e.g. 450' },
  { key: 'MOQ',               label: 'Minimum Order Qty (MOQ)',placeholder: 'e.g. 100' },
  { key: 'availableQuantity', label: 'Available Quantity',     placeholder: 'e.g. 5000' },
];

// ─── Image uploader ───────────────────────────────────────────────────────

function ImageUploader({ images, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const PRESET= import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFiles = async (files) => {
    const remaining = MAX_IMAGES - images.length;
    const toUpload  = Array.from(files).slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    setUploadErr('');
    const results = [];

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', PRESET);
      try {
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.secure_url) results.push(json.secure_url);
        else setUploadErr('One or more images failed to upload.');
      } catch {
        setUploadErr('Upload error. Check your Cloudinary preset.');
      }
    }

    onChange([...images, ...results]);
    setUploading(false);
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-slate-700">
        Product Images <span className="font-normal text-slate-400">(up to {MAX_IMAGES})</span>
      </span>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-[14px] border border-slate-200">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < MAX_IMAGES && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-[#245c9d] hover:bg-[#f8fbff]"
        >
          {uploading
            ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            : <ImagePlus className="h-5 w-5 text-slate-400" />
          }
          <div className="text-sm text-slate-500">
            {uploading ? 'Uploading…' : `Click to add images (${images.length}/${MAX_IMAGES})`}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploadErr && <p className="mt-1.5 text-xs font-medium text-amber-600">{uploadErr}</p>}
    </div>
  );
}

// ─── Certifications list ──────────────────────────────────────────────────

function CertificationsInput({ value, onChange }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || value.length >= MAX_CERTS || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-slate-700">
        Certifications <span className="font-normal text-slate-400">(up to {MAX_CERTS})</span>
      </span>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((cert, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {cert}
              <button type="button" onClick={() => remove(i)} className="text-emerald-400 hover:text-rose-600 transition">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {value.length < MAX_CERTS && (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="e.g. ISO 9001, HACCP"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#245c9d]"
          />
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Field helpers ─────────────────────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const INPUT_CLS = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10 transition";

// ─── Main Form ─────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object}   props.initial    — pre-filled values (for edit mode)
 * @param {Function} props.onSubmit   — async (data) => void  — called with clean payload
 * @param {boolean}  props.isLoading
 * @param {string}   props.submitLabel
 * @param {string}   [props.error]
 */
export default function ProductForm({ initial = {}, onSubmit, isLoading, submitLabel, error }) {
  // ── State — initialised from schema fields ──────────────────────────────
  const [fields, setFields] = useState({
    title:             initial.title             || '',
    category:          initial.category          || '',
    subcategory:       initial.subcategory        || '',
    description:       initial.description        || '',
    unit:              initial.unit               || '',
    price:             initial.price              != null ? String(initial.price) : '',
    MOQ:               initial.MOQ               != null ? String(initial.MOQ)   : '',
    availableQuantity: initial.availableQuantity  != null ? String(initial.availableQuantity) : '',
    incoterm:          initial.incoterm           || '',
    countryOfOrigin:   initial.countryOfOrigin    || '',
    leadTime:          initial.leadTime           || '',
    packagingDetails:  initial.packagingDetails   || '',
    videoUrl:          initial.videoUrl           || '',
    specSheet:         initial.specSheet          || '',
  });
  const [images,       setImages]       = useState(initial.images         || []);
  const [certifications, setCerts]      = useState(initial.certifications || []);

  const set = (key, val) => setFields((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build payload — only include non-empty optional fields
    const payload = { title: fields.title.trim(), category: fields.category };

    TEXT_FIELDS.forEach(({ key }) => {
      const v = fields[key]?.trim?.() ?? fields[key];
      if (key === 'title' || key === 'category') return; // already added
      if (v) payload[key] = v;
    });

    NUMBER_FIELDS.forEach(({ key }) => {
      const n = parseFloat(fields[key]);
      if (!isNaN(n)) payload[key] = n;
    });

    if (images.length)         payload.images         = images;
    if (certifications.length) payload.certifications = certifications;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Required fields ──────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#d8e2ef] bg-white p-5 shadow-sm">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Required</p>
        <div className="space-y-4">
          <Field label="Product Title" required>
            <input
              required
              value={fields.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Premium Basmati Rice 25 kg Bags"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Category" required>
            <select
              required
              value={fields.category}
              onChange={(e) => set('category', e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* ── Product info ─────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#d8e2ef] bg-white p-5 shadow-sm">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Product Info</p>
        <div className="space-y-4">
          {/* subcategory, description */}
          <Field label="Subcategory">
            <input value={fields.subcategory} onChange={(e) => set('subcategory', e.target.value)} placeholder="e.g. Long-grain Rice" className={INPUT_CLS} />
          </Field>
          <Field label="Description">
            <textarea value={fields.description} onChange={(e) => set('description', e.target.value)} placeholder="Quality, specs, intended use…" rows={3} className={`${INPUT_CLS} resize-none`} />
          </Field>
        </div>
      </div>

      {/* ── Trade terms ──────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#d8e2ef] bg-white p-5 shadow-sm">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Trade Terms</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {NUMBER_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input
                type="number"
                min="0"
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className={INPUT_CLS}
              />
            </Field>
          ))}
          <Field label="Unit of Measure">
            <select
              value={fields.unit}
              onChange={(e) => set('unit', e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Select unit of measure…</option>
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Incoterm">
            <select value={fields.incoterm} onChange={(e) => set('incoterm', e.target.value)} className={INPUT_CLS}>
              <option value="">Select…</option>
              {INCOTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Country of Origin">
            <input value={fields.countryOfOrigin} onChange={(e) => set('countryOfOrigin', e.target.value)} placeholder="India" className={INPUT_CLS} />
          </Field>
          <Field label="Lead Time">
            <input value={fields.leadTime} onChange={(e) => set('leadTime', e.target.value)} placeholder="14-21 days" className={INPUT_CLS} />
          </Field>
        </div>
      </div>

      {/* ── Packaging ────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#d8e2ef] bg-white p-5 shadow-sm">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Packaging &amp; Certifications</p>
        <div className="space-y-4">
          <Field label="Packaging Details">
            <textarea value={fields.packagingDetails} onChange={(e) => set('packagingDetails', e.target.value)} placeholder="Box size, pallet type, labelling requirements…" rows={2} className={`${INPUT_CLS} resize-none`} />
          </Field>
          <CertificationsInput value={certifications} onChange={setCerts} />
        </div>
      </div>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#d8e2ef] bg-white p-5 shadow-sm">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Media</p>
        <div className="space-y-4">
          <ImageUploader images={images} onChange={setImages} />
          <Field label="Product Video URL">
            <input value={fields.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://…" className={INPUT_CLS} />
          </Field>
          <Field label="Spec Sheet URL">
            <input value={fields.specSheet} onChange={(e) => set('specSheet', e.target.value)} placeholder="https://cloudinary…" className={INPUT_CLS} />
          </Field>
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] py-3.5 text-sm font-bold text-white shadow transition hover:bg-[#153a66] disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isLoading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
