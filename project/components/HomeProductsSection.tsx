"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Play, ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { type Product } from "@/lib/store";

export default function HomeProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "products"), where("active", "==", true), limit(3)))
      .then((snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section id="products" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">المنتجات الرقمية</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">دورات وكتب رقمية</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">محتوى رقمي احترافي يساعدك على النمو وتطوير مهاراتك</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -6 }}
              className="glass rounded-3xl overflow-hidden group cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-blue-700/20 flex items-center justify-center relative overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                  {product.type === "course" ? <Play className="w-10 h-10 text-white" /> : <BookOpen className="w-10 h-10 text-white" />}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="glass px-3 py-1 rounded-full text-xs font-bold text-primary">
                    {product.type === "course" ? "دورة" : product.type === "book" ? "كتاب" : "منتج"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{product.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">{product.price} BHD</span>
                  <Link href={`/products/${product.id}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all group">
                    اشتري الآن
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link href="/products" className="inline-flex items-center gap-2 glass px-8 py-4 rounded-2xl font-bold text-foreground hover:bg-white/80 transition-all duration-300">
            عرض جميع المنتجات <ArrowLeft className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
