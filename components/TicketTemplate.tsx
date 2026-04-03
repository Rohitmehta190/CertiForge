"use client";

import { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { format } from "date-fns";

interface TicketTemplateProps {
  attendeeName: string;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  ticketType: string;
  ticketId: string;
  template?: string; // "badge" or "vertical"
  qrData: string;
}

export default function TicketTemplate({
  attendeeName,
  eventName,
  date,
  time,
  venue,
  ticketType,
  ticketId,
  template = "vertical",
  qrData
}: TicketTemplateProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(qrData, { 
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
    .then(url => setQrCodeDataUrl(url))
    .catch(err => console.error("QR Code generation error:", err));
  }, [qrData]);

  const renderTemplate = () => {
    switch (template) {
      case "badge":
        return (
          <div className="relative w-full h-full bg-white border border-zinc-200 overflow-hidden flex flex-col items-center p-8">
            <div className="absolute top-0 left-0 right-0 h-4 bg-indigo-600"></div>
            
            {/* Lanyard hole */}
            <div className="w-16 h-3 bg-zinc-200 rounded-full mt-2 mb-8 mx-auto shadow-inner"></div>

            <div className="flex-1 flex flex-col items-center justify-center w-full text-center">
              <h1 className="text-3xl font-black text-indigo-900 leading-tight mb-2 uppercase tracking-tighter">
                {eventName}
              </h1>
              
              <div className="my-8">
                <p className="text-sm text-zinc-500 uppercase tracking-widest mb-1">Attendee</p>
                <h2 className="text-4xl font-bold text-zinc-900 break-words">{attendeeName}</h2>
                <div className="inline-block mt-3 px-4 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-full text-sm uppercase tracking-wider">
                  {ticketType}
                </div>
              </div>
            </div>

            <div className="w-full mt-auto flex flex-col items-center pt-6 border-t border-zinc-200">
              {qrCodeDataUrl && (
                <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm mb-3">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              )}
              <p className="text-xs font-mono text-zinc-500">{ticketId}</p>
            </div>
          </div>
        );

      case "vertical":
      default:
        return (
          <div className="relative w-full h-full bg-[#0c1120] text-white flex flex-col overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600"></div>
            <div className="absolute top-10 -right-20 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-60"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Event Header */}
              <div className="p-8 pb-12 pt-10 text-center">
                <p className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-2">Admit One</p>
                <h1 className="text-3xl font-bold text-white font-outfit uppercase tracking-tight leading-tight">
                  {eventName}
                </h1>
              </div>

              {/* Main Ticket Body */}
              <div className="flex-1 bg-white mx-4 rounded-t-3xl p-8 text-zinc-900 flex flex-col">
                <div className="flex-1">
                  <div className="mb-6 border-b border-zinc-200 pb-6">
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Pass Holder</p>
                    <h2 className="text-3xl font-bold font-outfit text-zinc-900">{attendeeName}</h2>
                    <span className="inline-block mt-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {ticketType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Date</p>
                      <p className="font-bold text-zinc-800 text-sm">
                        {date ? format(new Date(date), "MMM d, yyyy") : "TBA"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Time</p>
                      <p className="font-bold text-zinc-800 text-sm">{time || "TBA"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Venue</p>
                      <p className="font-bold text-zinc-800 text-sm leading-snug">{venue || "TBA"}</p>
                    </div>
                  </div>
                </div>

                {/* Perforated line effect */}
                <div className="relative h-8 border-t-2 border-dashed border-zinc-300 w-full flex items-center justify-center -mx-8 px-8 my-4">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0c1120]"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0c1120]"></div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <p className="text-[10px] text-zinc-400 font-medium mb-3 uppercase tracking-widest text-center">Scan at Entrance</p>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-36 h-36" />
                  ) : (
                    <div className="w-36 h-36 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400 border border-zinc-200">
                      Generating...
                    </div>
                  )}
                  <p className="text-xs font-mono text-zinc-400 mt-2">{ticketId}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={ticketRef}
      className={template === "badge" ? "w-full aspect-[3/4] shadow-xl" : "w-full aspect-[9/16] max-h-[800px] shadow-2xl"}
      id="ticket-container"
    >
      {renderTemplate()}
    </div>
  );
}
