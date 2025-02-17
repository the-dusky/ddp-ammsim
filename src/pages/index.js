import React, { useState } from 'react'
import ConfigForm from '../components/simulator/ConfigForm'
import Results from '../components/simulator/Results'
import ParticipantsTable from '../components/simulator/ParticipantsTable'
import LiquidityPool from '../components/simulator/LiquidityPool'
import { calculateAllocations, createParticipants } from '../utils/calculations'

export default function Home() {
  const [calculations, setCalculations] = useState(null)
  const [participants, setParticipants] = useState([])

  const handleConfigApply = (config) => {
    const newCalculations = calculateAllocations(config)
    const newParticipants = createParticipants(config, newCalculations)
    
    setCalculations(newCalculations)
    setParticipants(newParticipants)
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">DDP AMM Simulator</h1>
        
        {/* Configuration Form */}
        <ConfigForm onApply={handleConfigApply} />

        {/* Results */}
        {calculations && (
          <div className="mt-8 space-y-8">
            <Results config={calculations} />
            <LiquidityPool
              participants={participants}
              calculations={calculations}
              onParticipantsUpdate={setParticipants}
            />
            <div className="h-96 overflow-auto">
              <ParticipantsTable 
                participants={participants}
                ddpPrice={(() => {
                  const pool = participants.find(p => p.type === 'AMM Pool')
                  return pool?.ddpBalance > 0 ? pool.usdcBalance / pool.ddpBalance : 0
                })()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
