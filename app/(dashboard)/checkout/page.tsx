"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, ShieldCheck, Loader2 } from "lucide-react";

const tierDetails = {
  "tier-free": { name: "Free", priceMonthly: 0, priceYearly: 0 },
  "tier-pro": { name: "Pro", priceMonthly: 15, priceYearly: 144 },
  "tier-enterprise": { name: "Enterprise", priceMonthly: 49, priceYearly: 468 },
  "tier-student": { name: "Pro (Student)", priceMonthly: 7.5, priceYearly: 72 },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const planId = searchParams.get("plan") || "tier-pro";
  const isAnnual = searchParams.get("annual") === "true";
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const details = tierDetails[planId as keyof typeof tierDetails] || tierDetails["tier-pro"];
  const amount = isAnnual ? details.priceYearly : details.priceMonthly;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }, 1500);
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center max-w-md w-full"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-400 mb-6">Welcome to CertiForge {details.name}. Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
        <p className="text-slate-400">Complete your subscription to unlock premium features.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <form onSubmit={handleCheckout} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Payment Method
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cardholder Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Card Number</label>
                <input 
                  required
                  type="text" 
                  placeholder="•••• •••• •••• ••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Expiry Date</label>
                  <input 
                    required
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">CVC</label>
                  <input 
                    required
                    type="text" 
                    placeholder="123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-8 w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, var(--cf-accent-1, #6366f1), var(--cf-accent-2, #8b5cf6))" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${amount}`}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Payments are secure and encrypted.
            </p>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-3xl sticky top-8">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-300">
                <span>{details.name} Plan</span>
                <span>${amount}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Billing Cycle</span>
                <span>{isAnnual ? "Annually" : "Monthly"}</span>
              </div>
              <div className="h-px bg-white/10 w-full my-4" />
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total Due</span>
                <span>${amount}</span>
              </div>
            </div>
            
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200">
              <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
