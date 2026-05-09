/**
 * DealPage.jsx — The shared deal workspace.
 *
 * Tabs:
 *  Chat      → real messages via GET/POST /api/messages?dealId=
 *  Timeline  → deal.timeline array from GET /api/deals/:id
 *  Shipment  → deal.shipment block + stage info
 *
 * Status progression:
 *  PATCH /api/deals/:id/status → allowed next stage only
 *
 * All mock data (tradafyData) removed.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageSquareText, Timer, ShipWheel, Send, Loader2,
  AlertCircle, CheckCircle2, Package, ArrowLeft,
  Building2, Globe, MapPin, Users, Smile, Paperclip, FileText, Download, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, MetricCard } from './ui';
import { useAuth } from '../hooks/useAuth';
import { getDealById, advanceDealStatus, getMessages, sendMessage, updateDealShipment } from '../lib/dealService';

// ─── Stage lifecycle ──────────────────────────────────────────────────────────

const STAGES = [
  { key: 'inquiry',          label: 'Inquiry' },
  { key: 'negotiation',      label: 'Negotiation' },
  { key: 'agreement',        label: 'Agreement' },
  { key: 'payment',          label: 'Payment' },
  { key: 'production',       label: 'Production' },
  { key: 'shipping_request', label: 'Shipping' },
  { key: 'shipping',         label: 'In Transit' },
  { key: 'delivery',         label: 'Delivery' },
  { key: 'closed',           label: 'Closed' },
];

// What stage comes next for each current stage
const NEXT_STAGE = {
  inquiry:          'negotiation',
  negotiation:      'agreement',
  agreement:        'payment',
  payment:          'production',
  production:       'shipping_request',
  shipping_request: 'shipping',
  shipping:         'delivery',
  delivery:         'closed',
};

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'chat',     label: 'Chat',     icon: MessageSquareText },
  { key: 'timeline', label: 'Timeline', icon: Timer },
  { key: 'shipment', label: 'Shipment', icon: ShipWheel },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const fmtPrice = (p) => p != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(p)
  : '—';

const fmtCompanyOrigin = (company) => {
  const city = company?.city;
  const country = company?.country;
  return [city, country].filter(Boolean).join(', ') || country || '—';
};

const fmtList = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return '—';
  return items.slice(0, 4).join(', ');
};

const fmtWebsite = (website) => {
  if (!website) return '';
  return website.startsWith('http://') || website.startsWith('https://')
    ? website
    : `https://${website}`;
};

const getPersonName = (person) => {
  if (!person) return 'Participant';
  const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim();
  return fullName || person.displayName || person.name || person.email || 'Participant';
};

const getInitials = (value) => {
  const text = String(value || '').trim();
  if (!text) return '??';
  return text
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const QUICK_EMOJIS = ['😀', '🙂', '🙏', '🤝', '✨', '📦', '🚢', '📄', '💬', '❤️', '🚀', '👍'];
const MAX_ATTACHMENTS = 5;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const getAttachmentType = (name = '', url = '') => {
  const value = `${name || url}`.toLowerCase();
  if (value.endsWith('.pdf')) return 'PDF';
  if (value.endsWith('.doc') || value.endsWith('.docx')) return 'DOC';
  if (value.endsWith('.xls') || value.endsWith('.xlsx')) return 'XLS';
  return 'FILE';
};

const getAttachmentLabel = (attachment, index) => {
  if (!attachment) return `Attachment ${index + 1}`;
  if (attachment.name) return attachment.name;
  try {
    const raw = new URL(attachment.url);
    const path = raw.pathname.split('/').filter(Boolean).pop();
    if (path) return decodeURIComponent(path);
  } catch {
    // Ignore malformed URLs and fall back below.
  }
  return `Attachment ${index + 1}`;
};

const normalizeAttachmentUrl = (url) => {
  const value = String(url || '').trim();
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, '')}`;
};

const buildAttachmentDownloadUrl = (attachment, fallbackName = '') => {
  const baseUrl = normalizeAttachmentUrl(attachment?.url);
  if (!baseUrl) return '';

  const attachmentName = String(attachment?.name || fallbackName || '').toLowerCase();
  const isDocument = /\.(pdf|docx?|xlsx?)$/.test(attachmentName) || ['pdf', 'doc', 'xls'].includes(String(attachment?.type || '').toLowerCase());
  try {
    const parsed = new URL(baseUrl);
    if (/cloudinary\.com$/i.test(parsed.hostname) && /\/(image|raw)\/upload\//i.test(parsed.pathname)) {
      const resourceType = /\/raw\/upload\//i.test(parsed.pathname) || isDocument ? 'raw' : 'image';
      parsed.pathname = parsed.pathname.replace(/\/(image|raw)\/upload\//i, `/${resourceType}/upload/fl_attachment/`);
      return parsed.toString();
    }
  } catch {
    // Ignore URL parse errors and fall back to the original URL.
  }

  return baseUrl;
};

// ─── Chat tab ─────────────────────────────────────────────────────────────────

const sameId = (a, b) => String(a || '') === String(b || '');

function getParticipantCards(deal, user) {
  const currentCompanyId = user?.companyId?.toString();
  const buyerIsSelf = Boolean(currentCompanyId && sameId(currentCompanyId, deal?.buyerCompanyId));
  const supplierIsSelf = Boolean(currentCompanyId && sameId(currentCompanyId, deal?.supplierCompanyId));
  const buyerUserName = deal?.buyerUserName || '';
  const supplierUserName = deal?.supplierUserName || '';
  const fallbackCounterpartyName = deal?.chatCounterpartyUserName || '';
  const fallbackCounterpartyEmail = deal?.chatCounterpartyUserEmail || '';
  const buyerName = buyerIsSelf
    ? getPersonName(deal?.buyerUser || user)
    : buyerUserName || fallbackCounterpartyName || getPersonName(deal?.buyerUser) || 'Buyer contact';
  const supplierName = supplierIsSelf
    ? getPersonName(deal?.supplierUser || user)
    : supplierUserName || fallbackCounterpartyName || getPersonName(deal?.supplierUser) || 'Supplier contact';

  return [
    {
      key: 'buyer',
      role: 'Buyer',
      side: buyerIsSelf ? 'Your side' : 'Counterparty',
      isSelf: buyerIsSelf,
      personName: buyerName,
      personEmail: deal?.buyerUserEmail || deal?.buyerUser?.email || (!buyerIsSelf ? fallbackCounterpartyEmail : '') || '—',
      companyName: deal?.buyerCompanyName || deal?.buyerCompany?.name || 'Buyer company',
      origin: deal?.buyerCompanyOrigin || fmtCompanyOrigin(deal?.buyerCompany),
      industry: deal?.buyerCompanyIndustry || deal?.buyerCompany?.industry || '—',
      website: deal?.buyerCompanyWebsite || deal?.buyerCompany?.website || '',
      products: deal?.buyerCompanyMainProducts || deal?.buyerCompany?.mainProducts || [],
      markets: deal?.buyerCompanyExportMarkets || deal?.buyerCompany?.exportMarkets || [],
      accent: 'from-sky-500 to-cyan-500',
    },
    {
      key: 'supplier',
      role: 'Supplier',
      side: supplierIsSelf ? 'Your side' : 'Counterparty',
      isSelf: supplierIsSelf,
      personName: supplierName,
      personEmail: deal?.supplierUserEmail || deal?.supplierUser?.email || (!supplierIsSelf ? fallbackCounterpartyEmail : '') || '—',
      companyName: deal?.supplierCompanyName || deal?.supplierCompany?.name || 'Supplier company',
      origin: deal?.supplierCompanyOrigin || fmtCompanyOrigin(deal?.supplierCompany),
      industry: deal?.supplierCompanyIndustry || deal?.supplierCompany?.industry || '—',
      website: deal?.supplierCompanyWebsite || deal?.supplierCompany?.website || '',
      products: deal?.supplierCompanyMainProducts || deal?.supplierCompany?.mainProducts || [],
      markets: deal?.supplierCompanyExportMarkets || deal?.supplierCompany?.exportMarkets || [],
      accent: 'from-[#173b67] to-[#245c9d]',
    },
  ];
}

function ChatTab({ dealId, deal, user, onContactResolve, chatContacts }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const draftRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUserName = getPersonName(user);
  const cards = useMemo(
    () => getParticipantCards({
      ...deal,
      chatCounterpartyUserName: chatContacts?.counterpartyUserName,
      chatCounterpartyUserEmail: chatContacts?.counterpartyUserEmail,
    }, user),
    [deal, user, chatContacts]
  );
  const activeSide = cards.find((card) => card.isSelf) || cards[0];
  const counterpartySide = cards.find((card) => card.key !== activeSide?.key) || cards[1];
  const conversationName = counterpartySide?.personName || counterpartySide?.companyName || 'Counterparty';
  const conversationSubtext = [counterpartySide?.companyName, counterpartySide?.personEmail].filter(Boolean).join(' • ');

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMessages(dealId, { limit: 50 });
      setMessages([...result.messages].reverse());
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!onContactResolve || messages.length === 0) return;
    const otherSender = messages.find((msg) => !sameId(msg.senderId?._id || msg.senderId, user?._id))?.senderId;
    if (!otherSender) return;
    const otherName = getPersonName(otherSender);
    const otherEmail = otherSender?.email || '';
    if (otherName && otherName !== 'Participant') {
      onContactResolve({ counterpartyUserName: otherName, counterpartyUserEmail: otherEmail });
    }
  }, [messages, onContactResolve, user?._id]);

  const groupedMessages = useMemo(() => {
    const buckets = [];
    let currentLabel = '';
    let currentItems = [];

    const dayLabel = (dateValue) => {
      if (!dateValue) return 'Unknown date';
      const date = new Date(dateValue);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMessage = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const diffDays = Math.round((startOfToday - startOfMessage) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    messages.forEach((msg) => {
      const label = dayLabel(msg.createdAt);
      if (label !== currentLabel) {
        if (currentItems.length) buckets.push({ label: currentLabel, items: currentItems });
        currentLabel = label;
        currentItems = [msg];
      } else {
        currentItems.push(msg);
      }
    });

    if (currentItems.length) buckets.push({ label: currentLabel, items: currentItems });
    return buckets;
  }, [messages]);

  const insertEmoji = useCallback((emoji) => {
    const el = draftRef.current;
    if (!el) {
      setDraft((prev) => `${prev}${emoji}`);
      return;
    }

    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    setDraft((prev) => `${prev.slice(0, start)}${emoji}${prev.slice(end)}`);
    window.requestAnimationFrame(() => {
      try {
        const nextPos = start + emoji.length;
        el.focus();
        el.setSelectionRange(nextPos, nextPos);
      } catch {
        // Ignore browsers that refuse cursor manipulation.
      }
    });
    setShowEmojiTray(false);
  }, [draft]);

  const uploadAttachmentFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    if (pendingAttachments.length + files.length > MAX_ATTACHMENTS) {
      setError(`You can attach up to ${MAX_ATTACHMENTS} files in one message.`);
      return;
    }

    const accepted = files.filter((file) => {
      const name = file.name.toLowerCase();
      return file.type === 'application/pdf'
        || file.type === 'application/msword'
        || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        || name.endsWith('.pdf')
        || name.endsWith('.doc')
        || name.endsWith('.docx');
    });
    if (accepted.length !== files.length) {
      setError('Only PDF or document files can be attached in chat.');
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('File upload is not configured yet.');
      return;
    }

    setUploadingAttachment(true);
    setError('');

    const uploaded = [];
    for (const file of accepted) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
          method: 'POST',
          body: fd,
        });
        const json = await res.json();
        if (!json.secure_url) throw new Error(json.error?.message || 'Upload failed');
        uploaded.push({
          url: normalizeAttachmentUrl(json.secure_url),
          name: file.name,
          type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc',
        });
      } catch (err) {
        setError(`Could not upload "${file.name}". ${err.message}`);
      }
    }

    setPendingAttachments((prev) => [...prev, ...uploaded]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadingAttachment(false);
  }, [pendingAttachments.length]);

  const removeAttachment = useCallback((index) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDownloadAttachment = useCallback((messageId, attachmentIndex, attachmentName) => {
    const message = messages.find((item) => item._id === messageId);
    const attachment = message?.attachments?.[attachmentIndex];
    const downloadUrl = buildAttachmentDownloadUrl(attachment, attachmentName);

    if (!downloadUrl) {
      setError('Attachment link is not available.');
      return;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = attachmentName || attachment?.name || 'attachment';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() && pendingAttachments.length === 0) return;
    setSending(true);
    try {
      const msg = await sendMessage(dealId, {
        text: draft.trim(),
        attachments: pendingAttachments.map((attachment) => ({
          url: normalizeAttachmentUrl(attachment.url),
          name: attachment.name,
          type: attachment.type,
        })),
        type: pendingAttachments.length > 0 && !draft.trim() ? 'file' : 'text',
      });
      setDraft('');
      setPendingAttachments([]);
      setShowEmojiTray(false);
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending && (draft.trim() || pendingAttachments.length > 0)) {
        handleSend(e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-[24px] border border-slate-100 bg-slate-50/70">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[600px] flex-col overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      {error && (
        <div className="m-4 mb-0 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-0.5 sm:px-5 sm:py-1">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] text-sm font-black text-white shadow-sm">
            {getInitials(conversationName)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Chat</p>
            <h3 className="truncate text-[17px] font-bold text-[#143a6a]">{conversationName}</h3>
            <p className="truncate text-xs text-slate-500">{conversationSubtext || 'Deal participant'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {messages.length} messages
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-0.5 sm:px-5 sm:py-1">
        {messages.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#245c9d] shadow-sm">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No messages yet</p>
            <p className="mt-1 text-sm text-slate-500">Start the conversation below.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {groupedMessages.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="space-y-3">
                  {group.items.map((msg) => {
                    const isMine = sameId(msg.senderId?._id || msg.senderId, user._id);
                    const senderName = isMine ? currentUserName : getPersonName(msg.senderId);
                    const body = msg.text || '';
                    const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;
                    return (
                      <div key={msg._id} className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${isMine ? 'from-[#173b67] to-[#245c9d]' : 'from-slate-700 to-slate-500'} text-[10px] font-black text-white shadow-sm`}>
                          {getInitials(isMine ? currentUserName : senderName)}
                        </div>
                        <div
                          className={`max-w-[84%] rounded-[20px] px-4 py-2.5 shadow-sm sm:max-w-[70%] ${
                            isMine
                              ? 'border border-[#d9e6f5] bg-[linear-gradient(180deg,#1b406d_0%,#245c9d_100%)] text-white'
                              : 'border border-[#e2ebf4] bg-white text-slate-700'
                          }`}
                        >
                          <div className={`mb-1 flex items-center gap-3 ${isMine ? 'justify-end' : 'justify-between'}`}>
                            <span className={`text-[11px] font-bold ${isMine ? 'text-white/90' : 'text-[#173b67]/80'}`}>
                              {isMine ? 'You' : senderName}
                            </span>
                            <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                              {fmtDate(msg.createdAt)}
                            </span>
                          </div>
                          {body ? (
                            <p className={`whitespace-pre-wrap text-[13px] leading-[1.35] ${isMine ? 'text-white' : 'text-slate-700'}`}>
                              {body}
                            </p>
                          ) : null}
                          {hasAttachments && (
                            <div className={`mt-2 grid gap-2 ${msg.attachments.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                              {msg.attachments.map((attachment, index) => {
                                const attachmentLabel = getAttachmentLabel(attachment, index);
                                const attachmentType = getAttachmentType(attachmentLabel, attachment?.url);
                                const downloadIndex = index;
                                return (
                                  <div
                                    key={`${msg._id}-${attachment.url}-${index}`}
                                    className={`flex items-center gap-3 rounded-[16px] border px-3 py-2.5 transition hover:-translate-y-0.5 ${
                                      isMine
                                        ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                                    }`}
                                  >
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                                      isMine ? 'bg-white/15 text-white' : 'bg-[#edf5ff] text-[#245c9d]'
                                    }`}>
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadAttachment(msg._id, downloadIndex, attachmentLabel)}
                                        className="block w-full text-left"
                                      >
                                        <p className={`truncate text-sm font-semibold ${isMine ? 'text-white' : 'text-slate-700'}`}>
                                          {attachmentLabel}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${isMine ? 'text-white/65' : 'text-slate-400'}`}>
                                          {attachmentType}
                                        </p>
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadAttachment(msg._id, downloadIndex, attachmentLabel)}
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                                        isMine
                                          ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                      }`}
                                      aria-label={`Download ${attachmentLabel}`}
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      <form onSubmit={handleSend} className="shrink-0 border-t border-slate-100 bg-white px-4 py-0.5 sm:px-5 sm:py-1">
        {pendingAttachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingAttachments.map((attachment, index) => (
              <div
                key={`${attachment.url}-${index}`}
                className="flex items-center gap-2 rounded-full border border-[#d8e2ef] bg-[#f8fbff] px-3 py-2 text-xs font-semibold text-slate-600"
              >
                <FileText className="h-3.5 w-3.5 text-[#245c9d]" />
                <span className="max-w-[180px] truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="rounded-full p-0.5 text-slate-400 transition hover:bg-white hover:text-rose-600"
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showEmojiTray && (
          <div className="mb-2 flex flex-wrap gap-2 rounded-[20px] border border-slate-200 bg-slate-50 p-2.5">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-[22px] border border-[#d8e2ef] bg-white p-1 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
          <button
            type="button"
            onClick={() => setShowEmojiTray((prev) => !prev)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
              showEmojiTray ? 'border-[#245c9d] bg-[#edf5ff] text-[#245c9d]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#c7d8eb]'
            }`}
            aria-label="Insert emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachment || pendingAttachments.length >= MAX_ATTACHMENTS}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#c7d8eb] disabled:opacity-50"
            aria-label="Attach file"
          >
            {uploadingAttachment ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Paperclip className="h-4.5 w-4.5" />}
          </button>
          <textarea
            ref={draftRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={sending}
            rows={2}
            className="min-h-[34px] flex-1 resize-none rounded-[18px] border border-transparent bg-slate-50 px-4 py-1 text-[13px] leading-5 outline-none transition placeholder:text-slate-400 focus:border-[#245c9d] focus:bg-white focus:ring-2 focus:ring-[#245c9d]/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || (!draft.trim() && pendingAttachments.length === 0)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(36,92,157,0.25)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          className="hidden"
          onChange={(e) => uploadAttachmentFiles(e.target.files)}
        />
      </form>
    </div>
  );
}

// ─── Timeline tab ─────────────────────────────────────────────────────────────

function TimelineTab({ timeline = [] }) {
  if (timeline.length === 0) {
    return (
      <div className="rounded-[20px] bg-slate-50 py-10 text-center text-sm text-slate-400">
        No timeline events yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...timeline].reverse().map((item, i) => (
        <div key={i} className="rounded-[22px] border border-[#e2ebf4] bg-[#f8fbff] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[#245c9d]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold capitalize text-[#173b67]">
                {item.stage?.replace(/_/g, ' ') || 'Stage updated'}
              </p>
              <p className="text-xs text-slate-400">{fmtDate(item.updatedAt)}</p>
            </div>
          </div>
          {item.notes && (
            <p className="mt-3 border-l-2 border-[#d0e4f7] pl-3 text-sm leading-6 text-slate-600 italic">
              {item.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shipment tab ─────────────────────────────────────────────────────────────

function ShipmentTab({ deal, canUpdateShipment, onShipmentUpdate, updatingShipment }) {
  const { shipment } = deal;
  const [notes, setNotes] = useState(shipment?.notes || '');

  useEffect(() => {
    setNotes(shipment?.notes || '');
  }, [shipment?.notes]);

  const details = [
    { label: 'Selected Bid', value: deal.selectedBidId || 'Not assigned' },
    { label: 'Shipment Status', value: shipment?.status?.replace(/_/g, ' ') || 'Not yet in shipping' },
    { label: 'Shipment Notes',  value: shipment?.notes || '—' },
    { label: 'Last Updated',    value: fmtDate(shipment?.updatedAt) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {details.map(({ label, value }) => (
          <div key={label} className="rounded-[22px] border border-[#e2ebf4] bg-[#f8fbff] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-semibold capitalize text-slate-700">{value}</p>
          </div>
        ))}
      </div>
      {canUpdateShipment && (
        <div className="rounded-[24px] border border-[#d8e2ef] bg-[#f8fbff] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#173b67]">Shipment Progress Controls</p>
              <p className="mt-1 text-sm text-slate-500">
                Only the assigned shipping agent can update freight milestones for this deal.
              </p>
            </div>
            {updatingShipment && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['booking', 'loaded', 'in_transit', 'delivered'].map((step) => {
              const active = shipment?.status === step;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => onShipmentUpdate({ status: step, notes })}
                  disabled={updatingShipment || active}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#173b67] text-white hover:bg-[#245c9d] disabled:opacity-60'
                  }`}
                >
                  {step.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add shipment notes for buyer and supplier visibility..."
              disabled={updatingShipment}
              rows={3}
              className="w-full rounded-2xl border border-[#d8e2ef] bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10 disabled:opacity-60"
            />
          </div>
        </div>
      )}
      <div className="relative overflow-hidden rounded-[28px] border border-[#dbe5f0] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_1fr]">
          <div className="p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-[#173b67]">Shipment Tracking</p>
            <p className="mt-1 text-sm text-slate-500">
              Shipment details are updated by the assigned shipping agent after a bid is accepted.
            </p>
            <div className="mt-5 space-y-3">
              {['booking', 'loaded', 'in_transit', 'delivered'].map((step, i) => {
                const done = shipment?.status === step ||
                  ['booking','loaded','in_transit','delivered']
                    .slice(0, ['booking','loaded','in_transit','delivered'].indexOf(shipment?.status) + 1)
                    .includes(step);
                return (
                  <div key={step} className={`flex items-center gap-3 rounded-[18px] border px-4 py-3 ${done ? 'border-emerald-200 bg-emerald-50' : 'border-[#e2ebf4] bg-white'}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                    <p className={`text-sm font-semibold capitalize ${done ? 'text-emerald-700' : 'text-slate-500'}`}>{step.replace(/_/g, ' ')}</p>
                    {done && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200"
              alt="Port loading"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DealParticipantsCard({ deal, user, chatContacts }) {
  const cards = useMemo(
    () => getParticipantCards({ ...deal, chatCounterpartyUserName: chatContacts?.counterpartyUserName }, user),
    [deal, user, chatContacts]
  );
  const viewerSide = cards.find((card) => card.isSelf);

  return (
    <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Chat Contacts</p>
          <h3 className="mt-1 text-lg font-bold text-[#143a6a]">Who you are speaking with</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Both sides can review the contact, company, and market profile for the active deal.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#edf5ff] px-3 py-1.5 text-[11px] font-bold text-[#245c9d]">
          <Users className="h-3.5 w-3.5" />
          {viewerSide?.role || 'Participant'}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-[24px] border p-4 ${
              card.isSelf ? 'border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]' : 'border-[#e2ebf4] bg-[#fbfdff]'
            }`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-base font-black text-white shadow-lg`}>
                {getInitials(card.companyName || card.personName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {card.role}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                    card.isSelf ? 'bg-emerald-50 text-emerald-700' : 'bg-[#edf5ff] text-[#245c9d]'
                  }`}>
                    {card.side}
                  </span>
                </div>
                <h4 className="mt-2 truncate text-base font-bold text-[#143a6a]">{card.personName}</h4>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {card.isSelf ? 'Your user profile' : 'Counterparty user profile'}
                </p>
                <p className="truncate text-sm font-semibold text-slate-700">{card.companyName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {card.origin}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-[18px] bg-white px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Contact</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-700">{card.personEmail}</p>
              </div>
              <div className="rounded-[18px] bg-white px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Industry</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-700">{card.industry}</p>
              </div>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-[18px] bg-white px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Main products</p>
                <p className="mt-1 text-sm text-slate-700">{fmtList(card.products)}</p>
              </div>
              <div className="rounded-[18px] bg-white px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Export markets</p>
                <p className="mt-1 text-sm text-slate-700">{fmtList(card.markets)}</p>
              </div>
            </div>

            {card.website ? (
              <a
                href={fmtWebsite(card.website)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#245c9d] hover:underline"
              >
                <Globe className="h-4 w-4" />
                Visit company website
              </a>
            ) : null}

            {card.isSelf ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                <Building2 className="h-3.5 w-3.5" />
                Your account side
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { dealId }= useParams();
  const isShippingAgentRole = Boolean(user?.roles?.includes('shipping_agent') && !user?.roles?.includes('admin'));

  const [deal,       setDeal]      = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [activeTab,  setActiveTab] = useState('chat');
  const [advancing,  setAdvancing] = useState(false);
  const [advError,   setAdvError]  = useState('');
  const [shipmentError, setShipmentError] = useState('');
  const [updatingShipment, setUpdatingShipment] = useState(false);
  const [chatContacts, setChatContacts] = useState({ counterpartyUserName: '', counterpartyUserEmail: '' });

  // ── Fetch deal ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const d = await getDealById(dealId);
      setDeal(d);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (isShippingAgentRole && activeTab !== 'shipment') {
      setActiveTab('shipment');
    }
  }, [activeTab, isShippingAgentRole]);

  // ── Advance status ─────────────────────────────────────────────────────────
  const handleAdvance = async () => {
    const next = NEXT_STAGE[deal.status];
    if (!next) return;
    if (!window.confirm(`Advance this deal to "${next.replace(/_/g, ' ')}"?`)) return;
    setAdvancing(true);
    setAdvError('');
    try {
      const updated = await advanceDealStatus(dealId, next);
      setDeal(updated);
    } catch (err) {
      setAdvError(err.response?.data?.message || err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleShipmentUpdate = async (payload) => {
    setUpdatingShipment(true);
    setShipmentError('');
    try {
      const updated = await updateDealShipment(dealId, payload);
      setDeal((prev) => ({ ...prev, shipment: updated.shipment }));
    } catch (err) {
      setShipmentError(err.response?.data?.message || err.message);
    } finally {
      setUpdatingShipment(false);
    }
  };

  const handleContactResolve = useCallback((data) => {
    setChatContacts((prev) => {
      const next = {
        counterpartyUserName: data?.counterpartyUserName || prev.counterpartyUserName,
        counterpartyUserEmail: data?.counterpartyUserEmail || prev.counterpartyUserEmail,
      };
      if (
        next.counterpartyUserName === prev.counterpartyUserName &&
        next.counterpartyUserEmail === prev.counterpartyUserEmail
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) return (
    <AppShell title="Deal Workspace" subtitle="">
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    </AppShell>
  );

  if (error || !deal) return (
    <AppShell title="Deal Workspace" subtitle="">
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-rose-100 bg-rose-50 py-20 text-center">
        <Package className="h-12 w-12 text-rose-200" />
        <p className="text-lg font-bold text-slate-800">{error || 'Deal not found'}</p>
        <button onClick={() => navigate('/deals')} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Deals
        </button>
      </div>
    </AppShell>
  );

  const activeStepIndex = STAGES.findIndex((s) => s.key === deal.status);
  const nextStage = NEXT_STAGE[deal.status];
  const isBuyer = Boolean(user?.companyId && sameId(user.companyId, deal?.buyerCompanyId));
  const isSupplier = Boolean(user?.companyId && sameId(user.companyId, deal?.supplierCompanyId));
  const isAssignedAgent = Boolean(user?._id && sameId(user._id, deal?.shippingAgentId));
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  const isShippingAgent = isShippingAgentRole;
  const isCompanyUser = Boolean(isBuyer || isSupplier || isAdmin);
  const canEditDeal = isCompanyUser && ['inquiry', 'negotiation'].includes(deal.status);
  const canAdvanceStatus = Boolean((isBuyer || isSupplier || isAdmin) && nextStage);
  const canUpdateShipment = Boolean((isShippingAgent || isAssignedAgent || isAdmin) && ['shipping', 'delivery'].includes(deal.status));
  const visibleTabs = isShippingAgent ? TABS.filter((tab) => tab.key === 'shipment') : TABS;

  return (
    <AppShell
      title={deal.productName || 'Deal Workspace'}
      subtitle={isShippingAgent ? 'Logistics-only workspace for the assigned freight agent.' : 'Shared workspace where buyer, supplier, and the assigned freight agent coordinate from inquiry through delivery.'}
    >
      <div className="space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-7 text-white shadow-xl lg:p-8">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2400"
              alt="Cargo Port"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200">
                Shared Deal Workspace
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">
                {deal.productName || 'Deal Workspace'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-sky-100/90">
                {isShippingAgent
                  ? 'Cargo lane details and shipment progress are available here for the assigned freight agent only.'
                  : 'Buyer, supplier, and the assigned freight agent coordinate here through chat, timeline updates, and shipment tracking.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:mt-2 xl:items-end">
              <div className="flex items-center gap-3">
                {canEditDeal && (
                  <button
                    onClick={() => navigate(`/deal/${dealId}/edit`)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-6 py-3.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20"
                  >
                    Edit Terms
                  </button>
                )}

                {canAdvanceStatus && (
                  <button
                    onClick={handleAdvance}
                    disabled={advancing}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)] transition hover:bg-sky-400 disabled:opacity-60"
                  >
                    {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {advancing ? 'Advancing…' : `Advance to ${nextStage.replace(/_/g, ' ')}`}
                  </button>
                )}
              </div>
              
              {advError && (
                <p className="max-w-xs rounded-2xl bg-rose-500/20 px-4 py-2 text-xs font-medium text-rose-300">
                  {advError}
                </p>
              )}
              {shipmentError && (
                <p className="max-w-xs rounded-2xl bg-rose-500/20 px-4 py-2 text-xs font-medium text-rose-300">
                  {shipmentError}
                </p>
              )}
              {!nextStage && (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-6 py-3.5 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Deal Closed
                </span>
              )}
            </div>
          </div>

          {/* Metric tiles */}
          <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-4">
            <MetricCard dark label="Product"    value={deal.productName || '—'} />
            <MetricCard dark label="Quantity"   value={deal.quantity ? String(deal.quantity) : '—'} />
            <MetricCard dark label="Stage"      value={STAGES[Math.max(activeStepIndex, 0)]?.label || deal.status} />
            <MetricCard dark label={isShippingAgent ? 'Route' : 'Deal Price'} value={isShippingAgent ? `${deal.origin || '—'} → ${deal.destination || '—'}` : fmtPrice(deal.price)} />
          </div>
        </section>

        {/* ── Stage progress bar ───────────────────────────────────────────── */}
        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deal Lifecycle</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {STAGES.map((step, index) => {
              const active = activeStepIndex >= index;
              const current = activeStepIndex === index;
              return (
                <div
                  key={step.key}
                  className={`rounded-[18px] border p-3 text-center ${
                    current ? 'border-sky-300 bg-sky-50' :
                    active  ? 'border-[#b8cfe8] bg-[#edf5ff]' :
                              'border-[#e2ebf4] bg-white'
                  }`}
                >
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    current ? 'bg-sky-500 text-white' :
                    active  ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white' :
                              'bg-slate-100 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`mt-2 text-[10px] font-semibold leading-tight ${active ? 'text-[#173b67]' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Main content grid ────────────────────────────────────────────── */}
        <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">

          {/* Left — deal summary */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{isShippingAgent ? 'Cargo Summary' : 'Deal Summary'}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard label="Status"      value={STAGES[Math.max(activeStepIndex, 0)]?.label || deal.status} />
                {isShippingAgent ? (
                  <MetricCard label="Route" value={`${deal.origin || '—'} → ${deal.destination || '—'}`} />
                ) : (
                  <MetricCard label="Price" value={fmtPrice(deal.price)} />
                )}
                <MetricCard label="Incoterm"    value={deal.incoterm || '—'} />
                {isShippingAgent ? (
                  <MetricCard label="Selected Bid" value={deal.selectedBidId || '—'} />
                ) : (
                  <MetricCard label="Payment" value={deal.paymentTerms || 'Not set'} />
                )}
                <MetricCard label={isShippingAgent ? 'Shipment Status' : 'Opened'} value={isShippingAgent ? (deal.shipment?.status?.replace(/_/g, ' ') || 'not started') : fmtDate(deal.createdAt)} />
              </div>
            </div>

            {!isShippingAgent && (
              <DealParticipantsCard deal={deal} user={user} chatContacts={chatContacts} />
            )}

            {/* Workspace rules */}
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Rules</p>
              <div className="space-y-2 text-sm text-slate-600">
                {[
                  isShippingAgent ? 'Only assigned shipment data is visible in this workspace.' : 'Chat belongs only to participants in this deal.',
                  isShippingAgent ? 'Commercial pricing and negotiation details are hidden from shipping agents.' : 'Stage progression is sequential — no skipping.',
                  isShippingAgent ? 'Only the assigned shipping agent can update shipment milestones.' : 'A shipping bid must be accepted before entering Shipping.',
                  'Only the assigned shipping agent can update shipment progress.',
                ].map((rule) => (
                  <div key={rule} className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 text-xs shadow-sm">
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — tab panel */}
          <div className="flex h-[600px] min-h-[600px] flex-col rounded-[28px] border border-[#d8e2ef] bg-white p-4 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            {/* Tabs */}
            <div className="mb-3.5 flex shrink-0 flex-wrap gap-2 border-b border-slate-100 pb-3">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white'
                        : 'bg-[#f4f8fc] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className={`flex-1 min-h-0 ${activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto pr-1'}`}>
              {activeTab === 'chat'     && <ChatTab     dealId={dealId} deal={deal} user={user} onContactResolve={handleContactResolve} chatContacts={chatContacts} />}
              {activeTab === 'timeline' && <TimelineTab timeline={deal.timeline} />}
              {activeTab === 'shipment' && (
                <ShipmentTab
                  deal={deal}
                  canUpdateShipment={canUpdateShipment}
                  onShipmentUpdate={handleShipmentUpdate}
                  updatingShipment={updatingShipment}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
