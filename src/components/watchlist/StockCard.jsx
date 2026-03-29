import Card from '../shared/Card';
import { LuX } from 'react-icons/lu';

const StockCard = ({ name, ticker, price, change, percentage, isPositive, insight, onRemove }) => {
  return (
    <Card className="flex flex-col justify-between relative">
      <button
        onClick={() => onRemove(ticker)}
        className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-10"
        aria-label={`Remove ${ticker} from watchlist`}
      >
        <LuX size={20} />
      </button>
      <div>
        <div className="flex justify-between items-baseline pr-8">
          <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
          <p className="text-sm text-gray-400 font-mono">{ticker}</p>
        </div>
        <p className="text-3xl font-semibold my-2 text-white">${price?.toFixed(2)}</p>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{change?.toFixed(2)}</span>
          <span className="ml-1">({percentage})</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 font-semibold uppercase">AI INSIGHT</p>
        <p className="text-sm text-gray-300 mt-1">{insight}</p>
      </div>
    </Card>
  );
};

export default StockCard;