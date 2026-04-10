import React from 'react'
import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ellipseAddress } from '@/utils/ellipseAddress'

interface WalletModalProps {
  open: boolean
  onClose: () => void
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  // Debug: Log wallet state
  React.useEffect(() => {
    if (open) {
      console.log('WalletModal opened. Available wallets:', wallets)
      console.log('Active address:', activeAddress)
    }
  }, [open, wallets, activeAddress])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-md rounded-2xl glass-modal p-6 text-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">Connect Wallet</h2>
          <p className="text-sm text-slate-600 mb-6">Select a wallet provider to connect to Algorand</p>

          {activeAddress && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-600 mb-1">Connected</p>
              <p className="font-mono text-sm text-primary font-medium">{ellipseAddress(activeAddress)}</p>
            </div>
          )}

          {!wallets || wallets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 mb-2">No wallets available</p>
              <p className="text-xs text-slate-500">Make sure you have a Web3 wallet extension installed (Pera, Defly, etc.)</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {!activeAddress ? (
                wallets.map((wallet) => (
                  <Button
                    key={`provider-${wallet.id}`}
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-sm font-medium text-slate-800 bg-white border-slate-300 hover:border-blue-300 hover:bg-blue-50"
                    onClick={async () => {
                      try {
                        console.log(`Connecting to ${wallet.id}...`)
                        await wallet.connect()
                        console.log(`Connected to ${wallet.id}`)
                        onClose()
                      } catch (error) {
                        console.error(`Failed to connect to ${wallet.id}:`, error)
                        alert(`Failed to connect to ${wallet.metadata.name}: ${error instanceof Error ? error.message : String(error)}`)
                      }
                    }}
                  >
                    {!isKmd(wallet) && <img alt={`${wallet.id} icon`} src={wallet.metadata.icon} className="h-6 w-6 object-contain" />}
                    <span className="text-slate-800">{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-slate-600 text-center py-4">Wallet already connected</p>
              )}
            </div>
          )}

          {activeAddress && (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Done
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={async () => {
                  if (wallets) {
                    const activeWallet = wallets.find((w) => w.isActive)
                    if (activeWallet) {
                      await activeWallet.disconnect()
                    } else {
                      localStorage.removeItem('@txnlab/use-wallet:v3')
                      window.location.reload()
                    }
                  }
                  onClose()
                }}
              >
                Disconnect
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WalletModal
