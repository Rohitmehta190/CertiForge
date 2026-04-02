"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  blobPdfFromCertificateElement,
  generateCertificateId,
} from "@/utils/importedCertificatePdf";
import {
  readImageFileAsDataUrl,
  renderPdfFirstPageToDataUrl,
} from "@/utils/renderPdfPage";
import { FirebaseService } from "@/utils/firebaseService";

export type OverlayField = {
  id: string;
  label: string;
  value: string;
  xPct: number;
  yPct: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  align: "left" | "center" | "right";
  maxWidthPct: number;
  /** Hide pixels of the original scan under this line (paper-colored patch). */
  eraseBehind: boolean;
  eraseColor: string;
  eraseOpacity: number;
  erasePadX: number;
  erasePadY: number;
  eraseRadius: number;
};

export type CoverZone = {
  id: string;
  label: string;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  color: string;
  opacity: number;
  radius: number;
};

type Dragging =
  | { type: "field"; id: string }
  | { type: "cover"; id: string }
  | null;

const EXPORT_BASE_W = 800;

const DEFAULT_FIELDS: Omit<OverlayField, "value">[] = [
  {
    id: "name",
    label: "Recipient name",
    xPct: 50,
    yPct: 42,
    fontSize: 34,
    color: "#0a0a0a",
    fontFamily: "system-ui, Segoe UI, sans-serif",
    align: "center",
    maxWidthPct: 88,
    eraseBehind: true,
    eraseColor: "#ffffff",
    eraseOpacity: 1,
    erasePadX: 20,
    erasePadY: 14,
    eraseRadius: 6,
  },
  {
    id: "organization",
    label: "Organization",
    xPct: 50,
    yPct: 52,
    fontSize: 20,
    color: "#262626",
    fontFamily: "system-ui, Segoe UI, sans-serif",
    align: "center",
    maxWidthPct: 82,
    eraseBehind: true,
    eraseColor: "#ffffff",
    eraseOpacity: 1,
    erasePadX: 18,
    erasePadY: 10,
    eraseRadius: 6,
  },
  {
    id: "course",
    label: "Course / achievement",
    xPct: 50,
    yPct: 62,
    fontSize: 22,
    color: "#1e3a8a",
    fontFamily: "Georgia, 'Times New Roman', serif",
    align: "center",
    maxWidthPct: 86,
    eraseBehind: true,
    eraseColor: "#ffffff",
    eraseOpacity: 1,
    erasePadX: 18,
    erasePadY: 10,
    eraseRadius: 6,
  },
  {
    id: "date",
    label: "Date",
    xPct: 50,
    yPct: 71,
    fontSize: 15,
    color: "#404040",
    fontFamily: "system-ui, Segoe UI, sans-serif",
    align: "center",
    maxWidthPct: 70,
    eraseBehind: true,
    eraseColor: "#ffffff",
    eraseOpacity: 1,
    erasePadX: 16,
    erasePadY: 8,
    eraseRadius: 4,
  },
];

