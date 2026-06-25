"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { ResourceType } from "@/types";

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onCreated: (resource: any) => void;
}

export const CreateResourceModal: React.FC<CreateResourceModalProps> = ({
  isOpen,
  onClose,
  folderId,
  onCreated,
}) => {
  const [type, setType] = useState<"NOTE" | "YOUTUBE" | "LINK">("NOTE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  
  // Type-specific metadata
  const [noteContent, setNoteContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    const metadata: Record<string, any> = {};
    if (type === "NOTE") {
      metadata.noteContent = noteContent;
    } else if (type === "YOUTUBE") {
      metadata.youtubeUrl = youtubeUrl.trim();
    } else if (type === "LINK") {
      metadata.externalUrl = externalUrl.trim();
    }

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId,
          type,
          title: title.trim(),
          description: description.trim(),
          tags: tagsArray,
          visibility,
          metadata,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTitle("");
        setDescription("");
        setTags("");
        setVisibility("PRIVATE");
        setNoteContent("");
        setYoutubeUrl("");
        setExternalUrl("");
        onCreated(json.data);
        onClose();
      } else {
        setError(json.error || "Failed to create resource");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Resource">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Resource Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="NOTE">NOTE (Markdown Document)</option>
            <option value="YOUTUBE">YOUTUBE (Embedded Video)</option>
            <option value="LINK">LINK (Clickable URL Reference)</option>
          </select>
        </div>

        <Input
          label="Title"
          placeholder="Enter resource title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
        />

        {/* Dynamic Fields based on Type */}
        {type === "NOTE" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Markdown Content
            </label>
            <textarea
              placeholder="# Markdown header&#10;Write content here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all"
              disabled={loading}
            />
          </div>
        )}

        {type === "YOUTUBE" && (
          <Input
            label="YouTube Video URL"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            disabled={loading}
            required
          />
        )}

        {type === "LINK" && (
          <Input
            label="External URL"
            placeholder="https://example.com"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            disabled={loading}
            required
          />
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Description
          </label>
          <textarea
            placeholder="Optional description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-16 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        <Input
          label="Tags (comma separated)"
          placeholder="e.g. note, programming, docs"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={loading}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "SHARED")}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="PRIVATE">PRIVATE (Only You)</option>
            <option value="SHARED">SHARED (Leased / Permitted Users)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Create Resource
          </Button>
        </div>
      </form>
    </Modal>
  );
};
