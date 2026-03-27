import type { InputHTMLAttributes } from 'react'

export default function Input({
  label,
  className,
  ...props
}: {
  label?: string
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label ? <div className="text-xs text-slate-300 mb-2">{label}</div> : null}
      <input
        className={[
          'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none',
          'focus:ring-2 focus:ring-brandCyan/60 focus:border-brandCyan/30',
          className ?? '',
        ].join(' ')}
        {...props}
      />
    </label>
  )
}

