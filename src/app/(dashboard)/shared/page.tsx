import React from "react";
import { auth } from "@/lib/auth/auth";
import { getSharedResources } from "@/lib/services/resourceService";
import { Card } from "@/components/ui/Card";
import { ResourceCard } from "@/components/resources/ResourceCard";

export const revalidate = 0;

export default async function SharedResourcesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const sharedResources = await getSharedResources(userId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Shared Resources</h2>
        <p className="text-xs text-neutral-500">
          Discover federated resources shared by your peers across the knowledge network.
        </p>
      </div>

      {sharedResources.length === 0 ? (
        <Card className="p-12 text-center bg-neutral-900 border-neutral-850">
          <p className="text-sm text-neutral-400 font-medium">No shared resources found</p>
          <p className="text-xs text-neutral-600 mt-1">
            Resources marked with SHARED visibility by other users will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedResources.map((res: any) => (
            <ResourceCard
              key={res._id.toString()}
              resource={{
                ...res,
                _id: res._id?.toString(),
                ownerId: res.ownerId?._id?.toString() || res.ownerId?.toString(),
                folderId: res.folderId?.toString(),
                storageNodeId: res.storageNodeId?.toString(),
              }}
              // Do not pass onDelete so users cannot delete items shared by others
            />
          ))}
        </div>
      )}
    </div>
  );
}
