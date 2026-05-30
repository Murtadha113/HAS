"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Sparkles } from "lucide-react";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
  </svg>
);

export default function SocialSection() {
  const [settings, setSettings] = useState<{
    instagramUrl?: string;
    instagramHandle?: string;
    tiktokUrl?: string;
    tiktokHandle?: string;
  }>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "settings"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return unsub;
  }, []);

  const socials = [
    {
      label: "انستقرام",
      handle: settings.instagramHandle || "7asan_jami",
      url: settings.instagramUrl || "https://www.instagram.com/7asan_jami",
      icon: InstagramIcon,
      iconBg: "bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400",
      badge: "محتوى يومي",
      desc: "تابعني للمحتوى اليومي والنصائح",
    },
    {
      label: "تيك توك",
      handle: settings.tiktokHandle || "@7snjami",
      url: settings.tiktokUrl || "https://www.tiktok.com/@7snjami",
      icon: TikTokIcon,
      iconBg: "bg-gradient-to-br from-slate-700 to-slate-900",
      badge: "فيديوهات قصيرة",
      desc: "فيديوهات وأفكار قصيرة ومفيدة",
    },
  ];

  return (
    <section id="social-section" className="py-20 px-6 mesh-bg">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-bold text-sm tracking-widest mb-2 uppercase">تواصل معي</p>
          <h2 className="text-4xl md:text-5xl font-black text-foreground">تابعني</h2>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {socials.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass neon-glow glow-card rounded-3xl p-7 flex flex-col items-center text-center gap-4 transition-all duration-300 cursor-pointer group border border-blue-500/20"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className={`w-20 h-20 rounded-2xl ${s.iconBg} flex items-center justify-center text-white shadow-xl shadow-blue-500/30`}
              >
                <s.icon />
              </motion.div>

              {/* Info */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-black text-foreground">{s.handle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass neon-glow text-sm font-bold text-foreground mt-1 border border-blue-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {s.badge}
              </motion.div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
