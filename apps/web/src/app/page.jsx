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

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-base font-semibold text-slate-950 shadow-[0_18px_42px_rgba(34,211,238,0.35)]">
              1Fi
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                1Fi Phone Store
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                Modern phones · EMI ready
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <a className="text-sm font-semibold text-slate-200 transition hover:text-white" href="#catalog">Shop</a>
            <a className="text-sm font-semibold text-slate-200 transition hover:text-white" href="#support">Support</a>
            <span className="h-6 w-px bg-white/15" />
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/25 hover:bg-white/12"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              Check eligibility
            </a>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 md:pt-16">
        {/* Promo + Product grid */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/6 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-8 h-40 w-40 rounded-full bg-cyan-400/12 blur-3xl" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-cyan-100">Fresh this week</p>
                <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
                  Phones that feel premium. Checkout that feels instant.
                </h1>
                <p className="max-w-2xl text-[15px] text-slate-200 sm:text-[16px]">
                  EMI-ready prices in one glance, secure payments, and doorstep delivery. Scroll down to shop the full lineup.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="shimmer-text rounded-full px-4 py-2 text-sm font-semibold">
                  <span className="text-slate-950">Animated</span> pricing clarity
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[12px] font-semibold text-white">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
                  Now shipping nationwide
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product grid */}
        <section id="catalog" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Catalog</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-[44px]">
                All phones
              </h2>
            </div>
            <p className="text-sm text-slate-300">
              {products.length} devices · curated for speed, cameras, and battery
            </p>
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
            {products.map((product) => (
              <Link
                key={product._id.toString()}
                href={`/products/${product.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[22px] border border-white/12 bg-white/6 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-200/60 hover:shadow-[0_32px_90px_rgba(34,211,238,0.35)]"
              >
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 via-white/6 to-white/4 px-5 pt-10 pb-7">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.2),transparent_55%)]" />
                  <div className="relative flex h-60 items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.07]"
                    />
                  </div>
                  <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-[11px] text-slate-100">
                    <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1">Instant EMI</span>
                    <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1">Fast delivery</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[15px] text-slate-200">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[22px] font-semibold text-white sm:text-2xl">
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

                    <span className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-200 px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_55px_rgba(52,211,153,0.5)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_24px_80px_rgba(52,211,153,0.65)]">
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