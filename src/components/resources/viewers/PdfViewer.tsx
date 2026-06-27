"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDFJS worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [inputPage, setInputPage] = useState("1");
  const [scale, setScale] = useState(1.25);
  const [modalScale, setModalScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // 1. Initialize progress from localStorage and server API
  useEffect(() => {
    let cancelled = false;
    async function initProgress() {
      if (!url) return;
      const localKey = `pdf_progress_${url}`;
      const localVal = localStorage.getItem(localKey);
      let pageToSet = localVal ? parseInt(localVal, 10) : 1;

      try {
        const res = await fetch(`/api/pdf-progress?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.success && json.data?.page) {
          const serverPage = json.data.page;
          if (!localVal || serverPage > pageToSet) {
            pageToSet = serverPage;
            localStorage.setItem(localKey, pageToSet.toString());
          } else if (localVal && pageToSet !== serverPage) {
            // Sync local storage position with the server
            fetch("/api/pdf-progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url, page: pageToSet }),
            }).catch((err) => console.error("Sync error:", err));
          }
        }
      } catch (err) {
        console.error("Failed to fetch PDF progress:", err);
      }

      if (!cancelled && pageToSet >= 1) {
        setCurrentPage(pageToSet);
        setInputPage(pageToSet.toString());
      }
    }
    initProgress();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // 2. Debounced save progress on currentPage change
  useEffect(() => {
    if (!url) return;
    const localKey = `pdf_progress_${url}`;
    localStorage.setItem(localKey, currentPage.toString());
    setInputPage(currentPage.toString());

    const timer = setTimeout(() => {
      fetch("/api/pdf-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, page: currentPage }),
      }).catch((err) => console.error("Update progress error:", err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [url, currentPage]);

  // 3. Load the PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/cmaps/",
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setError("Failed to load PDF document. Please verify your credentials or try downloading it.");
          setLoading(false);
        }
      }
    }

    if (url) {
      loadPdf();
    }

    return () => {
      cancelled = true;
    };
  }, [url]);

  // 4. Render a specific page
  const renderPage = useCallback(
    async (pageNum: number, modalMode: boolean) => {
      if (!pdfDoc) return;
      const targetCanvas = modalMode ? modalCanvasRef.current : canvasRef.current;
      const targetContainer = modalMode ? modalContainerRef.current : containerRef.current;
      if (!targetCanvas || !targetContainer) return;

      // Cancel any in-progress render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setRendering(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const ctx = targetCanvas.getContext("2d");
        if (!ctx) return;

        const currentScale = modalMode ? modalScale : scale;
        const containerWidth = targetContainer.clientWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = (containerWidth - (modalMode ? 48 : 32)) / unscaledViewport.width;
        const effectiveScale = Math.min(currentScale, fitScale);

        const viewport = page.getViewport({ scale: effectiveScale });

        const dpr = window.devicePixelRatio || 1;
        targetCanvas.width = Math.floor(viewport.width * dpr);
        targetCanvas.height = Math.floor(viewport.height * dpr);
        targetCanvas.style.width = `${Math.floor(viewport.width)}px`;
        targetCanvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvas: targetCanvas,
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
    [pdfDoc, scale, modalScale]
  );

  // Re-render on page/scale/modal change or doc load
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      // Small timeout to ensure DOM containers are fully visible/rendered
      const timer = setTimeout(() => {
        renderPage(currentPage, isModalOpen);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pdfDoc, currentPage, scale, modalScale, isModalOpen, renderPage]);

  // Re-render on window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && currentPage > 0) {
        renderPage(currentPage, isModalOpen);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, currentPage, isModalOpen, renderPage]);

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePageSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(inputPage, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setCurrentPage(parsed);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const zoomIn = () => {
    if (isModalOpen) setModalScale((s) => Math.min(s + 0.25, 4));
    else setScale((s) => Math.min(s + 0.25, 4));
  };

  const zoomOut = () => {
    if (isModalOpen) setModalScale((s) => Math.max(s - 0.25, 0.5));
    else setScale((s) => Math.max(s - 0.25, 0.5));
  };

  return (
    <>
      {/* Inline Viewer */}
      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
        {/* Top toolbar */}
        <div className="bg-neutral-900 px-3 sm:px-4 py-3 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              PDF Preview
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Primary In-App Preview Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading || !!error}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Open In-App Preview</span>
            </button>

            <div className="w-px h-5 bg-neutral-700 mx-0.5 hidden sm:block" />

            {/* Zoom controls */}
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5 || loading || !!error}
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
              disabled={scale >= 4 || loading || !!error}
              className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <div className="w-px h-5 bg-neutral-700 mx-0.5 hidden sm:block" />

            {/* Open in new tab (Secondary) */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-md hover:bg-neutral-800"
              title="Open in New Tab"
            >
              <span>Open in New Tab</span>
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
                href={url}
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
              disabled={currentPage <= 1 || rendering}
              className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <form onSubmit={handlePageSubmit} className="flex items-center gap-1.5 text-xs text-neutral-400">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onBlur={() => handlePageSubmit()}
                className="w-12 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-1 text-center font-semibold text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Enter page number to jump"
              />
              <span>/</span>
              <span className="tabular-nums">{totalPages}</span>
              {rendering && <span className="text-[10px] text-neutral-500 animate-pulse">(rendering…)</span>}
            </form>

            <button
              onClick={goToNext}
              disabled={currentPage >= totalPages || rendering}
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

      {/* In-App Modal Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-md">
          {/* Modal Toolbar */}
          <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-4 shadow-lg shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                title="Close Preview"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-sm font-semibold text-white truncate">{title || "In-App PDF Preview"}</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Zoom controls */}
              <button
                onClick={zoomOut}
                disabled={modalScale <= 0.5 || loading || !!error}
                className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Zoom out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <span className="text-xs text-neutral-400 font-mono min-w-[3.5rem] text-center tabular-nums">
                {Math.round(modalScale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={modalScale >= 4 || loading || !!error}
                className="p-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <div className="w-px h-5 bg-neutral-700 mx-1 hidden sm:block" />

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1.5 p-1.5 rounded-md hover:bg-neutral-800"
                title="Open in New Tab"
              >
                <span>Open in New Tab</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Modal PDF Canvas Area */}
          <div
            ref={modalContainerRef}
            className="flex-1 overflow-auto bg-neutral-950 flex justify-center items-start p-2 sm:p-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-32 text-neutral-400">
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-xs font-medium">Loading document…</span>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center gap-3 py-32 px-6 text-center">
                <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base text-red-400 font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <canvas
                ref={modalCanvasRef}
                className="block mx-auto rounded-lg shadow-2xl border border-neutral-800"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>

          {/* Modal Bottom Pagination Bar */}
          {!loading && !error && totalPages > 0 && (
            <div className="bg-neutral-900 px-4 py-3 border-t border-neutral-800 flex items-center justify-center gap-3 shadow-lg shrink-0">
              <button
                onClick={goToPrev}
                disabled={currentPage <= 1 || rendering}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <form onSubmit={handlePageSubmit} className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  onBlur={() => handlePageSubmit()}
                  className="w-14 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-center font-semibold text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Enter page number to jump"
                />
                <span>/</span>
                <span className="tabular-nums font-medium">{totalPages}</span>
                {rendering && <span className="text-xs text-neutral-500 animate-pulse">(rendering…)</span>}
              </form>

              <button
                onClick={goToNext}
                disabled={currentPage >= totalPages || rendering}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
