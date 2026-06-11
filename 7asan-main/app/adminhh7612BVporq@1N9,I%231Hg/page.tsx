"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Package, Megaphone, Bell, Settings, LogOut, Loader2, Eye, EyeOff, Wrench, MessageSquare, Hammer, Lightbulb, FolderOpen } from "lucide-react";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminPackages from "@/components/admin/AdminPackages";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminServices from "@/components/admin/AdminServices";
import AdminServiceRequests from "@/components/admin/AdminServiceRequests";
import AdminTools from "@/components/admin/AdminTools";
import AdminSuggestions from "@/components/admin/AdminSuggestions";
import AdminCategories from "@/components/admin/AdminCategories";

export default function AdminPage() {
  const { user, isAdmin, loading, login, logout, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "services" | "serviceRequests" | "packages" | "orders" | "suggestions" | "tools" | "settings">("products");

  const handleLogin = async () => {
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-10 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">7</span>
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">لوحة الإدارة</h1>
        <p className="text-muted-foreground text-sm mb-8">7snjami Dashboard</p>
        <div className="space-y-3 mb-4">
          <input type="email" placeholder="الإيميل" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full glass rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="كلمة المرور" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full glass rounded-xl px-4 py-3 pr-12 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mb-4">{error}</motion.p>}
        <button onClick={handleLogin} disabled={!email || !password || submitting}
          className="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "دخول"}
        </button>
      </motion.div>
    </div>
  );

  const tabs = [
    { id: "products", label: "المنتجات الرقمية", icon: Package },
    { id: "categories", label: "الأقسام", icon: FolderOpen },
    { id: "services", label: "الخدمات", icon: Wrench },
    { id: "serviceRequests", label: "طلبات الخدمات", icon: MessageSquare },
    { id: "packages", label: "الباقات الإعلانية", icon: Megaphone },
    { id: "orders", label: "الطلبات", icon: Bell },
    { id: "suggestions", label: "الاقتراحات", icon: Lightbulb },
    { id: "tools", label: "الأدوات", icon: Hammer },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold">7</span>
            </div>
            <span className="font-black text-foreground">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm text-muted-foreground hover:text-foreground transition-colors">عرض الموقع ↗</a>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg shadow-primary/30"
                  : "glass text-foreground hover:bg-white/80"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "services" && <AdminServices />}
          {activeTab === "serviceRequests" && <AdminServiceRequests />}
          {activeTab === "packages" && <AdminPackages />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "suggestions" && <AdminSuggestions />}
          {activeTab === "tools" && <AdminTools />}
          {activeTab === "settings" && <AdminSettings />}
        </motion.div>
      </div>
    </div>
  );
}
