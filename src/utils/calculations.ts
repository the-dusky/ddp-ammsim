import { Config, Calculations, Participant } from '../types'

export function calculateAllocations(config: Config): Calculations {
  // Calculate fee amount and remaining supply
  const ddpFeeAmount = (config.totalSupply * config.ddpFee) / 100
  const remainingSupply = config.totalSupply - ddpFeeAmount

  // Calculate DDP allocations
  const chairmanDDP = (remainingSupply * config.chairmanDdpPercent) / 100
  const boardDDP = (remainingSupply * config.boardDdpPercent) / 100
  const boardMemberDDP = boardDDP / config.numBoardMembers
  const poolDDP = (remainingSupply * config.ammPercentage) / 100
  
  // Calculate USDC values
  const totalUSDC = Math.abs(config.chairmanUsdc + (config.boardMemberUsdc * config.numBoardMembers))
  const treasuryUSDC = (totalUSDC * config.treasuryUsdcPercent) / 100
  const poolUSDC = totalUSDC - treasuryUSDC

  // Treasury gets whatever DDP is left
  const treasuryDDP = remainingSupply - chairmanDDP - boardDDP - poolDDP

  return {
    ddpFeeAmount,
    remainingSupply,
    poolDDP,
    chairmanDDP,
    boardDDP,
    boardMemberDDP,
    treasuryDDP,
    totalUSDC,
    treasuryUSDC,
    poolUSDC
  }
}

export function createParticipants(config: Config, calculations: Calculations): Participant[] {
  const participants: Participant[] = [
    // Chairman
    {
      id: 1,
      name: 'Chairman',
      ddp: calculations.chairmanDDP,
      usdc: -config.chairmanUsdc,
      lpTokens: 0
    },
    // Board Members
    ...Array(config.numBoardMembers).fill(null).map((_, i) => ({
      id: i + 2,
      name: `Board Member ${i + 1}`,
      ddp: calculations.boardMemberDDP,
      usdc: -config.boardMemberUsdc,
      lpTokens: 0
    }))
  ]

  return participants
}

export function validateConfig(config: Config): string | null {
  // Calculate total allocation percentage
  const totalAllocation = config.ammPercentage + config.chairmanDdpPercent + config.boardDdpPercent

  // Check if total allocation exceeds remaining supply after fees
  if (totalAllocation > (100 - config.ddpFee)) {
    return `Total allocation (${totalAllocation.toFixed(2)}%) exceeds remaining supply after ${config.ddpFee}% fee`
  }

  // All validations passed
  return null
}
