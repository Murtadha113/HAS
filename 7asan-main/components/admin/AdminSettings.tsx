"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Save, Upload, QrCode, CreditCard, Loader2, CheckCircle, Instagram, Globe, AlignRight } from "lucide-react";
import { type SiteSettings } from "@/lib/store";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
);

const empty: SiteSettings = {
  benfitNumber: "", benfitIban: "", benfitQrUrl: "", whatsapp: "", email: "", telegramNotify: "",
  aboutText: "", instagramUrl: "", tiktokUrl: "", instagramHandle: "", tiktokHandle: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrPreview, setQrPreview] = useState("");

  useEffect(() => {
    getDoc(doc(db, "config", "settings")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as SiteSettings;
        setSettings({ ...empty, ...d });
        if (d.benfitQrUrl) setQrPreview(d.benfitQrUrl);
      }
      setLoading(false);
    });
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => setQrPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      const storageRef = ref(storage, "config/benfit-qr.png");
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings((s) => ({ ...s, benfitQrUrl: url }));
    } catch (e) { console.error(e); }
    setUploadingQr(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "config", "settings"), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const field = (label: string, key: keyof SiteSettings, props: Record<string, any> = {}) => (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5 text-right">{label}</label>
      <input
        type="text"
        value={settings[key] as string}
        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
        className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-black text-foreground">الإعدادات العامة</h2>

      {/* نبذة عني */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5 justify-end">
          <h3 className="text-lg font-bold text-foreground">نبذة عني</h3>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
            <AlignRight className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5 text-right">النص</label>
          <textarea
            rows={5}
            value={settings.aboutText}
            onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
            placeholder="اكتب نبذة عنك وعن موقعك هنا..."
            className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* السوشيل ميديا */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5 justify-end">
          <h3 className="text-lg font-bold text-foreground">حسابات السوشيل ميديا</h3>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Instagram className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          {field("رابط الانستقرام", "instagramUrl", { placeholder: "https://instagram.com/username" })}
          {field("اسم حساب الانستقرام (للعرض)", "instagramHandle", { placeholder: "@username" })}
          {field("رابط تيك توك", "tiktokUrl", { placeholder: "https://tiktok.com/@username" })}
          {field("اسم حساب تيك توك (للعرض)", "tiktokHandle", { placeholder: "@username" })}
        </div>
      </div>

      {/* بنفت */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5 justify-end">
          <h3 className="text-lg font-bold text-foreground">إعدادات بنفت</h3>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          {field("رقم بنفت (يظهر للعميل عند الدفع)", "benfitNumber", { placeholder: "مثال: 3300-0000" })}
          {field("IBAN البنك (اختياري)", "benfitIban", { placeholder: "BH00XXXX0000000000000000", className: "w-full glass rounded-xl px-4 py-3 text-right text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary" })}
          {/* QR Upload */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2 text-right">QR كود بنفت</label>
            <div className="flex gap-4 items-start">
              {qrPreview && (
                <div className="w-28 h-28 rounded-2xl overflow-hidden glass flex-shrink-0">
                  <img src={qrPreview} alt="QR" className="w-full h-full object-contain p-2" />
                </div>
              )}
              <label className={`flex-1 flex flex-col items-center gap-3 border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-colors ${uploadingQr ? "opacity-50 cursor-not-allowed" : "border-primary/40 hover:border-primary"}`}>
                {uploadingQr ? <Loader2 className="w-7 h-7 text-primary animate-spin" /> : <QrCode className="w-7 h-7 text-primary" />}
                <span className="text-sm font-medium text-foreground text-center">{qrPreview ? "تغيير QR الكود" : "ارفع QR الكود"}</span>
                <input type="file" accept="image/*" onChange={handleQrUpload} disabled={uploadingQr} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات التواصل */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-bold text-foreground text-right mb-5">معلومات التواصل</h3>
        <div className="space-y-4">
          {field("واتساب", "whatsapp", { placeholder: "+973 XXXX XXXX" })}
          {field("إيميل الإشعارات", "email", { placeholder: "admin@example.com", type: "email" })}
        </div>
      </div>

      {/* زر الحفظ */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><CheckCircle className="w-5 h-5" /> تم الحفظ!</> : <><Save className="w-5 h-5" /> حفظ الإعدادات</>}
      </button>
    </div>
  );
}
