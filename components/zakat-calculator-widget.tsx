'use client';
import { useState, useEffect } from 'react';

const ZakatCalculator: React.FC = () => {
  const [gold, setGold] = useState<string>(''); // In grams
  const [silver, setSilver] = useState<string>(''); // In grams
  const [cash, setCash] = useState<string>(''); // In USD
  const [debts, setDebts] = useState<string>(''); // In USD
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(0);
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(0);
  const [nisabGold, setNisabGold] = useState<number>(0);
  const [nisabSilver, setNisabSilver] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);


  // Nisab thresholds in grams (Hanafi method)
  const GOLD_NISAB_GRAMS = 87.48;
  const SILVER_NISAB_GRAMS = 612;

  useEffect(() => {
    const fetchMetalPrices = async () => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
  
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow' as const,
      };
  
      try {
        // Fetch Gold (XAU) price
        const goldResponse = await fetch('https://api.gold-api.com/price/XAU', requestOptions);
        const goldData = await goldResponse.json();
        if (!goldData.price) throw new Error('Gold API failed');
        const goldPricePerOunce = goldData.price;
        const goldPricePerGram = goldPricePerOunce / 28.34952; 
        setGoldPricePerGram(goldPricePerGram);
        setNisabGold(GOLD_NISAB_GRAMS * goldPricePerGram);
  
        // Fetch Silver (XAG) price
        const silverResponse = await fetch('https://api.gold-api.com/price/XAG', requestOptions);
        const silverData = await silverResponse.json();
        if (!silverData.price) throw new Error('Silver API failed');
        const silverPricePerOunce = silverData.price;
        const silverPricePerGram = silverPricePerOunce / 28.34952; 
        setSilverPricePerGram(silverPricePerGram);
        setNisabSilver(SILVER_NISAB_GRAMS * silverPricePerGram);
  
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch metal prices. Please try again later.');
        setLoading(false);
      }
    };
  
    fetchMetalPrices();
  }, []);
  

  // Calculate Zakat
  const calculateZakat = (): void => {
    setError('');
    setZakatAmount(null);

    // Convert inputs to numbers, default to 0 if empty or invalid
    const goldValue = parseFloat(gold) || 0;
    const silverValue = parseFloat(silver) || 0;
    const cashValue = parseFloat(cash) || 0;
    const debtsValue = parseFloat(debts) || 0;

    // Validation: Ensure non-negative values
    if (goldValue < 0 || silverValue < 0 || cashValue < 0 || debtsValue < 0) {
      setError('All values must be non-negative.');
      return;
    }

    // Calculate total wealth in USD
    const totalWealth =
      goldValue * goldPricePerGram + // Gold value
      silverValue * silverPricePerGram + // Silver value
      cashValue - // Cash
      debtsValue; // Debts

    // Determine the applicable Nisab (lower of gold or silver in USD)
    const applicableNisab = Math.min(nisabGold, nisabSilver);

    // Check if wealth meets Nisab or silver exceeds 612g
    if (totalWealth < applicableNisab && silverValue < SILVER_NISAB_GRAMS) {
      setError(`Your wealth ($${totalWealth.toFixed(2)}) is below the Nisab threshold ($${applicableNisab.toFixed(2)}). No Zakat is due.`);
      return;
    }

    // Calculate Zakat (2.5% of total Zakatable wealth)
    const zakat = totalWealth * 0.025;
    setZakatAmount(zakat);
  };

  return (
    <div className="zakat-calculator bg-white p-6 rounded-lg shadow-lg w-full max-w-[300px] mx-auto mt-4 min-h-[500px]">
      <h2 className="text-2xl font-heading font-semibold text-[#0D7A3B] mb-4 text-center">Zakat Calculator</h2>
      <p className="text-sm text-gray-600 mb-3 text-center">
        Enter wealth held for one lunar year. Consult a scholar for complex cases.
      </p>

      {loading && (
        <p className="text-center text-gray-500">Loading metal prices...</p>
      )}

      <div className="mb-3">
        <label htmlFor="gold" className="block text-sm font-medium text-gray-700">Gold (in grams)</label>
        <input
          id="gold"
          type="number"
          value={gold}
          onChange={(e) => setGold(e.target.value)}
          placeholder="Enter amount"
          min="0"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D7A3B]"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="silver" className="block text-sm font-medium text-gray-700">Silver (in grams)</label>
        <input
          id="silver"
          type="number"
          value={silver}
          onChange={(e) => setSilver(e.target.value)}
          placeholder="Enter amount"
          min="0"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D7A3B]"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="cash" className="block text-sm font-medium text-gray-700">Cash/Savings (in USD)</label>
        <input
          id="cash"
          type="number"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          placeholder="Enter amount"
          min="0"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D7A3B]"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="debts" className="block text-sm font-medium text-gray-700">Debts (in USD)</label>
        <input
          id="debts"
          type="number"
          value={debts}
          onChange={(e) => setDebts(e.target.value)}
          placeholder="Enter amount"
          min="0"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D7A3B]"
        />
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateZakat}
        disabled={loading}
        className={`w-full py-3 bg-[#0D7A3B] text-white font-bold rounded-md mt-3 transition-all duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0D7A3B]/90'
        }`}
      >
        Calculate Zakat
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Zakat Result */}
      {zakatAmount !== null && !error && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-[#0D7A3B]">Your Zakat Amount:</p>
          <p className="text-xl font-bold">{zakatAmount.toFixed(2)} USD</p>

          <div className="mt-6 text-left text-sm">
            <h3 className="text-lg font-semibold text-[#0D7A3B]">Calculation Steps:</h3>
            <ol className="list-decimal pl-4">
              <li><strong>Nisab Threshold:</strong> We use the lower of gold (87.48g) or silver (612g). In this case, the applicable Nisab is <strong>${Math.min(nisabGold, nisabSilver).toFixed(2)} USD</strong>.</li>
              <li><strong>Total Wealth:</strong> Total wealth is calculated as: (Gold * Gold Price) + (Silver * Silver Price) + Cash - Debts. In this case, your total wealth is <strong>${(parseFloat(gold) || 0) * goldPricePerGram + (parseFloat(silver) || 0) * silverPricePerGram + (parseFloat(cash) || 0) - (parseFloat(debts) || 0)}</strong>.</li>
              <li><strong>Zakat Calculation:</strong> Zakat is calculated as 2.5% of the zakatable wealth, which is <strong>${zakatAmount.toFixed(2)} USD</strong>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Price Info */}
      {!loading && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Gold: ${goldPricePerGram.toFixed(2)}/g | Silver: ${silverPricePerGram.toFixed(2)}/g | 
          Nisab (Gold): ${nisabGold.toFixed(2)} USD | Nisab (Silver): ${nisabSilver.toFixed(2)} USD
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1 text-center">
        Note: Uses lower of gold (87.48g) or silver (612g) Nisab per Hanafi method. Prices from GoldAPI.io.
      </p>
    </div>
  );
};

export default ZakatCalculator;
