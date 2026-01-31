# Health Check Endpoint

## Route
`GET /api/health`

## Purpose
Health check endpoint for monitoring service availability and status.

## Runtime
Edge runtime

## Request
No request body or parameters required.

## Response (Success)
```typescript
interface HealthCheckResponse {
  status: "ok";
  timestamp: string; // ISO 8601 datetime
  app: string; // "masukptn"
}
```
**Status Code**: 200

## Response (Error)
```typescript
interface HealthCheckErrorResponse {
  status: "error";
  error: string; // "Health check failed"
  timestamp: string; // ISO 8601 datetime
}
```
**Status Code**: 503

## Authentication
Not required - public endpoint

## Usage
Used by monitoring services, load balancers, and deployment health checks to verify the application is running correctly.
