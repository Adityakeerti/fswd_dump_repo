import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Camera, CameraOff, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import Quagga from '@ericblade/quagga2'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

interface BookInfo {
  id: number
  title: string
  author: string
  barcode_id: string
  total_copies: number
  available_copies: number
  is_available: boolean
}

interface TransactionInfo {
  user_name: string
  issue_date: string
  due_date: string
}

export default function Scanner() {
  const videoRef = useRef<HTMLDivElement | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [result, setResult] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null)
  const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null)
  const [action, setAction] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/test`)
      if (response.ok) {
        setConnected(true)
      }
    } catch (error) {
      setConnected(false)
      console.error('Connection check failed:', error)
    }
  }

  const startScanner = async () => {
    if (!videoRef.current) return
    
    setStatus('starting')
    setErrorMsg(null)
    setBookInfo(null)
    setTransactionInfo(null)
    setAction(null)
    setResult(null)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser. Try Chrome or Safari.')
      }

      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: videoRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment'
            }
          },
          locator: {
            patchSize: 'medium',
            halfSample: true
          },
          numOfWorkers: 2,
          decoder: {
            readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader']
          },
          locate: true
        },
        (err) => {
          if (err) {
            console.error('Quagga init error:', err)
            setErrorMsg('Scanner initialization failed: ' + err.message)
            setStatus('error')
            return
          }
          Quagga.start()
          setIsScanning(true)
          setStatus('scanning')
        }
      )

      Quagga.onDetected((result) => {
        const code = result.codeResult.code
        console.log('Barcode detected:', code, 'Format:', result.codeResult.format)
        
        if (code && code.startsWith('BOOK-') && code.length >= 9) {
          Quagga.stop()
          setIsScanning(false)
          setStatus('idle')
          handleScan(code)
        } else {
          console.log('Ignoring non-library barcode:', code)
        }
      })

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Camera access failed'
      setErrorMsg(msg)
      setStatus('error')
      console.error('Camera error:', error)
    }
  }

  const stopScanner = () => {
    if (isScanning) {
      Quagga.stop()
      setIsScanning(false)
      setStatus('idle')
    }
  }

  const handleScan = async (code: string) => {
    setResult(code)
    
    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, type: 'BARCODE' })
      })
      const data = await response.json()
      
      if (data.found) {
        setBookInfo(data.book_info)
        setTransactionInfo(data.transaction_info || null)
        setAction(data.action || null)
        
        await fetch(`${API_BASE}/api/update-latest-scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, timestamp: Date.now() })
        })
      } else {
        setErrorMsg(data.message || 'Book not found in system')
      }
    } catch (error) {
      setErrorMsg('Error connecting to library system')
      console.error('Lookup error:', error)
    }
  }

  const resetScanner = () => {
    setResult(null)
    setBookInfo(null)
    setTransactionInfo(null)
    setAction(null)
    setErrorMsg(null)
    setStatus('idle')
  }

  useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop()
      }
    }
  }, [isScanning])

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Mobile Scanner</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-semibold text-white">Scan a Book</h2>
          </div>

          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-2xl">
            {connected ? <Wifi size={16} className="text-brandCyan" /> : <WifiOff size={16} className="text-rose-200" />}
            <div className="text-sm text-slate-300">
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="glass-panel-strong rounded-3xl p-4">
        <div className="space-y-4">
          <div className="flex gap-3">
            {!isScanning ? (
              <button
                onClick={startScanner}
                disabled={status === 'starting'}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brandTeal via-brandCyan to-brandIndigo px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow-teal transition hover:brightness-110 active:scale-[0.99] focus-ring disabled:opacity-50"
              >
                <Camera size={18} />
                {status === 'starting' ? 'Starting...' : 'Start Scanner'}
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] focus-ring"
              >
                <CameraOff size={18} />
                Stop Scanner
              </button>
            )}
            
            {(result || errorMsg) && (
              <button
                onClick={resetScanner}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-[0.99] focus-ring"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            )}
          </div>

          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-black/30 min-h-[300px]">
            <div ref={videoRef} className="absolute inset-0 w-full h-full">
              {/* Quagga will inject video and canvas here */}
            </div>
            
            {!isScanning && status === 'idle' && !result && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                <div className="text-center">
                  <Camera size={60} className="mx-auto mb-4 opacity-50" />
                  <p>Camera will appear here</p>
                </div>
              </div>
            )}
            
            {status === 'scanning' && (
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-brandCyan/20 border border-brandCyan/50 px-3 py-1 text-xs text-brandCyan backdrop-blur-xl z-10">
                <CheckCircle2 size={14} />
                Scanner Active
              </div>
            )}
          </div>

          {status === 'error' && errorMsg && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-200 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-rose-200">{errorMsg}</div>
            </div>
          )}

          {result && (
            <div className="glass-panel rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Latest Scan</div>
              <div className="text-sm font-semibold text-white">{result}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date().toLocaleString()}</div>
            </div>
          )}

          {bookInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-strong rounded-2xl p-5 border border-brandCyan/30"
            >
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">{bookInfo.title}</h3>
                    <p className="text-sm text-slate-300 italic">by {bookInfo.author}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    bookInfo.is_available 
                      ? 'bg-brandCyan/20 text-brandCyan border border-brandCyan/30' 
                      : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                  }`}>
                    {bookInfo.is_available ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start">
                  <span className="text-slate-400 w-24 flex-shrink-0">Barcode:</span>
                  <span className="text-slate-200 font-medium flex-1">{bookInfo.barcode_id}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-slate-400 w-24 flex-shrink-0">Available:</span>
                  <span className="text-slate-200 font-semibold flex-1">
                    {bookInfo.available_copies} of {bookInfo.total_copies}
                  </span>
                </div>
                
                {transactionInfo && (
                  <>
                    <hr className="my-3 border-white/10" />
                    
                    <div className="flex items-start">
                      <span className="text-slate-400 w-24 flex-shrink-0">Issued To:</span>
                      <span className="text-slate-200 flex-1">{transactionInfo.user_name}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-slate-400 w-24 flex-shrink-0">Issue Date:</span>
                      <span className="text-slate-200 flex-1">{new Date(transactionInfo.issue_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-slate-400 w-24 flex-shrink-0">Due Date:</span>
                      <span className="text-slate-200 flex-1">{new Date(transactionInfo.due_date).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {!bookInfo && errorMsg && result && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center">
              <AlertTriangle size={24} className="mx-auto mb-2 text-rose-200" />
              <p className="text-sm text-rose-200">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        <p>Scan book barcodes starting with "BOOK-"</p>
        <p className="mt-1">Point camera at barcode and hold steady</p>
      </div>
    </div>
  )
}

