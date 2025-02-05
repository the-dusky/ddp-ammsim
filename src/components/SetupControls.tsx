import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const SetupControls = ({ onApply }) => {
  const [config, setConfig] = useState({
    poolDDP: 45000000,
    poolUSDC: 135000,
    whaleSettings: {
      ddp: 10000000,
      usdc: -27000
    },
    playerSettings: {
      ddp: 4000000,
      usdc: -10800
    },
    numberOfPlayers: 10
  });

  const handleApply = () => {
    const players = [
      {
        id: 1,
        name: 'Whale',
        ddp: config.whaleSettings.ddp,
        usdc: config.whaleSettings.usdc,
        lpTokens: 0
      },
      ...Array(config.numberOfPlayers).fill(null).map((_, i) => ({
        id: i + 2,
        name: `Player ${i + 1}`,
        ddp: config.playerSettings.ddp,
        usdc: config.playerSettings.usdc,
        lpTokens: 0
      }))
    ];

    onApply({
      reserves: {
        ddp: config.poolDDP,
        usdc: config.poolUSDC
      },
      players
    });
  };

  return (
    <Card className="w-full max-w-4xl mb-4">
      <CardHeader>
        <CardTitle>Setup Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium">Pool Settings</div>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="DDP Reserve"
                value={config.poolDDP}
                onChange={(e) => setConfig({
                  ...config,
                  poolDDP: parseFloat(e.target.value) || 0
                })}
              />
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="USDC Reserve"
                value={config.poolUSDC}
                onChange={(e) => setConfig({
                  ...config,
                  poolUSDC: parseFloat(e.target.value) || 0
                })}
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium">Number of Regular Players</div>
              <input
                type="number"
                className="w-full p-2 border rounded"
                min="1"
                max="20"
                value={config.numberOfPlayers}
                onChange={(e) => setConfig({
                  ...config,
                  numberOfPlayers: parseInt(e.target.value) || 10
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium">Whale Settings</div>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Whale DDP Balance"
                value={config.whaleSettings.ddp}
                onChange={(e) => setConfig({
                  ...config,
                  whaleSettings: {
                    ...config.whaleSettings,
                    ddp: parseFloat(e.target.value) || 0
                  }
                })}
              />
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Whale USDC Balance"
                value={config.whaleSettings.usdc}
                onChange={(e) => setConfig({
                  ...config,
                  whaleSettings: {
                    ...config.whaleSettings,
                    usdc: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium">Regular Player Settings</div>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Player DDP Balance"
                value={config.playerSettings.ddp}
                onChange={(e) => setConfig({
                  ...config,
                  playerSettings: {
                    ...config.playerSettings,
                    ddp: parseFloat(e.target.value) || 0
                  }
                })}
              />
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Player USDC Balance"
                value={config.playerSettings.usdc}
                onChange={(e) => setConfig({
                  ...config,
                  playerSettings: {
                    ...config.playerSettings,
                    usdc: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
          </div>

          <button
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleApply}
          >
            Apply Settings
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupControls;