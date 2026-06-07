"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { type Service } from "@/lib/store";
import { Wrench, CheckCircle, Loader2, Instagram } from "lucide-react";

export default function ServicePage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    instagram: "",
    extra: "",
  });

  useEffect(() => {
    getDoc(doc(db, "services", params.id as string)).then((snap) => {
      if (snap.exists()) setService({ id: snap.id, ...snap.data() } as Service);
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = async () => {
    if (!form.businessName || !form.phone) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "serviceRequests"), {
        serviceId: service?.id,
        serviceTitle: service?.title,
        ...form,
        status: "new",
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <>
      <BackButton />
      <div className="min-h-screen pt-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </>
  );

  if (!service) return (
    <>
      <BackButton />
      <div className="min-h-screen pt-4 flex items-center justify-center">
        <p className="text-muted-foreground">الخدمة غير موجودة</p>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <BackButton />
      <main className="min-h-screen pt-4 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 text-right mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-5">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            {service.categoryName && (
              <span className="text-sm text-amber-600 font-bold">{service.categoryName}</span>
            )}
            <h1 className="text-3xl font-black text-foreground mt-1 mb-4">{service.title}</h1>
            <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
              {service.description}
            </p>
          </motion.div>

          {/* Form */}
          {!done ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-8 text-right"
            >
              <h2 className="text-2xl font-black text-foreground mb-6">مهتم بالخدمة؟</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    اسم المحل / اسم الشخص *
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="مثال: محل الأناقة"
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    رقم التواصل *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+973 XXXX XXXX"
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    حساب المشروع على الانستقرام
                  </label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="@username"
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    أي معلومة أو شيء تريد تضيفه
                  </label>
                  <textarea
                    rows={4}
                    value={form.extra}
                    onChange={(e) => setForm({ ...form, extra: e.target.value })}
                    placeholder="أي تفاصيل إضافية..."
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.businessName || !form.phone || submitting}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الطلب"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">تم الإرسال!</h3>
              <p className="text-muted-foreground">وصلني طلبك وبتواصل معك قريباً 🙏</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
