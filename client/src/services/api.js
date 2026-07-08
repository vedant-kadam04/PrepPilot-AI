import axios from "axios";
const api=axios.create({
    baseURL:"https://preppilot-ai-backend-frn3.onrender.com",
});
export default api;