"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { type Category } from "@/lib/store";
import { Plus, Edit2, Trash2, Save, X, Loader2, FolderOpen, GripVertical } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [draft, setDraft] = useState({ name: "", order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "categories"), orderBy("order")), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const startAdd = () => { setDraft({ name: "", order: categories.length }); setAdding(true); setEditing(null); };
  const startEdit = (c: Category) => { setDraft({ name: c.name, order: c.order }); setEditing(c); setAdding(false); };

  const save = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    const id = editing ? editing.id : `cat-${Date.now()}`;
    await setDoc(doc(db, "categories", id), { name: draft.name.trim(), order: draft.order });
    setSaving(false);
    setAdding(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (confirm("تحذف هذا القسم؟")) await deleteDoc(doc(db, "categories", id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">أقسام المنتجات</h2>
        <button onClick={startAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {/* Form */}
      {(adding || editing) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setAdding(false); setEditing(null); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            <h3 className="font-bold text-foreground">{adding ? "قسم جديد" : "تعديل القسم"}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الترتيب</label>
              <input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5 text-right">اسم القسم *</label>
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="مثال: دورات، كتب، ملفات..."
                className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={!draft.name.trim() || saving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 hover:shadow-lg transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="glass px-6 py-2.5 rounded-xl font-bold text-foreground hover:bg-white/80 transition-all">إلغاء</button>
          </div>
        </motion.div>
      )}

      {categories.length === 0 && !adding && (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد أقسام — اضغط "إضافة قسم"</p>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-4 flex items-center gap-4">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold text-foreground">{cat.name}</p>
              <p className="text-xs text-muted-foreground">ترتيب: {cat.order}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(cat)} className="p-2 rounded-xl glass hover:bg-white/80 transition-all">
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={() => remove(cat.id)} className="p-2 rounded-xl glass hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
