import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../pages/user/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    // Mock register
    console.log('Register:', formData);
    alert('Đăng ký thành công! (Demo)');
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản để mua truyện dễ dàng hơn</p>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ tên</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
            <button type="submit" className="btn-primary">Đăng ký</button>
          </form>
          
          <p className="auth-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

