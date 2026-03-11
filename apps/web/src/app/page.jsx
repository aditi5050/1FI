import Link from 'next/link';
import dbConnect from '../lib/mongoose';
import Product from '../models/Product';

export default async function HomePage() {
  await dbConnect();
  const products = await Product.find({}).lean();
  const featuredProduct = products[0];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(244,114,182,0.14),transparent_22%)]" />
        <div className="absolute left-1/2 top-10 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/8 via-cyan-400/12 to-indigo-500/6 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-base font-semibold text-slate-950 shadow-[0_16px_40px_rgba(14,165,233,0.35)]">
              1Fi
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                1Fi Phone Store
              </span>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Modern devices + effortless EMI
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
              Powered by 1Fi
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 md:pt-16">
        {/* Hero */}
        <section className="mb-16 grid gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] md:items-center lg:gap-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-cyan-100 shadow-[0_12px_40px_rgba(14,165,233,0.24)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Instant EMI eligibility • Live in-store
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-[58px]">
                Ultra-modern phones, ultra-flexible payments.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
                Discover the latest flagships and hero mid-rangers with transparent pricing,
                flexible EMIs, and approvals in seconds. No paperwork, just pick your device and go.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300 px-7 text-base font-semibold text-slate-950 shadow-[0_20px_60px_rgba(52,211,153,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(52,211,153,0.6)]">
                Browse all phones
              </button>
              <button className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10">
                How 1Fi EMI works
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[{ label: '0% or low-cost EMIs', accent: 'emerald' }, { label: 'Instant credit decision', accent: 'cyan' }, { label: 'No in-store paperwork', accent: 'indigo' }].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.accent === 'emerald'
                        ? 'bg-emerald-400'
                        : item.accent === 'cyan'
                        ? 'bg-cyan-300'
                        : 'bg-indigo-300'
                    }`}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-10 rounded-[2.8rem] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_55%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(130deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                    Live preview
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {featuredProduct?.name ?? 'Select a device'}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    From ₹
                    {featuredProduct
                      ? Math.round((featuredProduct.price || 0) / 12).toLocaleString('en-IN')
                      : '—'}
                    /mo with 1Fi EMI
                  </p>
                </div>
                <div className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[12px] font-semibold text-emerald-100">
                  Live demo
                </div>
              </div>
              <div className="relative mt-2 flex h-72 items-center justify-center overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-900/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.24),transparent_40%),radial-gradient(circle_at_70%_10%,rgba(52,211,153,0.22),transparent_35%)] blur-2xl" />
                {featuredProduct?.images?.[0] ? (
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="relative z-[1] max-h-full max-w-full object-contain drop-shadow-[0_26px_65px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-[1.04]"
                  />
                ) : (
                  <div className="relative z-[1] text-sm text-slate-400">No preview available</div>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-300 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Fast approvals</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Transparent pricing</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Easy upgrades</div>
              </div>
            </div>
          </div>
        </section>

        {/* Product grid */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Catalog</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                All phones
              </h2>
            </div>
            <p className="text-[13px] text-slate-400">
              {products.length} devices · optimized for performance, camera, and value
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product._id.toString()}
                href={`/products/${product.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
              >
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-b from-white/8 via-white/5 to-white/3 px-5 pt-8 pb-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_55%)]" />
                  <div className="relative flex h-56 items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-[11px] text-slate-200">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Instant EMI</span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Fast delivery</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[14px] text-slate-300">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-white">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && (
                          <span className="text-sm text-slate-500 line-through">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-emerald-200">
                        From ₹{Math.round(product.price / 12).toLocaleString('en-IN')}/mo on 1Fi EMI
                      </p>
                    </div>

                    <span className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_14px_38px_rgba(52,211,153,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_60px_rgba(52,211,153,0.6)]">
                      View details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}