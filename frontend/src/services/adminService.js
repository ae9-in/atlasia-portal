import api from "./api";

export const adminService = {
  async getStudents(search = "") {
    const { data } = await api.get("/api/admin/students", { params: { search } });
    return data;
  },
  async toggleStudentStatus(id) {
    const { data } = await api.patch(`/api/admin/students/${id}/toggle-status`);
    return data;
  }
};
