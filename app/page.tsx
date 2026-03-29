"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, TrendingUp, Search, Building2, MapPin } from "lucide-react";

export default function HomePage() {
  // --- Animation Variants (The "Premium Motion" Logic) ---
  
  // 1. Container Variants for Staggering Children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between each child
        delayChildren: 0.3,
      },
    },
  };

  // 2. Individual Item Variants (Fade Up & Scale)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring", // Use spring for natural bounce
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  // 3. Floating Action Bar Animation
  const floatingBarVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        delay: 0.8, // Appears last for emphasis
      },
    },
    hover: {
      y: -5, // Subtle float up on hover
      boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)", // Emerald shadow
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-emerald-100 overflow-hidden relative">
      {/* Background Graphic Element - Large, Subtle */}
      <div className="absolute top-0 right-0 w-[60%] h-[100vh] bg-[#F7FDF9] rounded-l-[100px] z-0 pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Side: Headlines & Text */}
          <div className="md:col-span-8 flex flex-col items-start">
            <motion.div
              variants={itemVariants}
              className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700 shadow-inner"
            >
              <Building2 className="w-4 h-4" />
              <span>THE DIGITAL MARKETPLACE FOR SUSTAINABILITY</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 mb-8 leading-[0.95]"
            >
              Maximize Value. <br />
              <span className="text-emerald-600">Eliminate</span> Waste.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl font-normal leading-relaxed"
            >
              WasteBid is the premier auction platform transforming industrial
              by-products into raw resources. Connect, bid, and trade with verified
              global partners instantly.
            </motion.p>
          </div>
        </div>

        {/* --- Dribbble-Style FLOATING ACTION BAR (Logic preserved) --- */}
        <motion.div
          variants={floatingBarVariants}
          whileHover="hover"
          className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] w-[90%] max-w-5xl bg-slate-950 rounded-[32px] p-4 flex flex-col md:flex-row items-center gap-4 shadow-2xl shadow-slate-300"
        >
          {/* Visual Only: Icon & Text */}
          <div className="flex items-center gap-4 text-white flex-1 px-4 border-b md:border-b-0 md:border-r border-slate-700 pb-4 md:pb-0 w-full md:w-auto">
            <Search className="w-8 h-8 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-400 font-medium">Search Materials</span>
              <span className="text-lg font-semibold tracking-tight text-white">Metal, Plastic, Paper...</span>
            </div>
          </div>
          
          {/* Visual Only: Location Icon & Text */}
          <div className="flex items-center gap-4 text-white flex-1 px-4 border-b md:border-b-0 md:border-r border-slate-700 pb-4 md:pb-0 w-full md:w-auto">
            <MapPin className="w-8 h-8 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-400 font-medium">Location</span>
              <span className="text-lg font-semibold tracking-tight text-white">Global Listings</span>
            </div>
          </div>

          {/* Actual LOGIC BUTTONS */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            <Link
              href="/marketplace"
              className="px-8 py-5 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition-colors group text-lg"
            >
              Explore Market
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/listings/create"
              className="px-8 py-5 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-100 transition-colors text-lg"
            >
              Sell Material
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* --- BENTO GRID FEATURES SECTION --- */}
      <section className="px-6 md:px-12 pt-32 pb-40 max-w-7xl mx-auto z-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }} // Trigger when 150px in view
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Feature Card 1 (Large Bento) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="md:col-span-2 bg-white rounded-[40px] p-12 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group"
          >
            {/* Subtle Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <Zap className="w-16 h-16 text-emerald-500 mb-10" />
                <h3 className="text-4xl font-extrabold text-slate-950 mb-4 tracking-tighter">
                  Real-Time Bidding Engine.
                </h3>
              </div>
              <p className="text-slate-600 text-xl leading-relaxed max-w-xl">
                Experience the adrenaline of Live auctions. Our proprietary WebSocket technology ensures your bids are updated with zero latency, maximizing your chances of winning the materials you need.
              </p>
            </div>
          </motion.div>

          {/* Feature Card 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="bg-slate-950 rounded-[40px] p-12 text-white flex flex-col justify-between"
          >
            <ShieldCheck className="w-16 h-16 text-emerald-400 mb-16" />
            <div>
              <h3 className="text-3xl font-extrabold mb-4 tracking-tight">
                Verified Global <br /> Network.
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                Trade with total peace of mind. Every participant undergoes strict verification, ensuring a secure and compliant environment.
              </p>
            </div>
          </motion.div>

          {/* Feature Card 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between"
          >
            <TrendingUp className="w-16 h-16 text-blue-500 mb-16" />
            <div>
              <h3 className="text-3xl font-extrabold text-slate-950 mb-4 tracking-tight">
                Live Market <br /> Analytics.
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Stay ahead with real-time price trends and historical data. Make data-driven decisions for optimal waste management ROI.
              </p>
            </div>
          </motion.div>

          {/* Feature Card 4 (Large Bento with Image/Illustration Placeholder) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="md:col-span-2 bg-[#F9FBFA] rounded-[40px] p-12 border border-emerald-50 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative"
          >
            <div className="flex-1">
              <h3 className="text-4xl font-extrabold text-slate-950 mb-6 tracking-tighter">
                Fuel the Circular Economy.
              </h3>
              <p className="text-slate-600 text-xl leading-relaxed max-w-lg">
                Join our mission to eliminate industrial waste. By connecting by-products with companies that need them, we turn environmental challenges into sustainable business opportunities.
              </p>
            </div>
            {/* Visual Placeholder: An abstract representation of circularity */}
            <div className="w-40 h-40 md:w-60 md:h-60 rounded-full bg-emerald-100 border-4 border-dashed border-emerald-300 flex items-center justify-center relative">
                <Building2 className="w-20 h-20 text-emerald-600" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-[spin_10s_linear_infinite]" />
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}