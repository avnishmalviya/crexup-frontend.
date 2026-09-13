"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { StarRating } from "@/components/shared/StarRating";
import type { Creator, CreatorNote, ReliabilityRating } from "@/lib/types";

const SCORE_FIELDS: Array<{ key: keyof NonNullable<Creator["scores"]>; label: string }> = [
  { key: "engagementScore", label: "Engagement" },
  { key: "consistencyScore", label: "Consistency" },
  { key: "audienceQualityScore", label: "Audience Quality" },
  { key: "reliabilityScore", label: "Reliability" },
  { key: "brandFriendlyScore", label: "Brand Friendly" },
  { key: "growthScore", label: "Growth" },
];

const RATING_FIELDS: Array<{ key: "contentQuality" | "communication" | "onTimeDelivery" | "campaignPerformance" | "brandFit"; label: string }> = [
  { key: "contentQuality", label: "Content Quality" },
  { key: "communication", label: "Communication" },
  { key: "onTimeDelivery", label: "On-Time Delivery" },
  { key: "campaignPerformance", label: "Campaign Performance" },
  { key: "brandFit", label: "Brand Fit" },
];

const RELIABILITY_OPTIONS: ReliabilityRating[] = ["EXCELLENT", "GOOD", "AVERAGE", "POOR"];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CreatorProfilePage() {
  const ready = useRequireAuth();
  const { id } = useParams<{ id: string }>();

  const { data: creator, mutate } = useSWR<Creator>(
    ready ? `/api/creators/${id}` : null,
    (url: string) => api.get<Creator>(url)
  );

  const [noteText, setNoteText] = useState("");
  const [noteCategory, setNoteCategory] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Manual edit of Followers/Engagement etc.
  const [editingIg, setEditingIg] = useState(false);
  const [igForm, setIgForm] = useState({
    followers: 0,
    following: 0,
    totalPosts: 0,
    engagementRate: 0,
    avgReelViews: 0,
    avgLikes: 0,
    avgComments: 0,
    postingFrequency: 0,
  });
  const [savingIg, setSavingIg] = useState(false);

  // Instagram URL edit
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);

  // Creator Score / rating form
  const [ratingForm, setRatingForm] = useState({
    contentQuality: 0,
    communication: 0,
    onTimeDelivery: 0,
    campaignPerformance: 0,
    brandFit: 0,
    reliability: "AVERAGE" as ReliabilityRating,
    description: "",
  });
  const [savingRating, setSavingRating] = useState(false);
  const [ratingInitialized, setRatingInitialized] = useState(false);

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await api.post(`/api/creators/${id}/notes`, { category: noteCategory, text: noteText });
      setNoteText("");
      mutate();
    } finally {
      setSaving(false);
    }
  }

  async function refreshInstagram() {
    setRefreshing(true);
    try {
      await api.post(`/api/creators/${id}/refresh-instagram`);
      mutate();
    } finally {
      setRefreshing(false);
    }
  }

  function startEditingIg() {
    const ig = creator?.instagramProfile;
    setIgForm({
      followers: ig?.followers || 0,
      following: ig?.following || 0,
      totalPosts: ig?.totalPosts || 0,
      engagementRate: ig?.engagementRate || 0,
      avgReelViews: ig?.avgReelViews || 0,
      avgLikes: ig?.avgLikes || 0,
      avgComments: ig?.avgComments || 0,
      postingFrequency: ig?.postingFrequency || 0,
    });
    setEditingIg(true);
  }

  async function saveIg() {
    setSavingIg(true);
    try {
      await api.put(`/api/creators/${id}/instagram-profile`, igForm);
      setEditingIg(false);
      mutate();
    } finally {
      setSavingIg(false);
    }
  }

  function startEditingUrl() {
    setUrlValue(creator?.instagramUrl || "");
    setEditingUrl(true);
  }

  async function saveUrl() {
    setSavingUrl(true);
    try {
      await api.patch(`/api/creators/${id}`, { instagramUrl: urlValue || undefined });
      setEditingUrl(false);
      mutate();
    } finally {
      setSavingUrl(false);
    }
  }

  async function saveRating() {
    setSavingRating(true);
    try {
      await api.put(`/api/creators/${id}/rating`, ratingForm);
      mutate();
    } finally {
      setSavingRating(false);
    }
  }

  // Populate the rating form once from the loaded creator, without
  // clobbering the admin's in-progress edits on every re-fetch.
  useEffect(() => {
    if (creator?.rating && !ratingInitialized) {
      setRatingForm({
        contentQuality: creator.rating.contentQuality,
        communication: creator.rating.communication,
        onTimeDelivery: creator.rating.onTimeDelivery,
        campaignPerformance: creator.rating.campaignPerformance,
        brandFit: creator.rating.brandFit,
        reliability: creator.rating.reliability,
        description: creator.rating.description || "",
      });
      setRatingInitialized(true);
    }
  }, [creator, ratingInitialized]);

  if (!ready) return null;
  if (!creator) return <p className="text-sm text-muted">Loading…</p>;

  const ig = creator.instagramProfile;
  const scores = creator.scores;
  const perf = creator.performance;

  const previewAvgStars =
    (ratingForm.contentQuality +
      ratingForm.communication +
      ratingForm.onTimeDelivery +
      ratingForm.campaignPerformance +
      ratingForm.brandFit) /
    5;
  const previewOverallScore = Math.round(previewAvgStars * 2 * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {ig?.profilePictureUrl && (
            // Mock/remote avatars — plain img avoids next/image domain allowlisting for arbitrary creator URLs
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ig.profilePictureUrl} alt="" className="h-16 w-16 rounded-full border border-line object-cover" />
          )}
          <div>
            <h1 className="font-display text-2xl font-semibold">{creator.fullName}</h1>
            <p className="font-data text-sm text-muted">
              @{creator.instagramUsername} · {creator.creatorCode}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={creator.verificationStatus === "VERIFIED" ? "teal" : "neutral"}>
                {creator.verificationStatus.toLowerCase()}
              </Badge>
              <Badge>{creator.availabilityStatus.toLowerCase().replace("_", " ")}</Badge>
              <Badge tone="indigo">
                {creator.city}, {creator.state}
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              {editingUrl ? (
                <>
                  <Input
                    className="h-8 w-64"
                    placeholder="https://instagram.com/handle"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                  />
                  <Button size="sm" onClick={saveUrl} disabled={savingUrl}>
                    {savingUrl ? "Saving…" : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingUrl(false)}>
                    Cancel
                  </Button>
                </>
              ) : creator.instagramUrl ? (
                <>
                  <a href={creator.instagramUrl} target="_blank" rel="noreferrer" className="text-indigo hover:underline">
                    {creator.instagramUrl}
                  </a>
                  <button className="text-xs text-muted hover:underline" onClick={startEditingUrl}>
                    Edit
                  </button>
                </>
              ) : (
                <button className="text-xs text-indigo hover:underline" onClick={startEditingUrl}>
                  + Add Instagram URL
                </button>
              )}
            </div>

            <p className="mt-1 text-xs text-muted">Updated on {formatDate(creator.updatedAt)}</p>
          </div>
        </div>
        {scores && <ScoreRing score={scores.creatorScore} size={88} strokeWidth={7} label="Creator Score" />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Instagram Profile</h2>
            <div className="flex gap-2">
              {!editingIg && (
                <Button size="sm" variant="ghost" onClick={startEditingIg}>
                  Edit Details
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={refreshInstagram} disabled={refreshing}>
                {refreshing ? "Refreshing…" : "Refresh from Instagram"}
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {editingIg ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <EditField label="Followers" value={igForm.followers} onChange={(v) => setIgForm((f) => ({ ...f, followers: v }))} />
                  <EditField label="Following" value={igForm.following} onChange={(v) => setIgForm((f) => ({ ...f, following: v }))} />
                  <EditField label="Posts" value={igForm.totalPosts} onChange={(v) => setIgForm((f) => ({ ...f, totalPosts: v }))} />
                  <EditField
                    label="Engagement Rate %"
                    value={igForm.engagementRate}
                    onChange={(v) => setIgForm((f) => ({ ...f, engagementRate: v }))}
                  />
                  <EditField
                    label="Avg Reel Views"
                    value={igForm.avgReelViews}
                    onChange={(v) => setIgForm((f) => ({ ...f, avgReelViews: v }))}
                  />
                  <EditField label="Avg Likes" value={igForm.avgLikes} onChange={(v) => setIgForm((f) => ({ ...f, avgLikes: v }))} />
                  <EditField
                    label="Avg Comments"
                    value={igForm.avgComments}
                    onChange={(v) => setIgForm((f) => ({ ...f, avgComments: v }))}
                  />
                  <EditField
                    label="Posting Frequency /wk"
                    value={igForm.postingFrequency}
                    onChange={(v) => setIgForm((f) => ({ ...f, postingFrequency: v }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveIg} disabled={savingIg}>
                    {savingIg ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingIg(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : ig ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Followers" value={ig.followers.toLocaleString()} />
                <Stat label="Following" value={ig.following.toLocaleString()} />
                <Stat label="Posts" value={ig.totalPosts.toLocaleString()} />
                <Stat label="Engagement Rate" value={`${ig.engagementRate}%`} />
                <Stat label="Avg Reel Views" value={ig.avgReelViews.toLocaleString()} />
                <Stat label="Avg Likes" value={ig.avgLikes.toLocaleString()} />
                <Stat label="Avg Comments" value={ig.avgComments.toLocaleString()} />
                <Stat label="Posting Frequency" value={`${ig.postingFrequency}/wk`} />
              </div>
            ) : (
              <p className="text-sm text-muted">
                No Instagram data yet. Try refreshing, or{" "}
                <button className="text-indigo hover:underline" onClick={startEditingIg}>
                  enter it manually
                </button>
                .
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold">AI Scores</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {scores ? (
              SCORE_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{f.label}</span>
                  <span className="font-data font-medium">{scores[f.key]}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Scores not calculated yet.</p>
            )}
            {scores && (
              <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
                <span className="text-muted">Fake Follower Risk</span>
                <Badge tone={scores.fakeFollowerRisk >= 50 ? "red" : "teal"}>{scores.fakeFollowerRisk}</Badge>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display font-semibold">Campaign Performance History</h2>
          </CardHeader>
          <CardBody>
            {perf && perf.totalCampaigns > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Total Campaigns" value={perf.totalCampaigns.toString()} />
                <Stat label="Completion Rate" value={`${perf.completionRate}%`} />
                <Stat label="On-Time Delivery" value={`${perf.onTimeDeliveryRate}%`} />
                <Stat label="Acceptance Rate" value={`${perf.acceptanceRate}%`} />
                <Stat label="Avg Views" value={perf.avgViews.toLocaleString()} />
                <Stat label="Avg Reach" value={perf.avgReach.toLocaleString()} />
                <Stat label="Brand Rating" value={`${perf.brandRatingAvg}/5`} />
                <Stat label="Admin Rating" value={`${perf.adminRatingAvg}/5`} />
              </div>
            ) : (
              <p className="text-sm text-muted">No completed campaigns yet — this creator has no track record.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold">Internal Notes</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <form onSubmit={submitNote} className="space-y-2">
              <Select value={noteCategory} onChange={(e) => setNoteCategory(e.target.value as "POSITIVE" | "NEGATIVE")}>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
              </Select>
              <Textarea
                rows={2}
                placeholder="e.g. Delivers before deadline, great storytelling…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Add Note"}
              </Button>
            </form>

            <div className="max-h-80 space-y-3 overflow-y-auto border-t border-line pt-3">
              {(creator.notes || []).length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
              {(creator.notes || []).map((note: CreatorNote) => (
                <div key={note.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge tone={note.category === "POSITIVE" ? "teal" : "red"}>
                      {note.category === "POSITIVE" ? "✅" : "❌"}
                    </Badge>
                    <span className="text-xs text-muted">
                      {note.admin?.name} · {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{note.text}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-display font-semibold">Creator Score</h2>
          {creator.rating && <span className="text-xs text-muted">Last Reviewed: {formatDate(creator.rating.lastReviewedAt)}</span>}
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RATING_FIELDS.map((f) => (
              <div key={f.key} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                <span className="text-sm text-muted">{f.label}</span>
                <StarRating
                  value={ratingForm[f.key]}
                  onChange={(v) => setRatingForm((form) => ({ ...form, [f.key]: v }))}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-bg-black/5 to bg-white/5">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="font-data text-lg font-semibold">{previewOverallScore}/10</span>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Reliability</label>
              <Select
                value={ratingForm.reliability}
                onChange={(e) => setRatingForm((f) => ({ ...f, reliability: e.target.value as ReliabilityRating }))}
              >
                {RELIABILITY_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Description</label>
            <Textarea
              rows={3}
              placeholder="Notes on this creator's overall performance and fit for future campaigns…"
              value={ratingForm.description}
              onChange={(e) => setRatingForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <Button size="sm" onClick={saveRating} disabled={savingRating}>
            {savingRating ? "Saving…" : "Save Creator Score"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <Input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-data text-lg font-medium">{value}</p>
    </div>
  );
}
