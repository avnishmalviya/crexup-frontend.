"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { api, API_URL } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StageBadge, Badge, RecommendationBadge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Input";
import { ScoreRing } from "@/components/shared/ScoreRing";
import type { Campaign, CampaignCreator } from "@/lib/types";

const PIPELINE_STAGES: Array<{ key: string; label: string }> = [
  { key: "DRAFT", label: "Draft" },
  { key: "CREATOR_SHORTLISTED", label: "Shortlisted" },
  { key: "INVITATION_SENT", label: "Invited" },
  { key: "CREATOR_ACCEPTED", label: "Accepted" },
  { key: "ADDRESS_SUBMITTED", label: "Address" },
  { key: "PRODUCT_SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CONTENT_SUBMITTED", label: "Content In" },
  { key: "APPROVED", label: "Approved" },
  { key: "POSTED", label: "Posted" },
  { key: "COMPLETED", label: "Completed" },
];

type CampaignDetail = Campaign & { creators: CampaignCreator[] };

const TABS = ["Creators", "WhatsApp", "Shipping", "Content", "Reports"] as const;

export default function CampaignDetailPage() {
  const ready = useRequireAuth();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Creators");

  const { data: campaign, mutate } = useSWR<CampaignDetail>(
    ready ? `/api/campaigns/${id}` : null,
    (url: string) => api.get<CampaignDetail>(url)
  );

  if (!ready) return null;
  if (!campaign) return <p className="text-sm text-muted">Loading…</p>;

  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === campaign.stage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{campaign.name}</h1>
          <p className="font-data text-sm text-muted">
            {campaign.brandName} · {campaign.campaignCode}
          </p>
        </div>
        <StageBadge stage={campaign.stage} />
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center overflow-x-auto pb-1">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                      i <= currentStageIndex ? "bg-coral text-white" : "bg-white/5 text-muted"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="whitespace-nowrap text-[11px] text-muted">{s.label}</span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className={`mx-1 h-0.5 w-8 ${i < currentStageIndex ? "bg-coral" : "bg-line"}`} />
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "border-coral text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Creators" && <CreatorsTab campaign={campaign} onChange={mutate} />}
      {tab === "WhatsApp" && <WhatsappTab campaign={campaign} onChange={mutate} />}
      {tab === "Shipping" && <ShippingTab campaignId={campaign.id} />}
      {tab === "Content" && <ContentTab campaignId={campaign.id} />}
      {tab === "Reports" && <ReportsTab campaignId={campaign.id} />}
    </div>
  );
}

