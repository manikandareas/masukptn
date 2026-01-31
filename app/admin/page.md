# Admin Dashboard Page

## Route
`/admin`

## Purpose
Admin dashboard showing content management statistics and quick access to content management tools.

## Features
- Question statistics (total, published, draft)
- Question set statistics (total, published)
- Quick links to manage questions and question sets
- Question import management access

## Data Schema

### Prefetched Query Data
```typescript
interface AdminStats {
  questions: {
    total: number;
    published: number;
    draft: number;
  };
  questionSets: {
    total: number;
    published: number;
  };
}
```

## Props Passed to Component
```typescript
// No props - data prefetched via React Query
interface Props {
  // None
}
```

## Component Used
- `AdminDashboardPage` from `@/features/admin/components/admin-dashboard-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminStatsAction()` from `@/features/admin/server/get-admin-stats`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
