"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseService } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import BackButton from "@/components/BackButton";

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
        sponsors: [] // Initialize with no sponsors
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

  // Generate generic placeholder
  const setRandomBanner = () => {
    const ids = [1540575467063, 1492538222816, 1501281668741, 1511512578047];
    const id = ids[Math.floor(Math.random() * ids.length)];
    setFormData(prev => ({ ...prev, bannerUrl: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200&h=400` }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <BackButton to="/events" label="Back to Events" className="mb-3" />
        <h1 className="text-2xl font-bold text-white mb-1 font-outfit">Create New Event</h1>
        <p className="text-sm text-slate-500">Set up your event details to start generating tickets.</p>
      </div>

      <div className="glass-card p-6 sm:p-8 animate-fade-in-up stagger-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Tech Conference 2024"
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow font-outfit"
                style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)" }}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                  style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)", colorScheme: "dark" }}
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                  style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)", colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Venue *</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., Grand Ballroom, City Center"
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)" }}
                required
              />
            </div>

            {/* Banner URL */}
            <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Banner Image URL</label>
                 <button type="button" onClick={setRandomBanner} className="text-xs text-indigo-400 hover:text-indigo-300">Generate Random Placeholder</button>
               </div>
              <input
                type="url"
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)" }}
              />
              {formData.bannerUrl && (
                <div className="mt-3 h-32 rounded-lg overflow-hidden border border-white/10 relative">
                   <img src={formData.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Brief description of the event..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow resize-none"
                style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.12)" }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
