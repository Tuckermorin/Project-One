import React from 'react';
import type { OptionContract } from '../../models/OptionContract';
import { calculateProfitLoss } from '../../utils/profitLossCalculator';

interface PayoffDiagramProps {
  contract: OptionContract;
  width?: number;
  height?: number;
}

// Renders a simple payoff diagram as an inline SVG thumbnail
const PayoffDiagram: React.FC<PayoffDiagramProps> = ({ contract, width = 120, height = 80 }) => {
  const rangeFactor = 0.5; // +/-50% around strike
  const minPrice = contract.strikePrice * (1 - rangeFactor);
  const maxPrice = contract.strikePrice * (1 + rangeFactor);
  const steps = 20;
  const step = (maxPrice - minPrice) / steps;

  const plValues: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = minPrice + step * i;
    const { ifExercisedAtExpiration } = calculateProfitLoss(contract, price);
    plValues.push(ifExercisedAtExpiration);
  }

  const maxPL = Math.max(...plValues);
  const minPL = Math.min(...plValues);
  const range = maxPL - minPL || 1;

  const points = plValues
    .map((pl, i) => {
      const x = (i / steps) * width;
      const y = height - ((pl - minPL) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const breakevenY = height - ((0 - minPL) / range) * height;

  return (
    <svg width={width} height={height} className="text-blue-600">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
      <line x1={0} x2={width} y1={breakevenY} y2={breakevenY} stroke="#d1d5db" strokeWidth="1" />
    </svg>
  );
};

export default PayoffDiagram;
