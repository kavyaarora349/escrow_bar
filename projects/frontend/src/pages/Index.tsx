import { useState, useEffect, useCallback } from 'react'
import { Bounty } from '@/data/bounties'
import { StoredBounty } from '@/utils/bountyStorage'
import { listBounties, setBountyStatus } from '@/utils/bountyRepository'
import { getBountyOnChainInfo } from '@/utils/bountyService'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardView } from '@/components/layout/DashboardView'
import { DisputesView } from '@/components/layout/DisputesView'
import { SubmissionsView } from '@/components/layout/SubmissionsView'

import BountyList from '@/components/bounty/BountyList'
import BountyDetailModal from '@/components/bounty/BountyDetailModal'
import CreateBountyModal from '@/components/bounty/CreateBountyModal'
import WalletModal from '@/components/bounty/WalletModal'

/** Map a localStorage StoredBounty to the UI Bounty interface */
function storedToUiBounty(sb: StoredBounty): Bounty {
  const statusMap: Record<string, Bounty['status']> = {
    active: 'Open',
    claimed: 'In Progress',
    completed: 'Completed',
  }
  return {
    id: `chain-${sb.appId}`,
    title: sb.title,
    description: sb.description,
    reward: `${sb.reward} ALGO`,
    category: sb.category,
    difficulty: (sb.difficulty as Bounty['difficulty']) || 'Medium',
    deadline: new Date(sb.createdAt + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    creator: `${sb.creator.slice(0, 6)}...${sb.creator.slice(-4)}`,
    status: statusMap[sb.status] ?? 'Open',
    appId: sb.appId,
    creatorAddress: sb.creator,
  }
}

function mapOnChainToStoredStatus(onChainStatus: number): StoredBounty['status'] {
  // 0=open, 1=claimed, 2=submitted, 3=approved, 4=cancelled
  if (onChainStatus === 0) return 'active'
  if (onChainStatus === 1 || onChainStatus === 2) return 'claimed'
  return 'completed'
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [createdBounties, setCreatedBounties] = useState<Bounty[]>([])

  /** Load bounties and synchronize status with on-chain state */
  const loadCreatedBounties = useCallback(async () => {
    const stored = await listBounties()
    const synced = await Promise.all(
      stored.map(async (bounty) => {
        if (!bounty.appId || bounty.appId <= 0) return bounty
        try {
          const onChain = await getBountyOnChainInfo(bounty.appId)
          const mappedStatus = mapOnChainToStoredStatus(onChain.status)
          if (mappedStatus !== bounty.status) {
            await setBountyStatus(bounty.appId, mappedStatus)
            return { ...bounty, status: mappedStatus }
          }
          return bounty
        } catch {
          return bounty
        }
      }),
    )

    setCreatedBounties(synced.map(storedToUiBounty))
  }, [])

  useEffect(() => {
    void loadCreatedBounties()

    const intervalId = window.setInterval(() => {
      void loadCreatedBounties()
    }, 8000)

    const onFocus = () => {
      void loadCreatedBounties()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [loadCreatedBounties])

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onCreateBounty={() => setCreateOpen(true)}
      onConnectWallet={() => setWalletModalOpen(true)}
    >
      {activeTab === 'dashboard' && <DashboardView bounties={createdBounties} onBountyClick={setSelectedBounty} />}

      {activeTab === 'browse' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <BountyList onBountyClick={setSelectedBounty} extraBounties={createdBounties} />
        </div>
      )}

      {activeTab === 'my_submissions' && (
        <SubmissionsView onBountyClick={setSelectedBounty} />
      )}

      {activeTab === 'disputes' && <DisputesView bounties={createdBounties} />}

      {/* Modals are kept hidden and conditionally rendered or via prop control state */}
      <BountyDetailModal bounty={selectedBounty} onClose={() => setSelectedBounty(null)} />
      <CreateBountyModal open={createOpen} onClose={() => setCreateOpen(false)} onBountyCreated={loadCreatedBounties} />
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </DashboardLayout>
  )
}

export default Index
