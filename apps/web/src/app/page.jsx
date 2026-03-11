import Link from 'next/link';
import dbConnect from '../lib/mongoose';
import Product from '../models/Product';

export default async function HomePage() {
  await dbConnect();
  const products = await Product.find({}).lean();
  const featuredProduct = products[0];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#eef2f7)]">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-sm">
              1Fi
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                1Fi Phone Store
              </span>
              <span className="text-xs text-slate-500">
                Premium smartphones, simple EMIs
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Powered by 1Fi
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:pt-16">
        {/* Hero */}
        <section className="mb-14 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center lg:gap-16">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[13px] font-medium text-emerald-800 ring-1 ring-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Smart EMI-enabled checkout
            </p>
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
                Phones that feel
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  {' '}
                  premium.
                </span>
                <br className="hidden sm:block" />
                Payments that feel easy.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500 md:text-[16px]">
                A curated lineup of flagship and everyday devices, with
                transparent pricing and flexible EMIs built right into the
                checkout. No hidden charges, ever.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 text-[15px] font-semibold text-white shadow-[0_18px_45px_rgba(16,185,129,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(16,185,129,0.65)]">
                Browse all phones
              </button>
              <button className="inline-flex h-12 items-center justify-center rounded-xl bg-white/70 px-5 text-[15px] font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition-all duration-200 hover:bg-white hover:ring-slate-300">
                Learn about 1Fi EMI
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-[12px] text-slate-500">
              <span>0% or low-cost EMIs</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Instant credit decision</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>No documentation at store</span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.75)]">
              <div className="flex items-start justify-between gap-4 pb-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-300/90">
                    Preview device
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {featuredProduct?.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    From ₹
                    {featuredProduct
                      ? Math.round(
                          (featuredProduct.price || 0) / 12
                        ).toLocaleString('en-IN')
                      : '—'}
                    /mo with 1Fi EMI
                  </p>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                  Live demo
                </div>
              </div>
              <div className="relative mt-1 flex h-64 items-center justify-center sm:h-72">
                <div className="absolute inset-8 rounded-[2.2rem] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_55%)] blur-xl" />
                {featuredProduct?.images?.[0] && (
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="relative z-[1] max-h-full max-w-full object-contain drop-shadow-[0_22px_55px_rgba(15,23,42,0.9)] transition-transform duration-500 hover:scale-[1.03]"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Product grid */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              All phones
            </h2>
            <p className="text-[12px] text-slate-500">
              {products.length} devices • curated for performance, camera, and value
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product._id.toString()}
                href={`/products/${product.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[20px] bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_80px_rgba(15,23,42,0.12)] sm:p-6"
              >
                <div className="relative mb-5 overflow-hidden rounded-2xl bg-slate-50/80 px-4 pt-7 pb-6 sm:px-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_60%)]" />
                  <div className="relative flex h-52 items-center justify-center sm:h-56">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[13px] text-slate-500 sm:text-sm">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-slate-900 sm:text-2xl">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && (
                          <span className="text-sm text-slate-400 line-through">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-emerald-700 sm:text-[13px]">
                        From ₹{Math.round(product.price / 12).toLocaleString('en-IN')}/mo
                        on 1Fi EMI
                      </p>
                    </div>

                    <span className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:brightness-110 sm:px-6">
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