"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const campaignCreatorId = searchParams.get("id") || "";

  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    shippingCity: "",
    shippingState: "",
    shippingPincode: "",
    shippingUpi: "",
    shippingPhone: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function respond(accept: boolean) {
    setAccepted(accept);
    if (!accept) {
      setStatus("submitting");
      try {
        await api.post("/api/public/campaigns/confirm", { campaignCreatorId, accept: false }, { auth: false });
        setStatus("done");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
        setStatus("error");
      }
    }
  }

  async function submitAddress(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await api.post(
        "/api/public/campaigns/confirm",
        { campaignCreatorId, accept: true, ...form },
        { auth: false }
      );
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (!campaignCreatorId) {
    return (
      <CenteredCard>
        <p className="text-sm text-muted">This link is missing its invitation reference. Please use the link sent to you on WhatsApp.</p>
      </CenteredCard>
    );
  }

  if (status === "done") {
    return (
      <CenteredCard>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">✓</div>
        <h1 className="font-display text-xl font-semibold">
          {accepted ? "You're confirmed!" : "Response recorded"}
        </h1>
        <p className="text-sm text-muted">
          {accepted
            ? "Thanks — our team will ship your product and follow up with next steps."
            : "Thanks for letting us know. We hope to work with you on a future campaign."}
        </p>
      </CenteredCard>
    );
  }

  if (accepted === null) {
    return (
      <CenteredCard>
        <h1 className="font-display text-xl font-semibold">Confirm Your Collaboration</h1>
        <p className="text-sm text-muted">Are you interested in participating in this campaign?</p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => respond(true)}>Yes, I&apos;m in</Button>
          <Button variant="ghost" onClick={() => respond(false)}>
            Not this time
          </Button>
        </div>
      </CenteredCard>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold">Shipping Details</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={submitAddress} className="space-y-4">
              <div>
                <Label>Phone Number</Label>
                <Input required value={form.shippingPhone} onChange={(e) => update("shippingPhone", e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input required value={form.shippingCity} onChange={(e) => update("shippingCity", e.target.value)} />
              </div>
              <div>
                <Label>State</Label>
                <Input required value={form.shippingState} onChange={(e) => update("shippingState", e.target.value)} />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input required value={form.shippingPincode} onChange={(e) => update("shippingPincode", e.target.value)} />
              </div>
              <div>
                <Label>UPI ID (optional)</Label>
                <Input value={form.shippingUpi} onChange={(e) => update("shippingUpi", e.target.value)} />
              </div>

              {status === "error" && <p className="text-sm text-red">{error}</p>}

              <Button type="submit" disabled={status === "submitting"} className="w-full">
                {status === "submitting" ? "Submitting…" : "Accept & Submit Address"}
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

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmInner />
    </Suspense>
  );
}
