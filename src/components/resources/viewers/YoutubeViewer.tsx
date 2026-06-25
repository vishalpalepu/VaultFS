import React from "react";

interface YoutubeViewerProps {
  url: string;
}

function getYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const YoutubeViewer: React.FC<YoutubeViewerProps> = ({ url }) => {
  const videoId = getYoutubeId(url);

  if (!videoId) {
    return (
      <div className="w-full p-8 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
        <p className="text-sm text-red-400">Invalid YouTube URL: {url}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          YouTube Playback
        </span>
      </div>
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
};
