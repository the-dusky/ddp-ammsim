import React from 'react'

export default function Results({ config }) {
  // Format number with commas
  const formatNumber = (value) => {
    return value.toLocaleString('en-US')
  }

  // Calculate DDP allocations
  const calculateDDPAllocations = () => {
    const playerAllocation = (config.totalSupply * config.playerPercent) / 100
    const totalContributions = config.chairmanContribution + (config.boardMemberContribution * config.numBoardMembers)
    const chairmanShare = config.chairmanContribution / totalContributions
    const boardMemberShare = config.boardMemberContribution / totalContributions

    return {
      treasury: formatNumber((config.totalSupply * config.treasuryPercent) / 100),
      amm: formatNumber((config.totalSupply * config.ammPercent) / 100),
      chairman: formatNumber(playerAllocation * chairmanShare),
      boardMember: formatNumber(playerAllocation * boardMemberShare),
      platform: formatNumber((config.totalSupply * config.platformPercent) / 100)
    }
  }

  // Calculate USDC allocations
  const calculateUSDCAllocations = () => {
    const totalContributions = config.chairmanContribution + (config.boardMemberContribution * config.numBoardMembers)
    const platformFee = (totalContributions * config.platformFee) / 100
    const treasuryAmount = (totalContributions * config.treasuryUSDCPercent) / 100
    const remaining = totalContributions - platformFee - treasuryAmount

    return {
      total: formatNumber(totalContributions),
      platformFee: formatNumber(platformFee),
      treasury: formatNumber(treasuryAmount),
      remaining: formatNumber(remaining)
    }
  }

  const ddp = calculateDDPAllocations()
  const usdc = calculateUSDCAllocations()

  return (
    <div className="card w-full bg-base-300 shadow-xl border border-base-100">
      <div className="card-body gap-6">
        <h2 className="card-title text-2xl">Results</h2>
        
        {/* DDP Allocations */}
        <div>
          <h3 className="text-lg font-semibold mb-4">DDP Allocations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Treasury</div>
              <div className="stat-value text-lg">{ddp.treasury}</div>
              <div className="stat-desc">{config.treasuryPercent}%</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">AMM</div>
              <div className="stat-value text-lg">{ddp.amm}</div>
              <div className="stat-desc">{config.ammPercent}%</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Chairman</div>
              <div className="stat-value text-lg">{ddp.chairman}</div>
              <div className="stat-desc">From Player Pool</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Each Board Member</div>
              <div className="stat-value text-lg">{ddp.boardMember}</div>
              <div className="stat-desc">From Player Pool</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Platform</div>
              <div className="stat-value text-lg">{ddp.platform}</div>
              <div className="stat-desc">{config.platformPercent}%</div>
            </div>
          </div>
        </div>

        {/* USDC Allocations */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">USDC Allocations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Total Contributions</div>
              <div className="stat-value text-lg">{usdc.total}</div>
              <div className="stat-desc">USDC</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Platform Fee</div>
              <div className="stat-value text-lg">{usdc.platformFee}</div>
              <div className="stat-desc">{config.platformFee}%</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Treasury</div>
              <div className="stat-value text-lg">{usdc.treasury}</div>
              <div className="stat-desc">{config.treasuryUSDCPercent}%</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Remaining</div>
              <div className="stat-value text-lg">{usdc.remaining}</div>
              <div className="stat-desc">USDC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
