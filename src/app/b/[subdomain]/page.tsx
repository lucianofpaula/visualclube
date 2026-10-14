import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Scissors,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { getBarbershopBySubdomainAction } from "@/actions/barbershop";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const instant = false;

interface BarbershopPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export async function generateMetadata({
  params,
}: BarbershopPageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const barbershop = await getBarbershopBySubdomainAction(subdomain);

  if (!barbershop) {
    return {
      title: "Barbearia não encontrada | Visual Club",
    };
  }

  return {
    title: `${barbershop.name} | Agendamento Online`,
    description:
      barbershop.description ||
      `Agende seu horário na ${barbershop.name}. Conheça nossos profissionais, serviços e especialidades.`,
  };
}

export default async function BarbershopPublicPage({
  params,
}: BarbershopPageProps) {
  const { subdomain } = await params;
  const barbershop = await getBarbershopBySubdomainAction(subdomain);

  if (!barbershop || !barbershop.isActive) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Scissors className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Barbearia não encontrada
          </h1>
          <p className="text-sm text-muted-foreground">
            O endereço{" "}
            <span className="font-mono text-amber-500 font-medium">
              {subdomain}.visualclube.com.br
            </span>{" "}
            não está cadastrado ou está temporariamente desativado.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className={buttonVariants({ className: "w-full" })}
            >
              Ir para a página inicial do Visual Club
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullAddress = [
    barbershop.address,
    barbershop.number,
    barbershop.neighborhood,
    barbershop.city,
    barbershop.state,
  ]
    .filter(Boolean)
    .join(", ");

  const whatsappMessage = encodeURIComponent(
    `Olá! Vim pelo site da ${barbershop.name} e gostaria de agendar um horário.`
  );
  const whatsappUrl = barbershop.whatsapp
    ? `https://wa.me/55${barbershop.whatsapp.replace(/\D/g, "")}?text=${whatsappMessage}`
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {barbershop.logoUrl ? (
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border">
                <Image
                  src={barbershop.logoUrl}
                  alt={barbershop.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
                <Scissors className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight">
                {barbershop.name}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Unidade Verificada Visual Club
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "sm",
                  className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium",
                })}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-muted/40 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Scissors className="h-3.5 w-3.5" />
            Barbearia & Estilo Masculino
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {barbershop.name}
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {barbershop.description ||
              "Cortes clássicos, modernos e tratamentos de alta precisão. Agende seu atendimento com a nossa equipe de especialistas."}
          </p>

          {/* Endereço e Contato Rápidos */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
            {fullAddress && (
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span>{fullAddress}</span>
              </div>
            )}
            {barbershop.phone && (
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
                <Phone className="h-4 w-4 text-amber-500" />
                <span>{barbershop.phone}</span>
              </div>
            )}
          </div>

          {whatsappUrl && (
            <div className="pt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-amber-500 hover:bg-amber-600 text-black font-bold text-base px-8 shadow-lg shadow-amber-500/20",
                })}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Horário Agora
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Seção de Barbeiros / Profissionais */}
      <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 w-full flex-1">
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Nossa Equipe de Profissionais
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha seu barbeiro favorito e confira as especialidades de cada um
          </p>
        </div>

        {barbershop.professionals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card/50">
            <Scissors className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">
              Nenhum profissional listado publicamente no momento
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Entre em contato pelo WhatsApp para verificar os horários disponíveis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbershop.professionals.map((prof) => {
              const initials = prof.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const profScheduleMsg = encodeURIComponent(
                `Olá! Gostaria de agendar um horário com o profissional ${prof.name} na ${barbershop.name}.`
              );
              const profWhatsappUrl = barbershop.whatsapp
                ? `https://wa.me/55${barbershop.whatsapp.replace(/\D/g, "")}?text=${profScheduleMsg}`
                : null;

              return (
                <Card
                  key={prof.id}
                  className="overflow-hidden border-border bg-card hover:border-primary/40 transition-all hover:shadow-md"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <Avatar className="h-20 w-20 mx-auto border-2 border-amber-500/30">
                      {prof.avatarUrl && (
                        <AvatarImage src={prof.avatarUrl} alt={prof.name} />
                      )}
                      <AvatarFallback className="bg-amber-500/10 text-amber-500 font-bold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-bold text-lg text-foreground">
                        {prof.name}
                      </h4>
                      {prof.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {prof.bio}
                        </p>
                      )}
                    </div>

                    {prof.specialties.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                        {prof.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-[11px] font-medium bg-muted px-2.5 py-0.5 rounded-full text-foreground/80 border border-border"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {profWhatsappUrl && (
                      <div className="pt-2">
                        <a
                          href={profWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "w-full text-xs font-semibold gap-1.5 hover:bg-amber-500 hover:text-black hover:border-amber-500",
                          })}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Agendar com {prof.name.split(" ")[0]}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 py-8 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {barbershop.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <span>Powered by</span>
            <Link href="/" className="font-semibold text-amber-500 hover:underline">
              Visual Club Barbearias
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
