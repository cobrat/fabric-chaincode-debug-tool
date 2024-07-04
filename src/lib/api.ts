import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8801',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (id: string, secret: string) => {
  const response = await api.post('/user/enroll', { id, secret });
  const token = response.data.token;
  localStorage.setItem('token', token);
  return token;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default api;