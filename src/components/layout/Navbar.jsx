import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Buy Containers', path: '/inventory' },
  { label: 'How It Works', path: '/#how-it-works' },
  { label: 'About', path: '/about' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-accent/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <span className="text-primary-foreground font-mono font-black text-sm">CX</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-black text-lg tracking-tight leading-none">CONTAINERS</span>
              <span className="text-primary font-black text-lg tracking-tight leading-none ml-1.5">EXCHANGE</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all hover:bg-white/[0.08] hover:text-white ${
                  location.pathname === link.path ? 'text-white bg-white/[0.08]' : 'text-white/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+18005551234" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
              <Phone className="w-4 h-4" />
              <span className="font-mono">(800) 555-1234</span>
            </a>
            <Link to="/inventory">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 text-sm px-5">
                Get Pricing
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/[0.08] transition-all"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-accent/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-4 py-5 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-white/70 hover:text-white hover:bg-white/[0.08] font-medium text-sm py-3 px-3 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/[0.06] mt-3 space-y-3">
              <a href="tel:+18005551234" className="flex items-center gap-2 text-primary font-mono text-sm px-3 py-2">
                <Phone className="w-4 h-4" />
                (800) 555-1234
              </a>
              <Link to="/inventory" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg h-12">
                  Get Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}