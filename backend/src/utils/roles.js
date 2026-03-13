const normalizeRole = (role) => {
  if (!role) {
    return role;
  }

  const value = String(role).trim().toUpperCase();

  if (value === "ADMIN" || value === "SUPERADMIN" || value === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }

  if (value === "COORDINATOR") {
    return "COORDINATOR";
  }

  if (value === "STUDENT") {
    return "STUDENT";
  }

  return value;
};

module.exports = {
  normalizeRole
};
