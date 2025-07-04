import axios from "axios";

const API_BASE = "http://localhost:5000";

export const fetchSites = (bounds) => {
  return axios.post(`${API_BASE}/sites`, { bounds });
};

export const getDownloadUrls = (siteName, filters) => {
  return axios.post(`${API_BASE}/download-urls`, { 
    siteName, 
    filters 
  });
};

export const requestDownload = (region, filters) => {
  return axios.post(`${API_BASE}/download`, { region, filters });
};