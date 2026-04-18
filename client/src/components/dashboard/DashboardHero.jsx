/**
 * DashboardHero.jsx
 * The dark full-width hero banner with role-based title, subtitle,
 * and the three metric tiles (Products / RFQs / Deals etc).
 */
import React from 'react';
import { ArrowRight, BadgeDollarSign, Boxes, FolderKanban, ShipWheel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const TILE_ICONS = [Boxes, FolderKanban, null]; // third icon determined by role

export default function DashboardHero({ tiles }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log(user)

  const thirdIcon = user?.roles?.includes('shipping_agent') ? ShipWheel : BadgeDollarSign;
  const tileIcons = [Boxes, FolderKanban, thirdIcon];

  const title =
    user?.roles?.includes('shipping_agent')
      ? 'Transport Command Center'
      : user?.roles?.includes('supplier')
        ? 'Supplier Opportunities'
        : user?.roles?.includes('admin')
          ? 'Platform Operations'
          : 'Trade Opportunities';

  const subtitle =
    user?.roles?.includes('shipping_agent')
      ? 'Place freight bids on newly approved deals, convert awarded tenders into shipments, and keep execution visible in one logistics workspace.'
      : 'Monitor active opportunities, move RFQs into execution, and coordinate freight bidding before shipment starts.';

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-300/40 shadow-xl">
      <div className="relative bg-[#0c1f38]">
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2400"
          alt="Trade operations dashboard banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />

        <div className="relative flex flex-col gap-8 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          {/* Left — title & description */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200 backdrop-blur-sm">
              Live Workspace
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white xl:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-sky-100/90">{subtitle}</p>
          </div>

          {/* Right — metric tiles */}
          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-[620px] lg:shrink-0">
            {tiles.map((tile, index) => {
              const Icon = tileIcons[index] || Boxes;
              return (
                <button
                  key={tile.label}
                  onClick={() => navigate(tile.action)}
                  className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 text-left text-white shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sky-500/20 shadow-inner">
                    <Icon className="h-5 w-5 text-sky-300" />
                  </div>
                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/70">{tile.label}</p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <p className="text-3xl font-bold tracking-tight">{tile.value}</p>
                      <ArrowRight className="h-4 w-4 text-sky-400 opacity-60" />
                    </div>
                    <p className="mt-1 text-[10px] text-sky-200/50">{tile.note}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
