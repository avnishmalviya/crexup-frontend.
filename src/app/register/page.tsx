"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["Fashion", "Beauty", "Food", "Travel", "Fitness", "Tech", "Finance", "Comedy", "Lifestyle", "Gaming"];
const NICHES = ["Skincare", "Streetwear", "Home Decor", "Vlogging", "Parenting", "Sneakers", "Pets", "Music", "Education", "Couple"];

export default function CreatorRegistrationPage() {
  const [form, setForm] = useState({
    fullName: "",
    instagramUsername: "",
    instagramUrl: "",
    mobileNumber: "",
    whatsappNumber: "",
    email: "",
    gender: "",
    state: "",
    city: "",
    language: "",
    contentCategory: CATEGORIES[0],
    contentNiche: NICHES[0],
    upiId: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [creatorCode, setCreatorCode] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await api.post<{ message: string; creatorCode: string }>(
        "/api/public/creators/register",
        { ...form, gender: form.gender || undefined, upiId: form.upiId || undefined, instagramUrl: form.instagramUrl || undefined },
        { auth: false }
      );
      setMessage(res.message);
      setCreatorCode(res.creatorCode);
      setStatus("done");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
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
            <h1 className="font-display text-xl font-semibold">You&apos;re registered!</h1>
            <p className="text-sm text-muted">{message}</p>
            <p className="font-data text-sm">Your Creator ID: {creatorCode}</p>
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
          <h1 className="font-display text-2xl font-semibold">Register as a Crexup Creator</h1>
          <p className="text-sm text-white/60">Get matched with brand campaigns that fit your niche.</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold">Your Details</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" required className="sm:col-span-2">
                <Input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </Field>
              <Field label="Instagram Username" required>
                <Input
                  required
                  placeholder="@yourhandle"
                  value={form.instagramUsername}
                  onChange={(e) => update("instagramUsername", e.target.value)}
                />
              </Field>
              <Field label="Instagram URL (optional)">
                <Input
                  placeholder="https://instagram.com/yourhandle"
                  value={form.instagramUrl}
                  onChange={(e) => update("instagramUrl", e.target.value)}
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field label="Mobile Number" required>
                <Input required value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} />
              </Field>
              <Field label="WhatsApp Number" required>
                <Input
                  required
                  value={form.whatsappNumber}
                  onChange={(e) => update("whatsappNumber", e.target.value)}
                />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </Field>
              <Field label="Language" required>
                <Input required value={form.language} onChange={(e) => update("language", e.target.value)} />
              </Field>
              <Field label="State" required>
                <Input required value={form.state} onChange={(e) => update("state", e.target.value)} />
              </Field>
              <Field label="City" required>
                <Input required value={form.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
              <Field label="Content Category" required>
                <Select required value={form.contentCategory} onChange={(e) => update("contentCategory", e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Content Niche" required>
                <Select required value={form.contentNiche} onChange={(e) => update("contentNiche", e.target.value)}>
                  {NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="UPI ID (optional)" className="sm:col-span-2">
                <Input value={form.upiId} onChange={(e) => update("upiId", e.target.value)} />
              </Field>

              {status === "error" && <p className="text-sm text-red sm:col-span-2">{message}</p>}

              <Button type="submit" disabled={status === "submitting"} className="sm:col-span-2">
                {status === "submitting" ? "Submitting…" : "Submit Registration"}
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
