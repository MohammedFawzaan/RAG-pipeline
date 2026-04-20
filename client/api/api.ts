import axios from "axios";

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
});

// Auth
export const getMe = async () => {
    const response = await API.get("/auth/me");
    return response.data;
};

export const logout = async () => {
    const response = await API.post("/auth/logout");
    return response.data;
};

// Chat — now requires documentId
export const sendChatMessage = async (message: string, documentId: string) => {
    const response = await API.post("/chat", { message, documentId });
    return response.data;
};

// Upload
export const uploadPdf = async (formData: FormData) => {
    const response = await API.post("/upload/pdf", formData);
    return response.data; // returns { success, documentId, fileName }
};

// Files list
export const getFiles = async () => {
    const response = await API.get("/upload/files");
    return response.data; // returns { success, files: [{ documentId, fileName, uploadedAt }] }
};

export default API;