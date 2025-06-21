import axiosInstance from "./axiosInstance";
export const login = async (email, password) => {
    const response = await axiosInstance.post("/users/login", { email, password });
    const token = response.data.token;
    localStorage.setItem("token", token); // stocke le token
    return token;
};
const token = localStorage.getItem("token");
axiosInstance.get("/skills/user/1", {
    headers: { Authorization: `Bearer ${token}` }
});
