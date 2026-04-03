"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FirebaseService, EventRecord, TicketRecord } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import BackButton from "@/components/BackButton";
import { Users, Ticket, CheckCircle, Video, Search, MapPin, Calendar, Clock, Crown, Download, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendees' | 'sponsors'>('overview');

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoading(true);
        const [eventData, ticketsData] = await Promise.all([
          FirebaseService.getEventById(eventId),
          FirebaseService.getEventTickets(eventId)
        ]);

        if (eventData) setEvent(eventData);
        setTickets(ticketsData || []);
      } catch (error) {
        console.error("Error fetching event details:", error);
        showToast("Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId, user, showToast]);

  const checkedInCount = tickets.filter(t => t.status === 'checked-in').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center -mt-10">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin-slow" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-6">The event you are looking for does not exist or has been deleted.</p>
        <BackButton to="/events" label="Return to Events" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden animate-fade-in-up">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-mesh-vibrant" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-black/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <BackButton label="Back" to="/events" className="text-white/80 hover:text-white mb-2 bg-black/20 backdrop-blur-md rounded-lg p-1.5" />
              <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit mb-2 drop-shadow-md">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-200">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(event.date), "MMMM d, yyyy")}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {event.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.venue}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href={`/events/${eventId}/scanner`} className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] flex items-center gap-2">
                <Video className="w-4 h-4" /> Scanner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 animate-fade-in-up stagger-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Calendar },
          { id: 'attendees', label: 'Tickets & Attendees', icon: Ticket },
          { id: 'sponsors', label: 'Sponsors', icon: Crown }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in-up stagger-2">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white font-outfit mb-4">About Event</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {event.description || "No description provided."}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Tickets", value: tickets.length, icon: Ticket, color: "text-blue-400" },
                  { label: "Checked In", value: checkedInCount, icon: CheckCircle, color: "text-emerald-400" },
                  { label: "Pending", value: tickets.length - checkedInCount, icon: Clock, color: "text-amber-400" },
                  { label: "Sponsors", value: event.sponsors?.length || 0, icon: Crown, color: "text-purple-400" },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-5 flex flex-col items-center text-center">
                    <stat.icon className={`w-6 h-6 mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-4">
              <div className="glass-card p-5 border-t-2 border-t-indigo-500">
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href={`/events/${eventId}/tickets/new`} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-white/[0.05] transition-colors text-sm text-slate-300">
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><Plus className="w-4 h-4" /></div>
                    Generate Individual Ticket
                  </Link>
                  <Link href={`/events/${eventId}/tickets/bulk`} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-white/[0.05] transition-colors text-sm text-slate-300">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Users className="w-4 h-4" /></div>
                    Bulk Import Attendees
                  </Link>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-white/[0.05] transition-colors text-sm text-slate-300">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Download className="w-4 h-4" /></div>
                    Export Attendee List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDEES TAB */}
        {activeTab === 'attendees' && (
          <div className="glass-card flex flex-col">
            <div className="p-5 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search attendees..." 
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white w-full sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                 <Link href={`/events/${eventId}/tickets/bulk`} className="px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm font-medium hover:bg-indigo-500/30 transition-colors">
                   Bulk Import
                 </Link>
              </div>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {tickets.length > 0 ? (
                    tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{ticket.attendeeName}</div>
                          <div className="text-xs text-slate-500">{ticket.attendeeEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-400 bg-black/30 px-2 py-1 rounded-md border border-white/5">
                            {ticket.ticketId.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {ticket.status === 'checked-in' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-400/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors">
                            View Ticket
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No tickets generated yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SPONSORS TAB */}
        {activeTab === 'sponsors' && (
          <div className="glass-card p-6 text-center py-16">
            <Crown className="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sponsors Management</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Add sponsors to this event. Their logos can automatically be included in your generated certificates and tickets.
            </p>
            <button className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Sponsor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
