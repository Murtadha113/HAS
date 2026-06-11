"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Megaphone, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { type AdPackage } from "@/lib/store";

export default function HomeAdsSection() {
  const [packages, setPackages] = useState<AdPackage[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "packages"), where("active", "==", true)))
      .then((snap) => setPackages(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdPackage[]));
  }, []);

  if (packages.length === 0) return null;

  return (
    <section id="ads" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
            <Megaphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">باقات الإعلانات</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">وصّل مشروعك للناس</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">باقات إعلانية احترافية تناسب كل حجم وميزانية</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg, index) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: index * 0.1 }}
              className={`relative glass rounded-3xl p-8 ${pkg.highlighted ? "ring-2 ring-primary shadow-xl shadow-primary/20" : ""}`}>
              {pkg.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> الأكثر طلباً
                  </span>
                </div>
              )}
              <div className="text-right mb-6">
                <h3 className="text-2xl font-black text-foreground mb-2">{pkg.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                <div className="text-4xl font-black text-primary">
                  {pkg.price} <span className="text-lg font-medium text-muted-foreground">BHD</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-right">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mr-auto" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/ads?package=${pkg.id}`}
                className={`block text-center py-3 px-6 rounded-2xl font-bold transition-all duration-300 ${
                  pkg.highlighted
                    ? "bg-gradient-to-r from-primary to-blue-700 text-white hover:shadow-lg hover:shadow-primary/30"
                    : "glass text-foreground hover:bg-white/80"
                }`}>
                اختر هذه الباقة
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link href="/ads" className="inline-flex items-center gap-2 glass px-8 py-4 rounded-2xl font-bold text-foreground hover:bg-white/80 transition-all duration-300">
            استعرض جميع الباقات <ArrowLeft className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
