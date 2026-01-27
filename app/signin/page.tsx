import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masuk | MasukPTN",
  description: "Masuk ke akun Anda untuk melanjutkan persiapan SNMPTN.",
};

export default async function SignInPage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
