"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function SubmitContentInner() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") || "";
  const creatorId = searchParams.get("creatorId") || "";

  const [form, setForm] = useState({
    reelLink: "",
    storyLink: "",
    postingDate: "",
    caption: "",
    screenshotUrl: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await api.post(
        "/api/public/content/submit",
        {
          campaignId,
          creatorId,
          reelLink: form.reelLink || undefined,
          storyLink: form.storyLink || undefined,
          postingDate: form.postingDate ? new Date(form.postingDate).toISOString() : undefined,
          caption: form.caption || undefined,
          screenshotUrl: form.screenshotUrl || undefined,
        },
        { auth: false }
      );
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (!campaignId || !creatorId) {
    return (
      <CenteredCard>
        <p className="text-sm text-muted">
          This link is missing campaign details. Please use the link sent to you by the Crexup team.
        </p>
      </CenteredCard>
    );
  }

  if (status === "done") {
    return (
      <CenteredCard>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">✓</div>
        <h1 className="font-display text-xl font-semibold">Content submitted!</h1>
        <p className="text-sm text-muted">Our team will review it shortly and reach out if any changes are needed.</p>
      </CenteredCard>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold">Submit Your Content</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Instagram Reel Link</Label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/reel/..."
                  value={form.reelLink}
                  onChange={(e) => update("reelLink", e.target.value)}
                />
              </div>
              <div>
                <Label>Story Link</Label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/stories/..."
                  value={form.storyLink}
                  onChange={(e) => update("storyLink", e.target.value)}
                />
              </div>
              <div>
                <Label>Posting Date</Label>
                <Input type="date" value={form.postingDate} onChange={(e) => update("postingDate", e.target.value)} />
              </div>
              <div>
                <Label>Caption</Label>
                <Textarea rows={3} value={form.caption} onChange={(e) => update("caption", e.target.value)} />
              </div>
              <div>
                <Label>Screenshot URL</Label>
                <Input
                  type="url"
                  placeholder="Link to a screenshot of your post"
                  value={form.screenshotUrl}
                  onChange={(e) => update("screenshotUrl", e.target.value)}
                />
              </div>

              {status === "error" && <p className="text-sm text-red">{error}</p>}

              <Button type="submit" disabled={status === "submitting"} className="w-full">
                {status === "submitting" ? "Submitting…" : "Submit Content"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <Card className="w-full max-w-md text-center">
        <CardBody className="space-y-3 py-10">{children}</CardBody>
      </Card>
    </div>
  );
}

export default function SubmitContentPage() {
  return (
    <Suspense fallback={null}>
      <SubmitContentInner />
    </Suspense>
  );
}
