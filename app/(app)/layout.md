# App Layout

## Route
`/(app)/*` (applies to all authenticated app routes)

## Purpose
Authenticated app layout wrapper that provides the navigation bar and main container for all app pages.

## Features
- **AppNavbar**: Main navigation with links to Dashboard, Practice, Tryout, Admin
- Background styling with dark theme
- Container structure for child routes

## Data Schema

### Prefetched Query Data
None - layout wrapper only

## Props Passed to Component
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}
```

## Component Used
- `AppNavbar` from `@/components/app-navbar`

## Authentication
**Required**: Yes (implied by route group structure)
