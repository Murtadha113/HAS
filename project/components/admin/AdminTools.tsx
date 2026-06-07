"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, storage } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { type Tool } from "@/lib/store";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Loader2, Hammer, ExternalLink, Upload,
} from "lucide-react";

export default function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const emptyTool = (): Tool => ({
    id: `tool-${Date.now()}`,
    name: "", description: "", url: "",
    imageUrl: "", category: "", active: true, order: tools.length,
  });
  const [draft, setDraft] = useState<Tool>(emptyTool());

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "tools"), orderBy("order")),
      (snap) => {
        setTools(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Tool[]);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const startAdd = () => { setDraft(emptyTool()); setAdding(true); setEditing(null); };
  const startEdit = (t: Tool) => { setDraft({ ...t }); setEditing(t); setAdding(false); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `tools/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setDraft((d) => ({ ...d, imageUrl: url }));
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
    e.target.value = "";
  };

  const save = async () => {
    if (!draft.name || !draft.url) return;
    setSaving(true);
    await setDoc(doc(db, "tools", draft.id), draft);
    setSaving(false);
    setEditing(null);
    setAdding(false);
  };

  const remove = async (id: string) => {
    if (confirm("تريد تحذف هذه الأداة؟")) await deleteDoc(doc(db, "tools", id));
  };

  const toggleActive = async (t: Tool) => {
    await updateDoc(doc(db, "tools", t.id), { active: !t.active });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">الأدوات</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة أداة
        </button>
      </div>

      {/* Form */}
      {(editing || adding) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">{adding ? "إضافة أداة جديدة" : "تعديل الأداة"}</h3>
            <button onClick={() => { setEditing(null); setAdding(false); }}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">اسم الأداة *</label>
              <input type="text" value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="مثال: Claude Code"
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">التصنيف (اختياري)</label>
              <input type="text" value={draft.category ?? ""}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="مثال: برمجة، تسويق، تصميم"
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الوصف *</label>
              <textarea rows={2} value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="وصف مختصر للأداة وفائدتها"
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">رابط الأداة *</label>
              <input type="url" value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                placeholder="https://..."
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الترتيب</label>
              <input type="number" value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">صورة الأداة</label>
              <label className="flex items-center justify-center gap-2 glass rounded-xl px-4 py-3 cursor-pointer hover:bg-white/80 transition-all border-2 border-dashed border-teal-300">
                {uploading
                  ? <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  : <Upload className="w-4 h-4 text-teal-600" />}
                <span className="text-sm text-foreground">
                  {draft.imageUrl ? "تم رفع الصورة ✓" : "ارفع صورة"}
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {draft.imageUrl && (
              <div className="md:col-span-2 flex items-center gap-3">
                <img src={draft.imageUrl} alt="" className="w-20 h-16 object-cover rounded-xl" />
                <button onClick={() => setDraft({ ...draft, imageUrl: "" })}
                  className="text-xs text-red-500 hover:underline">حذف الصورة</button>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={!draft.name || !draft.url || saving || uploading}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
            <button onClick={() => { setEditing(null); setAdding(false); }}
              className="glass px-6 py-3 rounded-xl font-bold text-foreground hover:bg-white/80 transition-all">
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      {/* Empty */}
      {tools.length === 0 && !editing && !adding && (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد أدوات، اضغط "إضافة أداة"
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {tools.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-5 flex items-center gap-4 ${!t.active ? "opacity-50" : ""}`}>
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              {t.imageUrl
                ? <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Hammer className="w-6 h-6 text-white" />
                  </div>
              }
            </div>
            <div className="flex-1 text-right min-w-0">
              <h4 className="font-bold text-foreground truncate">{t.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{t.description}</p>
              <a href={t.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-0.5">
                <ExternalLink className="w-3 h-3" />
                {t.url}
              </a>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {t.category && (
                <span className="glass px-2 py-1 rounded-lg text-xs text-muted-foreground">{t.category}</span>
              )}
              <button onClick={() => toggleActive(t)} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                {t.active ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => startEdit(t)} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={() => remove(t.id)} className="p-2 rounded-lg glass hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
