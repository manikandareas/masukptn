import "server-only";

import { Client, type PublishResponse } from "@upstash/qstash";

type JobHandler<TPayload> = (payload: TPayload) => Promise<void>;

type JobDispatchOptions = {
  headers?: HeadersInit;
  delay?: number | `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d`;
  notBefore?: number;
  deduplicationId?: string;
  contentBasedDeduplication?: boolean;
  retries?: number;
  timeout?: number | `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d`;
  callback?: string;
  failureCallback?: string;
  label?: string;
};

type Job<TPayload> = {
  key: string;
  handler: JobHandler<TPayload>;
  dispatch: (
    payload: TPayload,
    options?: JobDispatchOptions,
  ) => Promise<PublishResponse<{ url: string; body: TPayload }>>;
};

const registry = new Map<string, JobHandler<unknown>>();

const client = new Client({
  token: process.env.QSTASH_TOKEN ?? "",
});

function getJobEndpointUrl() {
  const explicit = process.env.QSTASH_JOB_ENDPOINT;
  if (explicit) return explicit;

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL;

  if (!base) {
    throw new Error("Missing QSTASH_JOB_ENDPOINT or NEXT_PUBLIC_SITE_URL");
  }

  const normalized = base.startsWith("http") ? base : `https://${base}`;
  return `${normalized.replace(/\/$/, "")}/api/jobs`;
}

export function createJob<TPayload>(key: string, handler: JobHandler<TPayload>) {
  if (registry.has(key)) {
    throw new Error(`Job already registered: ${key}`);
  }

  registry.set(key, handler as JobHandler<unknown>);

  const dispatch: Job<TPayload>["dispatch"] = async (payload, options) => {
    if (!process.env.QSTASH_TOKEN) {
      throw new Error("Missing QSTASH_TOKEN");
    }
    const url = `${getJobEndpointUrl()}?job=${encodeURIComponent(key)}`;
    return client.publishJSON({
      url,
      body: payload,
      ...options,
    });
  };

  return {
    key,
    handler,
    dispatch,
  } satisfies Job<TPayload>;
}

export function getJobHandler(key: string) {
  return registry.get(key);
}
