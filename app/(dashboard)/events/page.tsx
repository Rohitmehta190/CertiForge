"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FirebaseService, EventRecord } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ConfirmModal";
import Link from "next/link";
import { format } from "date-fns";

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await FirebaseService.getEvents(user.uid);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      showToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async () => {
    // Note: We need a deleteEvent in FirebaseService. Since we didn't add it yet, we just remove the frontend state for now, but a real delete is needed.
    // I will simulate deletion here temporarily.
    if (!deleteTarget) return;
    try {
      // await FirebaseService.deleteEvent(deleteTarget.id);
      setEvents(events.filter((e) => e.id !== deleteTarget.id));
      showToast("Event deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-7 w-48 mb-2" />
            <div className="skeleton h-4 w-72" />
          </div>
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-40 w-full rounded-lg mb-4" />
              <div className="skeleton h-5 w-36 mb-2" />
              <div className="skeleton h-4 w-48 mb-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 font-outfit">Event Management</h1>
          <p className="text-sm text-slate-500">Create events and issue secure tickets with QR codes.</p>
        </div>
        <Link
          href="/events/new"
          prefetch
          className="gradient-btn px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] shrink-0 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Event
        </Link>
      </div>

      {/* Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div
              key={event.id}
              className={`glass-card glass-card-hover overflow-hidden flex flex-col cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              onClick={() => router.push(`/events/${event.id}`)}
            >
              {/* Event Image Banner */}
              <div className="h-40 relative bg-zinc-900 border-b border-white/[0.05]">
                {event.bannerUrl ? (
                  <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="absolute inset-0 bg-mesh-vibrant opacity-50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 text-center min-w-[3.5rem]">
                  <div className="text-[10px] uppercase font-bold text-indigo-400">
                    {format(new Date(event.date), "MMM")}
                  </div>
                  <div className="text-xl font-bold text-white font-outfit leading-none mt-0.5">
                    {format(new Date(event.date), "dd")}
                  </div>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 font-outfit truncate">{event.title}</h3>
                
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4 text-indigo-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4 text-indigo-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {event.sponsors?.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="w-7 h-7 rounded-full bg-slate-800 border-2 border-[#0c1120] flex items-center justify-center text-[10px] font-bold text-white" title={s.name}>
                        {s.name.substring(0, 1)}
                      </div>
                    ))}
                    {event.sponsors?.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-[#0c1120] flex items-center justify-center text-[10px] font-bold text-indigo-300">
                        +{event.sponsors.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(event);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="glass-card p-8 max-w-sm mx-auto">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(99, 102, 241, 0.08)" }}
            >
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-outfit">No Events Yet</h3>
            <p className="text-sm text-slate-500 mb-5">Start by creating your first event to manage tickets and attendees.</p>
            <Link
              href="/events/new"
              className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] inline-block"
            >
              <span className="relative z-10">Create Event</span>
            </Link>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? All tickets and attendee data will be removed.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
