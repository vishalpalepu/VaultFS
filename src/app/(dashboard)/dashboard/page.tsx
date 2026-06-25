import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getStorageStats } from "@/lib/services/storageNodeService";
import { countResources, getRecentResources } from "@/lib/services/resourceService";
import { getActiveLeaseCount } from "@/lib/services/storageLeaseService";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResourceCard } from "@/components/resources/ResourceCard";

export const revalidate = 0; // Disable caching to fetch real-time updates

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  // Fetch data in parallel on the server
  const [stats, resourceCount, leaseCount, recentResources] = await Promise.all([
    getStorageStats(userId),
    countResources(userId),
    getActiveLeaseCount(userId),
    getRecentResources(userId, 6),
  ]);

  const recentNotes = recentResources.filter((r) => r.type === "NOTE");

  const storageUsedPercentage = Math.min(
    100,
    Math.round((stats.totalUsedGB / (stats.totalAvailableGB || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Workspace Dashboard</h2>
        <p className="text-xs text-neutral-500">
          Real-time metrics and storage orchestration console.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="flex items-center gap-4 bg-neutral-900 border-neutral-800">
          <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Active Nodes
            </span>
            <span className="text-lg font-bold text-white">
              {stats.activeNodes} <span className="text-xs font-normal text-neutral-500">/ {stats.totalNodes}</span>
            </span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="flex items-center gap-4 bg-neutral-900 border-neutral-800">
          <div className="p-3 bg-emerald-600/10 rounded-xl text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Total Resources
            </span>
            <span className="text-lg font-bold text-white">{resourceCount}</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="flex items-center gap-4 bg-neutral-900 border-neutral-800">
          <div className="p-3 bg-purple-600/10 rounded-xl text-purple-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Active Leases
            </span>
            <span className="text-lg font-bold text-white">{leaseCount}</span>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="flex items-center gap-4 bg-neutral-900 border-neutral-800">
          <div className="p-3 bg-amber-600/10 rounded-xl text-amber-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 4h16m-16 4h16" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Storage Utilized
            </span>
            <span className="text-lg font-bold text-white">
              {stats.totalUsedGB.toFixed(3)}{" "}
              <span className="text-xs font-normal text-neutral-500">/ {stats.totalAvailableGB.toFixed(1)} GB</span>
            </span>
          </div>
        </Card>
      </div>

      {/* Storage Progress Section */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 space-y-4">
        <div className="flex justify-between items-center text-xs font-medium text-neutral-400">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Global Storage Cluster Usage
          </span>
          <span>{storageUsedPercentage}% Consumed</span>
        </div>
        <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden border border-neutral-800">
          <div
            className={`h-full transition-all duration-500 ${
              storageUsedPercentage >= 90 ? "bg-red-500" : storageUsedPercentage >= 75 ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${storageUsedPercentage}%` }}
          />
        </div>
      </Card>

      {/* Main Grid split: Recent Resources & Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Recent Resources
            </h3>
            <Link href="/folders" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Browse folders &rarr;
            </Link>
          </div>

          {recentResources.length === 0 ? (
            <Card className="p-8 text-center bg-neutral-900 border-neutral-850">
              <p className="text-xs text-neutral-500">No resources created yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentResources.map((res: any) => (
                <ResourceCard key={res._id.toString()} resource={{ ...res, _id: res._id.toString() }} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Recent Notes
          </h3>

          {recentNotes.length === 0 ? (
            <Card className="p-8 text-center bg-neutral-900 border-neutral-850">
              <p className="text-xs text-neutral-500">No markdown notes found.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note: any) => (
                <Card key={note._id.toString()} hoverEffect className="p-4 bg-neutral-905 border-neutral-800 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-xs font-semibold text-white truncate">{note.title}</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-3 mb-2 leading-relaxed">
                    {note.metadata?.noteContent || note.description}
                  </p>
                  <div className="text-[10px] text-neutral-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  <Link href={`/resources/${note._id.toString()}`} className="absolute inset-0 z-0">
                    <span className="sr-only">View Note</span>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
