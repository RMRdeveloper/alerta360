import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // NestJS default port
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
