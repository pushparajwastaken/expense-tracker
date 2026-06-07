import axios from "axios";

const API = axios.create({
  withCredentials: true,
});

export default API;
