import { redirect } from "next/navigation";

import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getUser } from "@/lib/auth";

export default async function SignUpPage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
