import api from "./api";

export const reportService = {
  async getMyReports() {
    const { data } = await api.get("/api/reports/my-reports");
    return data;
  },
  async upload(file) {
    const formData = new FormData();
    formData.append("report", file);
    const { data } = await api.post("/api/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  async getStatus() {
    const { data } = await api.get("/api/reports/status");
    return data;
  },
  async getAll() {
    const { data } = await api.get("/api/reports/all");
    return data;
  }
};
