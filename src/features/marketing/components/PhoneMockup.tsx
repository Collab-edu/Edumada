import type { ReactNode } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import withBasePath from '@/lib/base-path'

export type PhoneTab = { icon: string; label: string; active?: boolean }

/** Téléphone dessiné en HTML : en-tête Edumada, écran libre et barre d'onglets. Purement décoratif. */
export default function PhoneMockup({ tabs, children }: { tabs: PhoneTab[]; children: ReactNode }) {
    return (
        <div className='relative mx-auto w-full max-w-[18rem]' aria-hidden='true'>
            <div className='absolute -inset-6 -z-10 rounded-full bg-cream blur-2xl' />
            <div className='rounded-[2.5rem] border-[10px] border-secondary bg-offwhite shadow-xl'>
                <div className='mx-auto mt-2 h-1.5 w-16 rounded-full bg-secondary/20' />
                <div className='flex flex-col gap-4 px-4 pt-4'>
                    <div className='flex items-center justify-between'>
                        <Image src={withBasePath('/images/logo/edumada-logo.svg')} alt='' width={828} height={270} className='h-7 w-auto' />
                        <span className='relative text-xl text-secondary'>
                            <Icon icon='tabler:bell' />
                            <span className='absolute right-0 top-0 h-2 w-2 rounded-full bg-primary' />
                        </span>
                    </div>
                    {children}
                </div>
                <div className='mt-4 grid rounded-b-[1.9rem] border-t border-gray-200 bg-white py-2' style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                    {tabs.map((tab) => (
                        <span
                            key={tab.label}
                            className={`flex flex-col items-center gap-0.5 text-[10px] ${tab.active ? 'font-semibold text-primary' : 'text-ink/50'}`}>
                            <Icon icon={tab.icon} className='text-base' />
                            {tab.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
