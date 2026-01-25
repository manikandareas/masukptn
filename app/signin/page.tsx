import { redirect } from "next/navigation";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getUser } from "@/lib/auth";

export default async function SignInPage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
