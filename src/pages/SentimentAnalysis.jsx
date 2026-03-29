import { useEffect, useState } from 'react';
import NewsCard from '../components/news/NewsCard';
import { fetchNews } from '../api';

const SentimentAnalysis = () => {
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
                setError('Could not load sentiment data.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">News Sentiment Analysis</h1>
                <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    🔄 Refresh
                </button>
            </div>
            {loading && <div className="text-gray-400">Loading sentiment analysis...</div>}
            {error && <div className="text-red-400">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((item, index) => (
                    <NewsCard key={index} source={item.source || 'News'} time={item.timestamp || ''} title={item.headline} aiSummary={item.summary || item.ai_summary} sentiment={(item.sentiment || 'neutral').toLowerCase()} isSentimentLayout={true} />
                ))}
            </div>
        </div>
    );
}

export default SentimentAnalysis;