function CreatorsTab({ campaign, onChange }: { campaign: CampaignDetail; onChange: () => void }) {
  async function updateStatus(creatorId: string, status: string) {
    await api.patch(`/api/campaigns/${campaign.id}/creators/${creatorId}`, { status });
    onChange();
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead className="bg-paper text-left text-xs text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Creator</th>
            <th className="px-5 py-3 font-medium">Score</th>
            <th className="px-5 py-3 font-medium">Recommendation</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {campaign.creators.map((cc) => (
            <tr key={cc.id}>
              <td className="px-5 py-3">
                <p className="font-medium">{cc.creator.fullName}</p>
                <p className="font-data text-xs text-muted">@{cc.creator.instagramUsername}</p>
              </td>
              <td className="px-5 py-3">
                {cc.creator.scores && <ScoreRing score={cc.creator.scores.creatorScore} size={40} strokeWidth={4} />}
              </td>
              <td className="px-5 py-3">
                <RecommendationBadge tier={cc.recommendationTier} />
              </td>
              <td className="px-5 py-3">
                <Badge tone="indigo">{cc.status.toLowerCase().replace(/_/g, " ")}</Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex gap-1">
                  {cc.status === "SHORTLISTED" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(cc.creator.id, "INVITED")}>
                      Mark Invited
                    </Button>
                  )}
                  {cc.status === "DELIVERED" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(cc.creator.id, "COMPLETED")}>
                      Mark Completed
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {campaign.creators.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-muted">
                No creators shortlisted yet. Go to Creators and select some.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

function WhatsappTab({ campaign, onChange }: { campaign: CampaignDetail; onChange: () => void }) {
  const [previews, setPreviews] = useState<Array<{ creatorId: string; creatorName: string; message: string }>>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const notYetInvited = campaign.creators.filter((cc) => cc.status === "SHORTLISTED");

  async function loadPreviews() {
    setLoadingPreview(true);
    try {
      const res = await api.post<{ previews: typeof previews }>("/api/whatsapp/preview", {
        campaignId: campaign.id,
        creatorIds: notYetInvited.map((cc) => cc.creator.id),
        timeline: campaign.deadline ? new Date(campaign.deadline).toDateString() : undefined,
      });
      setPreviews(res.previews);
    } finally {
      setLoadingPreview(false);
    }
  }

  function updateMessage(creatorId: string, message: string) {
    setPreviews((prev) => prev.map((p) => (p.creatorId === creatorId ? { ...p, message } : p)));
  }

  async function sendAll() {
    setSending(true);
    try {
      await api.post("/api/whatsapp/send", {
        campaignId: campaign.id,
        messages: previews.map((p) => ({ creatorId: p.creatorId, messageText: p.message })),
      });
      setPreviews([]);
      onChange();
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-display font-semibold">Send Campaign Invitations</h2>
        {previews.length === 0 ? (
          <Button size="sm" onClick={loadPreviews} disabled={loadingPreview || notYetInvited.length === 0}>
            {loadingPreview ? "Preparing…" : `Preview messages (${notYetInvited.length})`}
          </Button>
        ) : (
          <Button size="sm" onClick={sendAll} disabled={sending}>
            {sending ? "Sending…" : `Send to ${previews.length}`}
          </Button>
        )}
      </CardHeader>
      <CardBody className="space-y-4">
        {notYetInvited.length === 0 && previews.length === 0 && (
          <p className="text-sm text-muted">No shortlisted creators awaiting invitation.</p>
        )}
        {previews.map((p) => (
          <div key={p.creatorId} className="space-y-1">
            <p className="text-sm font-medium">{p.creatorName}</p>
            <Textarea rows={5} value={p.message} onChange={(e) => updateMessage(p.creatorId, e.target.value)} />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function ShippingTab({ campaignId }: { campaignId: string }) {
  const { data } = useSWR<{ sheet: Array<Record<string, string>> }>(
    `/api/shipping/campaign/${campaignId}`,
    (url: string) => api.get<{ sheet: Array<Record<string, string>> }>(url)
  );

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead className="bg-paper text-left text-xs text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Creator</th>
            <th className="px-5 py-3 font-medium">Phone</th>
            <th className="px-5 py-3 font-medium">Address</th>
            <th className="px-5 py-3 font-medium">Courier</th>
            <th className="px-5 py-3 font-medium">Tracking</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data?.sheet.map((row) => (
            <tr key={row.creatorId}>
              <td className="px-5 py-3">{row.creatorName}</td>
              <td className="px-5 py-3 font-data">{row.phone}</td>
              <td className="px-5 py-3">{row.address}</td>
              <td className="px-5 py-3">{row.courier || "—"}</td>
              <td className="px-5 py-3 font-data">{row.trackingNumber || "—"}</td>
              <td className="px-5 py-3">
                <Badge tone="indigo">{row.shippingStatus.toLowerCase()}</Badge>
              </td>
            </tr>
          ))}
          {data && data.sheet.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-muted">
                No creators have submitted a shipping address yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

function ContentTab({ campaignId }: { campaignId: string }) {
  const { data, mutate } = useSWR<
    Array<{ id: string; reelLink: string | null; caption: string | null; reviewStatus: string; creator: { fullName: string } }>
  >(`/api/content/campaign/${campaignId}`, (url: string) =>
    api.get<Array<{ id: string; reelLink: string | null; caption: string | null; reviewStatus: string; creator: { fullName: string } }>>(url)
  );

  async function review(id: string, reviewStatus: string) {
    await api.patch(`/api/content/${id}/review`, { reviewStatus });
    mutate();
  }

  return (
    <div className="space-y-4">
      {(data || []).map((sub) => (
        <Card key={sub.id}>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="font-medium">{sub.creator.fullName}</p>
              {sub.reelLink && (
                <a href={sub.reelLink} target="_blank" rel="noreferrer" className="text-sm text-indigo hover:underline">
                  {sub.reelLink}
                </a>
              )}
              <p className="text-sm text-muted">{sub.caption}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={sub.reviewStatus === "APPROVED" ? "teal" : "amber"}>
                {sub.reviewStatus.toLowerCase().replace(/_/g, " ")}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => review(sub.id, "APPROVED")}>
                Approve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => review(sub.id, "REVISION_REQUESTED")}>
                Request Revision
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
      {data && data.length === 0 && (
        <Card>
          <CardBody className="py-10 text-center text-sm text-muted">No content submitted yet.</CardBody>
        </Card>
      )}
    </div>
  );
}

function ReportsTab({ campaignId }: { campaignId: string }) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("crexup_admin_token") : null;

  return (
    <Card>
      <CardBody className="flex flex-wrap gap-3">
        <a href={`${API_URL}/api/reports/campaign/${campaignId}/excel?token=${token}`} target="_blank" rel="noreferrer">
          <Button variant="secondary">Download Excel Report</Button>
        </a>
        <a href={`${API_URL}/api/reports/campaign/${campaignId}/pdf?token=${token}`} target="_blank" rel="noreferrer">
          <Button variant="secondary">Download PDF Report</Button>
        </a>
        <p className="w-full text-xs text-muted">
          Downloads authenticate via a <span className="font-data">?token=</span> query param since browsers can&apos;t
          attach an Authorization header on direct navigation — the backend&apos;s auth middleware accepts either.
        </p>
      </CardBody>
    </Card>
  );
}
