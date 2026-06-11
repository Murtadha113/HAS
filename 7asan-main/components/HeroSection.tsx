"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const words = [
  { text: "حاول", color: "text-white" },
  { text: "مجدداً", color: "text-white" },
  { text: "ستصل", color: "text-blue-400" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden mesh-bg flex items-center pt-24">
      {/* Animated Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="float-slow absolute top-[5%] right-[10%] w-96 h-96 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/30" />
        <div className="float-med absolute bottom-[10%] left-[5%] w-80 h-80 rounded-full bg-purple-500/15 blur-3xl dark:bg-purple-500/20" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/15 animate-pulse" />
        
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.03]">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-right order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-glow mb-8 border border-blue-500/30"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-semibold text-blue-300">أحول الأفكار إلى تجارب رقمية استثنائية</span>
            </motion.div>

            {/* Headline */}
            <div className="mb-8 space-y-0">
              {words.map((word, i) => (
                <motion.div 
                  key={word.text}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={`block text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight ${word.color}`}>
                    {word.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-md mb-10"
            >
              هنا ستجد ما هو رقمي أفادني أو ما تعلمته ومن الممكن أن يفيدك
            </motion.p>


          </motion.div>

          {/* Right Content - Enlarged Profile Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 lg:order-2 flex justify-center"
          >
            {/* Profile Circle with Neon Border */}
            <div className="relative w-full max-w-md"> {/* Increased max-w from sm to md */}
              {/* Rotating Borders */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 rounded-full border border-dashed border-blue-500/40"
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-12 rounded-full border border-dashed border-purple-500/20"
              />

              {/* Profile Image Container - Larger Circle */}
              <div className="relative aspect-square rounded-full overflow-hidden glass neon-glow shadow-2xl shadow-blue-500/40 border-4 border-blue-500/20">
                <Image 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-23%20at%204.38.32%20PM-UrveuBf2oTXTGnQnSUUYKLawPE5vP3.jpeg"
                  alt="7snjami" 
                  fill 
                  className="object-cover object-top scale-100" 
                  priority 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
