"use client";

import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { type AdPackage } from "@/lib/store";
import { Check, Sparkles, CheckCircle, Send, Loader2, Play } from "lucide-react";

// كارد منفصل عشان الـ hook يكون في مكانه الصح
function PackageCard({ pkg, selected, onSelect }: {
  pkg: AdPackage & { media?: { type: "image" | "video"; url: string }[] };
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const media = pkg.media ?? [];
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const activeMedia = media[activeMediaIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative glass rounded-3xl overflow-hidden transition-all duration-300 ${selected ? "ring-2 ring-primary shadow-xl shadow-primary/20" : ""} ${pkg.highlighted ? "ring-2 ring-primary/60" : ""}`}
    >
      {pkg.highlighted && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" /> الأكثر طلباً
          </span>
        </div>
      )}

      {media.length > 0 && activeMedia && (
        <div className="relative">
          <div className="h-48 bg-black/10 overflow-hidden">
            {activeMedia.type === "image"
              ? <img src={activeMedia.url} alt="" className="w-full h-full object-cover" />
              : <video src={activeMedia.url} controls className="w-full h-full object-contain bg-black" />
            }
          </div>
          {media.length > 1 && (
            <div className="flex gap-1.5 p-2 justify-center">
              {media.map((_, i) => (
                <button key={i} onClick={() => setActiveMediaIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeMediaIdx ? "bg-primary scale-125" : "bg-white/40"}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-8">
        <div className="text-right mb-6">
          <h3 className="text-2xl font-black text-foreground mb-2">{pkg.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
          <div className="text-4xl font-black text-primary">
            {pkg.price} <span className="text-lg font-medium text-muted-foreground">BHD</span>
          </div>
        </div>
        <ul className="space-y-3 mb-8">
          {pkg.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-right">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mr-auto" />
              <span className="text-sm text-foreground">{f}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => onSelect(pkg.id)}
          className={`w-full py-3 px-6 rounded-2xl font-bold transition-all duration-300 ${
            selected ? "bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg" :
            pkg.highlighted ? "bg-gradient-to-r from-primary to-blue-700 text-white hover:shadow-lg hover:shadow-primary/30" :
            "glass text-foreground hover:bg-white/80"
          }`}>
          {selected ? "✓ تم الاختيار" : "اختر هذه الباقة"}
        </button>
      </div>
    </motion.div>
  );
}

function AdsPageContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("package");

  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(preselected);
  const [showForm, setShowForm] = useState(!!preselected);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", businessName: "", message: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "packages"), (snap) => {
      if (!snap.empty) {
        setPackages(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p: any) => p.active) as AdPackage[]);
      }
    });
    return unsub;
  }, []);

  const activePackages = packages.filter((p) => p.active);
  const selectedPkg = activePackages.find((p) => p.id === selected);

  const handleSelect = (id: string) => {
    setSelected(id);
    setShowForm(true);
    setTimeout(() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "ad_requests"), {
        packageId: selected,
        packageName: selectedPkg?.name ?? "",
        buyerName: form.name,
        buyerPhone: form.phone,
        buyerEmail: form.email,
        businessName: form.businessName,
        message: form.message,
        status: "new",
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <>
      <BackButton />
      <main className="min-h-screen pt-4 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl font-black text-foreground mb-4">باقات الإعلانات</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">اختر الباقة وابدأ رحلتك التسويقية</p>
          </motion.div>

          {activePackages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">لا توجد باقات متاحة حالياً</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {activePackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg as any}
                  selected={selected === pkg.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {showForm && (
            <motion.div id="request-form" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              {!sent ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-foreground mb-2">طلب: {selectedPkg?.name}</h2>
                    <p className="text-muted-foreground">أكمل بياناتك وسنتواصل معك قريباً</p>
                  </div>
                  <div className="glass rounded-3xl p-8 space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input suppressHydrationWarning type="text" placeholder="الاسم الكامل *" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input suppressHydrationWarning type="tel" placeholder="رقم الهاتف / واتساب *" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <input suppressHydrationWarning type="email" placeholder="البريد الإلكتروني *" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input suppressHydrationWarning type="text" placeholder="اسم المشروع أو النشاط التجاري" value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    <textarea rows={4} placeholder="أخبرنا عن مشروعك وما تريد تحقيقه..." value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    <button onClick={handleSubmit} disabled={!form.name || !form.phone || !form.email || loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> أرسل الطلب</>}
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass rounded-3xl p-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-foreground mb-4">تم إرسال طلبك!</h2>
                  <p className="text-muted-foreground">
                    شكراً <span className="text-foreground font-bold">{form.name}</span>! سنتواصل معك على{" "}
                    <span className="text-primary font-bold">{form.phone}</span> قريباً.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AdsPage() {
  return <Suspense><AdsPageContent /></Suspense>;
}
