"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Users, Loader2, CheckCircle2 } from "lucide-react";

export default function CollegeDiscountPage() {
  const router = useRouter();
  const [seats, setSeats] = useState(50);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Base price is $15/mo. With volume discounts:
  // 50-100 seats: $10/mo
  // 101-500 seats: $8/mo
  // 501+ seats: $5/mo
  const getPricePerSeat = (count: number) => {
    if (count > 500) return 5;
    if (count > 100) return 8;
    return 10;
  };

  const pricePerSeat = getPricePerSeat(seats);
  const totalMonthly = seats * pricePerSeat;
  const totalYearly = totalMonthly * 12 * 0.8; // 20% annual discount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-4 bg-purple-500/20 text-purple-400 rounded-full mb-6">
          <Building2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">College & Institutional Pricing</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Equip your entire campus with CertiForge Pro. Get bulk licensing discounts that scale with your institution's size.
        </p>
      </motion.div>

      {!submitted ? (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" /> Estimate Your Plan
            </h2>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-slate-400">Number of Licenses (Seats)</label>
                <span className="text-2xl font-bold text-white bg-slate-800 px-4 py-1 rounded-lg border border-slate-700">{seats}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>50</span>
                <span>1000+</span>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Price per Seat</span>
                <span className="text-white font-bold">${pricePerSeat}/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Monthly</span>
                <span className="text-white font-bold">${totalMonthly}/mo</span>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Total Annually (20% Off)</span>
                <span className="text-purple-400 font-bold text-2xl">${totalYearly.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Request Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Institution Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="University of Example"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Your Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="Jane Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Work Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="jane@university.edu"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Additional Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about your requirements..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow resize-none"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="mt-4 w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, var(--cf-accent-2, #8b5cf6), #d946ef)" }}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Request"}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Request Sent Successfully!</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Thank you for your interest in CertiForge Pro for your institution. Our educational sales team will review your request and get back to you within 24 hours with a custom quote.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="py-3 px-8 rounded-xl font-bold text-white shadow-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-600"
          >
            Return to Dashboard
          </button>
        </motion.div>
      )}
    </div>
  );
}
