"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { PdfViewer } from "./viewers/PdfViewer";
import { VideoViewer } from "./viewers/VideoViewer";
import { ImageViewer } from "./viewers/ImageViewer";
import { NoteViewer } from "./viewers/NoteViewer";
import { YoutubeViewer } from "./viewers/YoutubeViewer";
import { LinkViewer } from "./viewers/LinkViewer";
import type { IResource, RelationType } from "@/types";
import Link from "next/link";

interface ResourceViewerProps {
  resource: IResource & { accessUrl?: string };
}

export const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource }) => {
  const router = useRouter();
  const [links, setLinks] = useState<{ outgoing: any[]; incoming: any[] }>({ outgoing: [], incoming: [] });
  const [allResources, setAllResources] = useState<IResource[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [relationType, setRelationType] = useState<RelationType>("REFERENCES");
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Note editing state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteContent, setEditedNoteContent] = useState(resource.metadata?.noteContent || "");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch(`/api/resources/${resource._id}/links`);
        const json = await res.json();
        if (json.success) {
          setLinks(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch links:", err);
      }
    }
    fetchLinks();
  }, [resource._id, refreshTrigger]);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("/api/resources");
        const json = await res.json();
        if (json.success) {
          // Exclude current resource
          setAllResources(json.data.filter((r: IResource) => r._id !== resource._id));
        }
      } catch (err) {
        console.error("Failed to fetch all resources:", err);
      }
    }
    fetchResources();
  }, [resource._id]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    setLinkingLoading(true);
    try {
      const res = await fetch("/api/resource-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceResourceId: resource._id,
          targetResourceId: selectedTargetId,
          relation: relationType,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRefreshTrigger((prev) => prev + 1);
        setSelectedTargetId("");
      }
    } catch (err) {
      console.error("Failed to create link:", err);
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const res = await fetch(`/api/resources/${resource._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { ...resource.metadata, noteContent: editedNoteContent },
        }),
      });
      if (res.ok) {
        setIsEditingNote(false);
        router.refresh();
      } else {
        alert("Failed to save note.");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const renderViewer = () => {
    const url = resource.accessUrl || resource.metadata?.externalUrl || "";

    switch (resource.type) {
      case "PDF":
        return <PdfViewer url={url} title={resource.title} />;
      case "VIDEO":
        return <VideoViewer url={url} />;
      case "IMAGE":
        return <ImageViewer url={url} title={resource.title} />;
      case "NOTE":
        if (isEditingNote) {
          return (
            <Card className="p-6 bg-neutral-900 border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Edit Markdown Note</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setIsEditingNote(false)} disabled={savingNote}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNote} loading={savingNote}>
                    Save Changes
                  </Button>
                </div>
              </div>
              <textarea
                value={editedNoteContent}
                onChange={(e) => setEditedNoteContent(e.target.value)}
                disabled={savingNote}
                rows={15}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="# Write your markdown note here..."
              />
            </Card>
          );
        }
        return <NoteViewer content={resource.metadata?.noteContent || ""} />;
      case "YOUTUBE":
        return <YoutubeViewer url={resource.metadata?.youtubeUrl || ""} />;
      case "LINK":
        return (
          <LinkViewer
            url={resource.metadata?.externalUrl || ""}
            title={resource.title}
            description={resource.description}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-neutral-500">
            Unsupported resource type: {resource.type}
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Main Resource Viewer */}
      <div className="lg:col-span-2 space-y-6">
        {renderViewer()}

        {/* Resource Details Card */}
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white">{resource.title}</h1>
                <Badge variant="info" className="text-[10px] px-2 uppercase">
                  {resource.type}
                </Badge>
                <Badge
                  variant={resource.visibility === "SHARED" ? "success" : "neutral"}
                  className="text-[10px] px-2 uppercase"
                >
                  {resource.visibility}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500">
                Created on {new Date(resource.createdAt).toLocaleString()}
              </p>
            </div>
            {resource.type === "NOTE" && !isEditingNote && (
              <Button size="sm" variant="secondary" onClick={() => setIsEditingNote(true)} className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Note
              </Button>
            )}
          </div>

          {resource.description && (
            <div className="mt-4 pt-4 border-t border-neutral-800/60">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{resource.description}</p>
            </div>
          )}

          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-800/60">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag, idx) => (
                  <Badge key={idx} variant="neutral">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {resource.hash && (
            <div className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
              <span>Client-side SHA-256 Hash:</span>
              <span className="font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-800 text-[10px] text-blue-400 select-all">
                {resource.hash}
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Right 1 Col: Relationship Graph Panel */}
      <div className="space-y-6">
        <Card className="bg-neutral-900 border-neutral-800 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
              Resource Graph
            </h2>
            <p className="text-xs text-neutral-500">
              Link this resource with other nodes in your knowledge base.
            </p>
          </div>

          {/* Add Link Form */}
          <form onSubmit={handleCreateLink} className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Select Target Resource
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choose resource --</option>
                {allResources.map((r) => (
                  <option key={r._id} value={r._id}>
                    [{r.type}] {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Relation
                </label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value as RelationType)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="REFERENCES">REFERENCES</option>
                  <option value="RELATED">RELATED</option>
                  <option value="CHILD">CHILD</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" loading={linkingLoading} className="w-full text-xs py-2">
                  Create Link
                </Button>
              </div>
            </div>
          </form>

          {/* Linked Resources Lists */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            {/* Outgoing links */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                References
              </h3>
              {links.outgoing.length === 0 ? (
                <p className="text-xs text-neutral-600 italic">No outgoing references.</p>
              ) : (
                <div className="space-y-2">
                  {links.outgoing.map((link) => (
                    <div
                      key={link._id}
                      className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/resources/${link.targetResourceId?._id}`}
                          className="text-xs font-medium text-blue-400 hover:text-blue-300 truncate block"
                        >
                          {link.targetResourceId?.title || "Unknown"}
                        </Link>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider">
                          Relation: {link.relation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming links */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Referenced By
              </h3>
              {links.incoming.length === 0 ? (
                <p className="text-xs text-neutral-600 italic">No incoming links.</p>
              ) : (
                <div className="space-y-2">
                  {links.incoming.map((link) => (
                    <div
                      key={link._id}
                      className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/resources/${link.sourceResourceId?._id}`}
                          className="text-xs font-medium text-blue-400 hover:text-blue-300 truncate block"
                        >
                          {link.sourceResourceId?.title || "Unknown"}
                        </Link>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider">
                          Relation: {link.relation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
