import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/actions/auth";
import { getProfessionalsAction } from "@/actions/professionals";
import { redirect } from "next/navigation";
import { Scissors, UserCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfessionalsClientPage } from "@/components/professionals/professionals-client-page";

export const instant = false;

export const metadata = {
  title: "Gestão de Profissionais | Visual Club",
  description: "Cadastre e gerencie a equipe de barbeiros da sua barbearia.",
};

export default async function ProfissionaisPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  const professionals = await getProfessionalsAction();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <SidebarProvider>
      <AppSidebar user={session} />
      <SidebarInset className="bg-background text-foreground min-h-screen">
        {/* Header com Trigger, Separator, Breadcrumb e ThemeToggle */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    href="/painel"
                    className="text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-1.5"
                  >
                    <Scissors className="h-3.5 w-3.5 text-amber-500" />
                    Visual Club
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block text-muted-foreground/60" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/painel"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Painel Administrativo
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-muted-foreground/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-semibold flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-amber-500" />
                    Profissionais
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Conteúdo Principal de Profissionais */}
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ProfessionalsClientPage
            initialProfessionals={professionals}
            appUrl={appUrl}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
