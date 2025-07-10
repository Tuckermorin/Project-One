import React, { useState } from 'react';

interface GreeksInput {
  stockPrice: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

const GreeksCalculator: React.FC = () => {
  const [greeksInput, setGreeksInput] = useState<GreeksInput>({
    stockPrice: 100,
    delta: 0.5,
    gamma: 0.1,
    theta: -0.05,
    vega: 0.2,
    rho: 0.01,
  });

  const calculateOptionValueImpact = () => {
    const priceChange = greeksInput.delta * 100;
    const volatilityChange = greeksInput.vega * 10;
    const timeDecay = greeksInput.theta * 100;
    const gammaImpact = greeksInput.gamma * 100;
    const rhoImpact = greeksInput.rho * 100;
    return { priceChange, volatilityChange, timeDecay, gammaImpact, rhoImpact };
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Greeks Calculator</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Price: ${greeksInput.stockPrice}</label>
            <input
              type="range"
              min="50"
              max="150"
              value={greeksInput.stockPrice}
              onChange={(e) => setGreeksInput({ ...greeksInput, stockPrice: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delta: {greeksInput.delta.toFixed(2)}</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={greeksInput.delta}
              onChange={(e) => setGreeksInput({ ...greeksInput, delta: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gamma: {greeksInput.gamma.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={greeksInput.gamma}
              onChange={(e) => setGreeksInput({ ...greeksInput, gamma: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Theta: {greeksInput.theta.toFixed(2)}</label>
            <input
              type="range"
              min="-0.1"
              max="0"
              step="0.01"
              value={greeksInput.theta}
              onChange={(e) => setGreeksInput({ ...greeksInput, theta: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vega: {greeksInput.vega.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={greeksInput.vega}
              onChange={(e) => setGreeksInput({ ...greeksInput, vega: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rho: {greeksInput.rho.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.01"
              value={greeksInput.rho}
              onChange={(e) => setGreeksInput({ ...greeksInput, rho: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-800 dark:text-gray-100">Option Value Impact</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Price Change (per $1 stock move): ${(calculateOptionValueImpact().priceChange).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Volatility Change (per 1% increase): ${(calculateOptionValueImpact().volatilityChange).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daily Time Decay: ${(calculateOptionValueImpact().timeDecay).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Delta Change (per $1 stock move): ${(calculateOptionValueImpact().gammaImpact).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rate Change (per 1% rate increase): ${(calculateOptionValueImpact().rhoImpact).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreeksCalculator;