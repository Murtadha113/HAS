"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AboutSection() {
  const [aboutText, setAboutText] = useState("");

  useEffect(() => {
    getDoc(doc(db, "config", "settings")).then((snap) => {
      if (snap.exists()) setAboutText(snap.data().aboutText ?? "");
    });
  }, []);

  if (!aboutText) return null;

  const lines = aboutText.split("\n").filter((l) => l.trim() !== "");
  const title = lines[0] ?? "";
  const body = lines.slice(1).join("\n");

  return (
    <section className="py-20 px-6 mesh-bg">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass neon-glow glow-card rounded-3xl p-10 text-right border border-blue-500/20"
        >
          {title && (
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4 leading-relaxed">
              {title}
            </h2>
          )}
          {body && (
            <p className="text-lg text-foreground/80 leading-loose whitespace-pre-line font-medium">
              {body}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
