import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-background px-4 pt-16">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-amber-400/30 blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
