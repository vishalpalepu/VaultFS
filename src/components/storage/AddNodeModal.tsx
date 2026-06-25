"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (node: any) => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [availableStorage, setAvailableStorage] = useState("10"); // default 10GB
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudName || !apiKey || !apiSecret || !availableStorage) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/storage/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudName: cloudName.trim(),
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          availableStorageGB: Number(availableStorage),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCloudName("");
        setApiKey("");
        setApiSecret("");
        setAvailableStorage("10");
        onAdded(json.data);
        onClose();
      } else {
        setError(json.error || "Failed to add node");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Cloudinary Storage Node">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Cloud Name"
          placeholder="Enter Cloudinary Cloud Name..."
          value={cloudName}
          onChange={(e) => setCloudName(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="API Key"
          placeholder="Enter Cloudinary API Key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="API Secret"
          placeholder="Enter Cloudinary API Secret..."
          type="password"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Allocated Storage Capacity (GB)"
          placeholder="e.g. 10"
          type="number"
          min="1"
          value={availableStorage}
          onChange={(e) => setAvailableStorage(e.target.value)}
          disabled={loading}
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Register Node
          </Button>
        </div>
      </form>
    </Modal>
  );
};
