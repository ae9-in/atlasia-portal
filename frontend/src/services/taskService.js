import api from "./api";

export const taskService = {
  async getTasks() {
    const { data } = await api.get("/api/tasks");
    return data;
  },
  async createTask(payload) {
    const { data } = await api.post("/api/tasks", payload);
    return data;
  },
  async deleteTask(id) {
    const { data } = await api.delete(`/api/tasks/${id}`);
    return data;
  }
};
