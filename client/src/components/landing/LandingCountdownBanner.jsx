import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock3, BellRing, ShieldCheck } from 'lucide-react';

const DEFAULT_STORAGE_KEY = 'landing-countdown-deadline-v1';
const DEFAULT_DURATION_HOURS = 20;

function getOrCreateDeadline(storageKey, durationHours) {
  const fallback = Date.now() + durationHours * 60 * 60 * 1000;

  if (typeof window === 'undefined') return fallback;

  try {
    const existing = window.localStorage.getItem(storageKey);
    const parsed = existing ? Number(existing) : NaN;
    if (Number.isFinite(parsed) && parsed > Date.now()) return parsed;

    const nextDeadline = Date.now() + durationHours * 60 * 60 * 1000;
    window.localStorage.setItem(storageKey, String(nextDeadline));
    return nextDeadline;
  } catch {
    return fallback;
  }
}

function formatTimeLeft(ms) {
  const safeMs = Math.max(ms, 0);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    expired: safeMs <= 0,
  };
}

function TimeTile({ value, label }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-5 sm:py-4">
      <div className="text-[2.35rem] font-black leading-none tracking-tight text-white tabular-nums sm:text-[2.95rem] lg:text-[3.15rem]">
        {value}
      </div>
      <div className="mt-1 text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/80 sm:text-[10px]">
        {label}
      </div>
    </div>
  );
}

export default function LandingCountdownBanner({
  title = 'Limited export window',
  message = 'A fresh batch of featured products is being highlighted for a short time only.',
  storageKey = DEFAULT_STORAGE_KEY,
  durationHours = DEFAULT_DURATION_HOURS,
  posterImages = [],
}) {
  const [deadline] = useState(() => getOrCreateDeadline(storageKey, durationHours));
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(deadline - Date.now()));

  useEffect(() => {
    const tick = () => setTimeLeft(formatTimeLeft(deadline - Date.now()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [deadline]);

  const displayHours = Math.max(0, timeLeft.hours);
  const displayMinutes = String(timeLeft.minutes).padStart(2, '0');
  const displaySeconds = String(timeLeft.seconds).padStart(2, '0');
  const leadingNumber = timeLeft.expired ? '00' : String(displayHours).padStart(2, '0');

  return (
    <section className="ml-auto w-full max-w-[1000px] px-0">
      <div className="relative overflow-hidden rounded-[34px] border border-[#d7e4f3] bg-[linear-gradient(135deg,#08192f_0%,#0b2442_40%,#143A6A_100%)] px-6 py-4.5 text-white shadow-[0_28px_80px_rgba(8,25,47,0.26)] sm:px-7 sm:py-5 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,169,61,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_26%)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative space-y-3.5">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.18)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200 backdrop-blur">
                <BellRing className="h-3.5 w-3.5" />
                20 hours left
              </div>
              <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-100">
                Live timer
              </div>
            </div>

            <div className="mt-3.5 flex items-end gap-3 sm:gap-4">
              <div className="flex-1 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] px-4 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-5 sm:py-4.5">
                <div className="text-[4rem] font-black leading-none tracking-tight text-white tabular-nums sm:text-[5.2rem] lg:text-[5.8rem]">
                  {leadingNumber}
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/80">
                  hours
                </div>
              </div>

              <div className="pb-4 text-[2.4rem] font-black leading-none text-white/75 sm:text-[3.2rem]">:</div>

              <div className="flex-1 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] px-4 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-5 sm:py-4.5">
                <div className="text-[4rem] font-black leading-none tracking-tight text-white tabular-nums sm:text-[5.2rem] lg:text-[5.8rem]">
                  {displayMinutes}
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/80">
                  minutes
                </div>
              </div>

              <div className="pb-4 text-[2.4rem] font-black leading-none text-white/75 sm:text-[3.2rem]">:</div>

              <div className="flex-1 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] px-4 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-5 sm:py-4.5">
                <div className="text-[4rem] font-black leading-none tracking-tight text-white tabular-nums sm:text-[5.2rem] lg:text-[5.8rem]">
                  {displaySeconds}
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/80">
                  seconds
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-200/85">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Clock3 className="h-3.5 w-3.5 text-amber-200" />
                Auto-updates every second
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Priority products highlighted on the landing page
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-3.5 shadow-[0_24px_50px_rgba(0,0,0,0.2)] backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/90">Alert poster</p>
                <p className="mt-1 text-[15px] font-bold text-white">Same platform theme, export-ready products</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-100">
                Deadline live
              </div>
            </div>

              <div className="grid grid-cols-3 gap-2">
                {posterImages.slice(0, 6).map((image, index) => (
                  <div
                    key={`${image.src}-${index}`}
                    className={`overflow-hidden rounded-[16px] border border-white/10 bg-slate-900 ${index === 0 ? 'col-span-2 row-span-2 min-h-[150px]' : 'min-h-[72px]'}`}
                  >
                    <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[#0A2540]/70 px-4 py-3">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300/80">Countdown snapshot</div>
                <div className="mt-1 text-[15px] font-bold text-white tabular-nums sm:text-[17px]">
                  {leadingNumber}:{displayMinutes}:{displaySeconds}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/90">Status</div>
                <div className="mt-1 text-sm font-bold text-white">{timeLeft.expired ? 'Expired' : 'Active'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
