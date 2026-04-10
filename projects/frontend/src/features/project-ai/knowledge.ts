import type { EscrowAgentContext } from '../escrow-agent/knowledge'

export type ProjectAIContext = {
  activeTab: string
  walletConnected: boolean
  network: string
}

const PROJECT_SUMMARY = `
BountyHub: Decentralized bounty platform on Algorand Testnet.
- Smart Contracts (PyTeal/Beaker): Bounty app (ID: 755780805), escrow logic, create/claim/approve/fund.
- Frontend: React/Vite/TS, Tailwind, @txnlab/use-wallet-react (Pera/Defly), bounty list/create, wallet connect.
- Files: projects/contracts/smart_contracts/bounty/contract.py, projects/frontend/src/components/bounty/.
- Deploy: poetry run algokit deploy testnet (contracts), pnpm dev/build (frontend).
- Key: App calls atomic, escrow in Application Account.
`

const STARTER_PROMPTS = [
  'Summarize the project',
  'How to deploy contracts?',
  'Frontend setup?',
  'Bounty smart contract flow?',
  'Wallet integration details?',
  'App ID and explorer?'
]

export function getProjectAIReply(prompt: string, context: ProjectAIContext): {
  title: string
  answer: string
  followUps: string[]
} {
  const { activeTab, walletConnected, network } = context
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('deploy')) {
    return {
      title: 'Deploy Guide',
        answer: `To deploy contracts: cd projects/contracts && poetry install && poetry run algokit deploy testnet.

Frontend: cd projects/frontend && pnpm dev (vite).
${network}, Tab: ${activeTab}, Wallet: ${walletConnected ? 'Connected' : 'Disconnected'}`,
      followUps: ['Full steps?', 'Localnet?', 'Mainnet?']
    }
  }

  if (lowerPrompt.includes('bounty') || lowerPrompt.includes('contract')) {
    return {
      title: 'Bounty Contract',
      answer: 'Bounty smart contract (App ID 755780805 Testnet): create_bounty() locks escrow, claim() by worker, approve_work() releases payment atomically. Files: projects/contracts/smart_contracts/bounty/contract.py. Explorer: https://testnet.explorer.perawallet.app/application/755780805',
      followUps: ['Flow diagram?', 'Source code?', 'Test?']
    }
  }

  if (lowerPrompt.includes('frontend')) {
    return {
      title: 'Frontend',
      answer: 'React 18 + Vite + Tailwind + TypeScript. WalletConnect: Pera/Defly/Exodus. Components: BountiesList, CreateBountyModal, Navbar. Run: pnpm dev. Deploy Vercel auto from git.',
      followUps: ['Components?', 'Styling?', 'Routing?']
    }
  }

  if (lowerPrompt.includes('wallet')) {
    return {
      title: 'Wallet',
      answer: `@txnlab/use-wallet-react. Supports: Pera, Defly, Exodus, Lute. Network: ${network}. Check walletConnected: ${walletConnected}`,
      followUps: ['Connect code?', 'Sign txn?', 'Accounts?']
    }
  }

  // Default
  return {
    title: 'Project AI',
    answer: `Project context: ${PROJECT_SUMMARY}
Ask about BountyHub contracts, frontend, deploy, flows. Tab: ${activeTab}, Wallet: ${walletConnected}`,
    followUps: STARTER_PROMPTS
  }
}

export function getProjectAIStarterPrompts(context: ProjectAIContext): string[] {
  return STARTER_PROMPTS
}



