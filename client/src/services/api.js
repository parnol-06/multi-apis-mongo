import axios from 'axios';

const USERS_API = process.env.REACT_APP_USERS_API || 'http://localhost:4001';
const PRODUCTS_API = process.env.REACT_APP_PRODUCTS_API || 'http://localhost:4002';

export const usersApi = axios.create({
  baseURL: USERS_API,
  headers: { 'Content-Type': 'application/json' }
});

export const productsApi = axios.create({
  baseURL: PRODUCTS_API,
  headers: { 'Content-Type': 'application/json' }
});
