import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, EyeOff, Fingerprint } from 'lucide-react';

const pillars = [
  {
    title: 'Uncompromising Stealth',
    description:
      "Victim safety is paramount. Aura features an interface disguise protocol ('The Veil'), masking the app as a daily planner to help protect users in active domestic threat environments.",
    Icon: EyeOff,
    iconClassName: 'text-cyan-500',
  },
  {
    title: 'Identity Integrity',
    description:
      'South African ID Luhn validation checks the number format and checksum; it is not cryptographic proof of identity. This structured input can help reduce dispatch friction and support a clearer distress report.',
    Icon: Fingerprint,
    iconClassName: 'text-emerald-500',
  },
  {
    title: 'Actionable Telemetry',
    description:
      'Beyond a simple panic button, Aura can collect incident details—such as reported weapon presence—and share real-time GPS location to give responders useful context before they arrive.',
    Icon: Activity,
    iconClassName: 'text-amber-500',
  },
];

export default function About({ onBack = null }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-full bg-black text-white px-4 pt-6 pb-10 font-sans"
    >
      <div className="max-w-md mx-auto min-h-[calc(100dvh-4rem)] flex flex-col">
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Back to Profile"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-sm font-medium text-zinc-400 tracking-tight pr-8">
            About Aura
          </h1>
        </div>

        <div className="flex flex-col flex-1">
          <header className="text-center pt-3">
            <img
              src="/aura_logo.svg"
              alt="Aura Logo"
              className="w-32 h-32 mx-auto mb-4 object-contain"
            />
            <p className="text-zinc-400 text-sm mt-1 tracking-tight leading-snug">
              Tactical Emergency Response &amp; GBV Protection Matrix
            </p>
            <span className="bg-zinc-900 text-zinc-500 text-xs px-3 py-1 rounded-full mt-4 inline-block">
              v1.0.0 • FNB App of the Year Edition
            </span>
          </header>

          <p className="text-zinc-300 text-sm leading-relaxed px-2 text-center mt-7">
            Aura is a next-generation civilian safety platform engineered to bridge the
            critical gap between vulnerable citizens and rapid law enforcement dispatch.
            Built with a zero-friction philosophy, Aura translates panic into actionable,
            categorized threat intelligence for tactical responders.
          </p>

          <section className="mt-7 space-y-3" aria-label="Aura's tactical pillars">
            {pillars.map(({ title, description, Icon, iconClassName }) => (
              <article
                key={title}
                className="bg-[#111111] rounded-2xl p-5 border border-white/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={iconClassName} size={20} />
                  <h3 className="text-sm font-semibold text-white tracking-tight leading-snug">
                    {title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed tracking-tight">
                  {description}
                </p>
              </article>
            ))}
          </section>

          <footer className="mt-auto pt-8 text-zinc-600 text-xs text-center leading-relaxed tracking-tight">
            Engineered in South Africa. Dedicated to community safety and the eradication
            of Gender-Based Violence.
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
