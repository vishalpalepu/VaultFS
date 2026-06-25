"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface LeaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequested: (lease: any) => void;
}

export const LeaseRequestModal: React.FC<LeaseRequestModalProps> = ({
  isOpen,
  onClose,
  onRequested,
}) => {
  const [providerEmail, setProviderEmail] = useState("");
  const [maxStorage, setMaxStorage] = useState("5"); // default 5GB
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerEmail || !maxStorage) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leases/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerEmail: providerEmail.trim(),
          maxStorageGB: Number(maxStorage),
          expiresAt: expiresAt || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setProviderEmail("");
        setMaxStorage("5");
        setExpiresAt("");
        onRequested(json.data);
        onClose();
      } else {
        setError(json.error || "Failed to request lease");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Storage Lease">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Provider's Email Address"
          placeholder="email@example.com"
          type="email"
          value={providerEmail}
          onChange={(e) => setProviderEmail(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Lease Capacity (GB)"
          placeholder="e.g. 5"
          type="number"
          min="1"
          value={maxStorage}
          onChange={(e) => setMaxStorage(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Expiration Date (Optional)"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
