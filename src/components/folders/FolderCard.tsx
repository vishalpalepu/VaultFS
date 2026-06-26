"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { IFolder } from "@/types";

interface FolderCardProps {
  folder: IFolder;
  onDelete?: (id: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onDelete }) => {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [saving, setSaving] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === folder.name) {
      setIsRenaming(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/folders/${folder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setIsRenaming(false);
        router.refresh();
      } else {
        alert("Failed to rename folder.");
      }
    } catch (err) {
      console.error("Rename error:", err);
      alert("Failed to rename folder.");
    } finally {
      setSaving(false);
    }
  };

  if (isRenaming) {
    return (
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={saving}
            className="text-xs py-1 px-2 h-8"
            autoFocus
          />
          <Button type="submit" size="sm" loading={saving} className="text-xs h-8 px-3">
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={() => {
              setIsRenaming(false);
              setNewName(folder.name);
            }}
            className="text-xs h-8 px-3"
          >
            Cancel
          </Button>
        </form>
      </Card>
    );
  }

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

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsRenaming(true);
          }}
          className="p-2 text-neutral-500 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
          title="Rename Folder"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete folder "${folder.name}" and all of its contents?`)) {
                onDelete(folder._id);
              }
            }}
            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
            title="Delete Folder"
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
      </div>
    </Card>
  );
};
