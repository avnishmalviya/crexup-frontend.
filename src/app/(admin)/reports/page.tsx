"use client";

import useSWR from "swr";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import type { Campaign } from "@/lib/types";

export default function ReportsOverviewPage() {
  const ready = useRequireAuth();
  const { data } = useSWR<{ campaigns: Campaign[] }>(
    ready ? "/api/campaigns?pageSize=50" : null,
    (url: string) => api.get<{ campaigns: Campaign[] }>(url)
  );

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted">Open a campaign&apos;s Reports tab to view or export its performance report.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Campaign</th>
              <th className="px-5 py-3 font-medium">Brand</th>
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
                <td className="px-5 py-3">
                  <StageBadge stage={c.stage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.campaigns.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">No campaigns yet.</p>
        )}
      </Card>
    </div>
  );
}
