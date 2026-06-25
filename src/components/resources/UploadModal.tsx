"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { hashFile } from "@/lib/utils/hash";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onUploaded: (resource: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId,
  onUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [hashing, setHashing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Auto-populate title if empty
      if (!title) {
        setTitle(selected.name.substring(0, selected.name.lastIndexOf(".")) || selected.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setError("");
    setHashing(true);

    try {
      // 1. Calculate SHA-256 hash client-side
      const fileHash = await hashFile(file);
      setHashing(false);
      setUploading(true);

      // 2. Build FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("folderId", folderId);
      formData.append("description", description.trim());
      formData.append("tags", tags);
      formData.append("visibility", visibility);
      formData.append("hash", fileHash);

      // 3. Upload to API
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setFile(null);
        setTitle("");
        setDescription("");
        setTags("");
        setVisibility("PRIVATE");
        onUploaded(json.data);
        onClose();
      } else {
        setError(json.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An error occurred during upload. Please try again.");
    } finally {
      setHashing(false);
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New File">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 file:cursor-pointer"
            disabled={hashing || uploading}
            required
          />
        </div>

        <Input
          label="Title"
          placeholder="Enter file title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={hashing || uploading}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Description
          </label>
          <textarea
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-20 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={hashing || uploading}
          />
        </div>

        <Input
          label="Tags (comma separated)"
          placeholder="e.g. project, pdf, docs"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={hashing || uploading}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "SHARED")}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={hashing || uploading}
          >
            <option value="PRIVATE">PRIVATE (Only You)</option>
            <option value="SHARED">SHARED (Leased / Permitted Users)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={hashing || uploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={hashing || uploading}
            disabled={!file || hashing || uploading}
          >
            {hashing ? "Hashing Data..." : uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
