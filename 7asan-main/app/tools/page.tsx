"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { type Tool } from "@/lib/store";
import { Hammer, ExternalLink, Loader2 } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "tools"), where("active", "==", true), orderBy("order")),
      (snap) => { setTools(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Tool[]); setLoading(false); }
    );
    return unsub;
  }, []);

  const categories = ["all", ...Array.from(new Set(tools.map((t) => t.category).filter((c): c is string => Boolean(c))))];
  const filtered = activeCategory === "all" ? tools : tools.filter((t) => t.category === activeCategory);

  return (
    <>
      <BackButton />
      <main className="min-h-screen pb-20 mesh-bg">
        <div className="max-w-5xl mx-auto px-6 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-teal-500 font-bold text-sm tracking-widest mb-2 uppercase">مجانية 100%</p>
            <h1 className="text-5xl font-black text-foreground mb-3">الأدوات</h1>
            <p className="text-muted-foreground text-lg">أدوات مختارة بعناية تساعدك في عملك</p>
          </motion.div>

          {/* Category tabs */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20" : "glass text-foreground hover:-translate-y-0.5"}`}>
                  {cat === "all" ? "الكل" : cat}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-teal-500/10 flex items-center justify-center mx-auto mb-6">
                <Hammer className="w-10 h-10 text-teal-400" />
              </div>
              <p className="text-muted-foreground text-lg">قريباً</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((tool, i) => (
                <motion.a key={tool.id} href={tool.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="group block">
                  <div className="glass glow-card rounded-3xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-teal-500/10 h-full">
                    <div className="h-44 bg-gradient-to-br from-teal-500/10 to-emerald-600/10 relative overflow-hidden">
                      {tool.imageUrl
                        ? <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                              <Hammer className="w-7 h-7 text-white" />
                            </div>
                          </div>
                      }
                      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center shadow">
                          <ExternalLink className="w-4 h-4 text-teal-600" />
                        </div>
                      </div>
                      {tool.category && (
                        <div className="absolute top-3 right-3">
                          <span className="glass px-3 py-1 rounded-full text-xs font-bold text-teal-700">{tool.category}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 text-right">
                      <h3 className="text-lg font-black text-foreground mb-1.5">{tool.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{tool.description}</p>
                      <div className="flex items-center justify-end gap-1.5 text-teal-500 text-xs font-bold">
                        <span>افتح الأداة</span><ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
