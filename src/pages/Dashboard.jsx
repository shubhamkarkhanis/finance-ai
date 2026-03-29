import React, { useState, useEffect } from 'react';
import Card from '../components/shared/Card';
import Tag from '../components/shared/Tag';
import { LuBrainCircuit, LuSend } from 'react-icons/lu';
import { askAssistant, fetchMarketTrends } from '../api';
import { renderMarkdownToHtml } from '../utils/markdown'; // Ensure this utility exists and is imported
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

import { fetchDashboardOverview } from '../api';

const defaultMarketData = [
  { name: 'S&P 500', value: '4,891.23', change: '+42.75', percentage: '+0.88%', isPositive: true },
  { name: 'NASDAQ', value: '17,425.68', change: '+215.92', percentage: '+1.25%', isPositive: true },
  { name: 'Dow Jones', value: '38,109.43', change: '-118.27', percentage: '-0.31%', isPositive: false },
  { name: 'NIFTY 50', value: '25,145.10', change: '+238.45', percentage: '+0.96%', isPositive: true },
];

const recentAnalysisData = [
    { sector: 'Tech Sector', sentiment: 'BULLISH', summary: 'AI investments driving growth in major tech companies', isPositive: true },
    { sector: 'Energy Sector', sentiment: 'BEARISH', summary: 'New environmental policies impacting sector performance', isPositive: false },
];

// Quick AI Insights Component
const QuickAIInsights = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState("Hi! I'm your AI financial assistant. Ask me a quick question about the market.");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResponse('');
        try {
            const res = await askAssistant(prompt);
            setResponse(res.answer);
        } catch (error) {
            console.error(error);
            setResponse('Sorry, I was unable to get a response.');
        } finally {
            setLoading(false);
            setPrompt(''); // Clear prompt after sending
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-2">Quick AI Insights</h3>
            <div className="flex items-start gap-3 p-3 bg-[#0D1117] rounded-lg min-h-[120px]">
                <div className="bg-purple-500 p-2 rounded-full mt-1 flex-shrink-0"><LuBrainCircuit size={20} /></div>
                <div className="text-sm text-gray-300 flex-1 prose prose-invert max-w-full">
                    {loading 
                        ? <span className="animate-pulse">Getting insights...</span> 
                        : <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(response) }} />
                    }
                </div>
            </div>
            <div className="relative mt-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Which sector is best to invest in right now?"
                    className="w-full bg-[#0D1117] border border-gray-700 rounded-lg pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                    disabled={loading}
                />
                <button
                    disabled={loading || !prompt.trim()}
                    onClick={handleSend}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-blue-600 p-2 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <LuSend size={18} />
                </button>
            </div>
        </Card>
    );
};


// Market Trend Analysis Component
const MarketTrendAnalysis = () => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadChartData() {
            try {
                const data = await fetchMarketTrends();
                if (!data || !data.prices || data.prices.length === 0) {
                   setError("No chart data available at this time.");
                   return;
                }
                setChartData({
                    labels: data.dates,
                    datasets: [{
                        label: 'S&P 500 (SPY)',
                        data: data.prices,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 0,
                    }]
                });
            } catch (err) {
                setError("Could not load market trend data.");
                console.error(err);
            }
        }
        loadChartData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => `Price: $${context.parsed.y.toFixed(2)}`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: {
                    maxTicksLimit: 8,
                    color: '#9ca3af',
                }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: {
                    color: '#9ca3af',
                    callback: (value) => `$${value}`
                }
            }
        }
    };
    
    return (
        <Card>
            <h3 className="text-lg font-semibold">Market Trend Analysis: S&P 500 (Today)</h3>
            <div className="h-64 mt-4">
                {error && <p className="text-red-400 text-center mt-10">{error}</p>}
                {!chartData && !error && <p className="text-gray-400 text-center mt-10 animate-pulse">Loading chart...</p>}
                {chartData && <Line options={options} data={chartData} />}
            </div>
        </Card>
    );
};


const Dashboard = () => {
  const [marketData, setMarketData] = useState(defaultMarketData);

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await fetchDashboardOverview();
        if (data && data.length > 0) {
          const formatted = data.map(item => ({
            name: item.name,
            value: item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: item.change > 0 ? `+${item.change.toFixed(2)}` : `${item.change.toFixed(2)}`,
            percentage: item.change_percent > 0 ? `+${item.change_percent.toFixed(2)}%` : `${item.change_percent.toFixed(2)}%`,
            isPositive: item.change >= 0
          }));
          setMarketData(formatted);
        }
      } catch (err) {
        console.error('Failed to load market overview:', err);
      }
    }
    loadOverview();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketData.map((item) => (
            <Card key={item.name}>
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>{item.name}</span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-xs">{item.name.split(' ')[0]}</span>
              </div>
              <p className="text-3xl font-semibold my-2 text-white">{item.value}</p>
              <div className={`text-sm font-medium ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <span>{item.change}</span>
                <span className="ml-1">({item.percentage})</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <QuickAIInsights />
            <MarketTrendAnalysis />
        </div>

        <div className="lg:col-span-1">
            <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Analysis</h3>
                <div className="space-y-4">
                    {recentAnalysisData.map(item => (
                        <div key={item.sector}>
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium text-gray-300">{item.sector}</h4>
                                <Tag type={item.isPositive ? 'positive' : 'negative'}>{item.sentiment}</Tag>
                            </div>
                            <p className="text-sm text-gray-400">{item.summary}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;