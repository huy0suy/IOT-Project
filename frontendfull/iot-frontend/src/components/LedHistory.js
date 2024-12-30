import React, { useState, useEffect } from 'react';
import Menu from './Menu';
import moment from 'moment';
import './styles/LedHistory.css';

const LedHistory = () => {
    const [deviceHistory, setDeviceHistory] = useState([]);
    const [deviceName, setDeviceName] = useState('');
    const [timestampInput, setTimestampInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tempInputPage, setTempInputPage] = useState(20);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // Fetch device control history data based on filters
    const fetchDeviceHistory = () => {
        let url = `http://localhost:5001/device_control_history?page=${page}&limit=${rowsPerPage}`;

        // Add device filter to the URL
        if (deviceName) {
            url += `&device=${deviceName}`;
        }

        // Add date range filter to the URL
        if (startDate && endDate) {
            url += `&start_time=${startDate}&end_time=${endDate}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.data.forEach((item, index) => {
                    item.id = index + 1 + (page - 1) * rowsPerPage; // Unique ID for rendering
                    item.timestamp = moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss');
                });

                setTotalPages(Math.ceil(data.total_records / rowsPerPage));
                setDeviceHistory(data.data); 
            })
            .catch(error => console.error('Error fetching device history:', error));
    };

    useEffect(() => {
        fetchDeviceHistory(); // Fetch data when the component mounts or when filters change
    }, [page, deviceName, rowsPerPage, startDate, endDate]);

    const handleUpdateRowsPerPage = () => {
        const newRowsPerPage = parseInt(tempInputPage, 10);
        if (newRowsPerPage > 0) {
            setRowsPerPage(newRowsPerPage);
            setPage(1); // Reset to first page
        }
    };

    const handleDeleteData = () => {
        fetch(`http://localhost:5001/clear_device_history`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    setDeviceHistory([]); // Clear device history
                    setPage(1); // Reset to first page
                } else {
                    console.error('Error deleting data');
                }
            })
            .catch(error => console.error('Error deleting data:', error));
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

    const handleSearch = () => {
        setPage(1); 
        fetchDeviceHistory(); 
    };

    return (
        <div>
            <div className="container-data">
                <h1>Device Control History</h1>

                {/* Device and Date Filters */}
                <div className="filter-container">
                    <select 
                        value={deviceName} 
                        onChange={(e) => setDeviceName(e.target.value)} 
                        className="rows-per-page-select"
                    >
                        <option value="">Tất cả Thiết Bị</option>
                        <option value="Đèn LED">Đèn LED</option>
                        <option value="Quạt">Quạt</option>
                        <option value="Máy lạnh">Máy lạnh</option>
                        <option value="Đèn bếp">Đèn bếp</option> {/* LED4 */}
                        <option value="Đèn tủ">Đèn tủ</option> {/* LED5 */}
                    </select>

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

                {/* Data Table */}
                {deviceHistory.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Device Name</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deviceHistory.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.id}</td>
                                    <td>{data.device}</td>
                                    <td>{data.command.includes('_on') ? 'On' : 'Off'}</td>
                                    <td>{data.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>No device control history available</div>
                )}

                {/* Rows per Page Selector */}
                <div className="rows-per-page">
                    <label htmlFor="rowsPerPageSelect">Rows per page: </label>
                    <select
                        id="rowsPerPageSelect"
                        value={tempInputPage}
                        onChange={(e) => setTempInputPage(e.target.value)}
                        onBlur={handleUpdateRowsPerPage}
                        className="rows-per-page-select"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={40}>40</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Pagination Controls */}
                <div className="pagination">
                    <button
                        className="btn-pagination btn-prev"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={`page-number ${page === i + 1 ? 'active' : ''}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="btn-pagination btn-next"
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

export default LedHistory;
