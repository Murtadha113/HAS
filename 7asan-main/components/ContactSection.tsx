"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-right"
          >
            <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium text-foreground">تواصل معنا</span>
            </span>

            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
              لديك مشروع؟
              <br />
              <span className="gradient-text">دعنا نتحدث</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              نحن هنا لمساعدتك في تحقيق رؤيتك. تواصل معنا الآن وسنعود إليك في أقرب وقت
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 glass rounded-2xl p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-bold text-foreground">info@7snjami.com</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 glass rounded-2xl p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-bold text-foreground" dir="ltr">+973 XXXX XXXX</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 glass rounded-2xl p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">الموقع</p>
                  <p className="font-bold text-foreground">البحرين 🇧🇭</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6 text-right">أرسل رسالة</h3>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <textarea
                  placeholder="رسالتك..."
                  rows={4}
                  className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                إرسال الرسالة
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
