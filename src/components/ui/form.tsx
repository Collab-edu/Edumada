'use client'
import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Champs de formulaire aux couleurs d'Edumada (zones tactiles ≥ 44 px) */
/* ------------------------------------------------------------------ */

export const inputClassName =
    'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-ink outline-hidden transition placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-offwhite disabled:text-ink/50'

interface FieldProps {
    label: string
    hint?: string
    error?: string
    required?: boolean
    className?: string
    children: (id: string, describedBy: string | undefined) => ReactNode
}

/** Libellé, aide et message d'erreur autour d'un champ. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
    const id = useId()
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={id} className='text-sm font-semibold text-secondary'>
                {label}
                {required && <span className='text-primary'> *</span>}
            </label>
            {children(id, describedBy)}
            {error ? (
                <p id={`${id}-error`} className='text-sm text-primary'>{error}</p>
            ) : hint ? (
                <p id={`${id}-hint`} className='text-sm text-ink/60'>{hint}</p>
            ) : null}
        </div>
    )
}

type BaseFieldProps = { label: string; hint?: string; error?: string; className?: string }

/** Champ de mot de passe (autoComplete « …password ») : sa valeur n'est jamais recopiée dans le HTML. */
export const isPasswordField = (autoComplete?: string) => !!autoComplete?.endsWith('password')

export function TextField({ label, hint, error, className, required, value, ...props }: BaseFieldProps & ComponentProps<'input'>) {
    // Mot de passe : champ non contrôlé, sinon React écrit la saisie dans l'attribut value (lisible dans l'inspecteur).
    const valueProps = isPasswordField(props.autoComplete) ? {} : { value }
    return (
        <Field label={label} hint={hint} error={error} required={required} className={className}>
            {(id, describedBy) => (
                <input id={id} required={required} aria-invalid={!!error} aria-describedby={describedBy} className={cn(inputClassName, error && 'border-primary')} {...props} {...valueProps} />
            )}
        </Field>
    )
}

export function TextArea({ label, hint, error, className, required, rows = 4, ...props }: BaseFieldProps & ComponentProps<'textarea'>) {
    return (
        <Field label={label} hint={hint} error={error} required={required} className={className}>
            {(id, describedBy) => (
                <textarea id={id} rows={rows} required={required} aria-invalid={!!error} aria-describedby={describedBy} className={cn(inputClassName, 'resize-y', error && 'border-primary')} {...props} />
            )}
        </Field>
    )
}

type Option = string | { value: string; label: string }

export function SelectField({ label, hint, error, className, required, options, placeholder, ...props }: BaseFieldProps & ComponentProps<'select'> & { options: Option[]; placeholder?: string }) {
    return (
        <Field label={label} hint={hint} error={error} required={required} className={className}>
            {(id, describedBy) => (
                <select id={id} required={required} aria-invalid={!!error} aria-describedby={describedBy} className={cn(inputClassName, 'hover:cursor-pointer', error && 'border-primary')} {...props}>
                    {placeholder !== undefined && <option value=''>{placeholder}</option>}
                    {options.map((option) => {
                        const { value, label: text } = typeof option === 'string' ? { value: option, label: option } : option
                        return <option key={value} value={value}>{text}</option>
                    })}
                </select>
            )}
        </Field>
    )
}

/** Case à cocher avec son libellé, cliquable sur toute la ligne. */
export function Checkbox({ label, hint, className, ...props }: { label: string; hint?: string; className?: string } & ComponentProps<'input'>) {
    return (
        <label className={cn('flex min-h-11 items-start gap-3 hover:cursor-pointer', className)}>
            <input type='checkbox' className='mt-1 h-5 w-5 shrink-0 accent-primary' {...props} />
            <span className='flex flex-col'>
                <span className='font-medium text-ink'>{label}</span>
                {hint && <span className='text-sm text-ink/60'>{hint}</span>}
            </span>
        </label>
    )
}

/**
 * Liste de textes éditable (objectifs, pièces à fournir, infrastructures…) : une ligne par élément.
 */
