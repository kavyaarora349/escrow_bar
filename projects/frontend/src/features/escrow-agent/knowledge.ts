export interface EscrowAgentContext {
  activeTab?: string
  walletConnected?: boolean
  network?: string
}

export interface EscrowAgentReply {
  topic: string
  title: string
  answer: string
  followUps: string[]
}

interface KnowledgeTopic {
  topic: string
  title: string
  answer: string
  followUps: string[]
  keywords: string[]
}

const DEFAULT_NETWORK = 'Algorand Testnet'

const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    topic: 'escrow-basics',
    title: 'How Escrow Works',
    answer:
      'Each bounty creates its own Algorand application account, and that account holds the reward in escrow. The creator locks funds on-chain first, so the money is not just a promise. Payment is only released from the app account when the creator approves the submitted work.',
    followUps: ['How is a bounty funded?', 'When does the worker get paid?', 'Why is this safer than a normal platform?'],
    keywords: ['escrow', 'how escrow works', 'lock funds', 'locked', 'application account', 'safe', 'fund safety', 'how does this work'],
  },
  {
    topic: 'funding',
    title: 'Funding A Bounty',
    answer:
      'When a creator opens a bounty, the app deploys a dedicated smart contract and funds its application account. In the current flow, that includes the reward amount plus minimum balance funding for the escrow account, so the bounty is backed before workers start claiming it.',
    followUps: ['What is the application account?', 'How much ALGO is locked?', 'What network is this on?'],
    keywords: ['fund', 'funding', 'create bounty', 'post bounty', 'reward amount', 'deposit', 'lock reward', 'min balance'],
  },
  {
    topic: 'claiming',
    title: 'Claiming A Bounty',
    answer:
      'A worker claims the bounty on-chain first. That updates the contract state so everyone can see who currently owns the work slot, and the flow is designed so a bounty can only be claimed once at a time.',
    followUps: ['What happens after claim?', 'Can multiple workers claim?', 'Do I need a wallet first?'],
    keywords: ['claim', 'claimed', 'claim work', 'worker', 'take bounty', 'can i claim'],
  },
  {
    topic: 'submission',
    title: 'Submitting Work',
    answer:
      'After claiming, the worker submits the work and the creator reviews it. In the current UI, submission is part of the tracked bounty flow, and approval is the step that actually unlocks payout from escrow.',
    followUps: ['What if my work is rejected?', 'When does the payout happen?', 'Who reviews the submission?'],
    keywords: ['submit', 'submission', 'submit work', 'deliver', 'upload work', 'after claim'],
  },
  {
    topic: 'approval',
    title: 'Approval And Payout',
    answer:
      'The payout happens when the creator approves the completed work. That approval triggers the contract to transfer the escrowed ALGO from the bounty application account to the worker wallet, and the resulting transaction is visible on Algorand Testnet.',
    followUps: ['Can the creator withdraw early?', 'Where can I see the transaction?', 'How do disputes work?'],
    keywords: ['approve', 'approval', 'payout', 'pay', 'paid', 'release funds', 'payment', 'when do i get paid'],
  },
  {
    topic: 'disputes',
    title: 'Disputes In The Current App',
    answer:
      'The Disputes tab is present in the UI, but right now it is an illustrative dashboard rather than a fully automated arbitration system. The real on-chain flow today is claim, submit, and creator approval, so disagreements still need manual review instead of smart-contract arbitration.',
    followUps: ['So what is on-chain today?', 'How is escrow still helpful?', 'What state is stored on-chain?'],
    keywords: ['dispute', 'arbitration', 'under review', 'creator unresponsive', 'conflict', 'appeal'],
  },
  {
    topic: 'safety',
    title: 'Why Escrow Is Safer',
    answer:
      'Escrow helps because the reward is locked on-chain in the bounty app account instead of sitting as an off-platform promise. That means workers can verify there is real funded escrow, and creators only release funds through the contract flow instead of manual trust-based transfers.',
    followUps: ['What exactly is locked?', 'When can funds move?', 'Is this on Testnet or Mainnet?'],
    keywords: ['safe', 'safer', 'security', 'trust', 'why use escrow', 'why is this better', 'secure'],
  },
  {
    topic: 'wallet-network',
    title: 'Wallet And Network',
    answer:
      'This app currently operates on Algorand Testnet, and a connected wallet is required for on-chain actions like creating, claiming, submitting, or approving a bounty. Wallet connection is handled from the dashboard header before those transactions can be signed.',
    followUps: ['Which actions need signing?', 'Can I browse without a wallet?', 'How do I create a bounty?'],
    keywords: ['wallet', 'connect wallet', 'network', 'testnet', 'mainnet', 'sign', 'signing', 'pera', 'defly'],
  },
  {
    topic: 'fees',
    title: 'Fees And Costs',
    answer:
      'Users still pay normal Algorand transaction fees for the on-chain steps, and the app also funds the application account minimum balance when a bounty is created. The benefit is that settlement stays transparent and the payout path is enforced by contract logic.',
    followUps: ['What gets funded on creation?', 'Why is minimum balance needed?', 'When is the escrow released?'],
    keywords: ['fee', 'fees', 'gas', 'cost', 'transaction fee', 'minimum balance'],
  },
  {
    topic: 'status',
    title: 'Bounty Status Flow',
    answer:
      'The core bounty lifecycle is open, claimed, submitted, and approved. In practice that means the creator funds escrow, a worker claims the bounty, work gets submitted, and then creator approval releases the payment.',
    followUps: ['What happens at approval?', 'Can someone else claim after that?', 'How do disputes fit in?'],
    keywords: ['status', 'stages', 'lifecycle', 'flow', 'open', 'submitted', 'approved'],
  },
]

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function matchesGreeting(message: string) {
  return /^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/.test(normalize(message))
}

