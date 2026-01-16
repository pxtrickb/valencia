import React from 'react'
import { Card } from '../ui/card'
import { UserPlus, ArrowRight, Building2 } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function CtaCards() {
  return (
    <div className="border-b border-white/10 bg-slate-950 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Join Community Card */}
          <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-orange-600">
              <UserPlus className="size-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Join Our Community
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              Create an account to save your favorite spots, write reviews,
              and get personalized recommendations for your Valencia adventure.
            </p>
            <Button
              asChild
              variant="outline"
              className="group border-white/20 bg-white text-slate-950 hover:bg-white/90"
            >
              <Link href="/signup">
                Create Account
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Card>

          {/* List Business Card */}
          <Card className="border-orange-600/20 bg-orange-600 p-6">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-orange-700">
              <Building2 className="size-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              List Your Business
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-white/90">
              Are you a local business owner? Join our platform to reach
              thousands of visitors and showcase what makes your establishment
              special.
            </p>
            <Button
              asChild
              variant="outline"
              className="group border-white/30 bg-white text-slate-950 hover:bg-white/90"
            >
              <Link href="/profile?tab=businesses&openModal=true">
                Apply Now
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
