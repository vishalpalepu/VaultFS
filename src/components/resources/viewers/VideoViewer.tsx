import React from "react";

interface VideoViewerProps {
  url: string;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({ url }) => {
  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Video Player
        </span>
      </div>
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {url ? (
          <video
            src={url}
            controls
            className="w-full h-full max-h-[600px] object-contain focus:outline-none"
            preload="metadata"
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center text-neutral-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Video is uploading and processing in the background...</p>
            <p className="text-xs text-neutral-500">The player will be available once the cloud stream is ready.</p>
          </div>
        )}
      </div>
    </div>
  );
};
