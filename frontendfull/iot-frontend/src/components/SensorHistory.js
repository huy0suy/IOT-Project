import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './styles/SensorHistory.css';

const SensorHistory = () => {
    const [sensorData, setSensorData] = useState([]);
    const [temperatureFilter, setTemperatureFilter] = useState('');
    const [humidityFilter, setHumidityFilter] = useState('');
    const [lightFilter, setLightFilter] = useState('');
    const [outdoorTemperatureFilter, setOutdoorTemperatureFilter] = useState('');
    const [timestampInput, setTimestampInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    useEffect(() => {
        fetchSensorData();
    }, [page, temperatureFilter, humidityFilter, lightFilter, outdoorTemperatureFilter, rowsPerPage, startDate, endDate]);

    const fetchSensorData = () => {
        let url = `http://localhost:5001/sensor_history?page=${page}&limit=${rowsPerPage}`;

        // Apply filters to the URL
        if (temperatureFilter) url += `&temperature=${temperatureFilter}`;
        if (humidityFilter) url += `&humidity=${humidityFilter}`;
        if (lightFilter) url += `&light=${lightFilter}`;
        if (outdoorTemperatureFilter) url += `&outdoor_temperature=${outdoorTemperatureFilter}`;
        if (startDate && endDate) {
            url += `&start_time=${startDate}&end_time=${endDate}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.data) {
                    data.data.forEach((item, index) => {
                        item.id = (page - 1) * rowsPerPage + index + 1;
                        const formattedTimestamp = moment(item.timestamp).isValid()
                            ? moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')
                            : 'Invalid date';
                        item.timestamp = formattedTimestamp;
                    });
                    setTotalPages(Math.ceil(data.total_records / rowsPerPage));
                    setSensorData(data.data);
                } else {
                    setSensorData([]);
                }
            })
            .catch(error => console.error('Error fetching sensor history:', error));
    };

    const handleTimestampInputChange = (e) => {
        const inputTimestamp = e.target.value;
        setTimestampInput(inputTimestamp);

        if (moment(inputTimestamp, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            const inputMoment = moment(inputTimestamp);
            setStartDate(inputMoment.subtract(1, 'seconds').format('YYYY-MM-DD HH:mm:ss'));
            setEndDate(inputMoment.add(2, 'seconds').format('YYYY-MM-DD HH:mm:ss'));
        } else {
            setStartDate('');
            setEndDate('');
        }
    };

    const handleDeleteData = () => {
        fetch(`http://localhost:5001/clear_sensors`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                setSensorData([]);
                setPage(1);
            } else {
                console.error('Error deleting sensor data');
            }
        })
        .catch(error => console.error('Error deleting data:', error));
    };

    const handleSearch = () => {
        setPage(1);
        fetchSensorData();
    };

    return (
        <div>
            <div className="container-data">
                <h1>Sensor Data History</h1>
                <div className="filter-container">
                    <input
                        type="text"
                        placeholder="Temperature"
                        value={temperatureFilter}
                        onChange={(e) => setTemperatureFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Humidity"
                        value={humidityFilter}
                        onChange={(e) => setHumidityFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Light"
                        value={lightFilter}
                        onChange={(e) => setLightFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Outdoor Temperature"
                        value={outdoorTemperatureFilter}
                        onChange={(e) => setOutdoorTemperatureFilter(e.target.value)}
                    />

                    <label htmlFor="timestampInput">Timestamp:</label>
                    <input
                        type="text"
                        placeholder="YYYY-MM-DD HH:mm:ss"
                        value={timestampInput}
                        onChange={handleTimestampInputChange}
                        id="timestampInput"
                    />

                    <button onClick={handleDeleteData} className="button-delete">Delete Data</button>
                </div>

                {sensorData.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Temperature (°C)</th>
                                <th>Humidity (%)</th>
                                <th>Light (lux)</th>
                                <th>Outdoor Temperature (°C)</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensorData.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.id}</td>
                                    <td>{record.temperature}</td>
                                    <td>{record.humidity}</td>
                                    <td>{record.light}</td>
                                    <td>{record.outdoor_temperature}</td>
                                    <td>{record.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>No sensor data available</div>
                )}

                <div className="rows-per-page">
                    <label htmlFor="rowsPerPageSelect">Rows per page: </label>
                    <select
                        id="rowsPerPageSelect"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        onBlur={handleSearch}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={40}>40</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="pagination">
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={page === i + 1 ? 'active' : ''}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SensorHistory;
