const normalizeRole = (role) => {
  if (!role) {
    return role;
  }

  const value = String(role).trim().toUpperCase();

  if (value === "SUPERADMIN" || value === "SUPER_ADMIN") {
    return "SUPERADMIN";
  }

  if (value === "ADMIN" || value === "COORDINATOR") {
    return "ADMIN";
  }

  if (value === "STUDENT") {
    return "STUDENT";
  }

  return value;
};

module.exports = {
  normalizeRole
};
