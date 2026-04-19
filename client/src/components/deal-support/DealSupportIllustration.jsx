import React from 'react';
import { BarChart3, FileText, ShieldCheck } from 'lucide-react';

function FloatingTile({ className, children }) {
  return (
    <div className={`absolute rounded-[18px] border border-white/60 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export default function DealSupportIllustration() {
  return (
    <div className="relative mx-auto h-[170px] w-full max-w-[240px] overflow-hidden sm:h-[180px] lg:h-[185px]">
      <div className="absolute inset-0 scale-[0.62] origin-top">
        <div className="absolute inset-x-10 top-12 h-44 rounded-[42px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96),rgba(243,247,252,0.98))] shadow-[0_28px_70px_rgba(15,23,42,0.08)]" />
        <div className="absolute left-1/2 top-[44%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(36,92,157,0.11),rgba(36,92,157,0.02)_64%,transparent_70%)] blur-sm" />

        <FloatingTile className="left-6 top-16 flex h-16 w-20 items-center justify-center">
          <ShieldCheck className="h-9 w-9 text-[#5c9e9a]" />
        </FloatingTile>
        <FloatingTile className="left-24 top-3 flex h-16 w-16 items-center justify-center">
          <FileText className="h-8 w-8 text-slate-500" />
        </FloatingTile>
        <FloatingTile className="right-8 top-20 flex h-[72px] w-[80px] items-center justify-center px-4 py-3">
          <BarChart3 className="h-10 w-10 text-[#6f96d2]" />
        </FloatingTile>
        <FloatingTile className="right-2 top-1/2 flex h-16 w-[72px] items-center justify-center px-4 py-3">
          <FileText className="h-8 w-8 text-slate-500" />
        </FloatingTile>

        <div className="absolute left-1/2 top-[52%] w-[170px] -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[210px]">
            <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full bg-[#293047] shadow-[0_16px_30px_rgba(15,23,42,0.22)]" />
            <div className="absolute left-1/2 top-10 h-10 w-12 -translate-x-1/2 rounded-b-[24px] rounded-t-[8px] bg-[#f0c9b4]" />
            <div className="absolute left-1/2 top-8 h-[72px] w-24 -translate-x-1/2 rounded-[42px] border-[5px] border-[#293047] border-t-transparent bg-transparent" />
            <div className="absolute left-1/2 top-[60px] h-24 w-24 -translate-x-1/2 rounded-[36px] bg-[linear-gradient(180deg,#25395d_0%,#1d2f4c_100%)] shadow-[0_18px_32px_rgba(15,23,42,0.2)]" />
            <div className="absolute left-[calc(50%-62px)] top-[76px] h-24 w-20 rotate-[-18deg] rounded-[28px] bg-[linear-gradient(180deg,#2b3f64_0%,#1f2f4f_100%)]" />
            <div className="absolute left-[calc(50%+20px)] top-[82px] h-24 w-20 rotate-[13deg] rounded-[28px] bg-[linear-gradient(180deg,#2b3f64_0%,#1f2f4f_100%)]" />
            <div className="absolute left-1/2 top-[110px] h-16 w-10 -translate-x-1/2 rounded-[12px] bg-[#f0c9b4]" />
            <div className="absolute left-[calc(50%-80px)] top-[112px] h-14 w-14 -rotate-12 rounded-[18px] bg-[#1f2f4f] shadow-[0_8px_18px_rgba(15,23,42,0.12)]" />
            <div className="absolute left-[calc(50%-84px)] top-[122px] h-4 w-18 rounded-full bg-[#f0c9b4]" />
            <div className="absolute left-[calc(50%-62px)] top-[146px] h-28 w-18 rounded-t-[32px] bg-[#d8e7f7]" />
            <div className="absolute left-[calc(50%-72px)] top-[140px] h-24 w-24 rounded-[28px] bg-[#1f2f4f]" />
            <div className="absolute left-[calc(50%+10px)] top-[146px] h-28 w-18 rounded-t-[32px] bg-[#d8e7f7]" />
            <div className="absolute left-[calc(50%+56px)] top-[122px] h-28 w-16 rounded-[28px] bg-[#1f2f4f]" />
            <div className="absolute right-[calc(50%-82px)] top-[116px] h-20 w-12 rotate-[-10deg] rounded-[18px] bg-[#f0c9b4]" />
          </div>
        </div>

        <FloatingTile className="left-3 bottom-10 flex h-14 w-14 items-center justify-center">
          <div className="grid grid-cols-2 gap-1.5">
            <span className="h-3.5 w-3.5 rounded-sm bg-[#c4d8f3]" />
            <span className="h-3.5 w-3.5 rounded-sm bg-[#91b3df]" />
            <span className="h-3.5 w-3.5 rounded-sm bg-[#7fb8ad]" />
            <span className="h-3.5 w-3.5 rounded-sm bg-[#dfe8f3]" />
          </div>
        </FloatingTile>
        <FloatingTile className="right-0 bottom-16 flex h-14 w-14 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-[#95b7e0] border-r-transparent" />
        </FloatingTile>
      </div>
    </div>
  );
}
