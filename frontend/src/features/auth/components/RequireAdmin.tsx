import { Navigate, Outlet, useLocation } from "react-router";

import { getAdminToken } from "../services/adminSession";

function RequireAdmin() {
  const location = useLocation();

  if (!getAdminToken()) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export default RequireAdmin;
