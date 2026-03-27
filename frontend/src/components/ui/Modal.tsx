import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  footer?: ReactNode
}>) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl glass-panel-strong rounded-3xl border border-white/10 overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                <div className="font-display font-semibold text-white">{title}</div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X size={18} className="text-slate-200" />
                </button>
              </div>

              <div className="px-5 py-4 sm:px-6 sm:py-5">{children}</div>

              {footer ? <div className="px-5 py-4 sm:px-6 border-t border-white/10">{footer}</div> : null}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

