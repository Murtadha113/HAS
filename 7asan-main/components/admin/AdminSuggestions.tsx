"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { Lightbulb, AlertCircle, Trash2, CheckCircle, Clock, Loader2 } from "lucide-react";

type Suggestion = {
  id: string;
  type: "suggest" | "problem";
  title: string;
  body?: string;
  status: "new" | "seen" | "done";
  createdAt: any;
};

const statusLabel = { new: "جديد", seen: "تمت المراجعة", done: "منتهي" };
const statusColor = {
  new: "bg-blue-100 text-blue-700",
  seen: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

export default function AdminSuggestions() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "suggest" | "problem">("all");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "suggestions"), orderBy("createdAt", "desc")),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Suggestion[]);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const setStatus = async (id: string, status: Suggestion["status"]) => {
    await updateDoc(doc(db, "suggestions", id), { status });
  };

  const remove = async (id: string) => {
    if (confirm("تحذف هذه الرسالة؟")) await deleteDoc(doc(db, "suggestions", id));
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);
  const newCount = items.filter((i) => i.status === "new").length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-foreground">الاقتراحات والشكاوي</h2>
          {newCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {newCount} جديد
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "suggest", "problem"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-primary to-blue-700 text-white"
                  : "glass text-foreground hover:bg-white/80"
              }`}
            >
              {f === "all" ? "الكل" : f === "suggest" ? "اقتراحات" : "مشاكل"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد رسائل
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`glass rounded-2xl p-5 ${item.status === "new" ? "ring-2 ring-primary/30" : ""}`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.type === "suggest"
                  ? "bg-gradient-to-br from-primary to-blue-700"
                  : "bg-gradient-to-br from-red-500 to-rose-600"
              }`}>
                {item.type === "suggest"
                  ? <Lightbulb className="w-5 h-5 text-white" />
                  : <AlertCircle className="w-5 h-5 text-white" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 text-right min-w-0">
                <div className="flex items-center justify-end gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.type === "suggest" ? "💡 اقتراح" : "🚨 مشكلة"}
                  </span>
                  {item.createdAt?.toDate && (
                    <span className="text-xs text-muted-foreground">
                      {item.createdAt.toDate().toLocaleDateString("ar-BH")}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                {item.body && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/20">
              {item.status !== "seen" && item.status !== "done" && (
                <button
                  onClick={() => setStatus(item.id, "seen")}
                  className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-50 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  تمت المراجعة
                </button>
              )}
              {item.status !== "done" && (
                <button
                  onClick={() => setStatus(item.id, "done")}
                  className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 hover:bg-green-50 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  منتهي
                </button>
              )}
              <button
                onClick={() => remove(item.id)}
                className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
