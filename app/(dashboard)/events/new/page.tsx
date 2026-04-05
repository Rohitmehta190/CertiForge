"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseService } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import BackButton from "@/components/BackButton";
import { Calendar, MapPin, Clock, Image as ImageIcon, Map, FileText, Sparkles, Wand2 } from "lucide-react";
import { format } from "date-fns";

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    bannerUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.date || !formData.venue) {
      showToast("Please fill out all required fields", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const eventId = await FirebaseService.createEvent({
        title: formData.title,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
        sponsors: [] 
      });

      showToast("Event created successfully!", "success");
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      showToast("Failed to create event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setRandomBanner = () => {
    const ids = [1540575467063, 1492538222816, 1501281668741, 1511512578047, 1504384308090, 1551818255988];
    const id = ids[Math.floor(Math.random() * ids.length)];
    setFormData(prev => ({ ...prev, bannerUrl: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200&h=400` }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <BackButton to="/events" label="Back to Events" className="mb-3" />
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
             <Sparkles className="w-8 h-8 text-indigo-400" /> Event Creator Studio
          </h1>
          <p className="text-sm text-slate-400">Design and launch your next big event.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-card p-8 rounded-[2rem] border border-indigo-500/10 shadow-2xl animate-fade-in-up stagger-1 h-full flex flex-col">
            <div className="space-y-6 flex-1">
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4"/> Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., ForwardJS Developer Conference"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xl font-bold placeholder-slate-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4"/> Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm appearance-none"
                    style={{ colorScheme: "dark" }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4"/> Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm appearance-none"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4"/> Venue *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Grand Exhibition Center, NY"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder-slate-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <ImageIcon className="w-4 h-4"/> Hero Banner URL
                   </label>
                   <button type="button" onClick={setRandomBanner} className="flex items-center gap-1.5 text-xs font-medium text-pink-400 hover:text-pink-300">
                     <Wand2 className="w-3 h-3"/> Auto-Fill Banner
                   </button>
                </div>
                <input
                  type="url"
                  name="bannerUrl"
                  value={formData.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-mono placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Map className="w-4 h-4"/> Short Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What is this event about?"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm resize-none placeholder-slate-600"
                />
              </div>

            </div>

            <div className="pt-8 mt-4 border-t border-white/10 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/events")}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="gradient-btn px-8 py-3 rounded-2xl text-sm font-bold disabled:opacity-40 shadow-xl shadow-indigo-500/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Event"
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 relative hidden lg:block">
           <div className="sticky top-24 animate-fade-in-up stagger-2">
             <div className="flex items-center gap-3 mb-6 px-2 text-slate-400 font-medium tracking-wide">
               <div className="w-8 h-px bg-slate-400/50"></div> Live Card Preview
             </div>
             
             <div className="glass-card overflow-hidden shadow-2xl relative w-full aspect-[4/5] flex flex-col group border border-white/10 rounded-3xl">
                {/* Banner */}
                <div className="h-[45%] relative bg-zinc-900 overflow-hidden border-b border-white/10">
                  {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="absolute inset-0 bg-mesh-vibrant opacity-30 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1120] to-transparent opacity-80"></div>

                  {/* Date Badge */}
                  {formData.date && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[4rem] shadow-xl">
                      <div className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider">
                        {format(new Date(formData.date), "MMM")}
                      </div>
                      <div className="text-2xl font-black text-white font-outfit leading-none mt-0.5">
                        {format(new Date(formData.date), "dd")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between bg-[#0c1120]">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-outfit line-clamp-2">
                      {formData.title || "Your Event Title"}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-6">
                      {formData.description || "Your event description will appear here. Add some exciting details to attract attendees!"}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                         <Clock className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="font-medium">{formData.time || "TBA"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                         <MapPin className="w-4 h-4 text-pink-400" />
                      </div>
                      <span className="truncate font-medium">{formData.venue || "Location TBA"}</span>
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
