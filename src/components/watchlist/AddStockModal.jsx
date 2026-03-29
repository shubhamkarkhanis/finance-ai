import { useState } from 'react';

const AddStockModal = ({ isOpen, onClose, onAddStock }) => {
  const [ticker, setTicker] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      onAddStock(ticker.trim().toUpperCase());
      setTicker('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#161B22] p-6 rounded-lg border border-gray-700 w-full max-w-sm mx-4">
        <h2 className="text-xl font-semibold mb-4">Add Stock to Watchlist</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-400 mb-1">
            Stock Ticker
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g., AAPL, MSFT"
            className="w-full bg-[#0D1117] border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;