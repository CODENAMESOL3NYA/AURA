import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Trash2,
  ArrowLeft,
  Plus,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function ContactCard({ data, onDelete }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors">
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-rose-500 shrink-0">
          <User size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-white tracking-tight leading-snug truncate">
              {data.fullName}
            </p>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-zinc-300">
              {data.relationship}
            </span>
          </div>
          <p className="text-xs text-zinc-400 tracking-tight flex items-center gap-1 mt-0.5">
            <Phone size={11} className="text-zinc-500" />
            {data.phoneNumber}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(data.id)}
        className="p-2 rounded-xl text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 ml-2"
        title={`Remove ${data.fullName}`}
        aria-label={`Remove ${data.fullName}`}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

export default function EmergencyContacts({ onBack = null }) {
  const navigate = useNavigate();

  // Task 2: Dynamic state initialized as empty array (eradicated hardcoded dummy array)
  const [contacts, setContacts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('aura_contacts');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    relationship: 'Parent',
  });

  const [validationError, setValidationError] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/profile');
    }
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
      setValidationError('Please provide both Full Name and Contact Number.');
      return;
    }

    const newContact = {
      id: `contact-${Date.now()}`,
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      relationship: formData.relationship,
      isPrimary: contacts.length === 0,
      autoDispatchSms: true,
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aura_contacts', JSON.stringify(updated));
      } catch (err) {}
    }

    setFormData({ fullName: '', phoneNumber: '', relationship: 'Parent' });
    setValidationError('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleDeleteContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aura_contacts', JSON.stringify(updated));
      } catch (err) {}
    }
  };

  return (
    <div className="flex-1 min-h-full min-h-[100dvh] bg-black text-white px-4 py-5 pb-28 font-sans selection:bg-rose-500/30">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header with Back Navigation */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Back to Profile"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white leading-snug">
              Emergency Contacts
            </h1>
            <p className="text-xs text-zinc-400 tracking-tight">
              Automated SOS alert escalation circle
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Emergency contact added to active responder circle.</span>
          </div>
        )}

        {/* Current Contacts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium tracking-wider uppercase text-zinc-500">
              Current Contacts ({contacts.length})
            </p>
            <span className="text-[11px] text-zinc-500 font-mono">Instant SMS / WhatsApp Sync</span>
          </div>

          {/* Task 2: Conditionally render designed Empty State when contacts.length is 0 */}
          {contacts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 text-center space-y-2">
              <Phone size={28} className="mx-auto text-zinc-600" />
              <p className="text-sm font-medium text-zinc-300">No emergency contacts</p>
              <p className="text-xs text-zinc-500">Add trusted contacts below to ensure swift dispatch notification.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {contacts.map((contact) => (
                <ContactCard data={contact} key={contact.id} onDelete={handleDeleteContact} />
              ))}
            </div>
          )}
        </div>

        {/* Add Contact Form */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-1.5 px-1">
            <Plus size={14} className="text-rose-500" />
            <p className="text-xs font-medium tracking-wider uppercase text-zinc-500">
              Add Emergency Contact
            </p>
          </div>

          <form onSubmit={handleAddContact} className="space-y-3.5 bg-[#111111] border border-white/5 rounded-2xl p-4">
            {validationError && (
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="block text-xs font-medium text-zinc-400 tracking-tight">
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="e.g. Sipho Sithole"
                value={formData.fullName}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, fullName: val }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label htmlFor="contact-phone" className="block text-xs font-medium text-zinc-400 tracking-tight">
                Contact Number
              </label>
              <input
                id="contact-phone"
                type="tel"
                placeholder="e.g. +27 82 000 0000"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, phoneNumber: val }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Styled <select> dropdown for Relationship */}
            <div className="space-y-1.5">
              <label htmlFor="contact-rel" className="block text-xs font-medium text-zinc-400 tracking-tight">
                Relationship
              </label>
              <div className="relative">
                <select
                  id="contact-rel"
                  value={formData.relationship}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, relationship: val }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors cursor-pointer appearance-none pr-8"
                >
                  <option value="Parent" className="bg-zinc-900 text-white">Parent</option>
                  <option value="Sibling" className="bg-zinc-900 text-white">Sibling</option>
                  <option value="Partner" className="bg-zinc-900 text-white">Partner</option>
                  <option value="Friend" className="bg-zinc-900 text-white">Friend</option>
                  <option value="Colleague" className="bg-zinc-900 text-white">Colleague</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white text-sm font-semibold tracking-tight transition-all cursor-pointer shadow-lg shadow-rose-500/20"
            >
              Add Contact
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
