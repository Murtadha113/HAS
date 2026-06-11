"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { type Product } from "@/lib/store";
import { BookOpen, Play, MapPin, ExternalLink, Upload, CheckCircle, Globe, Loader2 } from "lucide-react";

type PayStep = "info" | "payment" | "success";

const EMAILJS_SERVICE        = process.env.NEXT_PUBLIC_EMAILJS_SERVICE!;
const EMAILJS_TEMPLATE_ADMIN = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN!;
const EMAILJS_PUBLIC         = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [step, setStep] = useState<PayStep>("info");
  const [location, setLocation] = useState<"bahrain" | "outside" | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0); // ← نقلناه هنا

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "products", params.id as string));
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as Product);
        else setProduct(null);
        const settingsSnap = await getDoc(doc(db, "config", "settings"));
        if (settingsSnap.exists()) setSettings(settingsSnap.data());
      } catch { setProduct(null); }
      setLoadingData(false);
    };
    load();
  }, [params.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sendAdminNotification = async (buyerName: string, buyerEmail: string, productTitle: string) => {
    const adminEmail = settings?.email;
    if (!adminEmail) return;
    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_ADMIN, {
        to_email: adminEmail,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        product_title: productTitle,
        admin_url: `${window.location.origin}/adminhh7612BVporq@1N9,I%231Hg`,
      }, EMAILJS_PUBLIC);
    } catch (e) { console.error("Admin notification failed:", e); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let proofImageUrl = "";
      if (proofImage) {
        const storageRef = ref(storage, `proofs/${Date.now()}-${proofImage.name}`);
        await uploadBytes(storageRef, proofImage);
        proofImageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "orders"), {
        productId: product?.id,
        productTitle: product?.title,
        downloadLink: product?.downloadLink ?? "",
        buyerName: form.name,
        buyerEmail: form.email,
        buyerPhone: form.phone,
        location,
        proofImageUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await sendAdminNotification(form.name, form.email, product?.title ?? "");
      setStep("success");
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loadingData) return (
    <>
      <BackButton />
      <div className="min-h-screen pt-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </>
  );

  if (!product) return (
    <>
      <BackButton />
      <div className="min-h-screen pt-4 flex items-center justify-center">
        <p className="text-muted-foreground">المنتج غير موجود</p>
      </div>
      <Footer />
    </>
  );

  const media: { type: "image" | "video"; url: string }[] = (product as any).media ?? [];
  const active = media[activeIdx];
  const benfitNum = settings?.benfitNumber || "—";
  const benfitIban = settings?.benfitIban || "";
  const benfitQr = settings?.benfitQrUrl || "";

  return (
    <>
      <BackButton />
      <main className="min-h-screen pt-4 pb-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* ── STEP: INFO ── */}
          {step === "info" && (
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* معرض الميديا */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                <div className="h-80 bg-gradient-to-br from-primary/20 to-blue-700/20 rounded-3xl overflow-hidden glass flex items-center justify-center mb-3">
                  {active ? (
                    active.type === "image"
                      ? <img src={active.url} alt="" className="w-full h-full object-cover" />
                      : <video src={active.url} controls className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                      {product.type === "course" ? <Play className="w-12 h-12 text-white" /> : <BookOpen className="w-12 h-12 text-white" />}
                    </div>
                  )}
                </div>
                {media.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {media.map((m, i) => (
                      <button key={i} onClick={() => setActiveIdx(i)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                        {m.type === "image"
                          ? <img src={m.url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-black/20 flex items-center justify-center"><Play className="w-5 h-5 text-primary" /></div>
                        }
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* معلومات المنتج */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="text-right">
                <span className="inline-block glass px-3 py-1 rounded-full text-xs font-bold text-primary mb-4">
                  {product.type === "course" ? "دورة" : "كتاب"}
                </span>
                <h1 className="text-3xl font-black text-foreground mb-4">{product.title}</h1>
                <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
                <div className="text-4xl font-black text-primary mb-8">{product.price} BHD</div>
                <button onClick={() => setStep("payment")}
                  className="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all">
                  اشتري الآن
                </button>
              </motion.div>
            </div>
          )}

          {/* ── STEP: PAYMENT ── */}
          {step === "payment" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
              <h2 className="text-3xl font-black text-foreground text-center mb-8">إتمام الشراء</h2>

              <div className="glass rounded-3xl p-6 mb-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground text-right mb-4">بياناتك الشخصية</h3>
                <input suppressHydrationWarning type="text" placeholder="الاسم الكامل *" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input suppressHydrationWarning type="email" placeholder="البريد الإلكتروني *" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input suppressHydrationWarning type="tel" placeholder="رقم الهاتف" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="glass rounded-3xl p-6 mb-6">
                <h3 className="text-lg font-bold text-foreground text-right mb-4">موقعك</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setLocation("bahrain")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${location === "bahrain" ? "border-primary bg-primary/10" : "border-white/40 glass hover:border-primary/40"}`}>
                    <MapPin className="w-6 h-6 text-primary" />
                    <span className="font-bold text-foreground text-sm">البحرين 🇧🇭</span>
                    <span className="text-xs text-muted-foreground">الدفع عبر بنفت</span>
                  </button>
                  <button onClick={() => setLocation("outside")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${location === "outside" ? "border-primary bg-primary/10" : "border-white/40 glass hover:border-primary/40"}`}>
                    <Globe className="w-6 h-6 text-primary" />
                    <span className="font-bold text-foreground text-sm">خارج البحرين 🌍</span>
                    <span className="text-xs text-muted-foreground">الدفع الدولي</span>
                  </button>
                </div>
              </div>

              {location === "bahrain" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-foreground text-right mb-4">الدفع عبر بنفت</h3>
                  <div className="bg-primary/10 rounded-2xl p-4 mb-4 text-right">
                    <p className="text-sm text-foreground font-medium mb-1">رقم بنفت:</p>
                    <p className="text-2xl font-black text-primary">{benfitNum}</p>
                    {benfitIban && <p className="text-xs text-muted-foreground mt-1 font-mono">{benfitIban}</p>}
                    <p className="text-sm text-muted-foreground mt-2">المبلغ: {product.price} BHD</p>
                  </div>
                  {benfitQr && (
                    <div className="flex justify-center mb-4">
                      <div className="w-40 h-40 glass rounded-2xl p-2 flex items-center justify-center">
                        <img src={benfitQr} alt="QR" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground text-right mb-4">
                    بعد الدفع، ارفع صورة الإيصال وسيُرسل لك المنتج على بريدك الإلكتروني بعد المراجعة
                  </p>
                  <label className={`w-full flex flex-col items-center gap-3 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-colors ${proofPreview ? "border-green-400" : "border-primary/40 hover:border-primary"}`}>
                    <Upload className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-foreground">{proofPreview ? "تم رفع الإيصال ✓" : "ارفع صورة الإيصال"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {proofPreview && <img src={proofPreview} alt="proof" className="mt-3 w-full h-32 object-cover rounded-xl" />}
                </motion.div>
              )}

              {location === "outside" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-6">
                  {product.paymentMode === "external" ? (
                    <>
                      <h3 className="text-lg font-bold text-foreground text-right mb-3">الدفع الدولي</h3>
                      <p className="text-sm text-muted-foreground text-right mb-4">
                        سيتم تحويلك لموقع الدفع الآمن ({product.priceUSD} USD)
                      </p>
                      <a href={product.externalLink} target="_blank"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all">
                        <ExternalLink className="w-5 h-5" />
                        انتقل لصفحة الدفع
                      </a>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-foreground text-right mb-3">الدفع الدولي</h3>
                      <p className="text-sm text-muted-foreground text-right mb-4">
                        ادفع عبر الموقع الخارجي وارفع الإيصال. سعر الدولي: {product.priceUSD} USD
                      </p>
                      <a href={product.externalLink} target="_blank"
                        className="w-full flex items-center justify-center gap-2 glass text-foreground py-3 rounded-2xl font-bold mb-4 hover:bg-white/80 transition-all">
                        <ExternalLink className="w-5 h-5" />
                        موقع الدفع الخارجي
                      </a>
                      <label className={`w-full flex flex-col items-center gap-3 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-colors ${proofPreview ? "border-green-400" : "border-primary/40 hover:border-primary"}`}>
                        <Upload className="w-8 h-8 text-primary" />
                        <span className="text-sm font-medium text-foreground">{proofPreview ? "تم رفع الإيصال ✓" : "ارفع صورة الإيصال"}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {proofPreview && <img src={proofPreview} alt="proof" className="mt-3 w-full h-32 object-cover rounded-xl" />}
                    </>
                  )}
                </motion.div>
              )}

              {location && !(location === "outside" && product.paymentMode === "external") && (
                <button onClick={handleSubmit}
                  disabled={!form.name || !form.email || loading || (location === "bahrain" && !proofImage)}
                  className="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الطلب"}
                </button>
              )}
            </motion.div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-4">تم استلام طلبك! 🎉</h2>
              <p className="text-muted-foreground leading-relaxed">
                شكراً {form.name}! سنراجع طلبك وسيُرسل لك المنتج على{" "}
                <span className="text-primary font-bold">{form.email}</span>{" "}
                بعد التحقق من الدفع.
              </p>
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
