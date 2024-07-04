import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();

  if (!token) {
    // 用户未认证，重定向到登录页面
    return <Navigate to="/login" replace />;
  }

  // 用户已认证，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;