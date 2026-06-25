"use client";

import React from "react";
import Link from "next/link";
import { Card } from "../ui/Card";
import type { IFolder } from "@/types";

interface FolderCardProps {
  folder: IFolder;
  onDelete?: (id: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onDelete }) => {
  return (
    <Card hoverEffect className="group relative flex items-center justify-between p-4 bg-neutral-900 border-neutral-800">
      <Link href={`/folders/${folder._id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2.5 bg-neutral-800 rounded-lg text-blue-500 group-hover:text-blue-400 group-hover:bg-neutral-800/80 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <div className="truncate">
          <p className="text-sm font-semibold text-white group-hover:text-blue-400 truncate">
            {folder.name}
          </p>
          <p className="text-xs text-neutral-500">
            Created {new Date(folder.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Link>

      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete folder "${folder.name}" and all of its contents?`)) {
              onDelete(folder._id);
            }
          }}
          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </Card>
  );
};
