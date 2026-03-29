import Card from '../shared/Card';
import Sparkline from './Sparkline';

const CryptoCard = ({ name, symbol, price, change, percent_change, history }) => {
    const isPositive = change >= 0;

    return (
        <Card>
            <div>
                <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-semibold text-white">{name}</h3>
                    <p className="text-sm text-gray-400 font-mono">{symbol}</p>
                </div>
                <p className="text-3xl font-semibold my-2 text-white">
                    ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            <div className="h-24 my-4">
                <Sparkline data={history} isPositive={isPositive} />
            </div>
            <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <span>{change.toFixed(2)}</span>
                <span className="ml-1">({percent_change.toFixed(2)}%)</span>
                <span className="text-xs text-gray-500 ml-2">24h Change</span>
            </div>
        </Card>
    );
};

export default CryptoCard;