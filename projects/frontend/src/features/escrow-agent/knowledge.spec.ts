import { getEscrowAgentReply } from './knowledge'

describe('getEscrowAgentReply', () => {
  it('returns escrow guidance for escrow questions', () => {
    const reply = getEscrowAgentReply('How does escrow work for a bounty?')

    expect(reply.topic).toBe('escrow-basics')
    expect(reply.answer).toMatch(/application account/i)
  })

  it('is honest that disputes are not fully automated yet', () => {
    const reply = getEscrowAgentReply('How do disputes work here?')

    expect(reply.topic).toBe('disputes')
    expect(reply.answer).toMatch(/illustrative dashboard/i)
    expect(reply.answer).toMatch(/manual review/i)
  })

  it('adds wallet guidance when the user is not connected', () => {
    const reply = getEscrowAgentReply('How do I claim a bounty?', { walletConnected: false })

    expect(reply.topic).toBe('claiming')
    expect(reply.answer).toMatch(/connect a wallet/i)
  })

  it('falls back to a general escrow assistant reply when it cannot match intent', () => {
    const reply = getEscrowAgentReply('Tell me something unexpected')

    expect(reply.topic).toBe('fallback')
    expect(reply.followUps.length).toBeGreaterThan(0)
  })
})
