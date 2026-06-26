"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Ensure the URL has .pdf extension for Cloudinary
  const cleanUrl = (() => {
    try {
      const parsed = new URL(url);
      if (!parsed.pathname.endsWith(".pdf")) {
        parsed.pathname += ".pdf";
      }
      return parsed.toString();
    } catch {
      return url;
    }
  })();

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: cleanUrl,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/cmaps/",
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setError("Failed to load PDF. The file may be corrupted or inaccessible.");
          setLoading(false);
        }
      }
    }

    if (cleanUrl) {
      loadPdf();
    }

    return () => {
      cancelled = true;
    };
  }, [cleanUrl]);

  // Render a specific page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

      // Cancel any in-progress render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setRendering(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calculate scale to fit the container width
        const containerWidth = containerRef.current.clientWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = (containerWidth - 32) / unscaledViewport.width; // 32px for padding
        const effectiveScale = Math.min(scale, fitScale);

        const viewport = page.getViewport({ scale: effectiveScale });

        // Support high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvas: canvas,
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
        setRendering(false);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Render error:", err);
          setRendering(false);
        }
      }
    },
    [pdfDoc, scale]
  );

  // Re-render on page change, scale change, or when doc loads
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  // Re-render on resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && currentPage > 0) {
        renderPage(currentPage);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, currentPage, renderPage]);

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top toolbar */}
      <div className="bg-neutral-900 px-3 sm:px-4 py-3 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          PDF Preview
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
          </button>
          <span className="text-[11px] text-neutral-400 font-mono min-w-[3.5rem] text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 4}
            className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="w-px h-5 bg-neutral-700 mx-0.5 hidden sm:block" />

          {/* Open in new tab */}
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-md hover:bg-neutral-800"
          >
            <span className="hidden sm:inline">Open</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* PDF Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-950 flex justify-center items-start min-h-[350px] sm:min-h-[500px] max-h-[75vh]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-xs font-medium">Loading document…</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400 font-medium">{error}</p>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              Try opening the PDF directly →
            </a>
          </div>
        )}

        {!loading && !error && (
          <div className="p-2 sm:p-4">
            <canvas
              ref={canvasRef}
              className="block mx-auto rounded shadow-lg"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
      </div>

      {/* Bottom pagination bar */}
      {!loading && !error && totalPages > 0 && (
        <div className="bg-neutral-900 px-3 sm:px-4 py-2.5 border-t border-neutral-800 flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="font-semibold text-white tabular-nums">{currentPage}</span>
            <span>/</span>
            <span className="tabular-nums">{totalPages}</span>
          </div>

          <button
            onClick={goToNext}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
