import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCurrentUserBarbershopAction } from "@/actions/barbershop";
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
import { BarbershopWizard } from "@/components/barbershop/barbershop-wizard";
import { ThemeToggle } from "@/components/theme-toggle";

export const instant = false;

export const metadata: Metadata = {
  title: "Configurar Barbearia | Visual Club",
  description: "Cadastre e configure o perfil do seu negócio, subdomínio e horários de atendimento.",
};

export default async function BarbeariaPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const barbershop = await getCurrentUserBarbershopAction();

  return (
    <SidebarProvider>
      <AppSidebar user={session} barbershop={barbershop} />
      <SidebarInset>
        {/* Header com Breadcrumb e Trigger */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/80 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/painel">Painel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Minha Barbearia</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <BarbershopWizard initialData={barbershop} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
