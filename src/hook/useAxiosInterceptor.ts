import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/request';


export function useAxiosInterceptor(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/LoginPage');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);
}
