const API_BASE_URL = 'https://coding-contest-kayn.onrender.com/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('jwt_token') || null;
        this.user = JSON.parse(localStorage.getItem('user_details')) || null;
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_details', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_details');
    }

    isAuthenticated() {
        return this.token !== null;
    }

    isAdmin() {
        return this.user && this.user.role === 'ADMIN';
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        options.headers = { ...this.getHeaders(), ...options.headers };

        try {
            const response = await fetch(url, options);
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.message || data.error || 'Something went wrong';
                const err = new Error(errorMsg);
                err.status = response.status;
                err.validationErrors = data.validationErrors || null;
                throw err;
            }
            return data;
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }

    // 1. Auth API
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setAuth(data.token, {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        });
        return data;
    }

    async register(name, email, password, role) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });
    }

    // 2. Contests API
    async getContests() {
        return await this.request('/contests');
    }

    async getContest(id) {
        return await this.request(`/contests/${id}`);
    }

    async createContest(contestData) {
        return await this.request('/contests', {
            method: 'POST',
            body: JSON.stringify(contestData)
        });
    }

    async updateContest(id, contestData) {
        return await this.request(`/contests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contestData)
        });
    }

    async deleteContest(id) {
        return await this.request(`/contests/${id}`, {
            method: 'DELETE'
        });
    }

    // 3. Questions API
    async getQuestions(contestId) {
        return await this.request(`/contests/${contestId}/questions`);
    }

    async getQuestion(id) {
        return await this.request(`/questions/${id}`);
    }

    async createQuestion(contestId, questionData) {
        return await this.request(`/contests/${contestId}/questions`, {
            method: 'POST',
            body: JSON.stringify(questionData)
        });
    }

    async updateQuestion(id, questionData) {
        return await this.request(`/questions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(questionData)
        });
    }

    async deleteQuestion(id) {
        return await this.request(`/questions/${id}`, {
            method: 'DELETE'
        });
    }

    // 4. Test Cases API (Admin only)
    async getTestCases(questionId) {
        return await this.request(`/questions/${questionId}/testcases`);
    }

    async createTestCase(questionId, tcData) {
        return await this.request(`/questions/${questionId}/testcases`, {
            method: 'POST',
            body: JSON.stringify(tcData)
        });
    }

    async updateTestCase(id, tcData) {
        return await this.request(`/testcases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tcData)
        });
    }

    async deleteTestCase(id) {
        return await this.request(`/testcases/${id}`, {
            method: 'DELETE'
        });
    }

    // 5. Submissions API
    async submitSolution(sourceCode, language, questionId) {
        return await this.request('/submissions', {
            method: 'POST',
            body: JSON.stringify({ sourceCode, language, questionId })
        });
    }

    async getSubmission(id) {
        return await this.request(`/submissions/${id}`);
    }

    async getSubmissionHistory() {
        return await this.request('/submissions/history');
    }

    async getAllSubmissions() {
        return await this.request('/submissions');
    }

    // 6. Leaderboard API
    async getLeaderboard(contestId) {
        return await this.request(`/contests/${contestId}/leaderboard`);
    }
}

const api = new ApiClient();
window.api = api; // Expose globally for testing/fallback
export default api;
export { api };
