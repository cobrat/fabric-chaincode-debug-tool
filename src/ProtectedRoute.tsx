import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
  const { token, loading, checkAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const result = await checkAuth();
      setIsAuthenticated(result);
    };
    verifyAuth();
  }, [checkAuth]);

  if (loading || isAuthenticated === null) {
    // 显示加载中的UI
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // 用户未认证，重定向到登录页面，并记住当前URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 用户已认证，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;