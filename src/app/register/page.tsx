"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiError, authApi } from "@/lib/mediconnect";

type Role = "PATIENT" | "DOCTOR";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  qualification: string;
  experienceYears: string;
  bio: string;
  clinicAddress: string;
}

const initialForm: RegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  qualification: "",
  experienceYears: "",
  bio: "",
  clinicAddress: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("PATIENT");
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof RegisterForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const field = (
    label: string,
    key: keyof RegisterForm,
    type = "text",
    required = true,
  ) => (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <input
        required={required}
        type={type}
        min={type === "number" ? 0 : undefined}
        minLength={key === "password" ? 8 : undefined}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none transition focus:border-[#4e8848] focus:ring-2 focus:ring-[#4e8848]/10"
      />
    </label>
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      const common = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role,
      };

      const payload =
        role === "PATIENT"
          ? {
              ...common,
              dateOfBirth: form.dateOfBirth || undefined,
              gender: form.gender || undefined,
              address: form.address.trim() || undefined,
            }
          : {
              ...common,
              qualification: form.qualification.trim(),
              experienceYears: Number(form.experienceYears || 0),
              bio: form.bio.trim() || undefined,
              clinicAddress: form.clinicAddress.trim() || undefined,
            };

      await authApi.register(payload);

      toast.success("Account created successfully! Please log in.");

      router.replace("/login");
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          {/* Header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4e8848]">
              Join MediConnect
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[#153d30]">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Choose how you will use the platform.
            </p>
          </div>

          {/* Account type */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("PATIENT")}
              className={`rounded-xl border p-4 text-left transition ${
                role === "PATIENT"
                  ? "border-[#4e8848] bg-[#eff6ef]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block font-bold text-[#153d30]">Patient</span>

              <span className="mt-1 block text-xs text-slate-500">
                Find doctors and book care
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("DOCTOR")}
              className={`rounded-xl border p-4 text-left transition ${
                role === "DOCTOR"
                  ? "border-[#4e8848] bg-[#eff6ef]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block font-bold text-[#153d30]">Doctor</span>

              <span className="mt-1 block text-xs text-slate-500">
                Manage your practice and schedule
              </span>
            </button>
          </div>

          {/* Registration form */}
          <form onSubmit={submit} className="mt-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {field("First name", "firstName")}
              {field("Last name", "lastName")}
              {field("Email address", "email", "email")}
              {field("Phone number", "phone", "tel", false)}
              {field("Password (minimum 8 characters)", "password", "password")}
            </div>

            {/* Patient fields */}
            {role === "PATIENT" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {field("Date of birth", "dateOfBirth", "date", false)}

                <label className="block text-sm font-semibold text-slate-700">
                  Gender
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#4e8848]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <div className="sm:col-span-2">
                  {field("Address", "address", "text", false)}
                </div>
              </div>
            )}

            {/* Doctor fields */}
            {role === "DOCTOR" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {field("Qualification", "qualification")}

                {field(
                  "Years of experience",
                  "experienceYears",
                  "number",
                  false,
                )}

                <div className="sm:col-span-2">
                  {field("Clinic address", "clinicAddress", "text", false)}
                </div>

                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                  Professional biography
                  <textarea
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    rows={4}
                    placeholder="Tell patients about your professional experience and areas of expertise..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-normal outline-none transition focus:border-[#4e8848] focus:ring-2 focus:ring-[#4e8848]/10"
                  />
                </label>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={busy}
              className="mt-8 w-full rounded-xl bg-[#123f32] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#1b5944] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? "Creating account..."
                : `Create ${role.toLowerCase()} account`}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-[#28764e] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
