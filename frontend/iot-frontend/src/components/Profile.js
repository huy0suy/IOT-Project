import React from 'react';
import './styles/Profile.css';

// Mảng ảnh ngẫu nhiên
const randomImages = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/men/2.jpg',
    'https://randomuser.me/api/portraits/men/3.jpg',
    'https://randomuser.me/api/portraits/men/4.jpg',
    'https://randomuser.me/api/portraits/men/5.jpg',
];

// Chọn ngẫu nhiên 1 ảnh
const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];

const Profile = () => (
    <div className="profile">
        <div className="profile-header">
            <img src={randomImage} alt="Profile" className="profile-img" />
        </div>
        <h1>Thông tin cá nhân</h1>
        <p><strong>Họ tên:</strong> Nguyễn Xuân Huy</p>
        <p><strong>Mã sinh viên:</strong> B21DCCN438</p>
        <p><strong>Lớp:</strong> D21HTTT03</p>
        <p><strong>Github:</strong> <a href="https://github.com/huy0suy" target="_blank" rel="noopener noreferrer">https://github.com/huy0suy</a></p>
        <p><strong>Link tài liệu:</strong> <a href="https://docs.google.com/document/d/1oXXAFYsqwtieXZEg0ddXB1qVJBLdPfDI/edit?usp=sharing&ouid=103820745479640151689&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer">Link đến tài liệu PDF</a></p>
    </div>
);

export default Profile;
