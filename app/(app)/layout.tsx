import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col items-center">
        <div className="w-full">
          <SidebarTrigger />
        </div>
        <div className="w-full max-w-6xl flex-1 px-6 pb-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
