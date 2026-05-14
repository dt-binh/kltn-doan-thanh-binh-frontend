import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          email: formData.login,
          password: formData.password,
        }
      );

      // lưu token
      localStorage.setItem(
        "token",
        res.data.token
      );

      // lưu user
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Đăng nhập thành công!");

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Đăng nhập thất bại"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">
            Đăng nhập
          </h1>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-group">
              <label>
                Email hoặc tên đăng nhập
              </label>

              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Nhập email..."
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
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>

            <Link
              to="/forgot-password"
              className="login-forgot"
            >
              Quên mật khẩu?
            </Link>

            <button
              type="submit"
              className="login-btn"
            >
              Đăng nhập
            </button>
          </form>

          <p className="login-footer">
            Chưa có tài khoản?{" "}
            <Link to="/register">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;