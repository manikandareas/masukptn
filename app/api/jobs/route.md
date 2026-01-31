# Jobs Endpoint

## Route
`POST /api/jobs`

## Purpose
Webhook endpoint for processing background jobs via Upstash QStash (job queue service).

## Runtime
Force dynamic (not cached)

## Request
### Query Parameters
```typescript
interface JobRequestParams {
  job: string; // Job key to identify which handler to use
}
```

### Request Body
JSON payload varies by job type. Common structure:
```typescript
type JobPayload = unknown; // Varies by job key
```

## Response (Success)
```typescript
interface JobSuccessResponse {
  ok: true;
}
```
**Status Code**: 200

## Response Errors

### Missing Job Key
```typescript
interface MissingJobKeyResponse {
  error: "Missing job key";
}
```
**Status Code**: 400

### Unknown Job
```typescript
interface UnknownJobResponse {
  error: "Unknown job";
}
```
**Status Code**: 404

### Invalid JSON
```typescript
interface InvalidJSONResponse {
  error: "Invalid JSON payload";
}
```
**Status Code**: 400

## Registered Jobs
Jobs are registered in `@/lib/qstash/jobs.ts`:

### `question-import-process`
Processes PDF question imports through OCR and AI extraction.

```typescript
interface QuestionImportJobPayload {
  importId: string; // UUID of the question import
}
```

## Authentication
Signature verification via Upstash QStash `verifySignatureAppRouter` - ensures requests come from QStash service.

## Usage
Called by Upstash QStash when a scheduled job is ready to execute. Jobs are queued by application code and executed asynchronously.
