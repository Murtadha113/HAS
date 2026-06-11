"use client";

import { motion } from "framer-motion";
import { Code, Palette, Megaphone, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Code,
    title: "تطوير المواقع",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Palette,
    title: "التصميم الإبداعي",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Megaphone,
    title: "التسويق الرقمي",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "تحليل البيانات",
    color: "from-green-500 to-emerald-600",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 px-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-medium text-foreground">خدماتنا</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            ماذا نقدم لك؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            حلول متكاملة تناسب احتياجاتك
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass rounded-3xl p-6 cursor-pointer group"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {service.title}
              </h3>
              <div className="w-8 h-1 bg-gradient-to-r from-primary to-blue-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
