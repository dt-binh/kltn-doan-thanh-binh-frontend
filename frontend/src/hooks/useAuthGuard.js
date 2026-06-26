import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuthGuard = (roleRequired = null) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      // Nếu trang yêu cầu đăng nhập (có roleRequired) nhưng không có token/user,
      // điều hướng đến trang đăng nhập.
      if (roleRequired) {
        navigate("/login");
      }
      return;
    }

    // Nếu đã đăng nhập nhưng lại ở trang login hoặc register, điều hướng đi.
    if (location.pathname === '/login' || location.pathname === '/register') {
        if (user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }
        return;
    }

    // Kiểm tra quyền hạn nếu có yêu cầu (ví dụ: trang admin yêu cầu role 'admin')
    if (roleRequired && user.role !== roleRequired) {
      navigate("/"); // Điều hướng về trang chủ nếu không đúng quyền
    }
  }, [navigate, location.pathname, roleRequired]);
};

export default useAuthGuard;