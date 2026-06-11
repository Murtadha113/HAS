"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { db, storage } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { type Product, type Category } from "@/lib/store";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, Play,
  Save, X, Loader2, Image as ImageIcon, Video, Upload, CheckCircle
} from "lucide-react";

// ── نوع الميديا ──────────────────────────────────────────────
type MediaItem = { type: "image" | "video"; url: string; storagePath: string };

// ── مكون رفع الميديا ─────────────────────────────────────────
function MediaUploader({
  media, onChange,
}: {
  media: MediaItem[];
  onChange: (m: MediaItem[]) => void;
}) {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, kind: "image" | "video") => {
    setUploading(true);
    setProgress(0);
    const path = `products/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on("state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { console.error(err); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onChange([...media, { type: kind, url, storagePath: path }]);
        setUploading(false);
        setProgress(0);
      }
    );
  };

  const remove = async (item: MediaItem) => {
    try { await deleteObject(ref(storage, item.storagePath)); } catch {}
    onChange(media.filter((m) => m.url !== item.url));
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-2 text-right">
        الصور والفيديوهات ({media.length})
      </label>

      {/* Grid عرض الميديا */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {media.map((m, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden bg-black/10 aspect-square">
              {m.type === "image" ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted playsInline />
              )}
              {/* Badge */}
              <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {m.type === "image" ? "📷" : "🎬"}
              </span>
              {/* حذف */}
              <button
                onClick={() => remove(m)}
                className="absolute top-1.5 left-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* أزرار رفع */}
      {uploading ? (
        <div className="glass rounded-2xl p-4 text-center">
          <div className="w-full bg-white/30 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-primary to-blue-700 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">جاري الرفع... {progress}%</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl py-4 transition-colors text-sm font-medium text-foreground"
          >
            <ImageIcon className="w-5 h-5 text-primary" />
            رفع صورة
          </button>
          <button
            type="button"
            onClick={() => vidRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-blue-400/40 hover:border-blue-500 rounded-2xl py-4 transition-colors text-sm font-medium text-foreground"
          >
            <Video className="w-5 h-5 text-blue-600" />
            رفع فيديو
          </button>
        </div>
      )}

      <input ref={imgRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "image"); e.target.value = ""; }} />
      <input ref={vidRef} type="file" accept="video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "video"); e.target.value = ""; }} />
    </div>
  );
}

// ── الكومبوننت الرئيسي ────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyProduct = (): Product => ({
    id: `prod-${Date.now()}`,
    title: "", description: "", price: 0, priceUSD: 0,
    type: "course", image: "", paymentMode: "direct",
    externalLink: "", benfitLink: "", downloadLink: "", active: true,
  });

  const [draft, setDraft] = useState<Product>(emptyProduct());
  const [draftMedia, setDraftMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const unsubCats = onSnapshot(query(collection(db, "categories"), orderBy("order")), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const startAdd = () => {
    setDraft(emptyProduct());
    setDraftMedia([]);
    setAdding(true);
    setEditing(null);
  };

  const startEdit = (p: Product) => {
    setDraft({ ...p });
    // استرجاع الميديا المحفوظة
    setDraftMedia((p as any).media ?? []);
    setEditing(p);
    setAdding(false);
  };

  const save = async () => {
    setSaving(true);
    // أول صورة تصير الـ image الرئيسية للبطاقة
    const mainImage = draftMedia.find((m) => m.type === "image")?.url ?? draft.image ?? "";
    await setDoc(doc(db, "products", draft.id), {
      ...draft,
      image: mainImage,
      media: draftMedia,
    });
    setSaving(false);
    setEditing(null);
    setAdding(false);
  };

  const remove = async (id: string) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const toggleActive = async (p: Product) => {
    await updateDoc(doc(db, "products", p.id), { active: !p.active });
  };

  const isFormOpen = editing !== null || adding;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">المنتجات الرقمية</h2>
        <button onClick={startAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4" /> إضافة منتج
        </button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">
              {adding ? "إضافة منتج جديد" : "تعديل المنتج"}
            </h3>
            <button onClick={() => { setEditing(null); setAdding(false); }}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {/* ── الميديا — يمتد على عمودين ── */}
            <div className="md:col-span-2">
              <MediaUploader media={draftMedia} onChange={setDraftMedia} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">العنوان *</label>
              <input type="text" value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الوصف</label>
              <textarea rows={3} value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">السعر (BHD)</label>
              <input type="number" value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">السعر الدولي (USD)</label>
              <input type="number" value={draft.priceUSD}
                onChange={(e) => setDraft({ ...draft, priceUSD: Number(e.target.value) })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">النوع</label>
              <select value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as any })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="course">دورة / كورس</option>
                <option value="book">كتاب</option>
                <option value="other">منتج رقمي آخر</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">القسم</label>
              <select value={(draft as any).categoryId ?? ""}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value, categoryName: categories.find(c => c.id === e.target.value)?.name ?? "" } as any)}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">بدون قسم</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">طريقة الدفع (خارج البحرين)</label>
              <select value={draft.paymentMode}
                onChange={(e) => setDraft({ ...draft, paymentMode: e.target.value as any })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="direct">يرفع إيصال هنا</option>
                <option value="external">يتحول لموقع خارجي مباشرة</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">رابط الدفع الخارجي (خارج البحرين)</label>
              <input type="url" value={draft.externalLink}
                onChange={(e) => setDraft({ ...draft, externalLink: e.target.value })}
                placeholder="https://..."
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">رابط بنفت (البحرين)</label>
              <input type="text" value={draft.benfitLink}
                onChange={(e) => setDraft({ ...draft, benfitLink: e.target.value })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">رابط المنتج / التحميل ⬇️</label>
              <input type="url" value={draft.downloadLink}
                onChange={(e) => setDraft({ ...draft, downloadLink: e.target.value })}
                placeholder="https://..."
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={!draft.title || saving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </button>
            <button onClick={() => { setEditing(null); setAdding(false); }}
              className="glass px-6 py-3 rounded-xl font-bold text-foreground hover:bg-white/80 transition-all">
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {products.map((p, i) => {
          const media: MediaItem[] = (p as any).media ?? [];
          const thumb = media.find((m) => m.type === "image")?.url ?? p.image ?? "";
          const videoCount = media.filter((m) => m.type === "video").length;
          const imageCount = media.filter((m) => m.type === "image").length;

          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-2xl p-5 flex items-center gap-4 ${!p.active ? "opacity-50" : ""}`}>

              {/* صورة مصغرة */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-blue-700/20 flex items-center justify-center">
                {thumb
                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                  : p.type === "course"
                    ? <Play className="w-6 h-6 text-primary" />
                    : <BookOpen className="w-6 h-6 text-primary" />
                }
              </div>

              <div className="flex-1 text-right min-w-0">
                <h4 className="font-bold text-foreground truncate">{p.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {p.price} BHD ·{" "}
                  {p.type === "course" ? "دورة" : p.type === "book" ? "كتاب" : "أخرى"} ·{" "}
                  <span className={p.paymentMode === "external" ? "text-amber-600" : "text-green-600"}>
                    {p.paymentMode === "external" ? "دفع خارجي" : "دفع مباشر"}
                  </span>
                  {(imageCount > 0 || videoCount > 0) && (
                    <span className="mr-2 text-muted-foreground">
                      {imageCount > 0 && `· 📷 ${imageCount}`}
                      {videoCount > 0 && ` 🎬 ${videoCount}`}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(p)} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                  {p.active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => startEdit(p)} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                  <Edit2 className="w-4 h-4 text-foreground" />
                </button>
                <button onClick={() => remove(p.id)} className="p-2 rounded-lg glass hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
