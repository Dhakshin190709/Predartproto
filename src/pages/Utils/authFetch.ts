export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  
  if (options.body) {
    console.log('authFetch - Request body:', options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('authFetch - Response status:', response.status);

  if (response.status === 401 || response.status === 403) {
    // Clear session and redirect to login
    console.warn('authFetch - Unauthorized or forbidden. Clearing session and redirecting.');
    sessionStorage.clear();
    window.location.href = '/LoginPage'; // Update path if your login route is different
    return Promise.reject(new Error('Unauthorized or forbidden'));
  }

  return response;
};
