"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Wrench, Lightbulb, Hammer, ArrowLeft } from "lucide-react";

const cards = [
  {
    href: "/products",
    icon: ShoppingBag,
    gradient: "from-blue-500 to-blue-700",
    glow: "rgba(59,130,246,0.15)",
    accent: "#3b82f6",
    title: "منتجات رقمية",
    desc: "دورات وكتب رقمية تساعدك على النمو وتطوير مهاراتك المهنية",
    label: "تصفح المنتجات",
    num: "01",
  },
  {
    href: "/services",
    icon: Wrench,
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.15)",
    accent: "#f59e0b",
    title: "الخدمات",
    desc: "خدمات احترافية متنوعة تناسب احتياجات مشروعك وتساعده على النمو",
    label: "تصفح الخدمات",
    num: "02",
  },
  {
    href: "/tools",
    icon: Hammer,
    gradient: "from-teal-500 to-emerald-600",
    glow: "rgba(20,184,166,0.15)",
    accent: "#14b8a6",
    title: "الأدوات",
    desc: "أدوات مجانية مختارة بعناية تساعدك في عملك وتوفر وقتك وجهدك",
    label: "تصفح الأدوات",
    num: "03",
  },
  {
    href: "/suggest",
    icon: Lightbulb,
    gradient: "from-purple-500 to-violet-600",
    glow: "rgba(139,92,246,0.15)",
    accent: "#8b5cf6",
    title: "اقتراحات وشكاوي",
    desc: "عندك فكرة أو مشكلة؟ شاركنا وسنعمل على تحسين تجربتك",
    label: "أرسل اقتراحاً",
    num: "04",
  },
];

export default function HomeCardsSection() {
  return (
    <section className="py-24 px-6 mesh-bg">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">كيف أقدر أساعدك؟</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">اختر ما يناسبك وابدأ رحلتك</p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={card.href} className="block group">
                <div
                  className="relative glass neon-glow glow-card rounded-3xl p-8 h-full transition-all duration-500 group-hover:-translate-y-2 border border-blue-500/20"
                  style={{ "--glow": card.glow } as React.CSSProperties}
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                    style={{ background: card.glow }}
                  />

                  {/* Number */}
                  <span className="absolute top-6 left-6 text-5xl font-black opacity-5 select-none" style={{ color: card.accent }}>
                    {card.num}
                  </span>

                  <div className="flex flex-col h-full text-right">
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" style={{ color: card.accent }} />
                      </div>
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                        style={{ boxShadow: `0 8px 24px ${card.glow}` }}
                      >
                        <card.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-2xl font-black text-foreground mb-3">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-1 mb-6">{card.desc}</p>

                    {/* CTA */}
                    <div className="flex justify-end">
                      <span
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${card.gradient} text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 group-hover:shadow-lg`}
                        style={{ boxShadow: `0 0 0 ${card.glow}` }}
                      >
                        {card.label}
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
