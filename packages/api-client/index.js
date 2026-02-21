import axios from 'axios';
export const useProfileApi = (baseUrl) => {
    const uploadImage = async (userId, formData) => {
        return axios.post(`${baseUrl}/api/user/${userId}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };
    return { uploadImage };
};
