import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'basics',
    title: 'Options Basics',
    content: (
      <div className="space-y-4">
        <p>
          Options give the buyer the right, but not the obligation, to buy or sell an underlying security at a specific price before a certain date. A call option is a bet that prices will rise, while a put option profits when prices fall.
        </p>
        <p>
          Each option controls 100 shares of stock. The price you pay (or receive) for that control is called the premium.
        </p>
      </div>
    )
  },
  {
    id: 'strategies',
    title: 'Common Strategies',
    content: (
      <div className="space-y-4">
        <p>Popular approaches include:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Buying Calls/Puts</strong> – a straightforward bullish or bearish trade.</li>
          <li><strong>Covered Call</strong> – selling calls against stock you own for extra income.</li>
          <li><strong>Protective Put</strong> – buying puts to hedge downside risk on stock.</li>
          <li><strong>Straddle/Strangle</strong> – buying both calls and puts to bet on big moves.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'advanced',
    title: 'Advanced Strategies',
    content: (
      <div className="space-y-4">
        <p>More complex spreads can help control risk and cost:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Vertical Spreads</strong> – buy and sell options at different strikes.</li>
          <li><strong>Iron Condor</strong> – combine call and put spreads to profit from low volatility.</li>
          <li><strong>Calendar Spread</strong> – sell short‑term options and buy longer‑term ones.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'risks',
    title: 'Risks & Tips',
    content: (
      <div className="space-y-4">
        <p>
          Options can expire worthless and complex positions may carry unlimited loss potential. Always understand the maximum loss and monitor positions closely.
        </p>
        <p>
          Liquidity and time decay are key factors. Be cautious with strategies you don\'t fully understand.
        </p>
      </div>
    )
  }
];

const OptionsGuide: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [active, setActive] = useState(sections[0].id);
  const current = sections.find(s => s.id === active) || sections[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      <aside className="hidden sm:block w-56 bg-white border-r border-gray-200 p-6">
        <nav className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={`text-left w-full py-2 px-3 rounded-lg transition-colors ${active === section.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={onBack} variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{current.title}</h2>
          </div>
          <div className="prose max-w-none">
            {current.content}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OptionsGuide;
