// Basic types for the simulator
type Participant = {
  id: number
  name: string
  ddp: number
  usdc: number
  lpTokens: number
}

type Config = {
  totalSupply: number
  ammPercentage: number
  chairmanDdpPercent: number
  chairmanUsdc: number
  boardDdpPercent: number
  boardMemberUsdc: number
  treasuryUsdcPercent: number
  ddpFee: number
  numBoardMembers: number
}

type Calculations = {
  ddpFeeAmount: number
  remainingSupply: number
  poolDDP: number
  chairmanDDP: number
  boardDDP: number
  boardMemberDDP: number
  treasuryDDP: number
  totalUSDC: number
  treasuryUSDC: number
  poolUSDC: number
}

export type { Participant, Config, Calculations }
