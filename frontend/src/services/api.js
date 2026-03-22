import axios from "axios";

export const carApi = axios.create({
  baseURL: "http://localhost:8081/api"
});
