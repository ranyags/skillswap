import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : _jsx(Navigate, { to: "/login", replace: true });
};
export default PrivateRoute;
