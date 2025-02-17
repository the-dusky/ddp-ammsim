/**
 * Calculate DDP and USDC allocations based on configuration
 * @param {Object} config - Configuration object containing all settings
 * @returns {Object} Calculated values for DDP and USDC allocations
 */
export function calculateAllocations(config) {
  // Calculate total contributions
  const totalContributions = config.chairmanContribution + (config.boardMemberContribution * config.numBoardMembers)

  // Calculate USDC allocations
  const platformFeeAmount = (totalContributions * config.platformFee) / 100
  const treasuryUSDCAmount = (totalContributions * config.treasuryUSDCPercent) / 100
  const remainingUSDC = totalContributions - platformFeeAmount - treasuryUSDCAmount

  // Calculate player pool share
  const playerDDP = (config.totalSupply * config.playerPercent) / 100
  // Calculate relative shares within player allocation
  const chairmanShare = config.chairmanContribution / totalContributions
  const boardMemberShare = (config.boardMemberContribution * config.numBoardMembers) / totalContributions

  // Calculate DDP allocations
  const chairmanDDP = playerDDP * (config.chairmanContribution / totalContributions)
  const boardMemberDDP = (playerDDP * (config.boardMemberContribution / totalContributions))
  const ammDDP = (config.totalSupply * config.ammPercent) / 100
  const platformDDP = (config.totalSupply * config.platformPercent) / 100
  const treasuryDDP = config.totalSupply - ammDDP - playerDDP - platformDDP

  // Calculate initial DDP price
  const ddpPrice = totalContributions / config.totalSupply

  return {
    // DDP Allocations
    treasuryDDP,
    ammDDP,
    chairmanDDP,
    boardMemberDDP,
    platformDDP,
    playerDDP,
    // USDC Allocations
    totalContributions,
    platformFeeAmount,
    treasuryUSDCAmount,
    remainingUSDC,
    // Shares and Price
    chairmanShare,
    boardMemberShare,
    ddpPrice,
    // Original config
    ...config
  }
}

/**
 * Create array of participants (chairman and board members)
 * @param {Object} config - Configuration object
 * @param {Object} calculations - Calculated allocation values
 * @returns {Array} Array of participant objects
 */
export function createParticipants(config, calculations) {
  const participants = [
    // Chairman
    {
      type: 'Chairman',
      ddpBalance: calculations.chairmanDDP,
      usdcBalance: -config.chairmanContribution,
      lpTokens: 0
    },

    // Board Members
    ...Array(config.numBoardMembers).fill(null).map((_, index) => ({
      type: `Board Member ${index + 1}`,
      ddpBalance: calculations.boardMemberDDP,
      usdcBalance: -config.boardMemberContribution,
      lpTokens: 0
    })),

    // AMM Pool
    {
      type: 'AMM Pool',
      ddpBalance: calculations.ammDDP,
      usdcBalance: calculations.remainingUSDC,
      lpTokens: calculations.remainingUSDC // Initial LP tokens match USDC input
    },

    // Platform
    {
      type: 'Platform',
      ddpBalance: calculations.platformDDP,
      usdcBalance: calculations.platformFeeAmount,
      lpTokens: 0
    },

    // Treasury
    {
      type: 'Treasury',
      ddpBalance: calculations.treasuryDDP,
      usdcBalance: calculations.treasuryUSDCAmount,
      lpTokens: 0
    }
  ]

  return participants
}

/**
 * Validate configuration values
 * @param {Object} config - Configuration object to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateConfig(config) {
  // Calculate total allocation percentage
  const totalAllocation = config.ammPercentage + config.chairmanDdpPercent + config.boardDdpPercent

  // Check if total allocation exceeds remaining supply after fees
  if (totalAllocation > (100 - config.ddpFee)) {
    return `Total allocation (${totalAllocation.toFixed(2)}%) exceeds remaining supply after ${config.ddpFee}% fee`
  }

  // All validations passed
  return null
}
