"use client";

import useSWR from "swr";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge, StageBadge } from "@/components/ui/Badge";
import type { DashboardSummary } from "@/lib/types";
import { Users, BadgeCheck, Megaphone, TrendingUp } from "lucide-react";

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral-soft text-coral">
          <Icon size={18} />
        </div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const ready = useRequireAuth();
  const { data, isLoading, error } = useSWR<DashboardSummary>(
    ready ? "/api/dashboard/summary" : null,
    (url: string) => api.get<DashboardSummary>(url)
  );

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">A quick read on creators and campaigns right now.</p>
      </div>

      {error && (
        <Card className="border-red/30 bg-red-soft">
          <CardBody className="text-sm text-red">
            Couldn&apos;t reach the API at {process.env.NEXT_PUBLIC_API_URL}. Confirm the backend is running.
          </CardBody>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted">Loading…</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Users}
              label="Total Creators"
              value={data.totalCreators.toLocaleString()}
              hint={`+${data.creatorsAddedThisMonth} this month`}
            />
            <StatTile icon={BadgeCheck} label="Verified Creators" value={data.verifiedCreators.toLocaleString()} />
            <StatTile icon={Megaphone} label="Active Campaigns" value={data.activeCampaigns.toLocaleString()} />
            <StatTile
              icon={TrendingUp}
              label="Avg. Engagement"
              value={`${data.averageEngagement}%`}
              hint={`${data.campaignCompletionRate}% campaign completion rate`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-display font-semibold">Recent Registrations</h2>
                <Link href="/creators" className="text-xs text-indigo hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardBody className="divide-y divide-line p-0">
                {data.recentRegistrations.length === 0 && (
                  <p className="px-5 py-6 text-sm text-muted">No creators registered yet.</p>
                )}
                {data.recentRegistrations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/creators/${c.id}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-paper"
                  >
                    <div>
                      <p className="font-medium">{c.fullName}</p>
                      <p className="font-data text-xs text-muted">
                        @{c.instagramUsername} · {c.creatorCode}
                      </p>
                    </div>
                    <Badge tone={c.verificationStatus === "VERIFIED" ? "teal" : "neutral"}>
                      {c.verificationStatus.toLowerCase()}
                    </Badge>
                  </Link>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-display font-semibold">Campaign Timeline</h2>
                <Link href="/campaigns" className="text-xs text-indigo hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardBody className="divide-y divide-line p-0">
                {data.campaignTimeline.length === 0 && (
                  <p className="px-5 py-6 text-sm text-muted">No campaigns yet.</p>
                )}
                {data.campaignTimeline.map((c) => (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-paper"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="font-data text-xs text-muted">
                        {c.brandName} · {c.campaignCode}
                      </p>
                    </div>
                    <StageBadge stage={c.stage} />
                  </Link>
                ))}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
