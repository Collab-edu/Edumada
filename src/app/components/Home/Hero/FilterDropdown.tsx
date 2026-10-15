'use client'
import { Fragment } from 'react'
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    Transition,
} from '@headlessui/react'
import { Icon } from '@iconify/react/dist/iconify.js'

interface FilterDropdownProps {
    label: string
    options: string[]
    value: string
    onChange: (value: string) => void
    icon?: string
}

const FilterDropdown = ({ label, options, value, onChange, icon }: FilterDropdownProps) => {
    return (
        <div className='w-full'>
            <p className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                {icon && <Icon icon={icon} className='text-base text-secondary' />}
                {label}
            </p>
            <Listbox value={value} onChange={onChange}>
                <div className='relative mt-1'>
                    <ListboxButton className='relative w-full cursor-default rounded-lg bg-transparent py-1 pr-10 text-left focus:outline-hidden focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary hover:cursor-pointer'>
                        <span className='block truncate text-base font-semibold text-ink'>
                            {value}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                            <Icon
                                icon='tabler:chevron-down'
                                className='text-gray-400 text-xl inline-block me-2'
                            />
                        </span>
                    </ListboxButton>
                    <Transition
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'>
                        <ListboxOptions className='absolute z-10 mt-1 max-h-60 w-full min-w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden sm:text-sm'>
                            {options.map((option) => (
                                <ListboxOption
                                    key={option}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-cream text-primary' : 'text-ink'
                                        }`
                                    }
                                    value={option}>
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                    }`}>
                                                {option}
                                            </span>
                                            {selected ? (
                                                <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-primary'>
                                                    <Icon
                                                        icon='tabler:check'
                                                        className='text-xl inline-block me-2'
                                                    />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </Transition>
                </div>
            </Listbox>
        </div>
    )
}

export default FilterDropdown
