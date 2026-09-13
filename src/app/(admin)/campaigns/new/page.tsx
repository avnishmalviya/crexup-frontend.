"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function NewCampaignInner() {
  const ready = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const creatorIds = (searchParams.get("creatorIds") || "").split(",").filter(Boolean);

  const [form, setForm] = useState({
    name: "",
    brandName: "",
    product: "",
    goal: "",
    budget: "",
    creatorPayment: "",
    deliverables: "",
    deadline: "",
    captionGuidelines: "",
    contentGuidelines: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const campaign = await api.post<{ id: string }>("/api/campaigns", {
        name: form.name,
        brandName: form.brandName,
        product: form.product,
        goal: form.goal || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        creatorPayment: form.creatorPayment ? Number(form.creatorPayment) : undefined,
        deliverables: form.deliverables || undefined,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        captionGuidelines: form.captionGuidelines || undefined,
        contentGuidelines: form.contentGuidelines || undefined,
        creatorIds: creatorIds.length ? creatorIds : undefined,
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the campaign. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">New Campaign</h1>
        <p className="text-sm text-muted">
          {creatorIds.length > 0
            ? `${creatorIds.length} creator(s) will be shortlisted automatically.`
            : "You can shortlist creators after creating the campaign."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display font-semibold">Campaign Details</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Campaign Name" required>
              <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </Field>
            <Field label="Brand Name" required>
              <Input required value={form.brandName} onChange={(e) => update("brandName", e.target.value)} />
            </Field>
            <Field label="Product" required>
              <Input required value={form.product} onChange={(e) => update("product", e.target.value)} />
            </Field>
            <Field label="Campaign Goal">
              <Input value={form.goal} onChange={(e) => update("goal", e.target.value)} />
            </Field>
            <Field label="Budget (₹)">
              <Input type="number" value={form.budget} onChange={(e) => update("budget", e.target.value)} />
            </Field>
            <Field label="Creator Payment (₹)">
              <Input
                type="number"
                value={form.creatorPayment}
                onChange={(e) => update("creatorPayment", e.target.value)}
              />
            </Field>
            <Field label="Deadline">
              <Input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
            </Field>
            <Field label="Deliverables">
              <Input
                placeholder="e.g. 1 Reel + 2 Stories"
                value={form.deliverables}
                onChange={(e) => update("deliverables", e.target.value)}
              />
            </Field>
            <Field label="Caption Guidelines" className="sm:col-span-2">
              <Textarea rows={2} value={form.captionGuidelines} onChange={(e) => update("captionGuidelines", e.target.value)} />
            </Field>
            <Field label="Content Guidelines" className="sm:col-span-2">
              <Textarea rows={2} value={form.contentGuidelines} onChange={(e) => update("contentGuidelines", e.target.value)} />
            </Field>

            {error && <p className="text-sm text-red sm:col-span-2">{error}</p>}

            <Button type="submit" disabled={saving} className="sm:col-span-2">
              {saving ? "Creating…" : "Create Campaign"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-coral">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={null}>
      <NewCampaignInner />
    </Suspense>
  );
}
