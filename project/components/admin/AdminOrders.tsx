"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, updateDoc, query, orderBy, getDoc
} from "firebase/firestore";
import {
  CheckCircle, XCircle, Mail, MessageSquare, Package,
  Loader2, Eye, Clock, ChevronDown, ChevronUp, Send, Bell
} from "lucide-react";

const EMAILJS_SERVICE = "service_s3gm327";
const EMAILJS_TEMPLATE_BUYER = "template_wr0z8h4";      // إيميل للزبون برابط المنتج
const EMAILJS_TEMPLATE_ADMIN = "template_admin_notify"; // إشعار للأدمن بطلب جديد
const EMAILJS_PUBLIC = "D1c7OAnGGEDuYSCFc";

type Order = {
  id: string;
  type: "product" | "ad_request";
  productTitle?: string;
  productId?: string;
  downloadLink?: string;
  packageName?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  businessName?: string;
  message?: string;
  location?: "bahrain" | "outside";
  proofImageUrl?: string;
  status: string;
  createdAt: any;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "بانتظار المراجعة",
  confirmed: "تم تأكيد الدفع",
  delivered: "تم التسليم",
  rejected: "مرفوض",
  new: "جديد",
  contacted: "تم التواصل",
  done: "منتهي",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "product" | "ad_request">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");

  // جلب إيميل الأدمن من الإعدادات
  useEffect(() => {
    getDoc(doc(db, "config", "settings")).then((snap) => {
      if (snap.exists()) setAdminEmail(snap.data().email ?? "");
    });
  }, []);

  // تتبع الطلبات الجديدة لإرسال إشعار للأدمن
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, type: "product" as const, ...d.data() })) as Order[];

        // كشف الطلبات الجديدة وإرسال إشعار للأدمن
        if (adminEmail) {
          data.forEach((order) => {
            if (!seenIds.has(order.id) && order.status === "pending") {
              sendAdminNotification(order);
              setSeenIds((prev) => new Set([...prev, order.id]));
            }
          });
        }

        setOrders((prev) => {
          const adReqs = prev.filter((o) => o.type === "ad_request");
          return [...data, ...adReqs].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        });
        setLoading(false);
      }
    );

    const unsubAds = onSnapshot(
      query(collection(db, "ad_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, type: "ad_request" as const, ...d.data() })) as Order[];

        // كشف طلبات إعلانات جديدة
        if (adminEmail) {
          data.forEach((order) => {
            if (!seenIds.has(order.id) && order.status === "new") {
              sendAdminNotification(order);
              setSeenIds((prev) => new Set([...prev, order.id]));
            }
          });
        }

        setOrders((prev) => {
          const prods = prev.filter((o) => o.type === "product");
          return [...prods, ...data].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        });
      }
    );

    return () => { unsubOrders(); unsubAds(); };
  }, [adminEmail, seenIds]);

  // إرسال إشعار للأدمن
  const sendAdminNotification = async (order: Order) => {
    if (!adminEmail) return;
    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE_ADMIN,
        {
          to_email: adminEmail,
          buyer_name: order.buyerName,
          buyer_email: order.buyerEmail,
          buyer_phone: order.buyerPhone,
          product_title: order.productTitle ?? order.packageName ?? "—",
          order_type: order.type === "product" ? "منتج" : "إعلان",
          admin_url: `${window.location.origin}/adminhh7612BVporq@1N9,I%231Hg`,
        },
        EMAILJS_PUBLIC
      );
    } catch (e) {
      console.error("Admin notification error:", e);
    }
  };

  const sendEmail = async (order: Order, downloadLink: string) => {
    setSendingEmail(order.id);
    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE_BUYER,
        {
          to_email: order.buyerEmail,
          buyer_name: order.buyerName,
          product_title: order.productTitle ?? "",
          download_link: downloadLink,
        },
        EMAILJS_PUBLIC
      );
      setEmailSent(order.id);
      setTimeout(() => setEmailSent(null), 4000);
    } catch (e) {
      console.error("Email error:", e);
      alert("فشل إرسال الإيميل، استخدم الإرسال اليدوي");
    }
    setSendingEmail(null);
  };

  const confirmOrder = async (order: Order) => {
    let downloadLink = order.downloadLink ?? "";
    if (!downloadLink && order.productId) {
      try {
        const snap = await getDoc(doc(db, "products", order.productId));
        if (snap.exists()) downloadLink = snap.data().downloadLink ?? "";
      } catch {}
    }

    await updateDoc(doc(db, "orders", order.id), { status: "confirmed" });

    if (order.buyerEmail && downloadLink) {
      await sendEmail(order, downloadLink);
    }
  };

  const updateStatus = async (order: Order, status: string) => {
    const col = order.type === "product" ? "orders" : "ad_requests";
    await updateDoc(doc(db, col, order.id), { status });
  };

  const filtered = orders.filter((o) => filter === "all" || o.type === filter);
  const newCount = orders.filter((o) => o.status === "pending" || o.status === "new").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-foreground">الطلبات الواردة</h2>
          {newCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {newCount} جديد
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "الكل" },
            { value: "product", label: "مبيعات" },
            { value: "ad_request", label: "إعلانات" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === tab.value
                  ? "bg-gradient-to-r from-primary to-blue-700 text-white"
                  : "glass text-foreground hover:bg-white/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin email warning */}
      {!adminEmail && (
        <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3 justify-end border border-amber-300/40 bg-amber-50/30">
          <p className="text-sm text-amber-700 font-medium text-right">
            ⚠️ ما حطيت إيميلك في الإعدادات — لن تصلك إشعارات الطلبات الجديدة
          </p>
          <Bell className="w-5 h-5 text-amber-500 flex-shrink-0" />
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">لا توجد طلبات حتى الآن</div>
      )}

      <div className="space-y-4">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Main Row */}
            <div className="p-5 flex items-center gap-4">
              <div className="flex-1 text-right min-w-0">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <h4 className="font-bold text-foreground truncate">
                    {order.type === "product" ? order.productTitle : order.packageName}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.buyerName} · {order.buyerPhone}
                  {order.location && (
                    <span className="mr-2">{order.location === "bahrain" ? "🇧🇭" : "🌍"}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {order.proofImageUrl && (
                  <button
                    onClick={() => setProofModal(order.proofImageUrl!)}
                    className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all"
                    title="عرض الإيصال"
                  >
                    <Eye className="w-4 h-4 text-amber-700" />
                  </button>
                )}
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="p-2 rounded-lg glass hover:bg-white/80 transition-all"
                >
                  {expanded === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded */}
            {expanded === order.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-white/40 p-5"
              >
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="glass rounded-xl p-3 text-right">
                    <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                    <p className="font-medium text-foreground text-sm">{order.buyerEmail}</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-right">
                    <p className="text-xs text-muted-foreground mb-1">الهاتف</p>
                    <p className="font-medium text-foreground text-sm">{order.buyerPhone}</p>
                  </div>
                  {order.businessName && (
                    <div className="glass rounded-xl p-3 text-right">
                      <p className="text-xs text-muted-foreground mb-1">المشروع</p>
                      <p className="font-medium text-foreground text-sm">{order.businessName}</p>
                    </div>
                  )}
                  {order.downloadLink && (
                    <div className="glass rounded-xl p-3 text-right">
                      <p className="text-xs text-muted-foreground mb-1">رابط المنتج</p>
                      <a href={order.downloadLink} target="_blank" className="font-medium text-primary text-sm underline truncate block">{order.downloadLink}</a>
                    </div>
                  )}
                </div>

                {order.message && (
                  <div className="glass rounded-xl p-4 mb-4 text-right">
                    <p className="text-xs text-muted-foreground mb-1">الرسالة</p>
                    <p className="text-sm text-foreground">{order.message}</p>
                  </div>
                )}

                {/* Email sent success */}
                {emailSent === order.id && (
                  <div className="bg-green-100 text-green-700 rounded-xl px-4 py-2 mb-4 text-sm font-medium text-right">
                    ✓ تم إرسال الإيميل للزبون تلقائياً
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${order.buyerEmail}?subject=منتجك جاهز - 7snjami&body=مرحباً ${order.buyerName}، رابط منتجك: ${order.downloadLink ?? ""}`}
                    className="flex items-center gap-1.5 glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 transition-all">
                    <Mail className="w-4 h-4" />
                    إرسال يدوي
                  </a>
                  <a href={`https://wa.me/${order.buyerPhone.replace(/[\s+\-()]/g, "")}`}
                    target="_blank"
                    className="flex items-center gap-1.5 glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 transition-all">
                    <MessageSquare className="w-4 h-4" />
                    واتساب
                  </a>

                  {order.type === "product" && order.status === "pending" && (
                    <>
                      <button
                        onClick={() => confirmOrder(order)}
                        disabled={sendingEmail === order.id}
                        className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-60"
                      >
                        {sendingEmail === order.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <CheckCircle className="w-4 h-4" />}
                        قبول وإرسال المنتج تلقائياً
                      </button>
                      <button
                        onClick={() => updateStatus(order, "rejected")}
                        className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </button>
                    </>
                  )}

                  {order.type === "product" && order.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => sendEmail(order, order.downloadLink ?? "")}
                        disabled={sendingEmail === order.id}
                        className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-60"
                      >
                        {sendingEmail === order.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />}
                        إعادة إرسال الإيميل
                      </button>
                      <button
                        onClick={() => updateStatus(order, "delivered")}
                        className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all"
                      >
                        <Package className="w-4 h-4" />
                        تم التسليم
                      </button>
                    </>
                  )}

                  {order.type === "ad_request" && order.status === "new" && (
                    <button onClick={() => updateStatus(order, "contacted")}
                      className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all">
                      <Clock className="w-4 h-4" />
                      تم التواصل
                    </button>
                  )}
                  {order.type === "ad_request" && order.status === "contacted" && (
                    <button onClick={() => updateStatus(order, "done")}
                      className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all">
                      <CheckCircle className="w-4 h-4" />
                      منتهي
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Proof Image Modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
          onClick={() => setProofModal(null)}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl overflow-hidden max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <button onClick={() => setProofModal(null)} className="text-gray-500 hover:text-gray-800">✕</button>
              <h3 className="font-bold">إيصال الدفع</h3>
            </div>
            <img src={proofModal} alt="proof" className="w-full object-contain max-h-96" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
