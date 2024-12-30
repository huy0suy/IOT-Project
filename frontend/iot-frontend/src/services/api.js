// src/services/api.js
const API_URL = 'http://localhost:5001';

export const fetchData = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error.message); // Ghi rõ lỗi vào console
        throw error;
    }
};