function initialFields(certId: string): OverlayField[] {
  const base = DEFAULT_FIELDS.map((f) => ({
    ...f,
    value: f.id === "date" ? new Date().toLocaleDateString() : "",
  }));
  return [
    ...base,
    {
      id: "certificateId",
      label: "Certificate ID",
      value: certId,
      xPct: 50,
      yPct: 88,
      fontSize: 10,
      color: "#525252",
      fontFamily: "ui-monospace, monospace",
      align: "center",
      maxWidthPct: 92,
      eraseBehind: true,
      eraseColor: "#ffffff",
      eraseOpacity: 1,
      erasePadX: 12,
      erasePadY: 8,
      eraseRadius: 4,
    },
  ];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function newCoverZone(preset: "nameBand" | "bodyStrip" | "footer"): CoverZone {
  const id = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (preset === "nameBand") {
    return {
      id,
      label: "Cover: main name area",
      leftPct: 18,
      topPct: 34,
      widthPct: 64,
      heightPct: 22,
      color: "#ffffff",
      opacity: 1,
      radius: 4,
    };
  }
  if (preset === "bodyStrip") {
    return {
      id,
      label: "Cover: body / paragraph",
      leftPct: 12,
      topPct: 56,
      widthPct: 76,
      heightPct: 18,
      color: "#ffffff",
      opacity: 1,
      radius: 4,
    };
  }
  return {
    id,
    label: "Cover: footer / signatures",
    leftPct: 8,
    topPct: 82,
    widthPct: 84,
    heightPct: 12,
    color: "#ffffff",
    opacity: 1,
    radius: 2,
  };
}

export default function ImportedCertificateStudio() {
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
  const [backgroundSrc, setBackgroundSrc] = useState<string | null>(null);
  const [aspectH, setAspectH] = useState(600);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [certId, setCertId] = useState(() => generateCertificateId());
  const [fields, setFields] = useState<OverlayField[]>(() =>
    initialFields(generateCertificateId())
  );
  const [coverZones, setCoverZones] = useState<CoverZone[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("name");
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<Dragging>(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedField =
    fields.find((f) => f.id === selectedFieldId) ?? fields[0];
  const selectedCover = coverZones.find((z) => z.id === selectedCoverId);

  const applyBackgroundFromDataUrl = useCallback(
    (dataUrl: string, w: number, h: number) => {
      setBackgroundSrc(dataUrl);
      const ratio = h / w;
      setAspectH(Math.round(EXPORT_BASE_W * ratio));
      const nextId = generateCertificateId();
      setCertId(nextId);
      setFields(initialFields(nextId));
      setCoverZones([
        newCoverZone("nameBand"),
        newCoverZone("bodyStrip"),
      ]);
      setSelectedFieldId("name");
      setSelectedCoverId(null);
      setError("");
    },
    []
  );

  const onFile = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setBusy(true);
      setError("");
      try {
        if (
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf")
        ) {
          const { dataUrl, width, height } =
            await renderPdfFirstPageToDataUrl(file, 2);
          applyBackgroundFromDataUrl(dataUrl, width, height);
        } else if (file.type.startsWith("image/")) {
          const dataUrl = await readImageFileAsDataUrl(file);
          const img = new Image();
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error("Invalid image"));
            img.src = dataUrl;
          });
          applyBackgroundFromDataUrl(
            dataUrl,
            img.naturalWidth,
            img.naturalHeight
          );
        } else {
          setError("Please upload a PNG, JPG, or PDF file.");
        }
      } catch (e: unknown) {
        console.error(e);
        setError("Could not read that file. Try another image or PDF.");
      } finally {
        setBusy(false);
      }
    },
    [applyBackgroundFromDataUrl]
  );

  const startDragField = (f: OverlayField, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = certRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    dragOffsetRef.current = { dx: mx - f.xPct, dy: my - f.yPct };
    setSelectedFieldId(f.id);
    setSelectedCoverId(null);
    setDragging({ type: "field", id: f.id });
  };

  const startDragCover = (z: CoverZone, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = certRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    dragOffsetRef.current = { dx: mx - z.leftPct, dy: my - z.topPct };
    setSelectedCoverId(z.id);
    setDragging({ type: "cover", id: z.id });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const rect = certRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      const { dx, dy } = dragOffsetRef.current;
      if (dragging.type === "field") {
        setFields((prev) =>
          prev.map((f) =>
            f.id === dragging.id
              ? {
                  ...f,
                  xPct: clamp(mx - dx, 0, 100),
                  yPct: clamp(my - dy, 0, 100),
                }
              : f
          )
        );
      } else {
        setCoverZones((prev) =>
          prev.map((z) =>
            z.id === dragging.id
              ? {
                  ...z,
                  leftPct: clamp(mx - dx, 0, Math.max(0, 100 - z.widthPct)),
                  topPct: clamp(my - dy, 0, Math.max(0, 100 - z.heightPct)),
                }
              : z
          )
        );
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const updateField = (id: string, patch: Partial<OverlayField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const updateCover = (id: string, patch: Partial<CoverZone>) => {
    setCoverZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...patch } : z))
    );
  };

  const getName = () => fields.find((f) => f.id === "name")?.value.trim() ?? "";
  const getOrg = () =>
    fields.find((f) => f.id === "organization")?.value.trim() ?? "";
  const getCourse = () =>
    fields.find((f) => f.id === "course")?.value.trim() ?? "";
  const getDate = () =>
    fields.find((f) => f.id === "date")?.value.trim() ?? "";

  const buildPdf = async (): Promise<Blob | null> => {
    if (!certRef.current) return null;
    return blobPdfFromCertificateElement(certRef.current);
  };

  const onDownloadPdf = async () => {
    if (!backgroundSrc || !certRef.current) return;
    try {
      setBusy(true);
      const blob = await buildPdf();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("PDF export failed.");
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    const name = getName();
    if (!name) {
      setError("Add the recipient name before saving.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required to save the certificate.");
      return;
    }
    if (!backgroundSrc || !certRef.current) return;
    setSaving(true);
    setError("");
    try {
      const blob = await buildPdf();
      if (!blob) throw new Error("No PDF");
      const org = getOrg();
      const courseLine = getCourse();
      const dateLine = getDate();
      const courseParts = [org, courseLine].filter(Boolean);
      const course =
        courseParts.length > 0
          ? courseParts.join(" · ")
          : dateLine
            ? `Imported design (${dateLine})`
            : "Imported design";

      await FirebaseService.saveCertificate(
        {
          name,
          email: email.trim(),
          course,
          date: dateLine || undefined,
          certificateId: certId,
        },
        blob
      );
      router.push("/certificates");
    } catch (e) {
      console.error(e);
      setError("Save failed. Check your connection or try again.");
    } finally {
      setSaving(false);
    }
  };

  const transformForField = (f: OverlayField) => {
    if (f.align === "center") return "translate(-50%, -50%)";
    if (f.align === "right") return "translate(-100%, -50%)";
    return "translate(0, -50%)";
  };

  const displayText = (f: OverlayField) => {
    if (f.id === "certificateId") return certId;
    if (f.value) return f.value;
    if (f.id === "name") return "Recipient name";
    if (f.id === "organization") return "Organization";
    return "";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Import certificate design
        </h1>
        <p className="text-zinc-400 max-w-3xl">
          Your file is a <strong className="text-zinc-300">flat picture</strong>{" "}
          (PNG, JPG, or first page of a PDF). The old names and sentences are
          still <em>pixels</em> in that picture — the app cannot truly
          “replace” them like Word. Instead, we{" "}
          <strong className="text-zinc-300">cover</strong> those areas with
          patches the same color as the paper, then draw your new text on top.
          After upload you get two starter cover areas — drag and resize them
          over the old wording. Each text line also has a{" "}
          <strong className="text-zinc-300">paper patch</strong> behind it you
          can tune.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Certificate file (image or PDF)
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf,.pdf"
          disabled={busy}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-zinc-200"
          onChange={(e) => onFile(e.target.files)}
        />
        {busy && !backgroundSrc && (
          <p className="mt-3 text-sm text-zinc-500">Loading file…</p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {backgroundSrc && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
          <div>
            <p className="text-sm text-zinc-400 mb-3">
              <span className="text-amber-200/90">Orange ring</span> boxes are
              cover patches (under your text). Drag them over old printed names
              and paragraphs.{" "}
              <span className="text-white">White ring</span> is the selected
              text line — drag to position; use the paper patch options in the
              panel.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div
                ref={certRef}
                id="certificate"
                className="relative mx-auto shadow-2xl overflow-hidden"
                style={{
                  width: EXPORT_BASE_W,
                  height: aspectH,
                  backgroundImage: `url(${backgroundSrc})`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {coverZones.map((z) => (
                  <div
                    key={z.id}
                    className={`absolute z-[1] select-none ${
                      selectedCoverId === z.id
                        ? "ring-2 ring-amber-400/90 ring-offset-2 ring-offset-zinc-950"
                        : ""
                    }`}
                    style={{
                      left: `${z.leftPct}%`,
                      top: `${z.topPct}%`,
                      width: `${z.widthPct}%`,
                      height: `${z.heightPct}%`,
                      backgroundColor: z.color,
                      opacity: z.opacity,
                      borderRadius: z.radius,
                      cursor:
                        dragging?.type === "cover" && dragging.id === z.id
                          ? "grabbing"
                          : "grab",
                    }}
                    onMouseDown={(e) => startDragCover(z, e)}
                    title={z.label}
                  />
                ))}

                {fields.map((f) => (
                  <div
                    key={f.id}
                    role="button"
                    tabIndex={0}
                    className={`absolute z-10 select-none ${
                      selectedFieldId === f.id && !selectedCoverId
                        ? "ring-2 ring-white/90 rounded-sm"
                        : ""
                    }`}
                    style={{
                      left: `${f.xPct}%`,
                      top: `${f.yPct}%`,
                      transform: transformForField(f),
                      maxWidth: `${f.maxWidthPct}%`,
                      cursor:
                        dragging?.type === "field" && dragging.id === f.id
                          ? "grabbing"
                          : "grab",
                    }}
                    onMouseDown={(e) => startDragField(f, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedFieldId(f.id);
                        setSelectedCoverId(null);
                      }
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        maxWidth: "100%",
                      }}
                    >
                      {f.eraseBehind && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            inset: `-${f.erasePadY}px -${f.erasePadX}px`,
                            backgroundColor: f.eraseColor,
                            opacity: f.eraseOpacity,
                            borderRadius: f.eraseRadius,
                            zIndex: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "block",
                          fontSize: f.fontSize,
                          color: f.color,
                          fontFamily: f.fontFamily,
                          textAlign: f.align,
                          lineHeight: 1.25,
                          wordBreak: "break-word",
                        }}
                      >
                        {displayText(f)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={onDownloadPdf}
                className="px-4 py-2.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-all duration-200 border border-zinc-700 disabled:opacity-50"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Cover patches (hide old text)
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Drag rectangles over old printed lines. Match{" "}
                <strong className="text-zinc-400">patch color</strong> to your
                certificate paper (often <code className="text-zinc-400">#ffffff</code>).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                  onClick={() => {
                    const z = newCoverZone("nameBand");
                    setCoverZones((p) => [...p, z]);
                    setSelectedCoverId(z.id);
                  }}
                >
                  + Name band
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                  onClick={() => {
                    const z = newCoverZone("bodyStrip");
                    setCoverZones((p) => [...p, z]);
                    setSelectedCoverId(z.id);
                  }}
                >
                  + Body strip
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                  onClick={() => {
                    const z = newCoverZone("footer");
                    setCoverZones((p) => [...p, z]);
                    setSelectedCoverId(z.id);
                  }}
                >
                  + Footer
                </button>
              </div>

              <div className="space-y-1 max-h-36 overflow-y-auto">
                {coverZones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedCoverId(z.id)}
                    className={`w-full text-left px-2 py-2 rounded text-xs border ${
                      selectedCoverId === z.id
                        ? "border-amber-500/80 bg-zinc-800 text-white"
                        : "border-zinc-800 bg-zinc-900/80 text-zinc-400"
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>

              {selectedCover && (
                <div className="border-t border-zinc-800 pt-3 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-500">Left %</label>
                      <input
                        type="number"
                        value={Math.round(selectedCover.leftPct)}
                        onChange={(e) =>
                          updateCover(selectedCover.id, {
                            leftPct: clamp(
                              Number(e.target.value) || 0,
                              0,
                              100
                            ),
                          })
                        }
                        className="mt-0.5 w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500">Top %</label>
                      <input
                        type="number"
                        value={Math.round(selectedCover.topPct)}
                        onChange={(e) =>
                          updateCover(selectedCover.id, {
                            topPct: clamp(
                              Number(e.target.value) || 0,
                              0,
                              100
                            ),
                          })
                        }
                        className="mt-0.5 w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500">Width %</label>
                      <input
                        type="number"
                        value={Math.round(selectedCover.widthPct)}
                        onChange={(e) =>
                          updateCover(selectedCover.id, {
                            widthPct: clamp(
                              Number(e.target.value) || 10,
                              5,
                              100
                            ),
                          })
                        }
                        className="mt-0.5 w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500">Height %</label>
                      <input
                        type="number"
                        value={Math.round(selectedCover.heightPct)}
                        onChange={(e) =>
                          updateCover(selectedCover.id, {
                            heightPct: clamp(
                              Number(e.target.value) || 10,
                              5,
                              100
                            ),
                          })
                        }
                        className="mt-0.5 w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-500">Color</label>
                      <input
                        type="color"
                        value={selectedCover.color}
                        onChange={(e) =>
                          updateCover(selectedCover.id, {
                            color: e.target.value,
                          })
                        }
                        className="mt-0.5 h-8 w-full rounded border border-zinc-700 bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500">Opacity</label>
                      <input
                        type="range"
                        min={0.3}
                        max={1}
                        step={0.05}
                        value={selectedCover.opacity}
                        onChange={(e) =>
                          updateCover(selectedCover.id, {
                            opacity: Number(e.target.value),
                          })
                        }
                        className="w-full mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">
                      Corner radius (px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={selectedCover.radius}
                      onChange={(e) =>
                        updateCover(selectedCover.id, {
                          radius: Number(e.target.value),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => {
                      setCoverZones((p) =>
                        p.filter((x) => x.id !== selectedCover.id)
                      );
                      setSelectedCoverId(null);
                    }}
                  >
                    Remove this patch
                  </button>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Text fields</h2>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {fields.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFieldId(f.id);
                      setSelectedCoverId(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFieldId === f.id && !selectedCoverId
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {!selectedCoverId && (
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <label className="block text-xs text-zinc-500">
                    {selectedField.label}
                  </label>
                  <textarea
                    value={
                      selectedField.id === "certificateId"
                        ? certId
                        : selectedField.value
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (selectedField.id === "certificateId") {
                        setCertId(v);
                        updateField("certificateId", { value: v });
                      } else {
                        updateField(selectedField.id, { value: v });
                      }
                    }}
                    rows={selectedField.id === "certificateId" ? 2 : 3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                  />

                  <div className="rounded-lg border border-zinc-700 p-3 space-y-2 bg-zinc-800/40">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedField.eraseBehind}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            eraseBehind: e.target.checked,
                          })
                        }
                      />
                      Paper patch behind this line
                    </label>
                    {selectedField.eraseBehind && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-zinc-500">
                              Patch color
                            </label>
                            <input
                              type="color"
                              value={selectedField.eraseColor}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  eraseColor: e.target.value,
                                })
                              }
                              className="mt-0.5 h-8 w-full rounded border border-zinc-700"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500">
                              Patch opacity
                            </label>
                            <input
                              type="range"
                              min={0.5}
                              max={1}
                              step={0.05}
                              value={selectedField.eraseOpacity}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  eraseOpacity: Number(e.target.value),
                                })
                              }
                              className="w-full mt-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-zinc-500">
                              Pad H
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={48}
                              value={selectedField.erasePadX}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  erasePadX: Number(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500">
                              Pad V
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={40}
                              value={selectedField.erasePadY}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  erasePadY: Number(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500">Font size</label>
                      <input
                        type="range"
                        min={8}
                        max={64}
                        value={selectedField.fontSize}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500">Text color</label>
                      <input
                        type="color"
                        value={selectedField.color}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            color: e.target.value,
                          })
                        }
                        className="mt-1 h-9 w-full rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500">Font</label>
                    <select
                      value={selectedField.fontFamily}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          fontFamily: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    >
                      <option value="Georgia, 'Times New Roman', serif">
                        Serif
                      </option>
                      <option value="system-ui, Segoe UI, sans-serif">
                        Sans
                      </option>
                      <option value="ui-monospace, monospace">Monospace</option>
                      <option value="'Palatino Linotype', Palatino, serif">
                        Palatino
                      </option>
                      <option value="'Segoe Script', cursive">Script</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500">Align</label>
                    <select
                      value={selectedField.align}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          align: e.target.value as OverlayField["align"],
                        })
                      }
                      className="mt-1 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500">Max width %</label>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={selectedField.maxWidthPct}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          maxWidthPct: Number(e.target.value),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Save record</h2>
              <p className="text-sm text-zinc-500">
                Required for <em>My Certificates</em> (same as CSV upload).
              </p>
              <div>
                <label className="text-xs text-zinc-500">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@organization.com"
                  className="mt-1 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                />
              </div>
              <button
                type="button"
                disabled={saving || busy}
                onClick={onSave}
                className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save to My Certificates"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = generateCertificateId();
                  setCertId(next);
                  setFields((prev) =>
                    prev.map((f) =>
                      f.id === "certificateId" ? { ...f, value: next } : f
                    )
                  );
                }}
                className="w-full py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                New certificate ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
