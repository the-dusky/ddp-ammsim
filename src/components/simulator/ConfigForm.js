import React, { useState } from 'react'

// Default configuration values
const defaultConfig = {
  numBoardMembers: 100,
  numTraders: 10,
  totalSupply: 1000000000,
  ammPercent: 30,
  playerPercent: 40,
  platformPercent: 10,
  chairmanContribution: 500,
  boardMemberContribution: 5,
  platformFee: 0,
  treasuryUSDCPercent: 0
}

/**
 * Configuration form component for the AMM simulator
 * Allows users to set all parameters for DDP and USDC allocation
 */
export default function ConfigForm({ onApply, initialConfig }) {
  // Initialize state with defaults or provided values
  const [config, setConfig] = useState({ ...defaultConfig, ...initialConfig })
  const [error, setError] = useState('')

  // Calculate treasury percent based on other allocations
  const calculateTreasuryPercent = () => {
    return 100 - (config.ammPercent + config.playerPercent + config.platformPercent)
  }

  // Calculate total contributions
  const calculateTotalContributions = () => {
    return config.chairmanContribution + (config.boardMemberContribution * config.numBoardMembers)
  }

  // Calculate platform fee
  const calculatePlatformFee = () => {
    const totalContributions = calculateTotalContributions()
    return (totalContributions * config.platformFee) / 100
  }

  // Calculate DDP allocation amounts and percentages based on contributions
  const calculatePlayerShares = () => {
    const totalContributions = calculateTotalContributions()
    const chairmanShare = config.chairmanContribution / totalContributions
    const boardMemberShare = config.boardMemberContribution / totalContributions
    return { chairmanShare, boardMemberShare }
  }

  const calculateChairmanDDP = () => {
    const playerAllocation = (config.totalSupply * config.playerPercent) / 100
    const { chairmanShare } = calculatePlayerShares()
    const chairmanDDP = playerAllocation * chairmanShare
    const percentOfTotal = (chairmanDDP / config.totalSupply * 100).toFixed(2)
    return { amount: chairmanDDP.toLocaleString(), percent: percentOfTotal }
  }

  const calculateBoardMemberDDP = () => {
    const playerAllocation = (config.totalSupply * config.playerPercent) / 100
    const { boardMemberShare } = calculatePlayerShares()
    const boardMemberDDP = playerAllocation * boardMemberShare
    const percentOfTotal = (boardMemberDDP / config.totalSupply * 100).toFixed(2)
    return { amount: boardMemberDDP.toLocaleString(), percent: percentOfTotal }
  }

  // Validate USDC split
  const validateUSDCSplit = () => {
    const totalUSDCSplit = config.platformFee + config.treasuryUSDCPercent
    if (totalUSDCSplit > 100) {
      return `USDC split (${totalUSDCSplit}%) must not exceed 100%`
    }
    return null
  }

  // Handle form submission
  const handleApply = () => {
    const treasuryPercent = calculateTreasuryPercent()
    if (treasuryPercent < 0) {
      setError(`DDP allocation exceeds 100%`)
      return
    }

    const usdcError = validateUSDCSplit()
    if (usdcError) {
      setError(usdcError)
      return
    }

    setError('')
    onApply({ ...config, treasuryPercent })
  }

  // Track input values separately from stored values
  const [inputValues, setInputValues] = useState({})

  // Handle input changes - allow any input while typing
  const handleChange = (field, value) => {
    setInputValues(prev => ({ ...prev, [field]: value }))
  }

  // Handle blur - format and store valid number
  const handleBlur = (field, value) => {
    if (value === '' || value === '.') {
      setInputValues(prev => ({ ...prev, [field]: config[field] }))
      return
    }

    // Remove commas before parsing
    const cleanValue = value.replace(/,/g, '')
    const numValue = parseFloat(cleanValue)
    if (!isNaN(numValue)) {
      setConfig(prev => ({ ...prev, [field]: numValue }))
      // Clear the input value so it shows the formatted stored value
      setInputValues(prev => ({ ...prev, [field]: undefined }))
    } else {
      setInputValues(prev => ({ ...prev, [field]: config[field] }))
    }
  }

  // Format number with commas
  const formatNumber = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US')
    }
    return value
  }

  // Get display value for an input
  const getInputValue = (field) => {
    const value = inputValues[field] !== undefined ? inputValues[field] : config[field]
    // Only format if it's the stored value (not while user is typing)
    return inputValues[field] === undefined ? formatNumber(value) : value
  }

  return (
    <div className="card w-full bg-base-300 shadow-xl border border-base-100">
      <div className="card-body gap-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Participant Numbers */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Chairmen</span>
            </label>
            <div className="text-lg font-medium pl-4">1</div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Board Members</span>
            </label>
            <input
              type="text" inputMode="decimal"
              value={getInputValue('numBoardMembers')}
              onBlur={e => handleBlur('numBoardMembers', e.target.value)}
              onChange={e => handleChange('numBoardMembers', e.target.value)}
              className="input input-bordered input-primary bg-base-200 w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Traders</span>
            </label>
            <input
              type="text" inputMode="decimal"
              value={getInputValue('numTraders')}
              onBlur={e => handleBlur('numTraders', e.target.value)}
              onChange={e => handleChange('numTraders', e.target.value)}
              className="input input-bordered input-primary bg-base-200 w-full"
            />
          </div>
        </div>

        {/* DDP Supply */}
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text text-primary font-medium">DDP Supply</span>
          </label>
          <input
            type="text" inputMode="decimal"
            value={getInputValue('totalSupply')}
            onBlur={e => handleBlur('totalSupply', e.target.value)}
            onChange={e => handleChange('totalSupply', e.target.value)}
            className="input input-bordered input-primary bg-base-200 w-full"
          />
        </div>

        {/* Percentages */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Treasury %</span>
            </label>
            <div className="text-lg font-medium pl-4">{calculateTreasuryPercent()}%</div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">AMM %</span>
            </label>
            <input
              type="text" inputMode="decimal"
              value={getInputValue('ammPercent')}
              onBlur={e => handleBlur('ammPercent', e.target.value)}
              onChange={e => handleChange('ammPercent', e.target.value)}
              className="input input-bordered input-primary bg-base-200 w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Player %</span>
            </label>
            <input
              type="text" inputMode="decimal"
              value={getInputValue('playerPercent')}
              onBlur={e => handleBlur('playerPercent', e.target.value)}
              onChange={e => handleChange('playerPercent', e.target.value)}
              className="input input-bordered input-primary bg-base-200 w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Platform %</span>
            </label>
            <input
              type="text" inputMode="decimal"
              value={getInputValue('platformPercent')}
              onBlur={e => handleBlur('platformPercent', e.target.value)}
              onChange={e => handleChange('platformPercent', e.target.value)}
              className="input input-bordered input-primary bg-base-200 w-full"
            />
          </div>
        </div>

        {/* Contributions */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Chairman Contribution</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text" inputMode="decimal"
                value={getInputValue('chairmanContribution')}
                onBlur={e => handleBlur('chairmanContribution', e.target.value)}
                onChange={e => handleChange('chairmanContribution', e.target.value)}
                className="input input-bordered input-primary bg-base-200 w-full"
              />
              <span className="text-sm font-medium whitespace-nowrap">{calculateChairmanDDP().amount} DDP ({calculateChairmanDDP().percent}%)</span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-primary font-medium">Board Member Contribution</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text" inputMode="decimal"
                value={getInputValue('boardMemberContribution')}
                onBlur={e => handleBlur('boardMemberContribution', e.target.value)}
                onChange={e => handleChange('boardMemberContribution', e.target.value)}
                className="input input-bordered input-primary bg-base-200 w-full"
              />
              <span className="text-sm font-medium whitespace-nowrap">{calculateBoardMemberDDP().amount} DDP ({calculateBoardMemberDDP().percent}%)</span>
            </div>
          </div>
        </div>

        {/* USDC Split Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">USDC Split</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary font-medium">Platform Fee %</span>
              </label>
              <input
                type="text" inputMode="decimal"
                value={getInputValue('platformFee')}
                onBlur={e => handleBlur('platformFee', e.target.value)}
                onChange={e => handleChange('platformFee', e.target.value)}
                className="input input-bordered input-primary bg-base-200 w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary font-medium">Treasury USDC %</span>
              </label>
              <input
                type="text" inputMode="decimal"
                value={getInputValue('treasuryUSDCPercent')}
                onBlur={e => handleBlur('treasuryUSDCPercent', e.target.value)}
                onChange={e => handleChange('treasuryUSDCPercent', e.target.value)}
                className="input input-bordered input-primary bg-base-200 w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary font-medium">Total Contributions</span>
              </label>
              <div className="text-lg font-medium pl-4">{calculateTotalContributions()} USDC</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary font-medium">Platform Fee Amount</span>
              </label>
              <div className="text-lg font-medium pl-4">{calculatePlatformFee()} USDC</div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary font-medium">Treasury Amount</span>
              </label>
              <div className="text-lg font-medium pl-4">{(calculateTotalContributions() * config.treasuryUSDCPercent / 100).toLocaleString()} USDC</div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary font-medium">Remaining USDC</span>
              </label>
              <div className="text-lg font-medium pl-4">{(calculateTotalContributions() * (100 - config.platformFee - config.treasuryUSDCPercent) / 100).toLocaleString()} USDC</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-error mt-4">{error}</div>
        )}

        {/* Apply Button */}
        <div className="mt-6">
          <button
            onClick={handleApply}
            className="btn btn-primary w-full text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
