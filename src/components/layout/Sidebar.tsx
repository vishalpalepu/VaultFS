"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FolderNode {
  _id: string;
  name: string;
  parentFolderId: string | null;
  children: FolderNode[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch("/api/folders");
        const json = await res.json();
        if (json.success) {
          // Reconstruct tree client-side or fetch flat and build it
          const flat = json.data;
          const buildTree = (parentId: string | null): FolderNode[] => {
            return flat
              .filter((f: any) => f.parentFolderId === parentId)
              .map((f: any) => ({
                _id: f._id,
                name: f.name,
                parentFolderId: f.parentFolderId,
                children: buildTree(f._id),
              }));
          };
          setFolders(buildTree(null));
        }
      } catch (err) {
        console.error("Failed to load folder tree:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFolders();
  }, [pathname]); // Refresh when navigating

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderFolderNode = (node: FolderNode, depth = 0) => {
    const isExpanded = expandedFolders[node._id];
    const isSelected = pathname === `/folders/${node._id}`;

    return (
      <div key={node._id} className="select-none">
        <Link
          href={`/folders/${node._id}`}
          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all group ${
            isSelected
              ? "bg-blue-600/15 text-blue-400 font-medium"
              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {node.children.length > 0 ? (
              <button
                onClick={(e) => toggleExpand(node._id, e)}
                className="p-0.5 hover:bg-neutral-700/50 rounded transition-colors text-neutral-500 hover:text-neutral-300"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <span className="w-3.5" />
            )}
            <svg
              className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-400" : "text-neutral-500 group-hover:text-neutral-300"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span className="truncate text-xs tracking-wide">{node.name}</span>
          </div>
        </Link>
        {node.children.length > 0 && isExpanded && (
          <div className="mt-0.5">{node.children.map((child) => renderFolderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      href: "/folders",
      label: "Folders",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      href: "/search",
      label: "Search",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: "/storage",
      label: "Storage Nodes",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
      {/* Primary Links */}
      <nav className="p-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="px-6 py-2">
        <div className="border-t border-neutral-900" />
      </div>

      {/* Folder Tree Header */}
      <div className="px-6 py-2 flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        <span>Folder Tree</span>
      </div>

      {/* Folder Tree Body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {loading ? (
          <div className="text-center py-4 text-xs text-neutral-600">Loading tree...</div>
        ) : folders.length === 0 ? (
          <div className="text-center py-4 text-xs text-neutral-600">No folders.</div>
        ) : (
          folders.map((f) => renderFolderNode(f, 0))
        )}
      </div>
    </aside>
  );
};
