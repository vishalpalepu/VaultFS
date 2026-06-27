"use client";

import React, { useState } from "react";

interface PdfViewerProps {
  url: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Ensure the URL ends with .pdf for Cloudinary image-type PDFs
  const pdfUrl = (() => {
    try {
      const parsed = new URL(url);
      // If it's already a raw URL or already has .pdf extension, use as-is
      if (parsed.pathname.includes("/raw/upload") || parsed.pathname.endsWith(".pdf")) {
        return url;
      }
      // For image-type Cloudinary uploads, append .pdf extension
      if (!parsed.pathname.endsWith(".pdf")) {
        parsed.pathname += ".pdf";
      }
      return parsed.toString();
    } catch {
      return url;
    }
  })();

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top toolbar */}
      <div className="bg-neutral-900 px-3 sm:px-4 py-3 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          PDF Preview
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Download button */}
          <a
            href={pdfUrl}
            download
            className="text-xs text-neutral-300 hover:text-white transition-colors font-medium flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-md hover:bg-neutral-800"
            title="Download PDF"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </a>

          <div className="w-px h-5 bg-neutral-700 mx-0.5 hidden sm:block" />

          {/* Open in new tab */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-md hover:bg-neutral-800"
          >
            <span className="hidden sm:inline">Open in New Tab</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* PDF iframe area */}
      <div className="relative flex-1 min-h-[400px] sm:min-h-[600px] max-h-[80vh] bg-neutral-950">
        {/* Loading state */}
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-400 z-10 bg-neutral-950">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-xs font-medium">Loading document…</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center z-10 bg-neutral-950">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400 font-medium">
              Unable to display PDF inline.
            </p>
            <p className="text-xs text-neutral-500 max-w-sm">
              Your browser may not support inline PDF viewing. Use the button below to open it directly.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open PDF in New Tab
            </a>
          </div>
        )}

        {/* The iframe - primary PDF display method per Cloudinary guide */}
        <iframe
          src={pdfUrl}
          title={title || "PDF Document"}
          width="100%"
          height="100%"
          style={{
            border: "none",
            minHeight: "400px",
            display: error ? "none" : "block",
          }}
          className="w-full h-full min-h-[400px] sm:min-h-[600px]"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
};
