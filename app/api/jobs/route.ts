import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

import { getJobHandler } from "@/lib/qstash/jobs";

import "@/features/admin/jobs/question-import-process";

export const dynamic = "force-dynamic";

export const POST = verifySignatureAppRouter(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const jobKey = searchParams.get("job");

  if (!jobKey) {
    return NextResponse.json({ error: "Missing job key" }, { status: 400 });
  }

  const handler = getJobHandler(jobKey);
  if (!handler) {
    return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  await handler(payload as never);

  return NextResponse.json({ ok: true });
});
