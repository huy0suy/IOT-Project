import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Charts = ({ thoitiet }) => {
    const data = {
        labels: thoitiet.map(item => item.timestamp), // Sử dụng timestamp làm trục hoành
        datasets: [
            {
                label: 'Nhiệt độ (°C)',
                data: thoitiet.map(item => item.temperature),
                borderColor: 'rgb(255, 165, 0)',
                backgroundColor: 'rgba(255, 165, 0, 0.5)',
                fill: false,
            },
            {
                label: 'Độ ẩm (%)',
                data: thoitiet.map(item => item.humidity),
                borderColor: 'rgb(0, 123, 255)',
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                fill: false,
            },
            {
                label: 'Ánh sáng (lux)',
                data: thoitiet.map(item => item.light),
                borderColor: 'rgb(0, 255, 0)',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                fill: false,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ thay đổi nhiệt độ, độ ẩm, ánh sáng',
            },
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Thời gian'
                },
                ticks: {
                    autoSkip: true,
                    maxRotation: 90,
                    minRotation: 45
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Giá trị'
                }
            }
        }
    };

    return (
        <div>
            <Line data={data} options={options} />
        </div>
    );
};

export default Charts;
