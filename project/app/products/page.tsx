"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { type Product, type Category } from "@/lib/store";
import { BookOpen, Play, ArrowLeft, ShoppingBag, Search } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, "products"), where("active", "==", true)),
      (snap) => { setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]); setLoading(false); });
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories((snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[]).sort((a, b) => a.order - b.order));
    });
    return () => { unsubProducts(); unsubCats(); };
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <BackButton />
      <main className="min-h-screen pb-20 mesh-bg">
        <div className="max-w-7xl mx-auto px-6 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-primary font-bold text-sm tracking-widest mb-2 uppercase">المتجر الرقمي</p>
            <h1 className="text-5xl font-black text-foreground mb-3">المنتجات الرقمية</h1>
            <p className="text-muted-foreground text-lg">ملفات ودورات تساعدك على النمو</p>
          </motion.div>

          {/* Search + Category filters */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass glow-card rounded-3xl p-5 mb-10">
            <div className="relative mb-4">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input suppressHydrationWarning type="text" placeholder="ابحث عن منتج..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background/50 rounded-2xl px-4 py-3 pr-11 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button onClick={() => setActiveCategory("all")}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === "all" ? "bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg shadow-primary/20" : "glass text-foreground hover:-translate-y-0.5"}`}>
                الكل
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === c.id ? "bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg shadow-primary/20" : "glass text-foreground hover:-translate-y-0.5"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-primary/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-foreground/5 rounded-xl w-3/4 ml-auto" />
                    <div className="h-4 bg-foreground/5 rounded-xl" />
                    <div className="h-10 bg-foreground/5 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-muted-foreground">{search ? `لا نتائج لـ "${search}"` : "لا توجد منتجات"}</p>
              {(search || activeCategory !== "all") && (
                <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="mt-3 text-primary font-bold text-sm hover:underline">
                  إعادة تعيين
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground text-right mb-5">{filtered.length} منتج</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product, i) => {
                  const media: { type: "image" | "video"; url: string }[] = (product as any).media ?? [];
                  const coverImage = media.find((m) => m.type === "image")?.url ?? product.image;
                  return (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }} className="group">
                      <Link href={`/products/${product.id}`}>
                        <div className="glass glow-card rounded-3xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10">
                          <div className="h-52 bg-gradient-to-br from-primary/10 to-blue-700/10 relative overflow-hidden">
                            {coverImage
                              ? <img src={coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/30">
                                    {product.type === "course" ? <Play className="w-8 h-8 text-white" /> : <BookOpen className="w-8 h-8 text-white" />}
                                  </div>
                                </div>
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="p-6 text-right">
                            <h3 className="text-xl font-black text-foreground mb-2 leading-tight">{product.title}</h3>
                            {product.description && <p className="text-muted-foreground text-sm mb-5 line-clamp-2">{product.description}</p>}
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                                اشتري <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                              </span>
                              <div>
                                <p className="text-2xl font-black text-primary">{product.price} BHD</p>
                                {product.priceUSD > 0 && <p className="text-xs text-muted-foreground">{product.priceUSD} USD</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
