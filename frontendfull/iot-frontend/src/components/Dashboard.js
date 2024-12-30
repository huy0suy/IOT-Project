import { useState, useEffect } from 'react';
import Charts from './Charts';
import Temperature from './temperature';
import Humidity from './humidity';
import Light from './light';
import Menu from './Menu';
import './styles/Dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Dashboard = () => {
    const [isLed1On, setIsLed1On] = useState(false);
    const [isLed2On, setIsLed2On] = useState(false);
    const [isLed3On, setIsLed3On] = useState(false);
    const [led1Loading, setLed1Loading] = useState(false);
    const [led2Loading, setLed2Loading] = useState(false);
    const [led3Loading, setLed3Loading] = useState(false);
    const [temperature, setTemperature] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [light, setLight] = useState(0);
    const [sensorHistory, setSensorHistory] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`http://localhost:5001/latest_sensor_data`)
                .then(response => response.json())
                .then(data => {
                    setTemperature(data.temperature);
                    setHumidity(data.humidity);
                    setLight(data.light);
                    setSensorHistory(prev => [
                        ...prev.slice(-9),
                        { timestamp: data.timestamp, temperature: data.temperature, humidity: data.humidity, light: data.light }
                    ]);
                })
                .catch(error => console.error('Error fetching sensor data:', error));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const toggleLed = (ledNumber) => {
        let command;
        let setLedState;
        let currentLedState;
        let setLoadingState;

        // Determine which LED to control
        if (ledNumber === 1) {
            command = isLed1On ? 'Led1_off' : 'Led1_on';
            setLedState = setIsLed1On;
            currentLedState = isLed1On;
            setLoadingState = setLed1Loading;
        } else if (ledNumber === 2) {
            command = isLed2On ? 'Led2_off' : 'Led2_on';
            setLedState = setIsLed2On;
            currentLedState = isLed2On;
            setLoadingState = setLed2Loading;
        } else {
            command = isLed3On ? 'Led3_off' : 'Led3_on';
            setLedState = setIsLed3On;
            currentLedState = isLed3On;
            setLoadingState = setLed3Loading;
        }

        // Set loading state to true while the request is being processed
        setLoadingState(true);

        fetch(`http://localhost:5001/control_light`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        })
            .then(() => {
                // After successful control, update the LED state after a delay
                setTimeout(() => {
                    setLedState(!currentLedState);
                    setLoadingState(false); // Reset loading state
                }, 2000);
            })
            .catch(error => {
                console.error('Error controlling LED:', error);
                setLoadingState(false); // Reset loading state on error
            });
    };

    return (
        <div className="dashboard">
            <div className="dashboard-functions">
                <div className="sensor-card">
                    <i className="fas fa-thermometer-half icon"></i>
                    <Temperature temperature={temperature} />
                </div>
                <div className="sensor-card">
                    <i className="fas fa-tint icon"></i>
                    <Humidity humidity={humidity} />
                </div>
                <div className="sensor-card">
                    <i className="fas fa-lightbulb icon"></i>
                    <Light light={light} />
                </div>
            </div>
            <div className="chart-and-controls">
                <div className="dashboard-charts">
                    <Charts thoitiet={sensorHistory} />
                </div>
                <div className="controls">
                    {[1, 2, 3].map(num => (
                        <button
                            key={num}
                            onClick={() => toggleLed(num)}
                            className={
                                (num === 1 && isLed1On) ||
                                (num === 2 && isLed2On) ||
                                (num === 3 && isLed3On)
                                    ? 'on'
                                    : 'off'
                            }
                            disabled={
                                (num === 1 && led1Loading) ||
                                (num === 2 && led2Loading) ||
                                (num === 3 && led3Loading)
                            }
                        >
                            {num === 1 ? (
                                <i
                                    className="fa-regular fa-lightbulb"
                                    style={{ color: isLed1On ? 'red' : 'black' }}
                                ></i>
                            ) : num === 2 ? (
                                <i
                                    className={`fa-solid fa-fan ${isLed2On ? 'spin' : 'fan-transition'}`}
                                    style={{
                                        color: isLed2On ? 'greenyellow' : 'black',
                                    }}
                                ></i>
                            ) : (
                                <i
                                    className={`fa-solid fa-wind ${isLed3On ? 'air-conditioner' : ''}`}
                                    style={{ color: isLed3On ? 'blue' : 'black' }}
                                ></i>
                            )}
                            {num === 1
                                ? led1Loading
                                    ? 'Loading...'
                                    : isLed1On
                                    ? ' Off'
                                    : ' On'
                                : num === 2
                                ? led2Loading
                                    ? 'Loading...'
                                    : isLed2On
                                    ? ' '
                                    : ' On'
                                : led3Loading
                                ? 'Loading...'
                                : isLed3On
                                ? ' Off'
                                : ' On'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
