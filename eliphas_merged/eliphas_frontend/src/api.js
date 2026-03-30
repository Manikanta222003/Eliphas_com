import axios from 'axios'

const API = axios.create({
  baseURL: 'https://eliphas-com.onrender.com/api'  // 👈 replace with your Render URL
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export default API
