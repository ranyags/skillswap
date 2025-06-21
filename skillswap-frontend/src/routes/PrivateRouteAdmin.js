import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
const PrivateRouteAdmin = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token)
        return _jsx(Navigate, { to: "/login" });
    try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        return decoded.role === "admin" ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/unauthorized" });
    }
    catch {
        return _jsx(Navigate, { to: "/login" });
    }
};
export default PrivateRouteAdmin;
