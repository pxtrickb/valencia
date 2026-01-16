"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, Shield } from "lucide-react";

import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useAtTop(threshold = 8) {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    function handleScroll() {
      setAtTop(window.scrollY <= threshold);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return atTop;
}

export function Navbar() {
  const atTop = useAtTop();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  const isAuthPage =
    pathname?.startsWith("/signin") || pathname?.startsWith("/signup");

  const callbackURL = (() => {
    const search = searchParams?.toString();
    const base = pathname || "/";
    return search ? `${base}?${search}` : base;
  })();

  const user = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null }
    | undefined;

  const displayName = user?.name || user?.email || "Account";
  const initials =
    (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (isPending || !session) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/users");
        if (response.status === 403) {
          setIsAdmin(false);
        } else if (response.ok) {
          setIsAdmin(true);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    }

    checkAdmin();
  }, [session, isPending]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/landmarks", label: "Landmarks" },
    { href: "/spots", label: "Spots" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-300",
        atTop ? "top-0" : "top-4"
      )}
    >
      <header
        className={cn(
          "pointer-events-auto mx-4 flex w-full max-w-6xl items-center justify-between rounded-2xl border bg-background/95 px-4 py-3 text-sm shadow-lg backdrop-blur-md transition-all duration-300",
          atTop
            ? "rounded-none border-x-0 border-t-0 border-b-0 border-border/50 bg-transparent shadow-none backdrop-blur-sm"
            : "border-border/50"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-bold text-white shadow-sm">
            V
          </span>
          <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Valencia
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {/* Navigation Links - Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          {/* Auth Buttons */}
          {!isPending && !session && !isAuthPage && (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link
                  href={{
                    pathname: "/signin",
                    query: { callbackURL },
                  }}
                >
                  Sign in
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-orange-600 text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
              >
                <Link
                  href={{
                    pathname: "/signup",
                    query: { callbackURL },
                  }}
                >
                  Sign up
                </Link>
              </Button>
            </div>
          )}

          {session && (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    <Shield className="mr-2 size-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button
                  size="icon"
                  className="rounded-full border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 text-sm font-semibold text-orange-700 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-orange-900/50 dark:from-orange-950/50 dark:to-orange-900/30 dark:text-orange-400"
                  variant="outline"
                >
                  {initials}
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute left-4 right-4 top-full mt-2 rounded-2xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {session && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/admin"
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Shield className="mr-2 inline size-4" />
                Admin
              </Link>
            )}
            {!isPending && !session && !isAuthPage && (
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Link
                    href={{
                      pathname: "/signin",
                      query: { callbackURL },
                    }}
                  >
                    Sign in
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-orange-600 text-white hover:bg-orange-700"
                >
                  <Link
                    href={{
                      pathname: "/signup",
                      query: { callbackURL },
                    }}
                  >
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

