import React from "react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";

interface LinkViewerProps {
  url: string;
  title: string;
  description?: string;
}

export const LinkViewer: React.FC<LinkViewerProps> = ({ url, title, description }) => {
  return (
    <Card className="w-full bg-neutral-900 border-neutral-800 p-8 flex flex-col items-center text-center space-y-5">
      <div className="p-4 bg-neutral-800 rounded-full text-blue-500">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {description && <p className="text-sm text-neutral-400 max-w-lg">{description}</p>}
        <p className="text-xs text-blue-400/80 font-mono break-all max-w-lg mx-auto bg-neutral-950 p-2 rounded-lg border border-neutral-800">
          {url}
        </p>
      </div>

      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button variant="primary" className="flex items-center gap-2">
          Visit External Link
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Button>
      </a>
    </Card>
  );
};
