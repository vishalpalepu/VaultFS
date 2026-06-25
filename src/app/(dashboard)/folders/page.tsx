"use client";

import React, { useState, useEffect } from "react";
import { FolderCard } from "@/components/folders/FolderCard";
import { CreateFolderModal } from "@/components/folders/CreateFolderModal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { IFolder } from "@/types";

export default function FoldersPage() {
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders");
      const json = await res.json();
      if (json.success) {
        // Only show root level folders (no parent)
        const roots = json.data.filter((f: IFolder) => !f.parentFolderId);
        setFolders(roots);
      } else {
        setError(json.error || "Failed to load folders");
      }
    } catch (err) {
      setError("An error occurred loading folders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFolders((prev) => prev.filter((f) => f._id !== id));
      } else {
        alert(json.error || "Failed to delete folder");
      }
    } catch (err) {
      console.error("Delete folder error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Root Folders</h2>
          <p className="text-xs text-neutral-500">
            Create and browse primary folder hierarchies.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 text-xs py-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Folders list */}
      {loading ? (
        <Spinner size="lg" className="py-12" />
      ) : folders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900 border border-neutral-850 rounded-xl space-y-4">
          <div className="p-4 bg-neutral-800 rounded-full inline-block text-neutral-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">No folders yet</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
              Folders let you structure your markdown notes, PDFs, videos, images, and other bookmarks.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm">
            Create First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <FolderCard key={folder._id} folder={folder} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CreateFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(newFolder) => setFolders((prev) => [...prev, newFolder])}
      />
    </div>
  );
}
