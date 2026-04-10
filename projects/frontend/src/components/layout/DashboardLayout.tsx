import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { ellipseAddress } from '@/utils/ellipseAddress'
import { LayoutDashboard, PlusCircle, Search, CheckSquare, AlertOctagon, Wallet, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateBounty: () => void
  onConnectWallet: () => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange, onCreateBounty, onConnectWallet }) => {
  const { activeAddress } = useWallet()
  const walletConnected = !!activeAddress

  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  // Fetch ALGO balance
  useEffect(() => {
    if (!activeAddress) {
      setBalance(null)
      return
    }
    const fetchBalance = async () => {
      try {
        setLoadingBalance(true)
        const server = 'https://testnet-api.algonode.cloud'
        const response = await fetch(`${server}/v2/accounts/${activeAddress}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const algoBalance = data.amount / 1_000_000
        setBalance(algoBalance)
      } catch (error) {
        console.error('Failed to fetch balance:', error)
        setBalance(0)
      } finally {
        setLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [activeAddress])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Bounties', icon: Search },
    { id: 'my_submissions', label: 'My Submissions', icon: CheckSquare },
    { id: 'disputes', label: 'Disputes', icon: AlertOctagon },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#1f3049_0%,#0b1422_35%,#05080f_100%)] text-slate-200 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[#314056]/60 bg-[#0b1320]/85 backdrop-blur-md flex flex-col shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="h-16 flex items-center px-6 border-b border-[#314056]/70">
          <a href="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="BountyBase"
              className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-xl font-bold text-white tracking-wide">
              Escrow<span className="text-blue-500">Bar</span>
            </span>
          </a>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-[linear-gradient(180deg,#24456f,#1a365a)] text-white border border-[#4b6f9a]/60 shadow-[0_8px_20px_rgba(18,70,139,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-[#142238]/70 border border-transparent'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}

          {/* Action button in nav */}
          <button
            onClick={onCreateBounty}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#142238]/70 transition-colors mt-6 border border-transparent"
          >
            <PlusCircle className="h-5 w-5" />
            Create Bounty
          </button>
        </nav>

        {/* Network indicator at bottom */}
        <div className="p-4 border-t border-[#314056]/70">
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-[#355076]/70 bg-[#101d2f]">
            <p className="text-xs text-slate-500 uppercase font-semibold">Network</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-sm font-medium text-slate-300">Algorand Testnet</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20px_20px,rgba(88,130,182,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(ellipse_at_center,transparent_10%,rgba(3,8,18,0.72)_80%)]" />
        {/* Top Header */}
        <header className="h-16 border-b border-[#314056]/70 bg-[#0a1220]/70 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            {activeTab === 'dashboard' && 'Overview'}
            {activeTab === 'browse' && 'Browse Bounties'}
            {activeTab === 'my_submissions' && 'My Submissions'}
            {activeTab === 'disputes' && 'Dispute Management'}
          </h2>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <button
                onClick={onConnectWallet}
                className="flex items-center gap-3 bg-[#111f32]/85 border border-[#3c577c]/70 hover:bg-[#173154] hover:border-[#5a7cab] transition-colors cursor-pointer rounded-full pl-4 pr-3 py-1.5 shadow-sm group"
              >
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm font-semibold text-white">{ellipseAddress(activeAddress)}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-[#3e5b81] pl-3">
                  <span className="text-xs font-medium text-emerald-400">
                    {loadingBalance ? '...' : balance !== null ? `${balance.toFixed(2)} ALGO` : '0.00 ALGO'}
                  </span>
                  <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-300 transition-colors" />
                </div>
              </button>
            ) : (
              <Button
                size="sm"
                onClick={onConnectWallet}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto relative z-[1]">{children}</div>
      </main>
    </div>
  )
}
