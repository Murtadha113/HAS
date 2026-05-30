"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BackButton() {
  return (
    <div className="px-6 pt-8 pb-0 max-w-7xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 glass glow-card px-5 py-2.5 rounded-2xl text-sm font-bold text-foreground hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
      >
        <ArrowRight className="w-4 h-4" />
        الرئيسية
      </Link>
    </div>
  );
}
