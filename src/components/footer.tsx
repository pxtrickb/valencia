"use client";

import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, UserPlus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const exploreLinks = [
  { label: "Landmarks", href: "/landmarks" },
  { label: "Spots", href: "/spots" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/about" },
  { label: "Careers", href: "/about" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/about" },
  { label: "Terms of Service", href: "/about" },
  { label: "Cookie Policy", href: "/about" },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-background to-slate-950 text-white">
      {/* Footer Content */}
      <div className="bg-slate-950 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Branding */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <span className="text-xl font-bold text-white">València</span>
                <span className="ml-1 text-lg font-semibold text-orange-500">
                  TOURISM
                </span>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-white/70">
                This is a demo project for FEAA (UVT) / "Programare Internet" course.
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>Valencia, Spain</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <a
                    href="mailto:hello@valencia-tourism.com"
                    className="hover:text-white/80 transition-colors"
                  >
                    hello@valencia.eranova.ro
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  <a
                    href="tel:+34963000000"
                    className="hover:text-white/80 transition-colors"
                  >
                    +34 000 000 000
                  </a>
                </div>
              </div>
            </div>

            {/* Explore Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                EXPLORE
              </h4>
              <ul className="space-y-2">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                COMPANY
              </h4>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                LEGAL
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
