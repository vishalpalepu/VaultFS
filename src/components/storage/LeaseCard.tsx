"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { IStorageLease } from "@/types";

interface LeaseCardProps {
  lease: IStorageLease;
  mode: "provider" | "consumer";
  onApproved: () => void;
  onRevoked: () => void;
}

export const LeaseCard: React.FC<LeaseCardProps> = ({
  lease,
  mode,
  onApproved,
  onRevoked,
}) => {
  const [loading, setLoading] = useState(false);

  const getStatusVariant = () => {
    switch (lease.status) {
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "warning";
      case "REVOKED":
        return "error";
      default:
        return "neutral";
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leases/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId: lease._id }),
      });
      const json = await res.json();
      if (json.success) {
        onApproved();
      } else {
        alert(json.error || "Failed to approve lease");
      }
    } catch (err) {
      console.error("Approve lease error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leases/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId: lease._id }),
      });
      const json = await res.json();
      if (json.success) {
        onRevoked();
      } else {
        alert(json.error || "Failed to revoke lease");
      }
    } catch (err) {
      console.error("Revoke lease error:", err);
    } finally {
      setLoading(false);
    }
  };

  // The counterparty is the opposite of the mode
  const counterpartyName = mode === "provider" ? lease.consumer?.name : lease.provider?.name;
  const counterpartyEmail = mode === "provider" ? lease.consumer?.email : lease.provider?.email;

  return (
    <Card className="bg-neutral-900 border-neutral-800 space-y-4">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-blue-500">
            {counterpartyName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{counterpartyName || "Counterparty"}</h4>
            <p className="text-xs text-neutral-500">{counterpartyEmail}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant()} className="text-[10px] uppercase">
          {lease.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-neutral-950 p-3 rounded-lg border border-neutral-850">
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">Capacity</span>
          <span className="text-neutral-200 font-semibold">{lease.maxStorageGB} GB</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">Expires At</span>
          <span className="text-neutral-200">
            {lease.expiresAt ? new Date(lease.expiresAt).toLocaleDateString() : "Indefinite"}
          </span>
        </div>
        <div className="col-span-2 border-t border-neutral-800/60 pt-2 mt-1">
          <span className="text-[10px] text-neutral-500 block uppercase">Role</span>
          <span className="text-blue-400 font-semibold uppercase text-[10px]">
            {mode === "provider" ? "Lending Storage (Provider)" : "Using Storage (Consumer)"}
          </span>
        </div>
      </div>

      {/* Buttons */}
      {lease.status === "PENDING" && mode === "provider" && (
        <div className="flex gap-2 pt-2">
          <Button onClick={handleApprove} loading={loading} className="w-full text-xs py-1.5">
            Approve Lease
          </Button>
        </div>
      )}

      {lease.status === "ACTIVE" && mode === "provider" && (
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => {
              if (confirm("Are you sure you want to revoke this active storage lease?")) {
                handleRevoke();
              }
            }}
            variant="danger"
            loading={loading}
            className="w-full text-xs py-1.5"
          >
            Revoke Lease
          </Button>
        </div>
      )}
    </Card>
  );
};
