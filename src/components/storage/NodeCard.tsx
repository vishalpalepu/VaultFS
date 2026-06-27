"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ConfirmModal } from "../ui/ConfirmModal";
import type { IStorageNode } from "@/types";

interface NodeCardProps {
  node: IStorageNode;
  onDisable: (id: string) => void;
  onUpdated: () => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, onDisable, onUpdated }) => {
  const [updating, setUpdating] = useState(false);
  const [availableStorage, setAvailableStorage] = useState(node.availableStorageGB);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getStatusVariant = () => {
    switch (node.status) {
      case "ACTIVE":
        return "success";
      case "FULL":
        return "warning";
      case "OFFLINE":
      case "DISABLED":
        return "error";
      default:
        return "neutral";
    }
  };

  const handleUpdateStorage = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/storage/nodes/${node._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableStorageGB: availableStorage }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdated();
      }
    } catch (err) {
      console.error("Failed to update storage:", err);
    } finally {
      setUpdating(false);
    }
  };

  const usedPercentage = Math.min(100, Math.round((node.usedStorageGB / (node.availableStorageGB || 1)) * 100));

  return (
    <Card className="bg-neutral-900 border-neutral-800 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-neutral-800 rounded-lg text-blue-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white truncate max-w-[150px]">{node.cloudName}</h4>
            <p className="text-[10px] text-neutral-500 font-mono">ID: {node._id.substring(18)}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant()} className="text-[10px] uppercase">
          {node.status}
        </Badge>
      </div>

      {/* Storage Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-400">
          <span>Storage Allocation</span>
          <span>
            {node.usedStorageGB.toFixed(3)} GB / {node.availableStorageGB.toFixed(1)} GB
          </span>
        </div>
        <div className="w-full bg-neutral-850 h-2 rounded-full overflow-hidden border border-neutral-800">
          <div
            className={`h-full transition-all duration-500 ${
              usedPercentage >= 90 ? "bg-red-500" : usedPercentage >= 75 ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>{usedPercentage}% capacity consumed</span>
          <span>Available: {Math.max(0, node.availableStorageGB - node.usedStorageGB).toFixed(3)} GB</span>
        </div>
      </div>

      {/* Metadata / Logs */}
      <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 space-y-1.5 text-[11px] text-neutral-400 font-mono">
        <div className="flex justify-between">
          <span>API Key prefix:</span>
          <span>{node.apiKey.substring(0, 5)}***</span>
        </div>
        <div className="flex justify-between">
          <span>Consecutive failures:</span>
          <span className={node.failureCount > 0 ? "text-red-400 font-bold" : "text-neutral-500"}>
            {node.failureCount} / 3
          </span>
        </div>
        <div className="flex justify-between">
          <span>Last Health Check:</span>
          <span className="text-[10px] truncate max-w-[140px]">
            {node.lastHealthCheck ? new Date(node.lastHealthCheck).toLocaleTimeString() : "Never"}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-1 flex-1">
          <input
            type="number"
            min="1"
            className="w-16 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-1 text-xs text-white placeholder-neutral-500 text-center"
            value={availableStorage}
            onChange={(e) => setAvailableStorage(Number(e.target.value))}
          />
          <Button variant="ghost" size="sm" onClick={handleUpdateStorage} loading={updating} className="text-xs p-1">
            Update Limit
          </Button>
        </div>

        {node.status !== "DISABLED" && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-xs shrink-0"
          >
            Disable Node
          </Button>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDisable(node._id)}
        title="Disable Storage Node"
        message="Are you sure you want to disable this node? This will block new uploads to it."
        confirmText="Disable Node"
        variant="danger"
      />
    </Card>
  );
};
