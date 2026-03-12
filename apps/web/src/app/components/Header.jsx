'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hides the global header on product pages (assuming they have their own local navbars)
  const hideHeader = pathname?.startsWith('/products/');

  useEffect(() => {
    if (hideHeader) return undefined;

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideHeader]);

  // Close mobile menu automatically if the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (hideHeader) return null;

  return (
    <header 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b ${
        isScrolled || isMobileMenuOpen
          ? 'bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.04)]' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          
          {/* BRAND LOGO - Premium Hover Effect */}
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-900 transition-transform duration-300 group-hover:scale-105 group-hover:bg-emerald-500">
                <span className="text-lg font-black text-white">1</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 transition-colors duration-300 group-hover:text-emerald-500">
                1Fi
              </span>
            </Link>
          </div>

          {/* DESKTOP LINKS */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/#catalog" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">
              Shop
            </Link>
            <Link href="/#support" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">
              Support
            </Link>
            <Link href="/#emi" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">
              EMI Plans
            </Link>
          </nav>

          {/* DESKTOP ICONS & CTA */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-5 md:flex">
              <button aria-label="Search" className="text-slate-400 transition-colors hover:text-slate-900">
                <Search className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <button aria-label="Account" className="text-slate-400 transition-colors hover:text-slate-900">
                <User className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <button aria-label="Cart" className="relative text-slate-400 transition-colors hover:text-slate-900">
                <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </button>
            </div>

            <Link 
              href="/#catalog"
              className="group hidden sm:inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
            >
              Buy Now
            </Link>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="block text-slate-900 md:hidden p-2 -mr-2 transition-transform duration-300 active:scale-90"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2.5} /> : <Menu className="h-6 w-6" strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU - Smooth Dropdown Animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-6 pt-2 sm:px-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-xl">
          <nav className="flex flex-col gap-4 pt-4 pb-6 border-b border-slate-100">
            <Link
              href="/#catalog"
              className="text-lg font-bold text-slate-900 transition-colors hover:text-emerald-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/#support"
              className="text-lg font-bold text-slate-900 transition-colors hover:text-emerald-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Support
            </Link>
            <Link
              href="/#emi"
              className="text-lg font-bold text-slate-900 transition-colors hover:text-emerald-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              EMI Plans
            </Link>
          </nav>
          
          <div className="flex items-center justify-between pt-6 pb-2">
            <div className="flex items-center gap-6">
              <button aria-label="Search" className="text-slate-500 hover:text-slate-900">
                <Search className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button aria-label="Account" className="text-slate-500 hover:text-slate-900">
                <User className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button aria-label="Cart" className="relative text-slate-500 hover:text-slate-900">
                <ShoppingBag className="h-6 w-6" strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </button>
            </div>
            
            <Link 
              href="/#catalog"
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white sm:hidden transition-colors hover:bg-emerald-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}