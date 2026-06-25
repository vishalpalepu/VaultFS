"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Spinner } from "@/components/ui/Spinner";
import type { IResource } from "@/types";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const triggerSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        setSearched(true);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      triggerSearch(queryParam);
    }
  }, [queryParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleDeleteResource = (id: string) => {
    setResults((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide font-sans">Global Search</h2>
        <p className="text-xs text-neutral-500">
          Full-text index search over title, description, tags, and note content.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type search terms (e.g. project plan, tags, notes...)"
            className="pl-10 text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </form>

      {/* Results View */}
      <div className="space-y-4">
        {loading ? (
          <Spinner size="lg" className="py-20" />
        ) : searched ? (
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Search Results ({results.length})
            </h3>
            {results.length === 0 ? (
              <div className="py-20 border border-neutral-900 bg-neutral-900/10 rounded-xl text-center space-y-2">
                <svg className="w-8 h-8 text-neutral-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-semibold text-white">No matches found</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Try double-checking spelling or using different keywords.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((res) => (
                  <ResourceCard key={res._id} resource={res} onDelete={handleDeleteResource} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 border border-neutral-900 bg-neutral-900/10 rounded-xl text-center text-neutral-500 text-xs italic">
            Enter a search term above to scan the knowledge base.
          </div>
        )}
      </div>
    </div>
  );
}
