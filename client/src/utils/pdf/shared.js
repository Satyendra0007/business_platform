import { jsPDF } from 'jspdf';

export const PDF_THEME = {
  navy: [20, 58, 106],
  blue: [36, 92, 157],
  sky: [237, 245, 255],
  border: [218, 226, 238],
  text: [15, 23, 42],
  muted: [71, 85, 105],
  soft: [248, 250, 252],
  white: [255, 255, 255],
  accent: [229, 169, 61],
};

export const PDF_MARGIN = {
  top: 54,
  right: 48,
  bottom: 56,
  left: 48,
};

export function formatDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(value, currency = 'USD') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function safeText(value, fallback = '—') {
  if (value == null) return fallback;
  if (Array.isArray(value)) {
    const items = value.map((item) => safeText(item, '')).filter(Boolean);
    return items.length ? items.join(', ') : fallback;
  }
  if (typeof value === 'object') {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
}

export function splitLines(doc, text, width) {
  return doc.splitTextToSize(safeText(text, ''), width);
}

export function sanitizeFilenamePart(value, fallback = 'Deal') {
  return safeText(value, fallback)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || fallback;
}

export function buildPdfFilename(prefix, dealName) {
  return `${sanitizeFilenamePart(prefix, 'Document')}_${sanitizeFilenamePart(dealName)}.pdf`;
}

export function createPdfDoc({ title, subtitle, documentCode, referenceLabel, referenceValue }) {
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });
  doc.setProperties({
    title,
    subject: subtitle || title,
    author: 'Tradafy',
    creator: 'Tradafy PDF Generator',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const state = {
    x: PDF_MARGIN.left,
    y: 124,
    width: pageWidth - PDF_MARGIN.left - PDF_MARGIN.right,
    pageWidth,
    pageHeight,
    bottom: pageHeight - PDF_MARGIN.bottom,
    title,
    subtitle,
    documentCode,
    referenceLabel,
    referenceValue,
  };

  drawFirstPageHeader(doc, state);
  return { doc, state };
}

export function ensureSpace(doc, state, neededHeight = 24) {
  if (state.y + neededHeight <= state.bottom) return;
  doc.addPage();
  state.y = 86;
  drawContinuationHeader(doc, state);
}

export function addSectionHeading(doc, state, title, subtitle = '') {
  const headingHeight = subtitle ? 34 : 24;
  ensureSpace(doc, state, headingHeight);

  doc.setTextColor(...PDF_THEME.navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(safeText(title), state.x, state.y);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_THEME.muted);
    const lines = splitLines(doc, subtitle, state.width);
    doc.text(lines, state.x, state.y + 14);
    state.y += 14 + lines.length * 12;
  } else {
    state.y += 18;
  }

  doc.setDrawColor(...PDF_THEME.border);
  doc.setLineWidth(0.8);
  doc.line(state.x, state.y + 4, state.x + state.width, state.y + 4);
  state.y += 16;
}

export function addParagraph(doc, state, text, { size = 10.5, color = PDF_THEME.muted, leading = 15, indent = 0 } = {}) {
  const lines = splitLines(doc, text, state.width - indent);
  const height = Math.max(18, lines.length * leading);
  ensureSpace(doc, state, height);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(lines, state.x + indent, state.y);
  state.y += height;
}

export function addBulletList(doc, state, items, { size = 10.3 } = {}) {
  const list = (Array.isArray(items) ? items : []).filter(Boolean);
  if (!list.length) return;

  list.forEach((item) => {
    const lines = splitLines(doc, item, state.width - 16);
    ensureSpace(doc, state, Math.max(18, lines.length * 14));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...PDF_THEME.muted);
    doc.text('•', state.x, state.y);
    doc.text(lines, state.x + 14, state.y);
    state.y += Math.max(18, lines.length * 14);
  });
}

export function addKeyValueGrid(doc, state, items, { columns = 2 } = {}) {
  const entries = (Array.isArray(items) ? items : []).filter((item) => safeText(item?.value, '') !== '');
  if (!entries.length) return;

  const gap = 14;
  const columnWidth = (state.width - gap * (columns - 1)) / columns;
  const rows = [];

  for (let index = 0; index < entries.length; index += columns) {
    rows.push(entries.slice(index, index + columns));
  }

  rows.forEach((row) => {
    const estimatedHeights = row.map((entry) => {
      const labelLines = splitLines(doc, entry.label, columnWidth - 18);
      const valueLines = splitLines(doc, entry.value, columnWidth - 18);
      return Math.max(52, labelLines.length * 12 + valueLines.length * 13 + 18);
    });
    const rowHeight = Math.max(...estimatedHeights);
    ensureSpace(doc, state, rowHeight + 10);

    row.forEach((entry, index) => {
      const x = state.x + index * (columnWidth + gap);
      doc.setDrawColor(...PDF_THEME.border);
      doc.setFillColor(...PDF_THEME.soft);
      doc.roundedRect(x, state.y, columnWidth, rowHeight, 10, 10, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...PDF_THEME.muted);
      const labelLines = splitLines(doc, entry.label, columnWidth - 18);
      doc.text(labelLines, x + 10, state.y + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...PDF_THEME.text);
      const valueLines = splitLines(doc, entry.value, columnWidth - 18);
      doc.text(valueLines, x + 10, state.y + 28 + labelLines.length * 10);
    });

    state.y += rowHeight + 10;
  });
}

