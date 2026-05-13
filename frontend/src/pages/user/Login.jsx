import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError(""); // reset lỗi khi người dùng nhập lại
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo account
    const demoUser = {
      login: "admin@gmail.com",
      password: "123456",
    };

    if (
      formData.login !== demoUser.login ||
      formData.password !== demoUser.password
    ) {
      setError("Sai tài khoản hoặc mật khẩu!");
      return;
    }

    alert("Đăng nhập thành công! (Demo)");
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Đăng nhập</h1>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-group">
              <label>Email hoặc tên đăng nhập</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Link to="/forgot-password" className="login-forgot">
              Quên mật khẩu?
            </Link>

            <button type="submit" className="login-btn">
              Đăng nhập
            </button>
          </form>

          <p className="login-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>

          <p style={{ marginTop: "10px", fontSize: "13px", color: "#777" }}>
            Demo: admin@gmail.com / 123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;