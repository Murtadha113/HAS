"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Lightbulb, AlertCircle, Send, CheckCircle, Loader2 } from "lucide-react";

export default function SuggestPage() {
  const [type, setType] = useState<"suggest" | "problem" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = async () => {
    if (!type || !title.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "suggestions"), { type, title: title.trim(), body: body.trim(), status: "new", createdAt: serverTimestamp() });
      setDone(true);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <>
      <BackButton />
      <main className="min-h-screen pt-28 pb-20 px-6 mesh-bg">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-right mb-10">
            <p className="text-purple-500 font-bold text-sm tracking-widest mb-2 uppercase">رأيك يهمني</p>
            <h1 className="text-5xl font-black text-foreground">اقتراح / مشكلة</h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="glass glow-card rounded-3xl p-14 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">تم الإرسال! 🙏</h2>
                <p className="text-muted-foreground mb-8">شكراً على وقتك، رسالتك وصلت</p>
                <button onClick={() => { setDone(false); setType(null); setTitle(""); setBody(""); }}
                  className="glass px-6 py-3 rounded-2xl font-bold text-foreground hover:-translate-y-0.5 transition-all">
                  إرسال رسالة ثانية
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass glow-card rounded-3xl p-8 text-right space-y-6">

                {/* Type */}
                <div>
                  <label className="text-sm font-bold text-foreground block mb-3">نوع الرسالة *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: "suggest", label: "اقتراح", icon: Lightbulb, gradient: "from-primary to-blue-700", glow: "shadow-primary/20" },
                      { id: "problem", label: "مشكلة", icon: AlertCircle, gradient: "from-red-500 to-rose-600", glow: "shadow-red-500/20" },
                    ] as const).map((t) => (
                      <button key={t.id} onClick={() => setType(t.id)}
                        className={`flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold transition-all duration-300 ${
                          type === t.id
                            ? `bg-gradient-to-r ${t.gradient} text-white shadow-xl ${t.glow} scale-[1.02]`
                            : "glass text-foreground hover:-translate-y-0.5"
                        }`}>
                        <t.icon className="w-5 h-5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-bold text-foreground block mb-2">
                    عنوان {type === "suggest" ? "الاقتراح" : type === "problem" ? "المشكلة" : "الرسالة"} *
                  </label>
                  <input suppressHydrationWarning type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="العنوان..."
                    className="w-full bg-background/50 rounded-2xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-bold text-foreground block mb-2">التفاصيل</label>
                  <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)}
                    placeholder="اكتب تفاصيل أكثر..."
                    className="w-full bg-background/50 rounded-2xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none" />
                </div>

                <button onClick={handleSend} disabled={!type || !title.trim() || sending}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {sending ? "جاري الإرسال..." : "أرسل"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
