import api from "./api";

export const dailyReportService = {
  /**
   * Upload a daily report
   */
  async upload(file) {
    const formData = new FormData();
    formData.append("report", file);
    const { data } = await api.post("/api/daily-reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  /**
   * Get all daily reports for the current student
   */
  async getMyReports() {
    const { data } = await api.get("/api/daily-reports/my-reports");
    return data;
  },

  /**
   * Get today's submission status for the current student
   */
  async getTodayStatus() {
    const { data } = await api.get("/api/daily-reports/today-status");
    return data;
  },

  /**
   * Get all daily reports (Admin only)
   */
  async getAllReports(params) {
    const { data } = await api.get("/api/daily-reports/all", { params });
    return data;
  },

  /**
   * Update a report status (Admin only)
   */
  async updateStatus(id, payload) {
    const { data } = await api.patch(`/api/daily-reports/${id}/status`, payload);
    return data;
  }
};
