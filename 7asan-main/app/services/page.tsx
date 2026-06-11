"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { type Service, type ServiceCategory } from "@/lib/store";
import { ArrowLeft, Wrench, Loader2 } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubServices = onSnapshot(query(collection(db, "services"), where("active", "==", true)),
      (snap) => { setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Service[]); setLoading(false); });
    const unsubCats = onSnapshot(query(collection(db, "serviceCategories"), orderBy("order")),
      (snap) => { setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ServiceCategory[]); });
    return () => { unsubServices(); unsubCats(); };
  }, []);

  const filtered = activeTab === "all" ? services : services.filter((s) => s.categoryId === activeTab);

  return (
    <>
      <BackButton />
      <main className="min-h-screen pt-28 pb-20 px-6 mesh-bg">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-right mb-12">
            <p className="text-amber-500 font-bold text-sm tracking-widest mb-2 uppercase">خدماتي</p>
            <h1 className="text-5xl font-black text-foreground">الخدمات</h1>
          </motion.div>

          {/* Tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 justify-end">
              <button onClick={() => setActiveTab("all")}
                className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all ${activeTab === "all" ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20" : "glass text-foreground hover:-translate-y-0.5"}`}>
                الكل
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setActiveTab(c.id)}
                  className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all ${activeTab === c.id ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20" : "glass text-foreground hover:-translate-y-0.5"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-muted-foreground">لا توجد خدمات في هذا القسم</p>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((service, i) => (
                <motion.div key={service.id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="group">
                  <Link href={`/services/${service.id}`}>
                    <div className="glass glow-card rounded-3xl p-7 h-full transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-amber-500/10 text-right">
                      <div className="flex items-start justify-between mb-5">
                        <ArrowLeft className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-x-1" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                          <Wrench className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-foreground mb-2">{service.title}</h3>
                      {service.description && <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-2">{service.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-xs glass px-3 py-1 rounded-full text-muted-foreground">
                          {service.deliveryTime || "يُحدد لاحقاً"}
                        </span>
                        <p className="text-2xl font-black text-amber-500">{service.price} BHD</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
