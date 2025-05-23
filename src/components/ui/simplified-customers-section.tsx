import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface CustomerLogo {
  src: string
  alt: string
  height: number
}

interface CustomersSectionProps {
  customers: CustomerLogo[]
  className?: string
}

export function CustomersSection({ customers = [], className }: CustomersSectionProps) {
  return (
    <section className={`pb-12 pt-0 md:pb-16 ${className ?? ""}`} style={{backgroundColor: '#F4EDE9'}}>
      <div className="relative m-auto max-w-5xl px-6">
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-14">
          {customers.map((logo, index) => (
            <div key={index} className="flex">
              <img
                className="mx-auto h-auto w-fit"
                src={logo.src}
                alt={logo.alt}
                height={logo.height}
                width="auto"
                style={{ filter: 'brightness(0) invert(0.25)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
