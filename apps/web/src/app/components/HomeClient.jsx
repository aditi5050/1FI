'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomeClient({ products = [], featuredImage }) {
  const loopProducts = [...products, ...products, ...products, ...products, ...products];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          /* CHANGED: Speed reduced to 1/4th (140s instead of 35s) for a majestic, slow glide */
          animation: infinite-scroll 140s linear infinite;
          width: max-content;
          will-change: transform;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(#e1e4e8 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* CHANGED: Added a slower, cinematic fade-in so the text beautifully "appears" */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center px-4"
        >
          <h1 className="font-extrabold text-slate-900 tracking-tight leading-none text-[4rem] sm:text-[5.5rem] lg:text-[7rem]">
            Premium phones,
            <br />
            <span className="inline-block animate-gradient-x bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-clip-text text-transparent mt-2 pb-4">
              easy EMI.
            </span>
          </h1>
        </motion.div>
      </section>

      {/* CAROUSEL SECTION */}
      <section id="catalog" className="py-4 bg-[#fafafa] overflow-hidden">
        <div className="relative w-full">
          
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

          <div className="flex animate-infinite-scroll gap-6 px-6 sm:gap-8">
            {loopProducts.map((product, index) => {
              const uniqueKey = `${product._id?.toString() || product.slug}-${index}`;
              const startingEmi = Math.round((product.price || 0) / 12);

              return (
                <Link key={uniqueKey} href={`/products/${product.slug}`} className="group block shrink-0">
                  <div className="w-[310px] sm:w-[330px] h-full flex flex-col bg-white rounded-[2.5rem] p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2">
                    
                    <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-[2rem] bg-[#f8f9fa] flex items-center justify-center p-8 transition-colors duration-500 group-hover:bg-emerald-50/40">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent_70%)]" />
                      <img
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name}
                        className="relative z-10 w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    </div>
                    
                    <div className="flex flex-col flex-grow px-4 pb-3 text-left">
                      <h3 className="text-[1.35rem] font-extrabold text-slate-900 tracking-tight">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-1">
                        {product.description || 'Premium smartphone'}
                      </p>
                      
                      <div className="mt-6 mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 tracking-tighter">
                            ₹{product.price?.toLocaleString('en-IN') || '0'}
                          </span>
                          {product.mrp && (
                            <span className="text-sm font-semibold text-slate-400 line-through">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-bold text-emerald-500">
                          From ₹{startingEmi.toLocaleString('en-IN')}/mo
                        </p>
                      </div>

                      <div className="mt-auto w-full py-4 bg-slate-900 text-white rounded-full text-sm font-bold text-center transition-all duration-300 group-hover:bg-emerald-500 group-hover:shadow-[0_8px_20px_rgba(16,185,129,0.25)]">
                        View Details
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* MINIMALIST FOOTER */}
      <footer id="support" className="bg-white border-t border-slate-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <span className="text-white font-black text-lg">1</span>
                </div>
                <span className="font-black tracking-tight text-2xl text-slate-900">1Fi</span>
              </div>
              <p className="text-base text-slate-500 max-w-sm font-medium">
                Premium phones on easy EMI. Transparent pricing, instant approval.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Shop</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#catalog" className="hover:text-emerald-500 transition-colors">All Phones</a></li>
                <li><a href="#catalog" className="hover:text-emerald-500 transition-colors">EMI Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between text-sm font-medium text-slate-400">
            <p>© {new Date().getFullYear()} 1Fi. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}