export function ListField({ label, hint, error, value, onChange, placeholder, className }: BaseFieldProps & { value: string[]; onChange: (value: string[]) => void; placeholder?: string }) {
    const [draft, setDraft] = useState('')
    const add = () => {
        const text = draft.trim()
        if (text && !value.includes(text)) onChange([...value, text])
        setDraft('')
    }
    return (
        <Field label={label} hint={hint} error={error} className={className}>
            {(id, describedBy) => (
                <div className='flex flex-col gap-2'>
                    {value.length > 0 && (
                        <ul className='flex flex-col gap-2'>
                            {value.map((item, i) => (
                                <li key={`${item}-${i}`} className='flex items-center gap-2 rounded-lg bg-offwhite px-3 py-2'>
                                    <span className='flex-1 text-ink'>{item}</span>
                                    <button
                                        type='button'
                                        onClick={() => onChange(value.filter((_, j) => j !== i))}
                                        aria-label={`Retirer « ${item} »`}
                                        className='flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-cream hover:text-primary hover:cursor-pointer'>
                                        <Icon icon='tabler:x' />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className='flex gap-2'>
                        <input
                            id={id}
                            aria-describedby={describedBy}
                            value={draft}
                            placeholder={placeholder ?? 'Ajouter un élément'}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    add()
                                }
                            }}
                            className={inputClassName}
                        />
                        <Button type='button' variant='secondary' onClick={add} aria-label={`Ajouter à « ${label} »`}>
                            <Icon icon='tabler:plus' className='text-lg' />
                        </Button>
                    </div>
                </div>
            )}
        </Field>
    )
}

/* ------------------------------------------------------------------ */
/* Boutons                                                             */
/* ------------------------------------------------------------------ */

const buttonVariants = {
    primary: 'bg-primary text-white border border-primary hover:bg-primary/90 shadow-sm shadow-primary/20',
    secondary: 'bg-white text-secondary border border-secondary/20 hover:border-primary hover:text-primary',
    dark: 'bg-secondary text-white border border-secondary hover:bg-secondary/90',
    ghost: 'bg-transparent text-secondary border border-transparent hover:bg-secondary/10',
    danger: 'bg-white text-primary border border-primary/40 hover:bg-primary hover:text-white',
}

type ButtonProps = ComponentProps<'button'> & { variant?: keyof typeof buttonVariants; loading?: boolean; size?: 'md' | 'sm' }

export function Button({ variant = 'primary', loading = false, size = 'md', className, children, disabled, ...props }: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
                size === 'md' ? 'min-h-11 px-5 py-2.5' : 'min-h-9 px-3 py-1.5 text-sm',
                buttonVariants[variant],
                className
            )}
            {...props}>
            {loading && <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' aria-hidden='true' />}
            {children}
        </button>
    )
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof buttonVariants; size?: 'md' | 'sm' }) {
    return (
        <Link
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200',
                size === 'md' ? 'min-h-11 px-5 py-2.5' : 'min-h-9 px-3 py-1.5 text-sm',
                buttonVariants[variant],
                className
            )}
            {...props}
        />
    )
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

/** Message d'erreur générale d'un formulaire. */
export function FormAlert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' | 'success' }) {
    const tones = {
        error: 'bg-cream text-primary',
        info: 'bg-secondary/10 text-secondary',
        success: 'bg-success/30 text-secondary',
    }
    const icons = { error: 'tabler:alert-circle', info: 'tabler:info-circle', success: 'tabler:circle-check' }
    return (
        <p role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium', tones[tone])}>
            <Icon icon={icons[tone]} className='mt-0.5 shrink-0 text-lg' />
            <span>{children}</span>
        </p>
    )
}

/** Pastille de statut. */
export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; className?: string }) {
    const tones = {
        neutral: 'bg-gray-100 text-ink/70',
        success: 'bg-success/40 text-secondary',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-cream text-primary',
        info: 'bg-secondary/10 text-secondary',
    }
    return <span className={cn('inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>
}

/** Liste vide : explication et action suivante. */
export function EmptyState({ icon, title, children, action }: { icon: string; title: string; children?: ReactNode; action?: ReactNode }) {
    return (
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-secondary/20 bg-white px-6 py-12 text-center'>
            <span className='flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary'>
                <Icon icon={icon} className='text-2xl' />
            </span>
            <p className='text-lg font-bold text-secondary'>{title}</p>
            {children && <div className='max-w-md text-ink/70'>{children}</div>}
            {action}
        </div>
    )
}