export function addSignatureBlock(doc, state, { signerLabel = 'Authorized Signatory', companyName = '', date = formatDate() } = {}) {
  ensureSpace(doc, state, 92);

  doc.setDrawColor(...PDF_THEME.border);
  doc.setFillColor(...PDF_THEME.white);
  doc.roundedRect(state.x, state.y, state.width, 74, 12, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_THEME.muted);
  doc.text('Signature', state.x + 12, state.y + 16);

  doc.setDrawColor(...PDF_THEME.text);
  doc.setLineWidth(0.9);
  doc.line(state.x + 12, state.y + 38, state.x + 180, state.y + 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_THEME.text);
  doc.text(safeText(signerLabel), state.x + 12, state.y + 52);
  if (companyName) {
    doc.text(safeText(companyName), state.x + 12, state.y + 65);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_THEME.muted);
  doc.text(`Date: ${date}`, state.x + state.width - 120, state.y + 52);
  state.y += 90;
}

export function addFooter(doc, state, footerText = 'Generated by Tradafy') {
  const totalPages = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...PDF_THEME.border);
    doc.setLineWidth(0.7);
    doc.line(PDF_MARGIN.left, height - 34, width - PDF_MARGIN.right, height - 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_THEME.muted);
    doc.text(footerText, PDF_MARGIN.left, height - 18);
    doc.text(`Page ${pageNumber} of ${totalPages}`, width - PDF_MARGIN.right, height - 18, { align: 'right' });
  }
  doc.setPage(totalPages);
  state.y = Math.min(state.y, state.bottom);
}

export async function blobToDataUrl(blob) {
  if (!(blob instanceof Blob)) return '';
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read PDF blob'));
    reader.readAsDataURL(blob);
  });
}

export async function uploadPdfToCloudinary(blob, filename) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('PDF upload is not configured yet.');
  }

  if (!(blob instanceof Blob)) {
    throw new Error('PDF file is not available for upload.');
  }

  const formData = new FormData();
  formData.append('file', blob, filename || 'document.pdf');
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  if (!response.ok || !json.secure_url) {
    throw new Error(json.error?.message || 'Failed to upload PDF.');
  }

  return json.secure_url;
}

function drawFirstPageHeader(doc, state) {
  doc.setFillColor(...PDF_THEME.navy);
  doc.rect(0, 0, state.pageWidth, 88, 'F');
  doc.setFillColor(...PDF_THEME.accent);
  doc.rect(0, 0, state.pageWidth, 6, 'F');

  const badgeWidth = 160;
  const badgeHeight = 40;
  const badgeX = state.pageWidth - PDF_MARGIN.right - badgeWidth;
  const titleMaxWidth = Math.max(220, badgeX - state.x - 18);

  doc.setTextColor(...PDF_THEME.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const titleLines = splitLines(doc, state.title, titleMaxWidth);
  doc.text(titleLines, state.x, 30);

  if (state.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const subtitleY = 30 + (titleLines.length * 18) + 2;
    const lines = splitLines(doc, state.subtitle, titleMaxWidth);
    doc.text(lines, state.x, subtitleY);
  }

  if (state.documentCode || state.referenceValue) {
    const label = state.documentCode || 'Document';
    const ref = state.referenceValue ? `${state.referenceLabel || 'Reference'}: ${state.referenceValue}` : '';
    doc.setFillColor(255, 255, 255, 0.12);
    doc.roundedRect(badgeX, 18, badgeWidth, badgeHeight, 12, 12, 'F');
    doc.setTextColor(...PDF_THEME.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, badgeX + 16, 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    if (ref) {
      const refLines = splitLines(doc, ref, badgeWidth - 32);
      doc.text(refLines, badgeX + 16, 47);
    }
  }

  state.y = 124;
}

function drawContinuationHeader(doc, state) {
  doc.setDrawColor(...PDF_THEME.border);
  doc.setLineWidth(0.8);
  doc.line(state.x, 60, state.x + state.width, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...PDF_THEME.navy);
  doc.text(safeText(state.title), state.x, 77);

  if (state.referenceValue) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...PDF_THEME.muted);
    doc.text(`${state.referenceLabel || 'Reference'}: ${safeText(state.referenceValue)}`, state.x + state.width, 77, {
      align: 'right',
    });
  }

  state.y = 94;
}
