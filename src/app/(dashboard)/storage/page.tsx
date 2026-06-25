"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { NodeCard } from "@/components/storage/NodeCard";
import { LeaseCard } from "@/components/storage/LeaseCard";
import { AddNodeModal } from "@/components/storage/AddNodeModal";
import { LeaseRequestModal } from "@/components/storage/LeaseRequestModal";
import type { IStorageNode, IStorageLease } from "@/types";

export default function StorageSettingsPage() {
  const [activeTab, setActiveTab] = useState<"nodes" | "leases">("nodes");
  
  // Storage Nodes state
  const [nodes, setNodes] = useState<IStorageNode[]>([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [addNodeOpen, setAddNodeOpen] = useState(false);

  // Leases state
  const [leases, setLeases] = useState<{ asProvider: IStorageLease[]; asConsumer: IStorageLease[] }>({
    asProvider: [],
    asConsumer: [],
  });
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [requestLeaseOpen, setRequestLeaseOpen] = useState(false);

  const fetchNodes = async () => {
    setNodesLoading(true);
    try {
      const res = await fetch("/api/storage/nodes");
      const json = await res.json();
      if (json.success) {
        setNodes(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNodesLoading(false);
    }
  };

  const fetchLeases = async () => {
    setLeasesLoading(true);
    try {
      const res = await fetch("/api/leases");
      const json = await res.json();
      if (json.success) {
        setLeases(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLeasesLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    fetchLeases();
  }, []);

  const handleDisableNode = async (id: string) => {
    try {
      const res = await fetch(`/api/storage/nodes/${id}/disable`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchNodes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerHealthCheck = async () => {
    try {
      const res = await fetch("/api/storage/health");
      const json = await res.json();
      if (json.success) {
        alert("Health checks triggered successfully!");
        fetchNodes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Storage settings & federation</h2>
          <p className="text-xs text-neutral-500">
            Provision Cloudinary storage nodes and lease extra capacity in peer networks.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleTriggerHealthCheck} className="text-xs">
            Trigger Health Check
          </Button>
          {activeTab === "nodes" ? (
            <Button size="sm" onClick={() => setAddNodeOpen(true)} className="text-xs">
              Add Storage Node
            </Button>
          ) : (
            <Button size="sm" onClick={() => setRequestLeaseOpen(true)} className="text-xs">
              Request Lease
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-900">
        <button
          onClick={() => setActiveTab("nodes")}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "nodes"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          My Storage Nodes ({nodes.length})
        </button>
        <button
          onClick={() => setActiveTab("leases")}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "leases"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Federated Sharing & Leases
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "nodes" && (
          <div className="space-y-4">
            {nodesLoading ? (
              <Spinner size="lg" className="py-12" />
            ) : nodes.length === 0 ? (
              <div className="py-16 text-center border border-neutral-900 bg-neutral-900/10 rounded-xl space-y-4">
                <div className="p-4 bg-neutral-800 rounded-full inline-block text-neutral-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">No Storage Nodes Registered</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                    To store physical files (PDFs, Videos, Images), you must register at least one Cloudinary account.
                  </p>
                </div>
                <Button size="sm" onClick={() => setAddNodeOpen(true)}>
                  Add Node
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map((node) => (
                  <NodeCard
                    key={node._id}
                    node={node}
                    onDisable={handleDisableNode}
                    onUpdated={fetchNodes}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "leases" && (
          <div className="space-y-8">
            {/* Incoming Requests / Leases you are Providing */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Leases I Provide (Shared Capacity)
              </h3>
              {leasesLoading ? (
                <Spinner size="sm" />
              ) : leases.asProvider.length === 0 ? (
                <div className="p-4 border border-neutral-900 bg-neutral-900/10 rounded-xl text-center text-xs text-neutral-600 italic">
                  You are not leasing storage space to any peers.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leases.asProvider.map((lease) => (
                    <LeaseCard
                      key={lease._id}
                      lease={lease}
                      mode="provider"
                      onApproved={fetchLeases}
                      onRevoked={fetchLeases}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests / Leases you are Consuming */}
            <div className="space-y-4 pt-4 border-t border-neutral-900">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Leases I Consume (Borrowed Capacity)
              </h3>
              {leasesLoading ? (
                <Spinner size="sm" />
              ) : leases.asConsumer.length === 0 ? (
                <div className="p-4 border border-neutral-900 bg-neutral-900/10 rounded-xl text-center text-xs text-neutral-600 italic">
                  You have not requested or activated storage leases from peers.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leases.asConsumer.map((lease) => (
                    <LeaseCard
                      key={lease._id}
                      lease={lease}
                      mode="consumer"
                      onApproved={fetchLeases}
                      onRevoked={fetchLeases}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddNodeModal isOpen={addNodeOpen} onClose={() => setAddNodeOpen(false)} onAdded={fetchNodes} />
      
      <LeaseRequestModal
        isOpen={requestLeaseOpen}
        onClose={() => setRequestLeaseOpen(false)}
        onRequested={fetchLeases}
      />
    </div>
  );
}
