import api from "./api";

export const atlasiaService = {
  async getMyTasks() {
    const { data } = await api.get("/api/tasks/my-tasks");
    return data;
  },
  async getAllTasks() {
    const { data } = await api.get("/api/tasks/all");
    return data;
  },
  async createTask(payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "attachments") {
        for (const file of value || []) {
          formData.append("attachments", file);
        }
      } else {
        formData.append(key, value);
      }
    });
    const { data } = await api.post("/api/tasks/create", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  async addComment(payload) {
    const { data } = await api.post("/api/tasks/comment", payload);
    return data;
  },
  async deleteTask(id) {
    const { data } = await api.delete(`/api/tasks/${id}`);
    return data;
  },
  async getBusinesses() {
    const { data } = await api.get("/api/business/all");
    return data;
  },
  async createBusiness(payload) {
    const { data } = await api.post("/api/business/create", payload);
    return data;
  },
  async deleteBusiness(id) {
    const { data } = await api.delete(`/api/business/${id}`);
    return data;
  },
  async getSprints() {
    const { data } = await api.get("/api/sprint/all");
    return data;
  },
  async createSprint(payload) {
    const { data } = await api.post("/api/sprint/create", payload);
    return data;
  },
  async uploadReport(taskId, file) {
    const formData = new FormData();
    formData.append("report", file);
    formData.append("taskId", taskId);
    const { data } = await api.post(`/api/reports/upload/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  async getStudentReports() {
    const { data } = await api.get("/api/reports/student");
    return data;
  },
  async getTaskReports(taskId) {
    const { data } = await api.get("/api/reports/task", { params: { taskId } });
    return data;
  },
  async getUsers(role) {
    const { data } = await api.get("/api/admin/users", { params: role ? { role } : {} });
    return data;
  },
  async createUser(payload) {
    const { data } = await api.post("/api/admin/users", payload);
    return data;
  },
  async getCoordinatorOverview() {
    const { data } = await api.get("/api/admin/coordinator-overview");
    return data;
  },
  async getSuperOverview() {
    const { data } = await api.get("/api/admin/super-overview");
    return data;
  }
};
