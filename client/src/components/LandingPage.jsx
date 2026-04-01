import React from 'react';
import { ArrowRight, Globe, PackageCheck, ShieldCheck, ShipWheel, Sparkles } from 'lucide-react';
import dashboardReference from '../assets/dashboard-reference.jpeg';
import { getAllCompanies, getAllProducts } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';
import { PublicLayout } from './ui';

function LandingPage({ currentUser, navigate }) {
  const products = getAllProducts().slice(0, 4);
  const companies = getAllCompanies().slice(0, 4);
  const heroBackgroundStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(10, 31, 56, 0.92) 0%, rgba(18, 53, 92, 0.82) 38%, rgba(29, 77, 134, 0.30) 100%), url(${dashboardReference})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const stats = [
    { label: 'Active Deals', value: '24' },
    { label: 'Bids Won', value: '8' },
    { label: 'Shipments In Transit', value: '12' },
  ];

  return (
    <PublicLayout currentUser={currentUser} navigate={navigate}>
      <section className="mt-1 overflow-hidden rounded-[32px] border border-[#c8d9ec] bg-white shadow-[0_28px_72px_rgba(15,23,42,0.10)]">
        <div className="relative" style={heroBackgroundStyle}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.00))]" />
          <div className="absolute right-[7%] top-[14%] h-40 w-40 rounded-full bg-white/10 blur-3xl floating-orb" />
          <div className="absolute right-[16%] bottom-[28%] h-24 w-24 rounded-full bg-sky-200/16 blur-2xl floating-orb-delayed" />
          <div className="relative px-6 py-2.5 lg:px-8 lg:py-2.5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100 backdrop-blur animate-in-up">
                <Sparkles className="h-3.5 w-3.5" />
                Visual Trade Workspace
              </div>
              <h1 className="mt-2.5 max-w-[15ch] font-display text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white animate-in-up animation-delay-1 sm:text-[2.65rem] lg:text-[3rem]">
                Shipping opportunities, product discovery, and deal execution in one polished trade platform.
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-5 text-sky-100/90 animate-in-up animation-delay-2 sm:text-[14px]">
                Explore verified products, discover suppliers, and move from RFQ to shipment tracking through a dashboard experience inspired by real logistics operations software.
              </p>

              <div className="mt-3.5 flex flex-wrap gap-3 animate-in-up animation-delay-3">
                <button
                  onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
                  className="rounded-2xl bg-white px-5 py-2.5 font-semibold text-[#173b67] shadow-[0_18px_40px_rgba(255,255,255,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(255,255,255,0.22)]"
                >
                  Enter Workspace
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="rounded-2xl border border-white/14 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/16"
                >
                  View Products
                </button>
              </div>

              <div className="mt-3.5 grid max-w-3xl gap-2 sm:grid-cols-3 animate-in-up animation-delay-4">
                {[
                  ['Verified companies', 'Trusted global sellers and buyers'],
                  ['Product-led sourcing', 'Start from listings, not forms'],
                  ['Shared deal workspace', 'Chat and execution after conversion'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[18px] border border-white/12 bg-white/10 px-4 py-1.5 backdrop-blur transition hover:bg-white/14">
                    <p className="text-[13px] font-semibold text-sky-50">{title}</p>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/78">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative px-6 pb-2.5 lg:px-8">
            <div className="grid gap-2 rounded-[22px] border border-[#d7e2ef] bg-white p-3 shadow-[0_18px_36px_rgba(15,23,42,0.12)] animate-in-up animation-delay-4 md:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[16px] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8fc_100%)] px-4 py-2 transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(15,23,42,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-[1.5rem] font-semibold tracking-[-0.03em] text-[#143a6a]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.38fr_0.62fr]">
        <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)] animate-in-up">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Why It Works</p>
              <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Built like a professional trade operations desk</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Verified parties', text: 'Trusted buyers, suppliers, shipping agents, and admin oversight in one ecosystem.' },
              { icon: PackageCheck, title: 'Product-first flow', text: 'Public discovery starts from products, then moves naturally into RFQs and deals.' },
              { icon: ShipWheel, title: 'Shipment visibility', text: 'Execution continues inside a shared workspace with clear stage progression.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[#dde6f1] bg-[linear-gradient(180deg,#ffffff_0%,#f7fafd_100%)] p-5 transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4d86,#2d6ab1)] text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#143a6a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)] animate-in-up animation-delay-1">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Platform Snapshot</p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Global reach</h2>
          </div>
          <div className="mt-5 space-y-4">
            {[
              { icon: Globe, label: 'Countries Served', value: '150+' },
              { icon: ShieldCheck, label: 'Verified Companies', value: `${companies.length}+` },
              { icon: PackageCheck, label: 'Public Products', value: `${products.length}+` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[20px] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9fc_100%)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#245c9d]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-600">{item.label}</span>
                </div>
                <span className="text-2xl font-semibold tracking-[-0.03em] text-[#143a6a]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 animate-in-up animation-delay-2" id="products">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Featured Products</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Products visible on the public home</h2>
          </div>
          <button onClick={() => navigate('/products')} className="hidden rounded-2xl bg-[linear-gradient(135deg,#1d4d86,#2b66ad)] px-4 py-2.5 text-sm font-semibold text-white md:block">
            Browse All
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const visual = getProductVisual(product.id);
            return (
              <article key={product.id} className="overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.10)]">
                <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${visual.accent} p-4`}>
                  <img src={visual.image} alt={visual.alt} className="h-full w-full rounded-[22px] object-cover" />
                  <div className="absolute left-8 top-8 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{product.origin}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-fit rounded-full bg-[#edf5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#245c9d]">{product.category}</div>
                    <span className="text-sm font-semibold text-[#143a6a]">{product.price}</span>
                  </div>
                  <h3 className="mt-4 text-[1.4rem] font-semibold tracking-[-0.02em] text-slate-950">{product.name}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">{product.supplierCompany}</p>
                  <button onClick={() => navigate(`/product/${product.id}`)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245c9d]">
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 animate-in-up animation-delay-3">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Verified Companies</p>
          <h2 className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Trusted partners on the platform</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {companies.map((company, index) => (
            <article key={company.id} className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
              <div className={`flex h-36 items-center justify-center rounded-[22px] ${index % 2 === 0 ? 'bg-[linear-gradient(135deg,#dbeafe,#f8fafc)]' : 'bg-[linear-gradient(135deg,#edf5ff,#f8fafc)]'}`}>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#245c9d]">{company.role.replace('_', ' ')}</div>
              </div>
              <h3 className="mt-4 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-950">{company.name}</h3>
              <p className="mt-1 text-sm font-medium uppercase tracking-[0.08em] text-slate-500">{company.location}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export default LandingPage;
