"use client";

import useSWR from "swr";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StageBadge } from "@/components/ui/Badge";
import type { Campaign } from "@/lib/types";

interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
}

export default function CampaignsPage() {
  const ready = useRequireAuth();
  const { data, isLoading } = useSWR<CampaignsResponse>(
    ready ? "/api/campaigns?pageSize=50" : null,
    (url: string) => api.get<CampaignsResponse>(url)
  );

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-muted">{data ? `${data.total} campaigns` : "Track every campaign's pipeline."}</p>
        </div>
        <Link href="/campaigns/new">
          <Button>New Campaign</Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-muted">Loading…</p>}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Campaign</th>
              <th className="px-5 py-3 font-medium">Brand</th>
              <th className="px-5 py-3 font-medium">Creators</th>
              <th className="px-5 py-3 font-medium">Deadline</th>
              <th className="px-5 py-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-paper">
                <td className="px-5 py-3">
                  <Link href={`/campaigns/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                  <p className="font-data text-xs text-muted">{c.campaignCode}</p>
                </td>
                <td className="px-5 py-3">{c.brandName}</td>
                <td className="px-5 py-3 font-data">{c._count?.creators ?? 0}</td>
                <td className="px-5 py-3 text-muted">
                  {c.deadline ? new Date(c.deadline).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3">
                  <StageBadge stage={c.stage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.campaigns.length === 0 && !isLoading && (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No campaigns yet. Shortlist creators and create your first one.
          </p>
        )}
      </Card>
    </div>
  );
}
