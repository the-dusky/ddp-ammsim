import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { create, all } from 'mathjs';
import SetupControls from './SetupControls';

const math = create(all);

const AMMSimulator = () => {
  const [showSetup, setShowSetup] = useState(true);
  const [reserves, setReserves] = useState({
    ddp: 30000000, // 30M DDP
    usdc: 135000   // 135K USDC
  });

  // Initialize players
  const [players, setPlayers] = useState([
    { id: 1, name: 'Whale', ddp: 10000000, usdc: -27000, lpTokens: 0 },
    ...Array(10).fill(null).map((_, i) => ({
      id: i + 2,
      name: `Player ${i + 1}`,
      ddp: 4000000,
      usdc: -10800,
      lpTokens: 0
    }))
  ]);

  const [selectedPlayer, setSelectedPlayer] = useState(1);
  const [input, setInput] = useState({
    amount: '',
    token: 'ddp',
    action: 'swap'
  });
  const [fee] = useState(0.003); // 0.3% fee

  const calculateSwap = (inputAmount, inputToken) => {
    // Constant product formula: x * y = k
    const k = reserves.ddp * reserves.usdc;
    const inputWithFee = inputAmount * (1 - fee);
    
    if (inputToken === 'ddp') {
      // For DDP to USDC swap
      // New USDC reserve = k / (DDP reserve + input)
      const newUsdcReserve = k / (reserves.ddp + inputWithFee);
      const usdcOut = reserves.usdc - newUsdcReserve;
      
      // Calculate price impact
      const initialPrice = reserves.usdc / reserves.ddp;
      const finalPrice = newUsdcReserve / (reserves.ddp + inputWithFee);
      const priceImpact = Math.abs((finalPrice - initialPrice) / initialPrice) * 100;
      
      return {
        amountOut: usdcOut,
        priceImpact
      };
    } else {
      // For USDC to DDP swap
      const newDdpReserve = k / (reserves.usdc + inputWithFee);
      const ddpOut = reserves.ddp - newDdpReserve;
      
      // Calculate price impact
      const initialPrice = reserves.ddp / reserves.usdc;
      const finalPrice = newDdpReserve / (reserves.usdc + inputWithFee);
      const priceImpact = Math.abs((finalPrice - initialPrice) / initialPrice) * 100;
      
      return {
        amountOut: ddpOut,
        priceImpact
      };
    }
  };

  const calculateLiquidityAmounts = (inputAmount, inputToken) => {
    // Calculate the proportional amount of the other token needed
    // based on the current ratio of reserves
    if (inputToken === 'ddp') {
      // If providing DDP, calculate required USDC
      // (DDP input * USDC reserve) / DDP reserve
      const usdcRequired = Math.ceil((inputAmount * reserves.usdc) / reserves.ddp);
      return {
        ddp: inputAmount,
        usdc: usdcRequired,
        // Calculate share of the pool
        share: (inputAmount / (reserves.ddp + inputAmount)) * 100
      };
    } else {
      // If providing USDC, calculate required DDP
      // (USDC input * DDP reserve) / USDC reserve
      const ddpRequired = Math.ceil((inputAmount * reserves.ddp) / reserves.usdc);
      return {
        ddp: ddpRequired,
        usdc: inputAmount,
        // Calculate share of the pool
        share: (inputAmount / (reserves.usdc + inputAmount)) * 100
      };
    }
  };

  const handleSwap = () => {
    const amount = parseFloat(input.amount);
    if (isNaN(amount)) return;

    const { amountOut } = calculateSwap(amount, input.token);
    const player = players.find(p => p.id === selectedPlayer);
    
    if (input.token === 'ddp') {
      if (player.ddp < amount) return; // Check balance

      setReserves({
        ddp: reserves.ddp + amount,
        usdc: reserves.usdc - amountOut
      });

      setPlayers(players.map(p => p.id === selectedPlayer ? {
        ...p,
        ddp: p.ddp - amount,
        usdc: p.usdc + amountOut
      } : p));
    } else {
      if (player.usdc < amount) return; // Check balance

      setReserves({
        ddp: reserves.ddp - amountOut,
        usdc: reserves.usdc + amount
      });

      setPlayers(players.map(p => p.id === selectedPlayer ? {
        ...p,
        ddp: p.ddp + amountOut,
        usdc: p.usdc - amount
      } : p));
    }
  };

  const addLiquidity = () => {
    const amount = parseFloat(input.amount);
    if (isNaN(amount)) return;
    
    const { ddp, usdc } = calculateLiquidityAmounts(amount, input.token);
    const player = players.find(p => p.id === selectedPlayer);
    
    // Check balances
    if (player.ddp < ddp || player.usdc < usdc) return;

    setReserves({
      ddp: reserves.ddp + ddp,
      usdc: reserves.usdc + usdc
    });

    // Calculate LP tokens
    const shareOfPool = ddp / reserves.ddp;
    const totalLpSupply = players.reduce((sum, p) => sum + p.lpTokens, 0);
    const newLpTokens = totalLpSupply === 0 ? Math.sqrt(ddp * usdc) : totalLpSupply * shareOfPool;

    setPlayers(players.map(p => p.id === selectedPlayer ? {
      ...p,
      ddp: p.ddp - ddp,
      usdc: p.usdc - usdc,
      lpTokens: p.lpTokens + newLpTokens
    } : p));
  };

  const removeLiquidity = () => {
    const percentageToRemove = parseFloat(input.amount);
    if (isNaN(percentageToRemove) || percentageToRemove > 100) return;
    
    const player = players.find(p => p.id === selectedPlayer);
    const shareToRemove = percentageToRemove / 100;
    const lpTokensToRemove = player.lpTokens * shareToRemove;
    
    const totalLpSupply = players.reduce((sum, p) => sum + p.lpTokens, 0);
    const shareOfPool = lpTokensToRemove / totalLpSupply;
    
    const ddpToRemove = reserves.ddp * shareOfPool;
    const usdcToRemove = reserves.usdc * shareOfPool;
    
    setReserves({
      ddp: reserves.ddp - ddpToRemove,
      usdc: reserves.usdc - usdcToRemove
    });

    setPlayers(players.map(p => p.id === selectedPlayer ? {
      ...p,
      ddp: p.ddp + ddpToRemove,
      usdc: p.usdc + usdcToRemove,
      lpTokens: p.lpTokens - lpTokensToRemove
    } : p));
  };

  const getPrice = () => {
    return reserves.usdc / reserves.ddp;
  };

  const handleAction = () => {
    switch(input.action) {
      case 'swap':
        handleSwap();
        break;
      case 'add':
        addLiquidity();
        break;
      case 'remove':
        removeLiquidity();
        break;
      default:
        break;
    }
  };

  const simulateAction = () => {
    if (!input.amount) return null;
    const amount = parseFloat(input.amount);
    if (isNaN(amount)) return null;

    if (input.action === 'swap') {
      const { amountOut, priceImpact } = calculateSwap(amount, input.token);
      return { 
        type: 'swap',
        amountOut,
        priceImpact
      };
    } else if (input.action === 'add') {
      const { ddp, usdc } = calculateLiquidityAmounts(amount, input.token);
      return {
        type: 'liquidity',
        ddp,
        usdc
      };
    } else if (input.action === 'remove') {
      if (amount > 100) return null;
      const player = players.find(p => p.id === selectedPlayer);
      const shareToRemove = amount / 100;
      const lpTokensToRemove = player.lpTokens * shareToRemove;
      const totalLpSupply = players.reduce((sum, p) => sum + p.lpTokens, 0);
      const shareOfPool = lpTokensToRemove / totalLpSupply;
      
      return {
        type: 'remove',
        ddp: reserves.ddp * shareOfPool,
        usdc: reserves.usdc * shareOfPool,
        lpTokens: lpTokensToRemove
      };
    }
    return null;
  };

  const handleSetupApply = (settings) => {
    setReserves(settings.reserves);
    setPlayers(settings.players);
    setShowSetup(false);
  };

  const simulation = simulateAction();

  return (
    <div className="space-y-4">
      <button 
        className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        onClick={() => setShowSetup(!showSetup)}
      >
        {showSetup ? 'Hide Setup' : 'Show Setup'}
      </button>

      {showSetup && <SetupControls onApply={handleSetupApply} />}

      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>DDP/USDC Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 rounded">
                <div className="font-medium">DDP Reserve</div>
                <div className="text-lg">{reserves.ddp.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              </div>
              <div className="p-4 bg-gray-100 rounded">
                <div className="font-medium">USDC Reserve</div>
                <div className="text-lg">{reserves.usdc.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded">
              <div className="font-medium">Current Price (USDC/DDP)</div>
              <div className="text-lg">{getPrice().toLocaleString(undefined, {maximumFractionDigits: 6})}</div>
            </div>

            <div className="p-4 bg-gray-100 rounded space-y-2">
              <div className="font-medium">Player Selection</div>
              <select 
                className="w-full p-2 border rounded"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(parseInt(e.target.value))}
              >
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} - DDP: {player.ddp.toLocaleString()} | USDC: {player.usdc.toLocaleString()} | LP: {player.lpTokens.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <select 
                className="w-full p-2 border rounded"
                value={input.action}
                onChange={(e) => setInput({...input, action: e.target.value})}
              >
                <option value="swap">Swap</option>
                <option value="add">Add Liquidity</option>
                <option value="remove">Remove Liquidity</option>
              </select>

              {input.action === 'swap' && (
                <select 
                  className="w-full p-2 border rounded"
                  value={input.token}
                  onChange={(e) => setInput({...input, token: e.target.value})}
                >
                  <option value="ddp">Swap DDP</option>
                  <option value="usdc">Swap USDC</option>
                </select>
              )}

              {input.action === 'add' && (
                <select 
                  className="w-full p-2 border rounded"
                  value={input.token}
                  onChange={(e) => setInput({...input, token: e.target.value})}
                >
                  <option value="ddp">Input DDP Amount</option>
                  <option value="usdc">Input USDC Amount</option>
                </select>
              )}

              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder={input.action === 'remove' ? "Enter percentage (0-100)" : "Enter amount"}
                value={input.amount}
                onChange={(e) => setInput({...input, amount: e.target.value})}
              />

              {simulation && (
                <div className="p-4 bg-gray-100 rounded space-y-2">
                  {simulation.type === 'swap' && (
                    <>
                      <div>
                        <span className="font-medium">Expected Output: </span>
                        {simulation.amountOut.toLocaleString(undefined, {maximumFractionDigits: 6})} {input.token === 'ddp' ? 'USDC' : 'DDP'}
                      </div>
                      <div>
                        <span className="font-medium">Price Impact: </span>
                        {simulation.priceImpact.toLocaleString(undefined, {maximumFractionDigits: 2})}%
                      </div>
                    </>
                  )}
                  {simulation.type === 'liquidity' && (
                    <>
                      <div>
                        <span className="font-medium">Required DDP: </span>
                        {simulation.ddp.toLocaleString(undefined, {maximumFractionDigits: 6})}
                      </div>
                      <div>
                        <span className="font-medium">Required USDC: </span>
                        {simulation.usdc.toLocaleString(undefined, {maximumFractionDigits: 6})}
                      </div>
                    </>
                  )}
                  {simulation.type === 'remove' && (
                    <>
                      <div>
                        <span className="font-medium">DDP to Receive: </span>
                        {simulation.ddp.toLocaleString(undefined, {maximumFractionDigits: 6})}
                      </div>
                      <div>
                        <span className="font-medium">USDC to Receive: </span>
                        {simulation.usdc.toLocaleString(undefined, {maximumFractionDigits: 6})}
                      </div>
                      <div>
                        <span className="font-medium">LP Tokens to Burn: </span>
                        {simulation.lpTokens.toLocaleString(undefined, {maximumFractionDigits: 6})}
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAction}
              >
                {input.action === 'swap' ? 'Swap' : input.action === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="font-medium mb-4">Player Positions</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Player</th>
                    <th className="p-2 border text-right">DDP Balance</th>
 <th className="p-2 border text-right">USDC Balance</th>
                    <th className="p-2 border text-right">LP Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player.id} className={player.id === selectedPlayer ? 'bg-blue-50' : ''}>
                      <td className="p-2 border">{player.name}</td>
                      <td className="p-2 border text-right">{player.ddp.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="p-2 border text-right">{player.usdc.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="p-2 border text-right">{player.lpTokens.toLocaleString(undefined, {maximumFractionDigits: 6})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AMMSimulator;