"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Shield, Zap, Target } from "lucide-react";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    price: { monthly: "$0", yearly: "$0" },
    description: "Perfect for exploring basic template creation.",
    features: [
      "Up to 5 certificate templates",
      "Standard PDF export",
      "Basic email support",
      "Community forum access",
    ],
    notIncluded: ["Bulk CSV importing", "QR-based verification", "Custom branding", "Priority check-in"],
    cta: "Current Plan",
    mostPopular: false,
    icon: Target,
  },
  {
    name: "Pro",
    id: "tier-pro",
    price: { monthly: "$15", yearly: "$12" }, // Real representation $15/month or $144/year
    description: "Everything you need for professional event management.",
    features: [
      "Unlimited templates",
      "High-res PDF & PNG exports",
      "Bulk CSV importing",
      "QR-based live check-in system",
      "Remove CertiForge watermarks",
      "Priority email support",
    ],
    notIncluded: ["Dedicated account manager", "Custom API integration"],
    cta: "Upgrade to Pro",
    mostPopular: true,
    icon: Zap,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    price: { monthly: "$49", yearly: "$39" },
    description: "Advanced features and support for large organizations.",
    features: [
      "Everything in Pro",
      "Custom API integration",
      "Dedicated account manager",
      "Advanced team collaboration",
      "Custom branding & SSO",
      "24/7 Phone support",
      "SLA assurance",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    mostPopular: false,
    icon: Shield,
  },
];

export default function SubscriptionPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6"
        >
          Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">pricing</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400 mb-10"
        >
          Whether you're hosting a small meetup or a massive conference, we have a plan that perfectly scales with your needs.
        </motion.p>

        {/* Toggle switch */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-400"}`}>Monthly</span>
          <button
            type="button"
            className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            style={{ backgroundColor: annual ? "var(--cf-accent-1, #6366f1)" : "#334155" }}
            onClick={() => setAnnual(!annual)}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${annual ? "translate-x-7" : "translate-x-0"}`}
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 ${annual ? "text-white" : "text-slate-400"}`}>
            Annually <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">Save 20%</span>
          </span>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-8 max-w-7xl mx-auto items-start">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`
              relative flex flex-col p-8 rounded-3xl h-full backdrop-blur-md transition-all duration-300
              ${tier.mostPopular ? 'border-2 scale-100 lg:scale-105 z-10 shadow-2xl shadow-indigo-500/20' : 'border border-white/10 scale-100 mt-0 lg:mt-5'}
            `}
            style={{
              background: tier.mostPopular 
                ? "linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.95) 100%)" 
                : "rgba(20, 20, 30, 0.6)",
              borderColor: tier.mostPopular ? "var(--cf-accent-1, #6366f1)" : "rgba(255, 255, 255, 0.05)",
            }}
          >
            {tier.mostPopular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-400">{tier.description}</p>
              </div>
              <div className={`p-3 rounded-2xl ${tier.mostPopular ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-300'}`}>
                <tier.icon className="w-6 h-6" />
              </div>
            </div>

            <div className="mb-8 flex items-end gap-2">
              <span className="text-5xl font-black text-white">{annual ? tier.price.yearly : tier.price.monthly}</span>
              <span className="text-slate-400 font-medium mb-1">/mo</span>
              {annual && tier.price.yearly !== "$0" && (
                <span className="text-xs text-slate-500 line-through mb-2 ml-1">{tier.price.monthly}</span>
              )}
            </div>

            <button
              className={`
                mt-auto w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]
                ${tier.mostPopular 
                  ? 'text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40' 
                  : 'bg-white/5 text-white hover:bg-white/10'}
              `}
              style={tier.mostPopular ? {
                background: "linear-gradient(135deg, var(--cf-accent-1, #6366f1), var(--cf-accent-2, #8b5cf6))"
              } : {}}
            >
              {tier.cta}
            </button>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-sm font-medium text-white mb-4">What's included</p>
              <ul className="space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-slate-300">
                    <Check className={`w-5 h-5 shrink-0 ${tier.mostPopular ? "text-indigo-400" : "text-emerald-400"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.notIncluded.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-slate-500">
                    <X className="w-5 h-5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* FAQ or Trust badges placeholder */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-24 text-center border-t border-white/5 pt-12"
      >
        <p className="text-slate-400 text-sm">Trusted by event organizers worldwide. Need help deciding? <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Contact us</a>.</p>
      </motion.div>
    </div>
  );
}
