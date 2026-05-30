"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Wrench, ArrowLeft } from "lucide-react";

export default function HomeBoxesSection() {
  return (
    <section className="py-6 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-5">
          {/* بوكس المنتجات الرقمية */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="glass rounded-3xl p-7 group cursor-pointer"
          >
            <div className="flex flex-col h-full text-right">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center mb-5">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">منتجات رقمية</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                دورات، أدوات، ومحتوى رقمي احترافي يساعدك على النمو وتطوير مهاراتك
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 self-end group"
              >
                منتجات رقمية
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* بوكس الخدمات */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="glass rounded-3xl p-7 group cursor-pointer"
          >
            <div className="flex flex-col h-full text-right">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-5">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">الخدمات</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                خدمات احترافية متنوعة من إعلانات وتصميم وأكثر، تناسب احتياجات مشروعك
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 self-end group"
              >
                خدمات
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
