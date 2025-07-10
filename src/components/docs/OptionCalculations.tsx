interface StrategySimulation {
  strategy: string;
  stockPrice: number;
  strikePrice: number;
  premium: number;
  buyStrike?: number;
  sellStrike?: number;
}

export const calculatePayoff = (simulation: StrategySimulation) => {
  if (simulation.strategy === 'buy-put') {
    const itm = simulation.stockPrice < simulation.strikePrice;
    const payoff = itm ? Math.max(simulation.strikePrice - simulation.stockPrice - simulation.premium, -simulation.premium) : -simulation.premium;
    const maxReturn = simulation.strikePrice - simulation.premium;
    const maxLoss = -simulation.premium;
    return { itm, payoff, maxReturn, maxLoss };
  } else if (simulation.strategy === 'vertical-spread') {
    const buyStrike = simulation.buyStrike || 100;
    const sellStrike = simulation.sellStrike || 105;
    const itm = simulation.stockPrice < buyStrike && simulation.stockPrice > sellStrike;
    const payoff = Math.max(Math.min(buyStrike - simulation.stockPrice, buyStrike - sellStrike) - simulation.premium, -simulation.premium);
    const maxReturn = buyStrike - sellStrike - simulation.premium;
    const maxLoss = -simulation.premium;
    return { itm, payoff, maxReturn, maxLoss };
  }
  return { itm: false, payoff: 0, maxReturn: 0, maxLoss: 0 };
};