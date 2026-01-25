import { AppNavbar } from "@/components/app-navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <div>{children}</div>
    </div>
  );
}
