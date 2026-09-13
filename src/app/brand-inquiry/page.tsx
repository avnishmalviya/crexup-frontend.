"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function BrandInquiryPage() {
  const [form, setForm] = useState({
    brandName: "",
    contactName: "",
    email: "",
    phone: "",
    budget: "",
    campaignGoal: "",
    message: "",
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
      await api.post("/api/public/brand-inquiry", form, { auth: false });
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <Card className="w-full max-w-md text-center">
          <CardBody className="space-y-3 py-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">
              ✓
            </div>
            <h1 className="font-display text-xl font-semibold">Thanks for reaching out!</h1>
            <p className="text-sm text-muted">Our team will review your inquiry and get back to you shortly.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral font-display text-lg font-bold">
            C
          </div>
          <h1 className="font-display text-2xl font-semibold">Work with Crexup</h1>
          <p className="text-sm text-white/60">
            Tell us about your brand and campaign — our team matches you with vetted creators.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold">Brand Inquiry</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Brand Name" required>
                <Input required value={form.brandName} onChange={(e) => update("brandName", e.target.value)} />
              </Field>
              <Field label="Contact Name" required>
                <Input required value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
              </Field>
              <Field label="Email" required>
                <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Phone" required>
                <Input required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label="Budget">
                <Input placeholder="e.g. ₹2,00,000" value={form.budget} onChange={(e) => update("budget", e.target.value)} />
              </Field>
              <Field label="Campaign Goal">
                <Input
                  placeholder="e.g. Product launch awareness"
                  value={form.campaignGoal}
                  onChange={(e) => update("campaignGoal", e.target.value)}
                />
              </Field>
              <Field label="Message" className="sm:col-span-2">
                <Textarea rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} />
              </Field>

              {status === "error" && <p className="text-sm text-red sm:col-span-2">{error}</p>}

              <Button type="submit" disabled={status === "submitting"} className="sm:col-span-2">
                {status === "submitting" ? "Sending…" : "Submit Inquiry"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
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
