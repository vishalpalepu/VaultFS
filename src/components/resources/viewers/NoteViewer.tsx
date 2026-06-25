import React from "react";
import ReactMarkdown from "react-markdown";

interface NoteViewerProps {
  content: string;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({ content }) => {
  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Note Content
        </span>
      </div>
      <div className="p-6 md:p-8 bg-neutral-900 overflow-y-auto max-h-[600px]">
        {content ? (
          <article className="prose prose-invert prose-sm max-w-none text-neutral-300 space-y-4">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : (
          <p className="text-sm text-neutral-500 italic">No content written yet.</p>
        )}
      </div>
    </div>
  );
};
