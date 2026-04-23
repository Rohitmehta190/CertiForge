"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function StudentDiscountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.endsWith(".edu") && !email.endsWith(".ac.in") && !email.endsWith(".ac.uk")) {
      setError("Please enter a valid student email ending with .edu, .ac.in, etc.");
      return;
    }

    setLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 1500);
  };

  const handleProceed = () => {
    router.push("/checkout?plan=tier-student&annual=true");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 text-indigo-400 rounded-full mb-6">
          <GraduationCap className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Student Discount</h1>
        <p className="text-xl text-slate-400">Unlock CertiForge Pro for just <span className="text-white font-bold">$7.50/mo</span> (billed annually).</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-indigo-500/10"
      >
        {!verified ? (
          <form onSubmit={handleVerify}>
            <h2 className="text-2xl font-bold text-white mb-6">Verify your student status</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Institution Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-lg"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <button
              disabled={loading || !email}
              type="submit"
              className="w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, var(--cf-accent-1, #6366f1), var(--cf-accent-2, #8b5cf6))" }}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify Status"}
            </button>
            <p className="text-slate-500 text-sm mt-4 text-center">
              By verifying, you confirm that you are currently enrolled at an accredited educational institution.
            </p>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Verification Successful!</h2>
            <p className="text-slate-400 mb-8">Your student status has been confirmed. You're eligible for 50% off CertiForge Pro.</p>
            
            <button
              onClick={handleProceed}
              className="py-4 px-8 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 flex justify-center items-center gap-2 mx-auto"
              style={{ background: "linear-gradient(135deg, var(--cf-accent-1, #6366f1), var(--cf-accent-2, #8b5cf6))" }}
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
