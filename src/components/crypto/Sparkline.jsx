import { Line } from 'react-chartjs-2';

const Sparkline = ({ data, isPositive }) => {
    const chartData = {
        labels: data.map((_, index) => index), // Use index for labels
        datasets: [{
            data: data,
            borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        scales: {
            x: { display: false },
            y: { display: false },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default Sparkline;