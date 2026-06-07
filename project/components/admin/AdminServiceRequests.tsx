"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { type ServiceRequest } from "@/lib/store";
import { Loader2, Phone, Instagram, CheckCircle, Clock, MessageSquare } from "lucide-react";

const statusMap = {
  new: { label: "جديد", color: "text-blue-600 bg-blue-50" },
  contacted: { label: "تم التواصل", color: "text-amber-600 bg-amber-50" },
  done: { label: "منتهي", color: "text-green-600 bg-green-50" },
};

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "serviceRequests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ServiceRequest[]);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const updateStatus = async (id: string, status: ServiceRequest["status"]) => {
    await updateDoc(doc(db, "serviceRequests", id), { status });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (requests.length === 0) return (
    <div className="text-center py-20 text-muted-foreground">
      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
      لا توجد طلبات خدمات
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-black text-foreground mb-6">طلبات الخدمات</h2>
      <div className="space-y-4">
        {requests.map((r, i) => {
          const s = statusMap[r.status] ?? statusMap.new;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 text-right">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{r.serviceTitle}</p>
                  <h4 className="font-black text-foreground text-lg">{r.businessName}</h4>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-foreground">{r.phone}</span>
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                {r.instagram && (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm text-foreground">{r.instagram}</span>
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                {r.extra && (
                  <p className="text-sm text-muted-foreground bg-white/50 rounded-xl p-3">{r.extra}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {(["new", "contacted", "done"] as const).map((st) => (
                  <button key={st} onClick={() => updateStatus(r.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${r.status === st ? `${statusMap[st].color} ring-2 ring-current` : "glass text-foreground hover:bg-white/80"}`}>
                    {statusMap[st].label}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
