"use client";

import useSWR from "swr";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card, CardBody } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import type { Campaign } from "@/lib/types";

export default function WhatsappOverviewPage() {
  const ready = useRequireAuth();
  const { data } = useSWR<{ campaigns: Campaign[] }>(
    ready ? "/api/campaigns?pageSize=50" : null,
    (url: string) => api.get<{ campaigns: Campaign[] }>(url)
  );

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">WhatsApp Outreach</h1>
        <p className="text-sm text-muted">
          Pick a campaign to preview, edit, and send invitation messages to its shortlisted creators.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.campaigns.map((c) => (
          <Link key={c.id} href={`/campaigns/${c.id}`}>
            <Card className="h-full transition-shadow hover:shadow-sm">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.name}</p>
                  <StageBadge stage={c.stage} />
                </div>
                <p className="font-data text-xs text-muted">
                  {c.brandName} · {c.campaignCode}
                </p>
                <p className="text-xs text-muted">{c._count?.creators ?? 0} creators shortlisted</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {data && data.campaigns.length === 0 && (
        <Card>
          <CardBody className="py-10 text-center text-sm text-muted">
            No campaigns yet — create one from the Creators page after shortlisting.
          </CardBody>
        </Card>
      )}
    </div>
  );
}
