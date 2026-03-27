import type { ButtonHTMLAttributes, ReactNode } from 'react'

export default function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] focus-ring'

  const v =
    variant === 'primary'
      ? 'bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo text-slate-950 shadow-glow-teal hover:brightness-110'
      : variant === 'secondary'
        ? 'bg-white/5 border border-white/10 text-slate-100 hover:bg-white/10'
        : variant === 'danger'
          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200 hover:bg-rose-500/20'
          : 'bg-transparent border border-transparent text-slate-200 hover:bg-white/5'

  return (
    <button className={[base, v, className ?? ''].join(' ')} {...props}>
      {children}
    </button>
  )
}

