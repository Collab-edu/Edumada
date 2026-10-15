import React from 'react'
import Hero from '@/app/components/Home/Hero'
import Companies from '@/app/components/Home/Companies'
import Domains from '@/app/components/Home/Domains'
import RegisterCta from '@/app/components/Home/RegisterCta'
import NamesList from '@/app/components/Home/Courses'
import Schools from '@/app/components/Home/Schools'
import Steps from '@/app/components/Home/Steps'
import SchoolCta from '@/app/components/Home/SchoolCta'
import Newsletter from '@/app/components/Home/Newsletter'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Si Educational',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Companies />
      <Domains />
      <RegisterCta />
      <NamesList />
      <Schools />
      <Steps />
      <SchoolCta />
      <Newsletter />
    </main>
  )
}
