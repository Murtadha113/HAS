"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/products", label: "منتجات رقمية" },
    { href: "/services", label: "الخدمات" },
    { href: "/suggest", label: "اقتراح / مشكلة" },
  ];

  const scrollToContact = () => {
    const socialSection = document.getElementById('social-section');
    if (socialSection) {
      socialSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass neon-glow rounded-2xl px-6 py-4 border border-blue-500/20">
        {/* Logo - Removed the number 7 icon */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xl font-black text-foreground tracking-tight">7snjami</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                pathname === link.href
                  ? "bg-primary text-white shadow-lg shadow-blue-500/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={scrollToContact}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all hover:scale-105"
          >
            دعنا نتحدث
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-xl glass neon-glow flex items-center justify-center border border-blue-500/20"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-20 left-4 right-4 glass neon-glow rounded-2xl p-4 space-y-2 border border-blue-500/20"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                pathname === link.href
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button 
            onClick={scrollToContact}
            className="w-full text-right px-4 py-3 rounded-lg text-sm font-semibold text-primary bg-primary/10"
          >
            دعنا نتحدث
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
