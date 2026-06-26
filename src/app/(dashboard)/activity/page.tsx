"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

interface IEventLog {
  _id: string;
  eventType: string;
  actorId: string;
  targetId?: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<IEventLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const getEventDescription = (event: IEventLog) => {
    const { eventType, metadata } = event;
    switch (eventType) {
      case "RESOURCE_CREATED":
        return `Created resource "${metadata?.title || 'Unknown'}" (${metadata?.type || 'file'})`;
      case "RESOURCE_UPDATED":
        return `Updated resource metadata or content`;
      case "RESOURCE_DELETED":
        return `Deleted resource`;
      case "RESOURCE_SHARED":
        return `Updated resource visibility to SHARED`;
      case "NODE_ADDED":
        return `Added storage node "${metadata?.cloudName || 'Cloudinary'}"`;
      case "NODE_UPDATED":
        return `Updated storage node configuration`;
      case "NODE_DISABLED":
        return `Disabled storage node`;
      case "NODE_REMOVED":
        return `Removed storage node from pool`;
      case "LEASE_REQUESTED":
        return `Requested storage lease of ${metadata?.maxStorageGB || 0} GB`;
      case "LEASE_APPROVED":
        return `Approved storage lease request`;
      case "LEASE_REVOKED":
        return `Revoked storage lease`;
      case "USER_REGISTERED":
        return `Registered new VaultFS account`;
      case "USER_LOGIN":
        return `Logged into VaultFS dashboard`;
      default:
        return `System event: ${eventType}`;
    }
  };

  const getBadgeVariant = (eventType: string) => {
    if (eventType.includes("CREATED") || eventType.includes("ADDED") || eventType.includes("APPROVED")) {
      return "success";
    }
    if (eventType.includes("DELETED") || eventType.includes("REMOVED") || eventType.includes("REVOKED")) {
      return "error";
    }
    if (eventType.includes("UPDATED") || eventType.includes("SHARED")) {
      return "info";
    }
    return "neutral";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Activity Feed</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Immutable audit log of all events and storage mutations in your workspace.
        </p>
      </div>

      <Card className="p-6 bg-neutral-900 border-neutral-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spinner size="md" />
            <span className="text-xs text-neutral-500">Loading activity feed...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-sm text-neutral-500">
            No recent activity found in your workspace.
          </div>
        ) : (
          <div className="relative pl-6 border-l border-neutral-800 space-y-8">
            {events.map((event) => (
              <div key={event._id} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-neutral-800 border-2 border-blue-500 group-hover:bg-blue-500 transition-colors" />

                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">
                        {getEventDescription(event)}
                      </span>
                      <Badge variant={getBadgeVariant(event.eventType)} className="text-[10px] px-2 py-0.5">
                        {event.eventType}
                      </Badge>
                    </div>
                    {event.targetId && (
                      <p className="text-xs text-neutral-500 font-mono">
                        Target ID: {event.targetId}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
