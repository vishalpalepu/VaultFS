import React from "react";

interface ImageViewerProps {
  url: string;
  title: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ url, title }) => {
  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Image Preview
        </span>
      </div>
      <div className="p-6 bg-neutral-950 flex items-center justify-center min-h-[300px]">
        <img
          src={url}
          alt={title}
          className="max-w-full max-h-[600px] object-contain rounded-lg border border-neutral-800 shadow-md"
        />
      </div>
    </div>
  );
};
