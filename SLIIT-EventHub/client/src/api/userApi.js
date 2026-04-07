import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const userClient = axios.create({
  baseURL: `${BASE_URL}/users`,
});

const userApi = {
  // Get all organizers for the Clubs page
  getAllOrganizers: async () => {
    const { data } = await userClient.get('/organizers');
    return data;
  }
};

export default userApi;
