import React from "react";

interface PdfViewerProps {
  url: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  // Ensure the URL correctly ends with .pdf so Cloudinary serves it inline as a document
  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.endsWith(".pdf")) {
      parsed.pathname += ".pdf";
      cleanUrl = parsed.toString();
    }
  } catch (e) {
    // fallback if URL is invalid
  }

  return (
    <div className="w-full h-[650px] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          PDF Preview
        </span>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1.5"
        >
          Open In New Tab
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <iframe
        src={`${cleanUrl}#toolbar=1`}
        title={title}
        className="w-full flex-1 border-0"
      />
    </div>
  );
};
