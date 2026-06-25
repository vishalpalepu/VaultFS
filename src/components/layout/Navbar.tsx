"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/Button";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white font-bold tracking-wider text-sm shadow-md shadow-blue-500/25">
          VFS
        </div>
        <h1 className="font-semibold text-white tracking-wide text-sm md:text-base">
          VaultFS <span className="text-xs text-neutral-500 font-normal">v1.0.0-MVP</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-neutral-500">{session.user.email}</p>
            </div>
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                className="w-8 h-8 rounded-full border border-neutral-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-semibold text-blue-400">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
