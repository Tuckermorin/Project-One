import React, { useState } from 'react';
import { ArrowLeft, X, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import Button from '../common/Button';
import GreeksCalculator from './GreeksCalculator';

interface StrategySimulation {
  strategy: string;
  stockPrice: number;
  strikePrice: number;
  premium: number;
  stockOwned?: boolean;
  buyStrike?: number;
  sellStrike?: number;
  currentValue?: number;
}

const calculatePayoff = (simulation: StrategySimulation) => {
  const { strategy, stockPrice, strikePrice, premium, buyStrike, sellStrike, currentValue } = simulation;
  
  switch (strategy) {
    case 'buy-call':
      const callItm = stockPrice > strikePrice;
      const callPayoff = callItm ? stockPrice - strikePrice - premium : -premium;
      return { 
        itm: callItm, 
        payoff: callPayoff, 
        maxReturn: 'Unlimited', 
        maxLoss: -premium,
        breakeven: strikePrice + premium
      };

    case 'buy-put':
      const putItm = stockPrice < strikePrice;
      const putPayoff = putItm ? strikePrice - stockPrice - premium : -premium;
      return { 
        itm: putItm, 
        payoff: putPayoff, 
        maxReturn: strikePrice - premium, 
        maxLoss: -premium,
        breakeven: strikePrice - premium
      };

    case 'covered-call':
      const stockGain = stockPrice - (currentValue || 100);
      const callSold = stockPrice > strikePrice ? -(stockPrice - strikePrice) : 0;
      const totalPayoff = stockGain + premium + callSold;
      return {
        itm: stockPrice > strikePrice,
        payoff: totalPayoff,
        maxReturn: (strikePrice - (currentValue || 100)) + premium,
        maxLoss: -(currentValue || 100) + premium,
        breakeven: (currentValue || 100) - premium
      };

    case 'protective-put':
      const stockGainProt = stockPrice - (currentValue || 100);
      const putProt = stockPrice < strikePrice ? strikePrice - stockPrice : 0;
      const totalPayoffProt = stockGainProt + putProt - premium;
      return {
        itm: stockPrice < strikePrice,
        payoff: totalPayoffProt,
        maxReturn: 'Unlimited',
        maxLoss: (currentValue || 100) - strikePrice + premium,
        breakeven: (currentValue || 100) + premium
      };

    case 'bull-call-spread':
      const longCall = stockPrice > (buyStrike || 100) ? stockPrice - (buyStrike || 100) : 0;
      const shortCall = stockPrice > (sellStrike || 105) ? -(stockPrice - (sellStrike || 105)) : 0;
      const spreadPayoff = longCall + shortCall - premium;
      return {
        itm: stockPrice > (buyStrike || 100),
        payoff: spreadPayoff,
        maxReturn: (sellStrike || 105) - (buyStrike || 100) - premium,
        maxLoss: -premium,
        breakeven: (buyStrike || 100) + premium
      };

    default:
      return { itm: false, payoff: 0, maxReturn: 0, maxLoss: 0, breakeven: 0 };
  }
};

const StrategyCard = ({ 
  title, 
  description, 
  outlook, 
  strategy, 
  icon: Icon, 
  onSimulate 
}: {
  title: string;
  description: string;
  outlook: string;
  strategy: string;
  icon: any;
  onSimulate: (strategy: string) => void;
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-blue-600 mt-1" />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        <p className="text-xs text-blue-600 mt-2 font-medium">Market Outlook: {outlook}</p>
        <Button 
          onClick={() => onSimulate(strategy)}
          variant="secondary" 
          size="sm" 
          className="mt-3"
        >
          Try Simulation
        </Button>
      </div>
    </div>
  </div>
);

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const OptionsGuide: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [active, setActive] = useState('basics');
  const [simulation, setSimulation] = useState<StrategySimulation | null>(null);

  const closeSimulation = () => setSimulation(null);

  const openSimulation = (strategy: string) => {
    const defaultSims: { [key: string]: StrategySimulation } = {
      'buy-call': { strategy: 'buy-call', stockPrice: 105, strikePrice: 100, premium: 3 },
      'buy-put': { strategy: 'buy-put', stockPrice: 95, strikePrice: 100, premium: 4 },
      'covered-call': { strategy: 'covered-call', stockPrice: 105, strikePrice: 110, premium: 2, currentValue: 100 },
      'protective-put': { strategy: 'protective-put', stockPrice: 95, strikePrice: 95, premium: 3, currentValue: 100 },
      'bull-call-spread': { strategy: 'bull-call-spread', stockPrice: 105, strikePrice: 0, buyStrike: 100, sellStrike: 110, premium: 3 }
    };
    setSimulation(defaultSims[strategy] || defaultSims['buy-call']);
  };

  const sections: Section[] = [
    {
      id: 'basics',
      title: 'Options Basics',
      content: (
        <div className="space-y-4">
          <p>
            Options give the buyer the right, but not the obligation, to buy or sell an underlying security at a specific price before a certain date. A call option is a bet that prices will rise, allowing the holder to buy at a lower strike price, while a put option profits when prices fall, allowing the holder to sell at a higher strike price.
          </p>
          <p>
            Each option contract typically controls 100 shares of stock. The price you pay (or receive) for that control is called the premium, determined by factors like the stock's price, volatility, time to expiration, and interest rates.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Key Terms:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Strike Price:</strong> The fixed price at which the option can be exercised.</li>
              <li><strong>Expiration Date:</strong> The date after which the option becomes void.</li>
              <li><strong>In-the-Money (ITM):</strong> When exercising the option is profitable (call: stock price {`>`} strike; put: stock price {`<`} strike).</li>
              <li><strong>Out-of-the-Money (OTM):</strong> When exercising the option is not profitable.</li>
              <li><strong>Premium:</strong> The cost to buy an option contract.</li>
              <li><strong>Breakeven:</strong> The stock price where the strategy neither makes nor loses money.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'strategies',
      title: 'Basic Strategies',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            These fundamental strategies form the building blocks of options trading. Each targets different market conditions and risk profiles.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <StrategyCard
              title="Buy Call Options"
              description="Purchase the right to buy stock at a fixed price. Profits when stock price rises above strike + premium paid."
              outlook="Bullish (expecting price to rise)"
              strategy="buy-call"
              icon={TrendingUp}
              onSimulate={openSimulation}
            />
            
            <StrategyCard
              title="Buy Put Options"
              description="Purchase the right to sell stock at a fixed price. Profits when stock price falls below strike - premium paid."
              outlook="Bearish (expecting price to fall)"
              strategy="buy-put"
              icon={TrendingDown}
              onSimulate={openSimulation}
            />
            
            <StrategyCard
              title="Covered Call"
              description="Own 100 shares and sell a call option. Generate income from premium but cap upside potential."
              outlook="Neutral to slightly bullish"
              strategy="covered-call"
              icon={BarChart3}
              onSimulate={openSimulation}
            />
            
            <StrategyCard
              title="Protective Put"
              description="Own stock and buy put options as insurance. Limits downside risk while keeping upside potential."
              outlook="Bullish with downside protection"
              strategy="protective-put"
              icon={TrendingUp}
              onSimulate={openSimulation}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'advanced',
      title: 'Advanced Strategies',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            More sophisticated strategies that combine multiple options to create specific risk-reward profiles and target particular market conditions.
          </p>
          
          <div className="grid gap-4">
            <StrategyCard
              title="Bull Call Spread"
              description="Buy a call at lower strike, sell a call at higher strike. Limited risk and reward, cheaper than buying calls outright."
              outlook="Moderately bullish"
              strategy="bull-call-spread"
              icon={TrendingUp}
              onSimulate={openSimulation}
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Other Advanced Strategies (Concepts)</h4>
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>Iron Condor:</strong> Combines bull put spread + bear call spread. Profits when stock stays within a range.</p>
              <p><strong>Straddle:</strong> Buy call and put at same strike. Profits from large price moves in either direction.</p>
              <p><strong>Butterfly Spread:</strong> Combines multiple strikes to profit from minimal price movement.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'greeks',
      title: 'Options Greeks',
      content: (
        <div className="space-y-4">
          <p>Options Greeks measure how option prices change in response to various factors:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Delta:</strong> Measures how much an option's price changes for a $1 move in the underlying stock.</li>
            <li><strong>Gamma:</strong> Measures the rate of change in Delta.</li>
            <li><strong>Theta:</strong> Represents time decay, showing how much an option's value decreases daily.</li>
            <li><strong>Vega:</strong> Measures sensitivity to changes in implied volatility.</li>
            <li><strong>Rho:</strong> Measures sensitivity to interest rate changes.</li>
          </ul>
          <GreeksCalculator />
        </div>
      ),
    },
    {
      id: 'risks',
      title: 'Risks & Tips',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Key Risks</h4>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              <li><strong>Total Loss:</strong> Options can expire worthless, resulting in 100% loss of premium paid.</li>
              <li><strong>Time Decay:</strong> Options lose value daily as expiration approaches.</li>
              <li><strong>Liquidity Risk:</strong> Wide bid-ask spreads can increase trading costs.</li>
              <li><strong>Assignment Risk:</strong> Short options can be exercised against you at any time.</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Best Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>Start small and paper trade to learn without risk</li>
              <li>Understand each strategy's maximum loss before entering</li>
              <li>Have a clear exit plan for both profits and losses</li>
              <li>Focus on liquid options with tight bid-ask spreads</li>
              <li>Consider the Greeks when selecting strategies</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const getStrategyTitle = (strategy: string) => {
    const titles: { [key: string]: string } = {
      'buy-call': 'Buy Call Option',
      'buy-put': 'Buy Put Option', 
      'covered-call': 'Covered Call Strategy',
      'protective-put': 'Protective Put Strategy',
      'bull-call-spread': 'Bull Call Spread'
    };
    return titles[strategy] || 'Options Strategy';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex">
      <aside className="hidden sm:block w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={`text-left w-full py-2 px-3 rounded-lg transition-colors ${
                active === section.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={onBack} variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sections.find((s) => s.id === active)?.title}</h2>
          </div>
          <div className="prose max-w-none">{sections.find((s) => s.id === active)?.content}</div>
        </div>
        
        {simulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {getStrategyTitle(simulation.strategy)} Simulation
                </h3>
                <Button onClick={closeSimulation} variant="secondary" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Adjust Parameters</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock Price: ${simulation.stockPrice}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={simulation.stockPrice}
                      onChange={(e) => setSimulation({ ...simulation, stockPrice: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {simulation.strategy.includes('spread') ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Buy Strike: ${simulation.buyStrike}
                        </label>
                        <input
                          type="range"
                          min="80"
                          max="130"
                          value={simulation.buyStrike}
                          onChange={(e) => setSimulation({ ...simulation, buyStrike: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sell Strike: ${simulation.sellStrike}
                        </label>
                        <input
                          type="range"
                          min="90"
                          max="140"
                          value={simulation.sellStrike}
                          onChange={(e) => setSimulation({ ...simulation, sellStrike: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Strike Price: ${simulation.strikePrice}
                      </label>
                      <input
                        type="range"
                        min="80"
                        max="130"
                        value={simulation.strikePrice}
                        onChange={(e) => setSimulation({ ...simulation, strikePrice: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium: ${simulation.premium}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={simulation.premium}
                      onChange={(e) => setSimulation({ ...simulation, premium: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {(simulation.strategy === 'covered-call' || simulation.strategy === 'protective-put') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Purchase Price: ${simulation.currentValue}
                      </label>
                      <input
                        type="range"
                        min="80"
                        max="130"
                        value={simulation.currentValue}
                        onChange={(e) => setSimulation({ ...simulation, currentValue: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">Strategy Results</h4>
                  {(() => {
                    const results = calculatePayoff(simulation);
                    return (
                      <div className="space-y-2">
                        <div className={`p-2 rounded text-sm font-medium ${
                          results.itm ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          Status: {results.itm ? 'In-the-Money ✓' : 'Out-of-the-Money ✗'}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between">
                            <span>Current P&L:</span>
                            <span className={results.payoff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              ${results.payoff.toFixed(2)} per share
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Max Profit:</span>
                            <span className="text-green-600">
                              {typeof results.maxReturn === 'string' ? results.maxReturn : `$${results.maxReturn.toFixed(2)}`}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Max Loss:</span>
                            <span className="text-red-600">${Math.abs(results.maxLoss).toFixed(2)}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Breakeven:</span>
                            <span>${results.breakeven?.toFixed(2) || 'N/A'}</span>
                          </p>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            <strong>Per Contract (100 shares):</strong> ${(results.payoff * 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OptionsGuide;