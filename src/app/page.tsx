"use client"

import * as React from "react"
import { useState } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { SegmentsSection } from "@/components/landing/segments-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ComandasShowcase } from "@/components/landing/comandas-showcase"
import { RoiCalculator } from "@/components/landing/roi-calculator"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FaqSection } from "@/components/landing/faq-section"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { AuthModal } from "@/components/auth/auth-modal"

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500 selection:text-white relative">
      {/* Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content */}
      <main className="flex-1">
        <Hero onOpenAuth={handleOpenAuth} />
        <SegmentsSection onOpenAuth={handleOpenAuth} />
        <FeaturesSection />
        <ComandasShowcase onOpenAuth={handleOpenAuth} />
        <RoiCalculator onOpenAuth={handleOpenAuth} />
        <PricingSection onOpenAuth={handleOpenAuth} />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection onOpenAuth={handleOpenAuth} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal (Login / Cadastro via Email ou WhatsApp) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  )
}
