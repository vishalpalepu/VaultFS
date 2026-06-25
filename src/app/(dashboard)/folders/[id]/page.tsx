"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FolderCard } from "@/components/folders/FolderCard";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { CreateFolderModal } from "@/components/folders/CreateFolderModal";
import { UploadModal } from "@/components/resources/UploadModal";
import { CreateResourceModal } from "@/components/resources/CreateResourceModal";
import type { IFolder, IResource } from "@/types";

export default function FolderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const [folder, setFolder] = useState<IFolder | null>(null);
  const [subfolders, setSubfolders] = useState<IFolder[]>([]);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Triggers
  const [subfolderModalOpen, setSubfolderModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  const fetchFolderContents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/folders/${folderId}`);
      const json = await res.json();
      if (json.success) {
        setFolder(json.data.folder);
        setSubfolders(json.data.children);

        // Fetch resources for this folder
        const resSec = await fetch(`/api/folders/${folderId}/resources`);
        const jsonSec = await resSec.json();
        if (jsonSec.success) {
          setResources(jsonSec.data);
        }
      } else {
        router.push("/folders");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (folderId) {
      fetchFolderContents();
    }
  }, [folderId]);

  const handleDeleteSubfolder = async (id: string) => {
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSubfolders((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setResources((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (!folder) {
    return <div className="text-center py-20 text-neutral-500">Folder not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-900 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Folders</span>
            <span>&rarr;</span>
            <span className="font-mono text-[10px]">{folder._id}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {folder.name}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSubfolderModalOpen(true)}
            className="text-xs"
          >
            Create Subfolder
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setResourceModalOpen(true)}
            className="text-xs"
          >
            Create Resource
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload File
          </Button>
        </div>
      </div>

      {/* Two Column Grid View: Subfolders on Left, Resources on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Subfolder Tree / Nested folders */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Subfolders
          </h3>
          {subfolders.length === 0 ? (
            <div className="p-4 border border-neutral-900 bg-neutral-900/30 rounded-xl text-center text-xs text-neutral-600 italic">
              No subfolders.
            </div>
          ) : (
            <div className="space-y-3">
              {subfolders.map((f) => (
                <FolderCard key={f._id} folder={f} onDelete={handleDeleteSubfolder} />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Resources in Current Folder */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Resources
          </h3>
          {resources.length === 0 ? (
            <div className="py-20 border border-dashed border-neutral-800 rounded-xl text-center space-y-4">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-full inline-block text-neutral-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Folder is empty</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Get started by uploading files or creating custom notes, links, and embedded videos.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="secondary" onClick={() => setResourceModalOpen(true)}>
                  Create Note/Link
                </Button>
                <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                  Upload File
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((res) => (
                <ResourceCard key={res._id} resource={res} onDelete={handleDeleteResource} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={subfolderModalOpen}
        onClose={() => setSubfolderModalOpen(false)}
        parentFolderId={folderId}
        onCreated={(newFolder) => setSubfolders((prev) => [...prev, newFolder])}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folderId={folderId}
        onUploaded={(newRes) => setResources((prev) => [newRes, ...prev])}
      />

      <CreateResourceModal
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        folderId={folderId}
        onCreated={(newRes) => setResources((prev) => [newRes, ...prev])}
      />
    </div>
  );
}
