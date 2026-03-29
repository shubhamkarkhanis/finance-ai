import { useEffect, useState } from 'react';
import { fetchCryptoData } from '../api';
import CryptoCard from '../components/crypto/CryptoCard';

const Crypto = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchCryptoData();
                setData(res || []);
            } catch (err) {
                console.error(err);
                setError('Could not load cryptocurrency data.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cryptocurrency Market</h1>
            </div>

            {loading && <div className="text-gray-400">Loading crypto data...</div>}
            {error && <div className="text-red-400 p-4 bg-red-500/10 rounded-md">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((crypto) => (
                    <CryptoCard
                        key={crypto.symbol}
                        name={crypto.name}
                        symbol={crypto.symbol}
                        price={crypto.price}
                        change={crypto.change}
                        percent_change={crypto.percent_change}
                        history={crypto.history}
                    />
                ))}
            </div>
        </div>
    );
};

export default Crypto;