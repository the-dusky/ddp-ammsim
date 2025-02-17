import React, { useState } from 'react'

export default function ParticipantsTable({ participants, ddpPrice }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Format number with commas
  const formatNumber = (value, decimals = 0) => {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  // Calculate portfolio value
  const getPortfolioValue = (participant) => {
    // Calculate DDP value based on current pool price
    const ddpValue = participant.ddpBalance * ddpPrice
    // Add USDC balance to get total portfolio value
    return ddpValue + participant.usdcBalance
  }

  // Calculate DDP value
  const getDDPValue = (ddpBalance) => {
    return ddpBalance * ddpPrice
  }

  return (
    <div className="card w-full bg-base-300 shadow-xl border border-base-100">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-2xl">Participants</h2>
          <div className="form-control w-64">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search participants..."
                className="input input-bordered bg-base-200 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="btn btn-square btn-outline"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="sticky top-0 bg-base-300">
              <tr>
                <th>Type</th>
                <th>DDP Balance</th>
                <th>USDC Balance</th>
                <th>LP Tokens</th>
                <th>DDP Value</th>
                <th>Portfolio Value</th>
              </tr>
            </thead>
            <tbody>
              {participants
                .filter(participant => 
                  participant.type.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((participant, index) => {
                const portfolioValue = getPortfolioValue(participant)
                const ddpValue = getDDPValue(participant.ddpBalance)

                return (
                  <tr key={index}>
                    <td className="font-medium">{participant.type}</td>
                    <td>{formatNumber(participant.ddpBalance)}</td>
                    <td>{formatCurrency(participant.usdcBalance)}</td>
                    <td>{formatNumber(participant.lpTokens)}</td>
                    <td>{formatCurrency(ddpValue)}</td>
                    <td className="font-medium">{formatCurrency(portfolioValue)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
