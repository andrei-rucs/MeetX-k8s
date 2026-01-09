import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ParallaxProvider } from "react-scroll-parallax";
import { Provider } from "react-redux";
import { store } from './application/store.ts';
import { Middleware, OpenAPI as OpenAPIConfig } from "../openapi/requests/core/OpenAPI.ts";
import axios, { AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { ThemeProvider } from './components/themes/theme-provider.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Set pentru a ține evidența mesajelor toast active
const activeToasts = new Set();

const queryClient = new QueryClient();

// Funcție pentru a afișa toast-urile de eroare fără duplicate
export const showErrorToast = (message: string) => {
  if (activeToasts.has(message)) {
    return;
  }
  activeToasts.add(message);
  toast.error(message, {
    onClose: () => activeToasts.delete(message),
  });
};

function isUnauthorizedError(error: any) {
  return error.status === 401;
}

export async function renewToken() {
  return await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/api/Authorization/RefreshToken`,
    {},
    {
      withCredentials: true,
    }
  );
}

let refreshingFunc: any = undefined;

const responseInterceptor: Middleware<AxiosResponse<any, any>> = async (error) => {
  const originalConfig = error.config;

  if (!isUnauthorizedError(error)) {
    showErrorToast(error?.data?.errorMessage?.message || error.data.Message);
    return error;
  }

  try {
    if (!refreshingFunc)
      refreshingFunc = renewToken();

    const response = await refreshingFunc;
    const token = response.data.response.token;
    localStorage.setItem('token', token);
    OpenAPIConfig.HEADERS = {
      "Authorization": "Bearer " + token
    }

    try {
      originalConfig.headers.Authorization = `Bearer ${token}`;
      return await axios.request(originalConfig);
    } catch (innerError: any) {
      if (isUnauthorizedError(innerError)) {
        throw innerError;
      } else {
        showErrorToast(innerError?.response?.data?.errorMessage?.message ||
          innerError.response?.data.Message);
      }
    }
  } catch (err) {
    window.location.href = "/login";
  } finally {
    refreshingFunc = undefined;
  }
  return error;
};

OpenAPIConfig.BASE = import.meta.env.VITE_BACKEND_URL;
OpenAPIConfig.WITH_CREDENTIALS = true;
OpenAPIConfig.HEADERS = {
  "Authorization": "Bearer " + localStorage.getItem("token")
}
OpenAPIConfig.interceptors.response.use(responseInterceptor);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ParallaxProvider>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  </ParallaxProvider>,
)
