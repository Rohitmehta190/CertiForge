"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Calendar, Award, Zap, ShieldCheck, ArrowRight, LayoutDashboard, QrCode } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const features = [
    {
      title: "Premium Certificate Engine",
      description: "Issue stunning, fully-responsive certificates backed by SVG mesh gradients and dynamic data binding.",
      icon: <Award className="w-6 h-6 text-indigo-400" />,
      color: "rgba(99, 102, 241, 0.1)"
    },
    {
      title: "End-to-End Event Suite",
      description: "Build robust schedules, manage brand sponsorships, and seamlessly handle bulk attendees in seconds.",
      icon: <Calendar className="w-6 h-6 text-pink-400" />,
      color: "rgba(236, 72, 153, 0.1)"
    },
    {
      title: "Live Check-in & Scanning",
      description: "Equip organizers with real-time QR code scanners that sync check-ins immediately via Firebase.",
      icon: <QrCode className="w-6 h-6 text-emerald-400" />,
      color: "rgba(16, 185, 129, 0.1)"
    },
    {
      title: "Global Verification",
      description: "Every document features an irrevocable ID. Verify passes and certs easily on a public authentication ledger.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      color: "rgba(245, 158, 11, 0.1)"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--cf-bg-primary)" }}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-indigo-600/20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-purple-600/20 pointer-events-none"></div>

      {/* Navigation Layer */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold font-outfit tracking-tight text-white">CertiForge<span className="text-indigo-400">Pro</span></span>
        </div>
        
        <div>
          {user ? (
            <Link href="/dashboard" className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105 active:scale-95">
               <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
               <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign In</Link>
               <Link href="/register" className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105 active:scale-95">
                 Get Started
               </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-24 pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-8 animate-fade-in-up">
            <Sparkles className="w-3 h-3" /> Event Suite Launch Let's Go
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white font-outfit tracking-tight mb-6 animate-fade-in-up stagger-1 leading-[1.1] max-w-4xl">
             The Ultimate OS for <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Events & Accolades</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 animate-fade-in-up stagger-2 leading-relaxed">
            CertiForge Pro enables organizers to instantly orchestrate events, mass-generate premium verified credentials, and check-in attendees seamlessly with live QR technology.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up stagger-3">
             <button onClick={() => router.push(user ? '/dashboard' : '/register')} className="gradient-btn px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-all w-full sm:w-auto">
                {user ? "Access Your Dashboard" : "Start Creating Free"} <ArrowRight className="w-5 h-5" />
             </button>
             <button className="px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all w-full sm:w-auto">
               <Zap className="w-5 h-5 text-amber-400" /> Watch Demo
             </button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-24 border-t border-white/5 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-outfit mb-4">Enterprise-grade capabilities.</h2>
            <p className="text-slate-400 text-lg">Everything you need to run professional conferences and programs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-8 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2 duration-300">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-outfit">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Call to Action Footer */}
        <section className="container mx-auto px-4 py-24 mb-12">
           <div className="glass-card rounded-[3rem] p-12 text-center relative overflow-hidden border border-indigo-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
              <div className="relative z-10">
                 <h2 className="text-3xl md:text-5xl font-black text-white font-outfit mb-6">Ready to forge your legacy?</h2>
                 <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">Join hundreds of organizers utilizing CertiForge Pro to power their most important moments.</p>
                 <button onClick={() => router.push(user ? '/dashboard' : '/register')} className="gradient-btn px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-all mx-auto">
                    Join the Platform Now <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </section>
      </main>
      
      <footer className="border-t border-white/5 bg-black/40 py-8 relative z-10 text-center text-sm text-slate-500">
         <p>© {new Date().getFullYear()} CertiForge Pro Event Suite. All rights reserved.</p>
      </footer>
    </div>
  );
}