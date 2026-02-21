import axios from 'axios';
const api = axios.create({
    // Ensure there is NO trailing slash here if you add a leading slash in your .post() calls
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
});
export default api;
