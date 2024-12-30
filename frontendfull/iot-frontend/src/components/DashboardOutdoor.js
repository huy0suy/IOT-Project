import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './styles/DashboardOutdoor.css';

const DashboardOutdoor = () => {
    const [outdoorTemperature, setOutdoorTemperature] = useState(0);
    const [outdoorHistory, setOutdoorHistory] = useState([]);
    const [timestamps, setTimestamps] = useState([]);
    const [isLed4On, setIsLed4On] = useState(false); // Đèn bếp
    const [isLed5On, setIsLed5On] = useState(false); // Đèn tủ
    const [led4Loading, setLed4Loading] = useState(false); // Loading state for LED4
    const [led5Loading, setLed5Loading] = useState(false); // Loading state for LED5

    // Fetch dữ liệu từ backend
    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`http://localhost:5001/latest_sensor_data`)
                .then((response) => response.json())
                .then((data) => {
                    setOutdoorTemperature(data.outdoor_temperature); // Cập nhật giá trị outdoor_temperature
                    setTimestamps((prev) => [...prev.slice(-9), data.timestamp]); // Lưu lại timestamp
                    setOutdoorHistory((prev) => [...prev.slice(-9), data.outdoor_temperature]); // Giữ lịch sử tối đa 10 giá trị
                })
                .catch((error) => console.error('Error fetching outdoor temperature:', error));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Xử lý bật/tắt LED4 và LED5
    const toggleLed = (ledNumber) => {
        const command = ledNumber === 4
            ? (isLed4On ? 'Led4_off' : 'Led4_on')
            : (isLed5On ? 'Led5_off' : 'Led5_on');
    

        if (ledNumber === 4) setIsLed4On(prev => !prev);
        else setIsLed5On(prev => !prev);

        // Set loading state to true while the request is being processed
        if (ledNumber === 4) setLed4Loading(true);
        else setLed5Loading(true);

        // Send the command to control the light
        fetch(`http://localhost:5001/control_light`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command }),
        })
            .then(() => {
                // Fetch updated light status immediately after controlling light
                fetch('http://localhost:5001/light-states')
                    .then(response => response.json())
                    .then(data => {
                        const status = data.status || {};
                        setIsLed4On(status.Led4?.status === 'on');
                        setIsLed5On(status.Led5?.status === 'on');
                    })
                    .catch((error) => console.error('Error fetching light status:', error))
                    .finally(() => {
                        // Reset loading state after response
                        if (ledNumber === 4) setLed4Loading(false);
                        else setLed5Loading(false);
                    });
            })
            .catch((error) => {
                console.error(`Error controlling LED${ledNumber}:`, error);
                if (ledNumber === 4) setLed4Loading(false);
                else setLed5Loading(false);
            });
    };

    // Dữ liệu biểu đồ
    const data = {
        labels: timestamps,  // Dùng timestamps cho trục hoành
        datasets: [
            {
                label: 'Nhiệt độ ngoài trời (°C)',
                data: outdoorHistory,
                borderColor: 'rgb(255, 165, 0)',
                backgroundColor: 'rgba(255, 165, 0, 0.5)',
                fill: false, // Không tô màu dưới biểu đồ
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Biểu đồ thay đổi nhiệt độ ngoài trời' },
        },
        scales: {
            x: {
                type: 'category', // Đảm bảo trục hoành là kiểu category để sử dụng timestamp
                title: {
                    display: true,
                    text: 'Thời gian',
                },
                ticks: {
                    autoSkip: true, // Tự động bỏ qua các giá trị không cần thiết
                    maxRotation: 90, // Xoay các nhãn trục hoành để dễ đọc
                    minRotation: 45,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Nhiệt độ (°C)',
                },
            },
        },
    };

    return (
        <div className="dashboard-outdoor">
            {/* Đặt outdoor temperature và các nút bật tắt đèn cùng 1 hàng */}
            <div className="sensor-display-and-controls">
                <div className="sensor-display">
                    <i className="fas fa-thermometer-half"></i>
                    <h2>Outdoor Temperature: {outdoorTemperature}°C</h2>
                </div>
                <div className="led-controls">
                    <button 
                        onClick={() => toggleLed(4)} 
                        className={isLed4On ? 'on' : 'off'} 
                        disabled={led4Loading}
                    >
                        <i className="fa-regular fa-lightbulb" style={{ color: isLed4On ? "red" : "black" }}></i>
                        {led4Loading ? 'Loading...' : isLed4On ? 'Tắt Đèn Bếp' : 'Bật Đèn Bếp'}
                    </button>
                    <button 
                        onClick={() => toggleLed(5)} 
                        className={isLed5On ? 'on' : 'off'} 
                        disabled={led5Loading}
                    >
                        <i className="fa-regular fa-lightbulb" style={{ color: isLed5On ? "red" : "black" }}></i>
                        {led5Loading ? 'Loading...' : isLed5On ? 'Tắt Đèn Tủ' : 'Bật Đèn Tủ'}
                    </button>
                </div>
            </div>

            <div className="chart-container">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default DashboardOutdoor;
