import { useEffect, useState, useCallback } from 'react'
import { Scan, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Modal from './Modal'

interface ReturnScanModalProps {
  open: boolean
  title: string
  onClose: () => void
  onScanReceived: (transactionId: string, bookInfo: any) => void
  children: React.ReactNode
  footer: React.ReactNode
}

export default function ReturnScanModal({ open, title, onClose, onScanReceived, children, footer }: ReturnScanModalProps) {
  const [scanMode, setScanMode] = useState<'waiting' | 'scanning' | 'received' | 'failed' | 'manual'>('manual')
  const [scanAttempts, setScanAttempts] = useState(0)
  const [lastTimestamp, setLastTimestamp] = useState(0)
  const [scannedBook, setScannedBook] = useState<any>(null)

  const pollForScan = useCallback(async () => {
    try {
      const token = localStorage.getItem('pt_access_token')
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/latest-scan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Check if there's a new scan (timestamp changed and has book data)
        if (data.timestamp > lastTimestamp && data.book_id && data.book_info) {
          setLastTimestamp(data.timestamp)
          setScannedBook(data.book_info)
          
          // Check if book has active transaction (for return)
          if (data.transaction_info && data.action === 'return') {
            setScanMode('received')
            
            // Clear the scan from backend
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/clear-scan`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            // Notify parent component with transaction ID
            onScanReceived(String(data.transaction_info.id), data.book_info)
            
            // Auto switch to manual mode after 2 seconds
            setTimeout(() => {
              setScanMode('manual')
            }, 2000)
          } else {
            // Book is not issued, show error
            setScanMode('failed')
            setScannedBook({ ...data.book_info, error: 'This book is not currently issued' })
            setTimeout(() => setScanMode('manual'), 3000)
          }
        }
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [lastTimestamp, onScanReceived])

  useEffect(() => {
    if (scanMode === 'scanning') {
      const interval = setInterval(pollForScan, 1000) // Poll every second
      return () => clearInterval(interval)
    }
  }, [scanMode, pollForScan])

  const startScanning = () => {
    setScanMode('scanning')
    setScanAttempts(prev => prev + 1)
    
    // Auto-fallback to manual after 30 seconds or 2 attempts
    setTimeout(() => {
      if (scanMode === 'scanning') {
        if (scanAttempts >= 1) {
          setScanMode('failed')
          setTimeout(() => setScanMode('manual'), 3000)
        } else {
          setScanMode('manual')
        }
      }
    }, 30000)
  }

  const cancelScanning = () => {
    setScanMode('manual')
  }

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setScanMode('manual')
      setScanAttempts(0)
      setScannedBook(null)
    }
  }, [open])

  return (
    <Modal open={open} title={title} onClose={onClose} footer={footer}>
      <div className="space-y-4">
        {/* Scan Mode Selector */}
        {scanMode === 'manual' && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Scan size={20} className="text-brandCyan" />
              <div>
                <div className="text-sm font-semibold text-white">Use Mobile Scanner</div>
                <div className="text-xs text-slate-400">Scan book barcode to return</div>
              </div>
            </div>
            <button
              onClick={startScanning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brandTeal to-brandCyan text-sm font-semibold text-slate-950 hover:brightness-110 transition"
            >
              Start Scanning
            </button>
          </div>
        )}

        {/* Scanning Status */}
        {scanMode === 'scanning' && (
          <div className="p-6 rounded-2xl bg-brandCyan/10 border border-brandCyan/30 text-center">
            <Loader size={48} className="mx-auto mb-4 text-brandCyan animate-spin" />
            <div className="text-lg font-semibold text-white mb-2">Waiting for scan...</div>
            <div className="text-sm text-slate-300 mb-4">
              Open scanner on your phone and scan the book barcode
            </div>
            <div className="text-xs text-slate-400 mb-4">
              Attempt {scanAttempts} of 2 • Auto-fallback in 30s
            </div>
            <button
              onClick={cancelScanning}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white transition"
            >
              Cancel & Enter Manually
            </button>
          </div>
        )}

        {/* Scan Received */}
        {scanMode === 'received' && scannedBook && !scannedBook.error && (
          <div className="p-4 rounded-2xl bg-brandCyan/20 border border-brandCyan/50 flex items-start gap-3">
            <CheckCircle size={24} className="text-brandCyan flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-1">Book Scanned!</div>
              <div className="text-xs text-slate-300">
                {scannedBook.title} by {scannedBook.author}
              </div>
              <div className="text-xs text-brandCyan mt-1">Ready to return</div>
            </div>
          </div>
        )}

        {/* Scan Failed */}
        {scanMode === 'failed' && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-start gap-3">
            <AlertCircle size={24} className="text-rose-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-1">
                {scannedBook?.error ? 'Book Not Issued' : 'Scan timeout'}
              </div>
              <div className="text-xs text-slate-300">
                {scannedBook?.error || 'No scan received after 2 attempts. Falling back to manual entry...'}
              </div>
            </div>
          </div>
        )}

        {/* Manual Form (always visible) */}
        <div className={scanMode === 'scanning' ? 'opacity-50 pointer-events-none' : ''}>
          {children}
        </div>
      </div>
    </Modal>
  )
}