function getContextualPrompts(context: EscrowAgentContext): string[] {
  if (context.activeTab === 'disputes') {
    return ['Is dispute handling on-chain yet?', 'What does the escrow protect during a dispute?', 'What is actually live today?']
  }

  if (context.activeTab === 'my_submissions') {
    return ['Do I need to claim before submitting?', 'When does payout happen?', 'What if the creator does not approve?']
  }

  if (context.activeTab === 'browse') {
    return ['How do I claim a bounty?', 'How is the reward locked?', 'Do I need a wallet to start?']
  }

  return ['How does escrow work here?', 'When does the worker get paid?', 'Is dispute handling automated?']
}

function withContextHints(answer: string, context: EscrowAgentContext, topic: string) {
  const hints: string[] = []

  if (!context.walletConnected && ['funding', 'claiming', 'submission', 'approval', 'wallet-network'].includes(topic)) {
    hints.push('You will need to connect a wallet before you can send any of those transactions.')
  }

  const network = context.network || DEFAULT_NETWORK
  if (topic === 'wallet-network' || topic === 'approval' || topic === 'funding') {
    hints.push(`This app is currently pointed at ${network}.`)
  }

  if (hints.length === 0) {
    return answer
  }

  return `${answer}\n\n${hints.join(' ')}`
}

function scoreTopic(message: string, topic: KnowledgeTopic) {
  const normalizedMessage = normalize(message)
  const words = normalizedMessage.split(' ').filter(Boolean)

  return topic.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword)

    if (normalizedMessage.includes(normalizedKeyword)) {
      return score + (normalizedKeyword.includes(' ') ? 5 : 3)
    }

    if (words.some((word) => word === normalizedKeyword)) {
      return score + 2
    }

    return score
  }, 0)
}

function getDefaultReply(context: EscrowAgentContext): EscrowAgentReply {
  return {
    topic: 'fallback',
    title: 'Escrow Assistant',
    answer:
      'I can help explain how EscrowBar handles bounty funding, escrow safety, claiming, submissions, approvals, wallet usage, and the current dispute flow. Ask me something like how funds are locked, when payout happens, or what is actually on-chain today.',
    followUps: getContextualPrompts(context),
  }
}

export function getEscrowAgentReply(message: string, context: EscrowAgentContext = {}): EscrowAgentReply {
  const trimmed = message.trim()

  if (!trimmed || matchesGreeting(trimmed)) {
    return getDefaultReply(context)
  }

  const bestMatch = KNOWLEDGE_TOPICS.map((topic) => ({
    topic,
    score: scoreTopic(trimmed, topic),
  })).sort((left, right) => right.score - left.score)[0]

  if (!bestMatch || bestMatch.score === 0) {
    return getDefaultReply(context)
  }

  return {
    topic: bestMatch.topic.topic,
    title: bestMatch.topic.title,
    answer: withContextHints(bestMatch.topic.answer, context, bestMatch.topic.topic),
    followUps: bestMatch.topic.followUps,
  }
}

export function getEscrowAgentStarterPrompts(context: EscrowAgentContext = {}) {
  return getContextualPrompts(context)
}
