import axios from "axios";

export const bankApi = axios.create({
  baseURL: "http://localhost:8082/api"
});
