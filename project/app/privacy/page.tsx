"use client";

import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";

const sections = [
  { title: "مقدمة", content: `نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. من خلال استعمالك لموقعنا، فإنك توافق صراحةً على سياسة الخصوصية والشروط والأحكام الخاصة بنا.` },
  { title: "١. المعلومات التي نجمعها", content: `موقعنا لا يطلب إنشاء حساب أو تسجيل دخول. المعلومات التي نجمعها تقتصر على:\n\n• البريد الإلكتروني: لإرسال المنتجات الرقمية.\n• رقم الهاتف أو الواتساب: للتواصل في حال وجود مشكلة.\n• حساب الإنستغرام (اختياري): للخدمات المخصصة فقط.\n• إيصال الدفع: لتأكيد عملية الدفع.` },
  { title: "٢. كيف نستخدم معلوماتك؟", content: `نستخدم البيانات حصراً لـ:\n\n• معالجة طلباتك وإرسال المنتجات.\n• التأكد من صحة عمليات الدفع.\n• التواصل لتقديم الخدمات المطلوبة.\n• تقديم الدعم الفني.` },
  { title: "٣. مشاركة وحماية البيانات", content: `نحن لا نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة لأغراض تسويقية.\n\nقد تتضمن عملية الدفع تحويلك إلى منصة خارجية (مثل منصة Creators). نحن لسنا مسؤولين عن سياسات الخصوصية الخاصة بتلك المنصات.` },
  { title: "٤. الاحتفاظ بالبيانات", content: `نحتفظ ببيانات الطلب وصور إيصالات الدفع للفترة اللازمة لضمان تسليم المنتج بنجاح ولأغراض المراجعة المالية، وبعد ذلك يتم التخلص منها أو حفظها بشكل آمن.` },
];

export default function PrivacyPage() {
  return (
    <>
      <BackButton />
      <main className="min-h-screen pt-4 pb-20 px-6 mesh-bg">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-right mb-12">
            <p className="text-primary font-bold text-sm tracking-widest mb-2 uppercase">قانوني</p>
            <h1 className="text-4xl font-black text-foreground">سياسة الخصوصية</h1>
          </motion.div>
          <div className="space-y-5">
            {sections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass glow-card rounded-3xl p-7 text-right">
                <h3 className="text-lg font-black text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-loose whitespace-pre-line text-sm">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
