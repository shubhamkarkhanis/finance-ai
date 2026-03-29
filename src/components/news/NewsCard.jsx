import Card from '../shared/Card';
import Tag from '../shared/Tag';

const NewsCard = ({ source, time, title, summary, aiAnalysis, aiSummary, sentiment, isSentimentLayout = false }) => {
    
    // Determine the content to display, preferring aiAnalysis or aiSummary, but falling back to summary
    const displayContent = aiAnalysis || aiSummary || summary || '';

    return (
        <Card>
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">{source} • {time}</div>
                <Tag type={sentiment}>{sentiment.toUpperCase()}</Tag>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            
            {/* Render summary only if it exists and is different from the AI analysis content */}
            {summary && summary !== displayContent && <p className="text-sm text-gray-300 mb-4">{summary}</p>}
            
            <div className="bg-[#0D1117] p-3 rounded-md">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    {isSentimentLayout ? 'AI SUMMARY' : 'AI ANALYSIS'}
                </p>
                {/* Use dangerouslySetInnerHTML to render HTML content from the API */}
                <div
                    className="text-sm text-gray-200 font-medium"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                />
            </div>
        </Card>
    );
};

export default NewsCard;