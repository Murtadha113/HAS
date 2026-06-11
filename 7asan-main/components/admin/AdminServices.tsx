"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { type Service, type ServiceCategory } from "@/lib/store";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Loader2, Tag, Wrench } from "lucide-react";

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"services" | "categories">("services");

  // Service state
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyService = (): Service => ({
    id: `svc-${Date.now()}`, title: "", description: "",
    categoryId: "", categoryName: "", active: true, order: services.length,
  });
  const [draft, setDraft] = useState<Service>(emptyService());

  // Category state
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [catDraft, setCatDraft] = useState<ServiceCategory>({ id: "", name: "", order: 0 });

  useEffect(() => {
    const unsubServices = onSnapshot(collection(db, "services"), (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Service[]);
      setLoading(false);
    });
    const unsubCats = onSnapshot(
      query(collection(db, "serviceCategories"), orderBy("order")),
      (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ServiceCategory[])
    );
    return () => { unsubServices(); unsubCats(); };
  }, []);

  const handleCatChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setDraft({ ...draft, categoryId: catId, categoryName: cat?.name ?? "" });
  };

  const save = async () => {
    setSaving(true);
    await setDoc(doc(db, "services", draft.id), draft);
    setSaving(false); setEditing(null); setAdding(false);
  };
  const remove = async (id: string) => {
    if (confirm("حذف هذه الخدمة؟")) await deleteDoc(doc(db, "services", id));
  };
  const toggleActive = async (s: Service) => {
    await updateDoc(doc(db, "services", s.id), { active: !s.active });
  };

  const saveCat = async () => {
    setSavingCat(true);
    await setDoc(doc(db, "serviceCategories", catDraft.id), catDraft);
    setSavingCat(false); setEditingCat(null); setAddingCat(false);
  };
  const removeCat = async (id: string) => {
    if (confirm("حذف هذا القسم؟")) await deleteDoc(doc(db, "serviceCategories", id));
  };

  const btn = "bg-gradient-to-r from-primary to-blue-700 text-white";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">الخدمات</h2>
        <button
          onClick={() => tab === "services" ? (setDraft(emptyService()), setAdding(true), setEditing(null)) : (setCatDraft({ id: `scat-${Date.now()}`, name: "", order: categories.length }), setAddingCat(true), setEditingCat(null))}
          className={`flex items-center gap-2 ${btn} px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all`}
        >
          <Plus className="w-4 h-4" />
          {tab === "services" ? "إضافة خدمة" : "إضافة قسم"}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ id: "services", label: "الخدمات" }, { id: "categories", label: "الأقسام" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? btn : "glass text-foreground hover:bg-white/80"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* الخدمات */}
      {tab === "services" && (
        <>
          {(editing || adding) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">{adding ? "إضافة خدمة جديدة" : "تعديل الخدمة"}</h3>
                <button onClick={() => { setEditing(null); setAdding(false); }}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5 text-right">اسم الخدمة *</label>
                  <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الوصف (شرح الخدمة)</label>
                  <textarea rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="اشرح الخدمة هنا بالتفصيل..."
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5 text-right">القسم</label>
                  <select value={draft.categoryId ?? ""} onChange={(e) => handleCatChange(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">بدون قسم</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الترتيب</label>
                  <input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={save} disabled={!draft.title || saving}
                  className={`flex items-center gap-2 ${btn} px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
                </button>
                <button onClick={() => { setEditing(null); setAdding(false); }} className="glass px-6 py-3 rounded-xl font-bold text-foreground hover:bg-white/80 transition-all">إلغاء</button>
              </div>
            </motion.div>
          )}

          {services.length === 0 && !editing && !adding && (
            <div className="text-center py-20 text-muted-foreground">لا توجد خدمات، اضغط "إضافة خدمة"</div>
          )}

          <div className="space-y-4">
            {services.sort((a, b) => a.order - b.order).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl p-5 flex items-center gap-4 ${!s.active ? "opacity-50" : ""}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-right min-w-0">
                  <h4 className="font-bold text-foreground truncate">{s.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {s.categoryName || "بدون قسم"} · {s.description.slice(0, 50)}{s.description.length > 50 ? "..." : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(s)} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                    {s.active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => { setDraft({ ...s }); setEditing(s); setAdding(false); }} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                    <Edit2 className="w-4 h-4 text-foreground" />
                  </button>
                  <button onClick={() => remove(s.id)} className="p-2 rounded-lg glass hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* الأقسام */}
      {tab === "categories" && (
        <>
          {(editingCat || addingCat) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">{addingCat ? "إضافة قسم جديد" : "تعديل القسم"}</h3>
                <button onClick={() => { setEditingCat(null); setAddingCat(false); }}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5 text-right">اسم القسم *</label>
                  <input type="text" value={catDraft.name} onChange={(e) => setCatDraft({ ...catDraft, name: e.target.value })}
                    placeholder="مثال: إعلانات"
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5 text-right">الترتيب</label>
                  <input type="number" value={catDraft.order} onChange={(e) => setCatDraft({ ...catDraft, order: Number(e.target.value) })}
                    className="w-full glass rounded-xl px-4 py-3 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveCat} disabled={!catDraft.name || savingCat}
                  className={`flex items-center gap-2 ${btn} px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50`}>
                  {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
                </button>
                <button onClick={() => { setEditingCat(null); setAddingCat(false); }} className="glass px-6 py-3 rounded-xl font-bold text-foreground hover:bg-white/80 transition-all">إلغاء</button>
              </div>
            </motion.div>
          )}

          {categories.length === 0 && !editingCat && !addingCat && (
            <div className="text-center py-20 text-muted-foreground">لا توجد أقسام</div>
          )}

          <div className="space-y-3">
            {categories.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className="font-bold text-foreground">{c.name}</h4>
                  <p className="text-xs text-muted-foreground">{services.filter((s) => s.categoryId === c.id).length} خدمة</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setCatDraft({ ...c }); setEditingCat(c); setAddingCat(false); }} className="p-2 rounded-lg glass hover:bg-white/80 transition-all">
                    <Edit2 className="w-4 h-4 text-foreground" />
                  </button>
                  <button onClick={() => removeCat(c.id)} className="p-2 rounded-lg glass hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
