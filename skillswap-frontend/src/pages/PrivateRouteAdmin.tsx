import { Navigate } from "react-router-dom";
import React, { JSX } from "react";

const PrivateRouteAdmin = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.role === "admin" ? children : <Navigate to="/unauthorized" />;
  } catch {
    return <Navigate to="/login" />;
  }
};

export default PrivateRouteAdmin;
