import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock3,
  EyeOff,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Phone,
  Plus,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext.jsx';
import { useAuthAndSafety } from '../../context/AuthAndSafetyContext.jsx';

const gbvHotlines = [
  {
    name: 'National GBV Command Centre',
    number: '0800 428 428',
    desc: '24/7 Toll-Free Emergency Support & Extraction',
    badge: 'Official DSD',
  },
  {
    name: 'Stop Gender Violence Helpline',
    number: '0800 150 150',
    desc: 'Confidential Crisis Counselling & Safe Havens',
    badge: '24/7 Toll-Free',
  },
  {
    name: 'Thuthuzela Care Centre Network',
    number: '011 488 4000',
    desc: 'One-stop medical, legal, and trauma centers',
    badge: 'Gauteng Health',
  },
  {
    name: 'Childline South Africa',
    number: '116',
    desc: 'Free support for children and family disputes',
    badge: 'Toll-Free',
  },
];

const incidentCategories = [
  'Suspicious Vehicle',
  'Harassment or Stalking',
  'Domestic Violence Concern',
  'Safety Hazard',
  'Other',
];

function createIncidentId() {
  return globalThis.crypto?.randomUUID?.() || `incident-${Date.now()}`;
}

export default function OfficialHome() {
  const navigate = useNavigate();
  const { sosActive } = useSafety();
  const { activeEmergency, setIsStealthMode } = useAuthAndSafety();
  const [isHotlinesOpen, setIsHotlinesOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [form, setForm] = useState({ category: '', location: '', description: '' });
  const [toast, setToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const isFormValid =
    form.category.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.description.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    const newIncident = {
      id: createIncidentId(),
      title: form.category.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      timestamp: Date.now(),
      verified: false,
    };

    if (isPublic) {
      setIncidents((currentIncidents) => [newIncident, ...currentIncidents]);
      setToast('Public community alert added to this demo feed.');
    } else {
      setToast('Encrypted report dispatched to local precinct. Prototype confirmation only; no precinct connection is configured.');
    }

    setForm({ category: '', location: '', description: '' });
    setIsPublic(false);
    setIsReportOpen(false);
    setIsSubmitting(false);
  };

  const formatTime = (timestamp) => {
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  };

  const hasActiveEmergency = !!activeEmergency || sosActive;

  return (
    <div className="flex-1 min-h-full bg-black text-white px-4 pt-8 pb-28 font-sans selection:bg-rose-500/30 selection:text-white">
      <div className="max-w-md mx-auto space-y-5">
        <header className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center text-rose-400">
            <HeartHandshake size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight leading-snug">
              GBV Crisis &amp; Safe Havens
            </h1>
            <p className="text-xs text-zinc-500 mt-1 tracking-tight leading-relaxed">
              Local safety intelligence and support resources.
            </p>
          </div>
        </header>

        {hasActiveEmergency && (
          <motion.div
            layout
            className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-white tracking-tight leading-snug">
                  Active Alert Transmitting
                </h2>
                <p className="text-[10px] text-rose-300 font-mono mt-0.5">
                  GPS live coordinates locked
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold tracking-tight transition-colors cursor-pointer shrink-0"
            >
              View Beacon
            </button>
          </motion.div>
        )}

        <motion.section layout className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <button
            type="button"
            aria-expanded={isHotlinesOpen}
            onClick={() => setIsHotlinesOpen((open) => !open)}
            className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-rose-400 shrink-0">
              <Phone size={17} />
            </div>
            <span className="flex-1 text-sm font-semibold tracking-tight leading-snug">
              National Crisis Hotlines (Toll-Free)
            </span>
            <motion.span
              animate={{ rotate: isHotlinesOpen ? 180 : 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="text-zinc-500"
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>
          <motion.div
            initial={false}
            animate={{
              height: isHotlinesOpen ? 'auto' : 0,
              opacity: isHotlinesOpen ? 1 : 0,
            }}
            transition={{ height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
            aria-hidden={!isHotlinesOpen}
          >
            <div className="px-3 pb-3 space-y-2">
              {gbvHotlines.map((hotline) => (
                <a
                  key={hotline.name}
                  href={`tel:${hotline.number.replace(/\s+/g, '')}`}
                  tabIndex={isHotlinesOpen ? 0 : -1}
                  className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex items-center justify-between gap-3 transition-colors hover:bg-zinc-900 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white tracking-tight leading-snug">
                        {hotline.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                        {hotline.badge}
                      </span>
                    </div>
                    <span className="text-xs text-rose-400 font-mono font-semibold block mt-1">
                      {hotline.number}
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {hotline.desc}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <motion.section layout className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold tracking-tight leading-snug">
                Local Safety Perimeter
              </h2>
              <p className="text-[11px] text-zinc-500 tracking-tight mt-1">
                Active Alerts: Johannesburg South (Mondeor, Booysens)
              </p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono shrink-0 pb-0.5">
              <Radio size={12} />
              LOCAL
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="w-full min-h-[50px] rounded-xl px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 text-sm font-semibold tracking-tight transition-colors cursor-pointer shadow-lg shadow-rose-950/20"
          >
            <Plus size={18} />
            Log Community Incident
          </button>

          <AnimatePresence initial={false} mode="popLayout">
            {isLoading ? (
              <motion.div
                key="feed-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
                aria-label="Loading local safety alerts"
              >
                <div className="animate-pulse bg-zinc-800 rounded-xl h-24" />
                <div className="animate-pulse bg-zinc-800 rounded-xl h-24" />
              </motion.div>
            ) : incidents.length === 0 ? (
              <motion.div
                key="feed-empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-white/5 bg-[#111111] px-5 py-7 text-center"
              >
                <div className="w-11 h-11 mx-auto rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
                  <ShieldCheck size={21} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-200 tracking-tight leading-snug">
                  No community alerts nearby
                </h3>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed tracking-tight max-w-[260px] mx-auto">
                  There are no public reports in this perimeter right now. If you notice a safety concern, you can share it with the community.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="feed-items"
                layout
                className="space-y-3"
              >
                <AnimatePresence initial={false}>
                  {incidents.map((incident) => (
                    <motion.article
                      key={incident.id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <AlertCircle size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white tracking-tight leading-snug">
                              {incident.title}
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400 tracking-tight">
                              <MapPin size={12} className="shrink-0" />
                              <span className="truncate">{incident.location}</span>
                            </p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 shrink-0 pt-0.5">
                          <Clock3 size={11} />
                          {formatTime(incident.timestamp)}
                        </span>
                      </div>
                      {incident.description && (
                        <p className="mt-3 text-xs text-zinc-400 leading-relaxed tracking-tight">
                          {incident.description}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                            incident.verified
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {incident.verified ? <CheckCircle size={12} /> : <Users size={12} />}
                          {incident.verified ? 'Community Verified' : 'Community Report'}
                        </span>
                        {!incident.verified && (
                          <span className="text-[10px] text-zinc-600">Not independently verified</span>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <div className="rounded-xl border border-white/5 bg-zinc-950/70 px-3.5 py-3 flex items-start gap-2.5">
          <LockKeyhole size={15} className="text-zinc-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 tracking-tight leading-relaxed">
            Public community reports are shown in this local demo feed. Private submissions are not displayed here.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              setIsStealthMode(true);
              navigate('/calendar');
            }}
            className="bg-[#111111] hover:bg-zinc-900 border border-white/5 text-white w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs font-semibold tracking-tight leading-snug"
          >
            <EyeOff size={18} className="text-zinc-400" />
            <span>Disguise</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isReportOpen && (
          <motion.div
            key="report-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsReportOpen(false);
            }}
          >
            <motion.section
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="incident-form-title"
              className="w-full max-w-md max-h-[92dvh] overflow-y-auto bg-[#111111] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold">
                    Community Safety
                  </p>
                  <h2 id="incident-form-title" className="mt-1 text-lg font-bold text-white tracking-tight leading-snug">
                    Log Community Incident
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 tracking-tight">
                    Share only details that are safe and useful to report.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="w-9 h-9 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close incident form"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-zinc-300 tracking-tight">
                    Category <span className="text-rose-400">*</span>
                  </span>
                  <select
                    required
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-3 text-sm text-white tracking-tight outline-none focus:border-rose-500/60"
                  >
                    <option value="">Select a category</option>
                    {incidentCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-zinc-300 tracking-tight">
                    Location <span className="text-rose-400">*</span>
                  </span>
                  <input
                    required
                    type="text"
                    maxLength={120}
                    value={form.location}
                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                    placeholder="Neighbourhood, street, or landmark"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 tracking-tight outline-none focus:border-rose-500/60"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-zinc-300 tracking-tight">
                    Description <span className="text-rose-400">*</span>
                  </span>
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe what you observed. Avoid identifying personal details."
                    className="w-full resize-y rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 tracking-tight leading-relaxed outline-none focus:border-rose-500/60"
                  />
                </label>

                <div className="rounded-2xl border border-white/5 bg-zinc-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white tracking-tight leading-snug">
                        Visibility Status
                      </p>
                      <p className="mt-1 text-xs font-medium text-zinc-300 tracking-tight">
                        {isPublic ? 'Public Broadcast' : 'Private (Default)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPublic}
                      aria-label="Visibility Status: Public Broadcast"
                      onClick={() => setIsPublic((current) => !current)}
                      className={`relative w-14 h-7 shrink-0 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                        isPublic ? 'bg-rose-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          isPublic ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-500 tracking-tight leading-relaxed">
                    {isPublic
                      ? 'Alert users within a 5km radius.'
                      : 'Route directly to SAPS/CPF. Hidden from public.'}
                  </p>
                </div>

                <p className="text-[10px] text-zinc-600 leading-relaxed tracking-tight">
                  Prototype only: this form does not currently connect to SAPS, CPF, or a live public broadcast service. Do not use it in place of emergency services.
                </p>

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white py-3.5 text-sm font-semibold tracking-tight transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Incident'}
                </button>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="incident-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            className="fixed z-[60] bottom-24 left-4 right-4 max-w-md mx-auto rounded-xl border border-emerald-500/20 bg-zinc-950 px-4 py-3 text-emerald-500 text-xs font-medium tracking-tight shadow-xl"
          >
            <div className="flex items-start gap-2">
              <CheckCircle size={15} className="shrink-0 mt-0.5" />
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
