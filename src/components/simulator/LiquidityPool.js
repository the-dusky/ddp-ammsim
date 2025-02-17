import React, { useState } from 'react'

export default function LiquidityPool({ participants, onParticipantsUpdate }) {
  const [activeTab, setActiveTab] = useState('swap') // swap, addLiquidity, removeLiquidity
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [swapInputs, setSwapInputs] = useState({ from: '', to: '', outputAmount: 0, fromToken: 'DDP', toToken: 'USDC', priceImpact: 0 })
  const [liquidityInputs, setLiquidityInputs] = useState({ ddp: '', usdc: '' })
  const [removeAmount, setRemoveAmount] = useState('')

  // Get list of players (excluding AMM Pool)
  const players = participants.filter(p => p.type !== 'AMM Pool')
  const player = players.find(p => p.type === selectedPlayer)

  // Get pool state
  const pool = participants.find(p => p.type === 'AMM Pool')
  
  // Calculate current price and market cap from pool
  const ddpPrice = pool.ddpBalance > 0 ? pool.usdcBalance / pool.ddpBalance : 0
  const totalSupply = participants.reduce((sum, p) => sum + p.ddpBalance, 0)
  const marketCap = ddpPrice * totalSupply

  // Get player balances and calculate portfolio value
  const playerBalances = player ? {
    ddp: player.ddpBalance,
    usdc: player.usdcBalance,
    lp: player.lpTokens,
    // Portfolio value = USDC balance + (DDP balance * DDP price)
    portfolioValue: player.usdcBalance + (player.ddpBalance * ddpPrice)
  } : { ddp: 0, usdc: 0, lp: 0, portfolioValue: 0 }

  // Format number with commas
  const formatNumber = (value, decimals = 0) => {
    if (!value) return ''
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  // Calculate price impact percentage
  const calculatePriceImpact = (inputAmount, fromToken) => {
    if (!inputAmount) return 0
    const amount = parseFloat(inputAmount)
    if (isNaN(amount)) return 0

    const inputReserve = fromToken === 'DDP' ? pool.ddpBalance : pool.usdcBalance
    const outputReserve = fromToken === 'DDP' ? pool.usdcBalance : pool.ddpBalance

    // Calculate current price
    const currentPrice = inputReserve / outputReserve

    // Calculate new reserves after swap
    const inputAmountWithFee = amount * 0.997
    const newInputReserve = inputReserve + inputAmountWithFee
    const outputAmount = (outputReserve * inputAmountWithFee) / newInputReserve
    const newOutputReserve = outputReserve - outputAmount

    // Calculate new price
    const newPrice = newInputReserve / newOutputReserve

    // Calculate price impact
    const priceImpact = Math.abs((newPrice - currentPrice) / currentPrice) * 100
    return priceImpact
  }

  // Calculate swap amounts
  const calculateSwapOutput = (input, fromToken) => {
    if (!input) return { outputAmount: 0, priceImpact: 0 }
    const inputAmount = parseFloat(input)
    if (isNaN(inputAmount)) return { outputAmount: 0, priceImpact: 0 }

    // Get current reserves
    const inputReserve = fromToken === 'DDP' ? pool.ddpBalance : pool.usdcBalance
    const outputReserve = fromToken === 'DDP' ? pool.usdcBalance : pool.ddpBalance

    // Calculate using constant product formula: (x + Δx)(y - Δy) = xy
    // Where x is input reserve, y is output reserve
    // Δx is input amount, Δy is output amount
    // Apply 0.3% fee to input amount
    const inputAmountWithFee = inputAmount * 0.997

    // Solve for Δy: Δy = (y * Δx) / (x + Δx)
    const outputAmount = (outputReserve * inputAmountWithFee) / (inputReserve + inputAmountWithFee)
    const priceImpact = calculatePriceImpact(inputAmount, fromToken)

    return {
      outputAmount,
      priceImpact
    }
  }

  // Handle swap input change
  const handleSwapInput = (value) => {
    const { outputAmount, priceImpact } = calculateSwapOutput(value, swapInputs.fromToken)
    setSwapInputs(prev => ({
      ...prev,
      from: value,
      to: prev.fromToken === 'DDP' ? formatNumber(outputAmount, 2) : formatNumber(outputAmount),
      outputAmount,
      priceImpact
    }))
  }

  // Handle token swap
  const handleSwapTokens = () => {
    setSwapInputs(prev => ({
      from: '',
      to: '',
      fromToken: prev.toToken,
      toToken: prev.fromToken
    }))
  }

  // Execute swap
  const executeSwap = () => {
    if (!selectedPlayer || !swapInputs.from) return

    const inputAmount = parseFloat(swapInputs.from)
    const outputAmount = swapInputs.outputAmount

    if (isNaN(inputAmount) || outputAmount === 0) {
      alert('Invalid amount')
      return
    }

    // Only check DDP balance - USDC can go negative
    if (swapInputs.fromToken === 'DDP' && inputAmount > playerBalances.ddp) {
      alert('Insufficient DDP balance')
      return
    }

    // Update player balances
    const updatedParticipants = participants.map(p => {
      if (p.type === selectedPlayer) {
        return {
          ...p,
          ddpBalance: swapInputs.fromToken === 'DDP' ?
            p.ddpBalance - inputAmount :
            p.ddpBalance + outputAmount,
          usdcBalance: swapInputs.fromToken === 'USDC' ?
            p.usdcBalance - inputAmount :
            p.usdcBalance + outputAmount
        }
      }
      if (p.type === 'AMM Pool') {
        return {
          ...p,
          ddpBalance: swapInputs.fromToken === 'DDP' ?
            p.ddpBalance + inputAmount :
            p.ddpBalance - outputAmount,
          usdcBalance: swapInputs.fromToken === 'USDC' ?
            p.usdcBalance + inputAmount :
            p.usdcBalance - outputAmount
        }
      }
      return p
    })

    // Reset inputs
    setSwapInputs(prev => ({
      ...prev,
      from: '',
      to: ''
    }))

    // Update participants in parent component
    onParticipantsUpdate(updatedParticipants)
  }

  // Calculate liquidity amounts
  const calculateOtherTokenAmount = (amount, token) => {
    if (!amount) return ''
    const value = parseFloat(amount)
    if (isNaN(value)) return ''

    if (token === 'DDP') {
      return formatNumber(value * ddpPrice, 2)
    } else {
      return formatNumber(value / ddpPrice)
    }
  }

  // Handle liquidity input change
  const handleLiquidityInput = (value, token) => {
    const otherAmount = calculateOtherTokenAmount(value, token)
    setLiquidityInputs(token === 'DDP' 
      ? { ddp: value, usdc: otherAmount }
      : { ddp: otherAmount, usdc: value }
    )
  }

  return (
    <div className="card w-full bg-base-300 shadow-xl border border-base-100 p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 pt-4 border-r border-base-200">
          <div className="card w-full bg-base-300 shadow-xl border border-base-100 p-6">
            {/* Player Selector */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text text-lg font-medium">Select Player</span>
              </label>
              <select 
                className="select select-bordered bg-base-200 w-full"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">Choose a player</option>
                {players.map((p, index) => (
                  <option key={index} value={p.type}>{p.type}</option>
                ))}
              </select>
            </div>

            {/* Player Balances */}
            {player && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Player Balances</h3>
                <div className="stats stats-vertical bg-base-200 w-full">
                  <div className="stat">
                    <div className="stat-title">DDP Balance</div>
                    <div className="stat-value text-lg">{formatNumber(playerBalances.ddp)}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">USDC Balance</div>
                    <div className="stat-value text-lg">{formatNumber(playerBalances.usdc, 2)}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">LP Tokens</div>
                    <div className="stat-value text-lg">{formatNumber(playerBalances.lp)}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Portfolio Value</div>
                    <div className="stat-value text-lg">${formatNumber(playerBalances.portfolioValue, 2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-8 pt-4">
          <div className="card w-full bg-base-300 shadow-xl border border-base-100 p-6">
            <div className="card-body p-0">
              <h2 className="card-title text-2xl p-6 pb-2">Liquidity Pool</h2>
                  {/* Pool Stats */}
                  <div className="stats bg-base-200 w-full mb-6">
                    <div className="stat">
                      <div className="stat-title">DDP in Pool</div>
                      <div className="stat-value text-lg">{formatNumber(pool.ddpBalance)}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">USDC in Pool</div>
                      <div className="stat-value text-lg">{formatNumber(pool.usdcBalance, 2)}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">DDP Price</div>
                      <div className="stat-value text-lg">${formatNumber(ddpPrice, 4)}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Market Cap</div>
                      <div className="stat-value text-lg">${formatNumber(marketCap, 2)}</div>
                    </div>
                  </div>

                  {/* Action Tabs */}
                  <div className="tabs tabs-boxed mb-4">
                    <a 
                      className={`tab ${activeTab === 'swap' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('swap')}
                    >
                      Swap
                    </a>
                    <a 
                      className={`tab ${activeTab === 'addLiquidity' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('addLiquidity')}
                    >
                      Add Liquidity
                    </a>
                    <a 
                      className={`tab ${activeTab === 'removeLiquidity' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('removeLiquidity')}
                    >
                      Remove Liquidity
                    </a>
                  </div>
              {/* Swap Interface */}
              {activeTab === 'swap' && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">From</span>
                      <span className="label-text-alt">{swapInputs.fromToken}</span>
                    </label>
                    <input
                      type="text"
                      value={swapInputs.from}
                      onChange={(e) => handleSwapInput(e.target.value)}
                      className="input input-bordered bg-base-200"
                      placeholder="0.0"
                    />
                  </div>

                  <button 
                    className="btn btn-circle btn-sm mx-auto block"
                    onClick={handleSwapTokens}
                  >
                    ↓
                  </button>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">To</span>
                      <span className="label-text-alt">{swapInputs.toToken}</span>
                    </label>
                    <input
                      type="text"
                      value={swapInputs.to}
                      className="input input-bordered bg-base-200"
                      placeholder="0.0"
                      disabled
                    />
                  </div>

                  {swapInputs.from && (
                    <div className="text-sm">
                      <span className={`font-medium ${swapInputs.priceImpact > 5 ? 'text-error' : 'text-warning'}`}>
                        Price Impact: {formatNumber(swapInputs.priceImpact, 2)}%
                      </span>
                    </div>
                  )}

                  <button 
                    className="btn btn-primary w-full" 
                    disabled={!selectedPlayer || !swapInputs.from}
                    onClick={executeSwap}
                  >
                    {!selectedPlayer ? 'Select a Player' : 
                     !swapInputs.from ? 'Enter Amount' : 
                     swapInputs.priceImpact > 15 ? 'High Price Impact' : 'Swap'}
                  </button>
                </div>
              )}

              {/* Add Liquidity Interface */}
              {activeTab === 'addLiquidity' && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">DDP Amount</span>
                    </label>
                    <input
                      type="text"
                      value={liquidityInputs.ddp}
                      onChange={(e) => handleLiquidityInput(e.target.value, 'DDP')}
                      className="input input-bordered bg-base-200"
                      placeholder="0.0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">USDC Amount</span>
                    </label>
                    <input
                      type="text"
                      value={liquidityInputs.usdc}
                      onChange={(e) => handleLiquidityInput(e.target.value, 'USDC')}
                      className="input input-bordered bg-base-200"
                      placeholder="0.0"
                    />
                  </div>

                  <button 
                    className="btn btn-primary w-full"
                    disabled={!selectedPlayer}
                  >
                    {selectedPlayer ? 'Add Liquidity' : 'Select a Player'}
                  </button>
                </div>
              )}

              {/* Remove Liquidity Interface */}
              {activeTab === 'removeLiquidity' && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">LP Tokens to Remove</span>
                    </label>
                    <input
                      type="text"
                      value={removeAmount}
                      onChange={(e) => setRemoveAmount(e.target.value)}
                      className="input input-bordered bg-base-200"
                      placeholder="0.0"
                    />
                  </div>

                  <div className="stats bg-base-200">
                    <div className="stat">
                      <div className="stat-title">You&apos;ll Receive</div>
                      <div className="stat-value text-sm">
                        {removeAmount ? formatNumber(parseFloat(removeAmount) * pool.ddpBalance / pool.lpTokens) : '0'} DDP
                      </div>
                      <div className="stat-desc">
                        {removeAmount ? formatNumber(parseFloat(removeAmount) * pool.usdcBalance / pool.lpTokens, 2) : '0'} USDC
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary w-full"
                    disabled={!selectedPlayer}
                  >
                    {selectedPlayer ? 'Remove Liquidity' : 'Select a Player'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
  )
}
