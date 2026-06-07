"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { type AdPackage } from "@/lib/store";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Star, Save, X,
  Check, Loader2, Image as ImageIcon, Video
} from "lucide-react";

type MediaItem = { type: "image" | "video"; url: string; storagePath: string };

function MediaUploader({ media, onChange }: { media: MediaItem[]; onChange: (m: MediaItem[]) => void }) {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, kind: "image" | "video") => {
    setUploading(true);
    setProgress(0);
    const path = `packages/${Date.now()}-${file.name}`;
    const task = uploadBytesResumable(ref(storage, path), file);
    task.on("state_changed",
      (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (e) => { console.error(e); setUploading(false); },
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
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {media.map((m, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden bg-black/10 aspect-square">
              {m.type === "image"
                ? <img src={m.url} alt="" className="w-full h-full object-cover" />
                : <video src={m.url} className="w-full h-full object-cover" muted playsInline />
              }
              <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {m.type === "image" ? "📷" : "🎬"}
              </span>
              <button onClick={() => remove(m)}
                className="absolute top-1.5 left-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {uploading ? (
        <div className="glass rounded-2xl p-4 text-center">
          <div className="w-full bg-white/30 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-primary to-blue-700 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">جاري الرفع... {progress}%</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <button type="button" onClick={() => imgRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl py-4 transition-colors text-sm font-medium text-foreground">
            <ImageIcon className="w-5 h-5 text-primary" /> رفع صورة
          </button>
          <button type="button" onClick={() => vidRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-blue-400/40 hover:border-blue-500 rounded-2xl py-4 transition-colors text-sm font-medium text-foreground">
            <Video className="w-5 h-5 text-blue-600" /> رفع فيديو
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

export default function AdminPackages() {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdPackage | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [draftMedia, setDraftMedia] = useState<MediaItem[]>([]);

  const emptyPkg = (): AdPackage => ({
    id: `pkg-${Date.now()}`, name: "", description: "", price: 0,
    features: [], active: true, highlighted: false,
  });
  const [draft, setDraft] = useState<AdPackage>(emptyPkg());

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "packages"), (snap) => {
      setPackages(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdPackage[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const startAdd = () => { setDraft(emptyPkg()); setDraftMedia([]); setAdding(true); setEditing(null); };
  const startEdit = (p: AdPackage) => {
    setDraft({ ...p, features: [...p.features] });
    setDraftMedia((p as any).media ?? []);
    setEditing(p);
    setAdding(false);
  };

  const save = async () => {
    setSaving(true);
    const mainImage = draftMedia.find((m) => m.type === "image")?.url ?? (draft as any).image ?? "";
    await setDoc(doc(db, "packages", draft.id), { ...draft, image: mainImage, media: draftMedia });
    setSaving(false);
    setEditing(null);
    setAdding(false);
  };

  const remove = async (id: string) => {
    if (confirm("هل تريد حذف هذه الباقة؟")) await deleteDoc(doc(db, "packages", id));
  };

  const toggleActive = async (p: AdPackage) => {
    await updateDoc(doc(db, "packages", p.id), { active: !p.active });
  };

  const addFeature = () => {
    if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(""); }
  };

  const isFormOpen = editing !== null || adding;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">باقات الإعلانات</h2>
        <button onClick={startAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4" /> إضافة باقة
        </button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">{adding ? "إضافة باقة جديدة" : "تعديل الباقة"}</h3>
            <button onClick={() => { setEditing(null); setAdding(false); }}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">

            {/* الميديا */}
            <div className="md:col-span-2">
              <MediaUploader media={draftMedia} onChange={setDraftMedia} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">اسم الباقة *</label>
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">السعر (BHD)</label>
              <input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الوصف</label>
              <input type="text" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-foreground block mb-2 text-right">المميزات</label>
            <div className="space-y-2 mb-3">
              {draft.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 glass rounded-xl px-4 py-2">
                  <button onClick={() => setDraft({ ...draft, features: draft.features.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-right text-sm text-foreground">{f}</span>
                  <Check className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addFeature}
                className="bg-gradient-to-r from-primary to-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">إضافة</button>
              <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFeature()} placeholder="أضف ميزة..."
                className="flex-1 glass rounded-xl px-4 py-2.5 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mb-6">
            <input type="checkbox" checked={draft.highlighted} onChange={(e) => setDraft({ ...draft, highlighted: e.target.checked })} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-foreground">تمييز كـ"الأكثر طلباً" ⭐</span>
          </label>

          <div className="flex gap-3">
            <button onClick={save} disabled={!draft.name || saving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </button>
            <button onClick={() => { setEditing(null); setAdding(false); }}
              className="glass px-6 py-3 rounded-xl font-bold text-foreground hover:bg-white/80 transition-all">إلغاء</button>
          </div>
        </motion.div>
      )}

      {packages.length === 0 && !isFormOpen && (
        <div className="text-center py-20 text-muted-foreground">لا توجد باقات، اضغط "إضافة باقة" لإنشاء أول باقة</div>
      )}

      <div className="space-y-4">
        {packages.map((p, i) => {
          const media: MediaItem[] = (p as any).media ?? [];
          const thumb = media.find((m) => m.type === "image")?.url ?? (p as any).image ?? "";
          const videoCount = media.filter((m) => m.type === "video").length;
          const imageCount = media.filter((m) => m.type === "image").length;

          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`glass rounded-2xl p-5 flex items-center gap-4 ${!p.active ? "opacity-50" : ""}`}>

              {/* صورة مصغرة */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-blue-700/20 flex items-center justify-center">
                {thumb
                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                  : <Star className="w-6 h-6 text-primary" />
                }
              </div>

              <div className="flex-1 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <h4 className="font-bold text-foreground">{p.name}</h4>
                  {p.highlighted && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.price} BHD · {p.features.length} مميزات
                  {(imageCount > 0 || videoCount > 0) && (
                    <span className="mr-2">
                      {imageCount > 0 && `· 📷 ${imageCount}`}
                      {videoCount > 0 && ` 🎬 ${videoCount}`}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
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
