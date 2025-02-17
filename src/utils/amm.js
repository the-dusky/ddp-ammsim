/**
 * Calculate swap output amount using constant product formula (x * y = k)
 * @param {number} inputAmount Amount being swapped in
 * @param {number} inputReserve Current reserve of input token
 * @param {number} outputReserve Current reserve of output token
 * @returns {number} Amount of output token to receive
 */
export function calculateSwapOutput(inputAmount, inputReserve, outputReserve) {
  const inputAmountWithFee = inputAmount * 997 // 0.3% fee
  const numerator = inputAmountWithFee * outputReserve
  const denominator = (inputReserve * 1000) + inputAmountWithFee
  return numerator / denominator
}

/**
 * Calculate required token amounts for adding liquidity
 * @param {number} amount Amount of token being added
 * @param {number} reserve1 Current reserve of token 1
 * @param {number} reserve2 Current reserve of token 2
 * @returns {number} Required amount of other token
 */
export function calculateRequiredAmount(amount, reserve1, reserve2) {
  return (amount * reserve2) / reserve1
}

/**
 * Calculate LP tokens to mint when adding liquidity
 * @param {number} amount1 Amount of token 1 being added
 * @param {number} amount2 Amount of token 2 being added
 * @param {number} reserve1 Current reserve of token 1
 * @param {number} reserve2 Current reserve of token 2
 * @param {number} totalSupply Current total supply of LP tokens
 * @returns {number} Amount of LP tokens to mint
 */
export function calculateLPTokens(amount1, amount2, reserve1, reserve2, totalSupply) {
  if (totalSupply === 0) {
    // Initial liquidity - use geometric mean
    return Math.sqrt(amount1 * amount2)
  }
  
  // Use minimum ratio to ensure no price impact
  const ratio1 = (amount1 * totalSupply) / reserve1
  const ratio2 = (amount2 * totalSupply) / reserve2
  return Math.min(ratio1, ratio2)
}

/**
 * Calculate token amounts to receive when removing liquidity
 * @param {number} lpAmount Amount of LP tokens to burn
 * @param {number} reserve1 Current reserve of token 1
 * @param {number} reserve2 Current reserve of token 2
 * @param {number} totalSupply Current total supply of LP tokens
 * @returns {Object} Amounts of tokens to receive
 */
export function calculateRemoveLiquidity(lpAmount, reserve1, reserve2, totalSupply) {
  const amount1 = (lpAmount * reserve1) / totalSupply
  const amount2 = (lpAmount * reserve2) / totalSupply
  return { amount1, amount2 }
}

/**
 * Calculate price impact of a swap
 * @param {number} inputAmount Amount being swapped in
 * @param {number} inputReserve Current reserve of input token
 * @param {number} outputReserve Current reserve of output token
 * @returns {number} Price impact as a percentage
 */
export function calculatePriceImpact(inputAmount, inputReserve, outputReserve) {
  const outputAmount = calculateSwapOutput(inputAmount, inputReserve, outputReserve)
  const currentPrice = inputReserve / outputReserve
  const newInputReserve = inputReserve + inputAmount
  const newOutputReserve = outputReserve - outputAmount
  const newPrice = newInputReserve / newOutputReserve
  return Math.abs((newPrice - currentPrice) / currentPrice) * 100
}
