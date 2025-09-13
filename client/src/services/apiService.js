import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to include auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor to handle auth errors
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    setToken(token) {
        if (token) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.common['Authorization'];
        }
    }

    // Auth endpoints
    async login(email, password) {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    async adminSignup(email, password, companyName) {
        const response = await this.api.post('/auth/signup', {
            email,
            password,
            companyName
        });
        return response.data;
    }

    async inviteUser(email, password, role = 'member') {
        const response = await this.api.post('/auth/invite', {
            email,
            password,
            role
        });
        return response.data;
    }

    async getCurrentUser() {
        const response = await this.api.get('/auth/me');
        return response.data;
    }

    // Notes endpoints
    async getNotes() {
        const response = await this.api.get('/notes');
        return response.data;
    }

    async getNote(id) {
        const response = await this.api.get(`/notes/${id}`);
        return response.data;
    }

    async createNote(title, content) {
        const response = await this.api.post('/notes', { title, content });
        return response.data;
    }

    async updateNote(id, title, content) {
        const response = await this.api.put(`/notes/${id}`, { title, content });
        return response.data;
    }

    async deleteNote(id) {
        const response = await this.api.delete(`/notes/${id}`);
        return response.data;
    }

    // Tenant endpoints
    async getTenant(slug) {
        const response = await this.api.get(`/tenants/${slug}`);
        return response.data;
    }

    async upgradeTenant(slug) {
        const response = await this.api.post(`/tenants/${slug}/upgrade`);
        return response.data;
    }

    async getTenantUsers(slug) {
        const response = await this.api.get(`/tenants/${slug}/users`);
        return response.data;
    }

    // Health check
    async healthCheck() {
        const response = await this.api.get('/health', { baseURL: 'http://localhost:3001' });
        return response.data;
    }
}

export const apiService = new ApiService();
