import { useEffect, useState } from 'react';
import NewsCard from '../components/news/NewsCard';
import { fetchNews } from '../api';

const MarketNews = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchNews();
                setArticles(data || []);
            } catch (err) {
                console.error(err);
                setError('Could not load news.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Market News</h1>
                <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    🔄 Refresh
                </button>
            </div>
            {loading && <div className="text-gray-400">Loading news...</div>}
            {error && <div className="text-red-400">{error}</div>}
            <div className="space-y-6">
                {articles.map((newsItem, index) => (
                    <NewsCard key={index} source={newsItem.source || 'News'} time={newsItem.timestamp || ''} title={newsItem.headline} summary={newsItem.summary} aiAnalysis={newsItem.ai_analysis} sentiment={(newsItem.sentiment || 'neutral').toLowerCase()} />
                ))}
            </div>
        </div>
    );
};

export default MarketNews;