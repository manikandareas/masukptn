import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Daftar | MasukPTN",
  description: "Buat akun baru untuk memulai persiapan SNMPTN Anda.",
};

export default async function SignUpPage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
