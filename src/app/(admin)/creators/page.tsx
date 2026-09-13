"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/shared/ScoreRing";
import type { Creator } from "@/lib/types";

interface CreatorsResponse {
  creators: Creator[];
  total: number;
  totalPages: number;
  page: number;
}

function CreatorsPageInner() {
  const ready = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [minEngagement, setMinEngagement] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (state) params.set("state", state);
  if (city) params.set("city", city);
  if (category) params.set("category", category);
  if (minFollowers) params.set("minFollowers", minFollowers);
  if (maxFollowers) params.set("maxFollowers", maxFollowers);
  if (minEngagement) params.set("minEngagement", minEngagement);
  if (verificationStatus) params.set("verificationStatus", verificationStatus);
  params.set("pageSize", "20");

  const { data, isLoading } = useSWR<CreatorsResponse>(
    ready ? `/api/creators?${params.toString()}` : null,
    (url: string) => api.get<CreatorsResponse>(url)
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function createCampaignWithSelection() {
    const ids = Array.from(selected).join(",");
    router.push(`/campaigns/new?creatorIds=${ids}`);
  }

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Creators</h1>
          <p className="text-sm text-muted">{data ? `${data.total} creators found` : "Search and filter your roster."}</p>
        </div>
        {selected.size > 0 && (
          <Button onClick={createCampaignWithSelection}>Create Campaign ({selected.size})</Button>
        )}
      </div>

      <Card>
        <CardBody className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Input placeholder="Name, Instagram, mobile" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input
            placeholder="Min. followers"
            type="number"
            value={minFollowers}
            onChange={(e) => setMinFollowers(e.target.value)}
          />
          <Input
            placeholder="Max. followers"
            type="number"
            value={maxFollowers}
            onChange={(e) => setMaxFollowers(e.target.value)}
          />
          <Input
            placeholder="Min. engagement %"
            type="number"
            value={minEngagement}
            onChange={(e) => setMinEngagement(e.target.value)}
          />
          <Select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)}>
            <option value="">Verified: All</option>
            <option value="VERIFIED">Verified only</option>
            <option value="UNVERIFIED">Unverified only</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </CardBody>
      </Card>

      {isLoading && <p className="text-sm text-muted">Loading…</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.creators.map((creator) => (
          <Card key={creator.id} className={selected.has(creator.id) ? "border-coral" : ""}>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.has(creator.id)}
                    onChange={() => toggle(creator.id)}
                  />
                  <div>
                    <Link href={`/creators/${creator.id}`} className="font-medium hover:underline">
                      {creator.fullName}
                    </Link>
                    <p className="font-data text-xs text-muted">
                      @{creator.instagramUsername} · {creator.creatorCode}
                    </p>
                    <p className="text-xs text-muted">
                      {creator.city}, {creator.state} · {creator.contentNiche}
                    </p>
                  </div>
                </label>
                {creator.scores && <ScoreRing score={creator.scores.creatorScore} size={52} strokeWidth={5} />}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <Badge>{(creator.instagramProfile?.followers || 0).toLocaleString()} followers</Badge>
                <Badge>{creator.instagramProfile?.engagementRate || 0}% engagement</Badge>
                {creator.scores && (creator.scores.fakeFollowerRisk || 0) >= 50 && (
                  <Badge tone="red">Fake follower risk</Badge>
                )}
                <Badge tone={creator.verificationStatus === "VERIFIED" ? "teal" : "neutral"}>
                  {creator.verificationStatus.toLowerCase()}
                </Badge>
              </div>
              <p className="text-[11px] text-muted">
                Updated on {new Date(creator.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {data && data.creators.length === 0 && !isLoading && (
        <Card>
          <CardBody className="py-10 text-center text-sm text-muted">
            No creators match these filters yet. Try widening your search.
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function CreatorsPage() {
  return (
    <Suspense fallback={null}>
      <CreatorsPageInner />
    </Suspense>
  );
}
