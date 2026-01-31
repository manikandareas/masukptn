# Root Layout

## Route
`/` (applies to all routes)

## Purpose
Root layout wrapper that provides global styling, fonts, and React Query provider to the entire application.

## Features
- **Font Setup**: JetBrains Mono (primary), Geist Sans, Geist Mono
- **Dark Mode**: Class-based dark mode (`.dark` on `<html>`)
- **React Query Provider**: TanStack Query for data fetching
- **Global Styles**: Applies globals.css and antialiased text
- **Metadata Config**: Default page title and description

## Data Schema

### Prefetched Query Data
None - layout configuration only

## Props Passed to Component
```typescript
interface RootLayoutProps {
  children: React.ReactNode;
}
```

## Fonts Used
```typescript
{
  jetbrainsMono: {
    variable: "--font-sans",
    subsets: ["latin"]
  },
  geistSans: {
    variable: "--font-geist-sans",
    subsets: ["latin"]
  },
  geistMono: {
    variable: "--font-geist-mono",
    subsets: ["latin"]
  }
}
```

## Authentication
Not applicable - layout wrapper only
