// ==============================================================================
// AdaptiveMath — Production-grade Unified API Client
// ==============================================================================

export class ApiError extends Error {
  constructor({ status, code, message, requestId, details = null }) {
    super(message || 'Đã có lỗi xảy ra trong quá trình xử lý yêu cầu.');
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'UNKNOWN_ERROR';
    this.requestId = requestId;
    this.details = details;
  }
}

const DEFAULT_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : '/api/v1';

function generateRequestId() {
  return 'req_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    retryCount = 0,
    maxRetries = method === 'GET' ? 2 : 0,
    ...customConfig
  } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${DEFAULT_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const requestId = headers['x-request-id'] || generateRequestId();

  const config = {
    method,
    credentials: 'include', // Guarantees HttpOnly session cookie is transmitted
    headers: {
      'x-request-id': requestId,
      ...headers
    },
    ...customConfig
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    // Network failure (offline, DNS failure, ECONNREFUSED)
    if (retryCount < maxRetries) {
      const delayMs = 400 * Math.pow(2, retryCount);
      await sleep(delayMs);
      return request(endpoint, {
        ...options,
        retryCount: retryCount + 1
      });
    }

    throw new ApiError({
      status: 0,
      code: 'NETWORK_OFFLINE',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng của bạn.',
      requestId
    });
  }

  const serverRequestId = response.headers.get('x-request-id') || requestId;

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  let responseData;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let errorCode = 'HTTP_ERROR_' + response.status;
    let errorMessage = 'Yêu cầu không thành công.';
    let details = null;

    if (responseData && typeof responseData === 'object') {
      errorCode = responseData.code || responseData.error || errorCode;
      errorMessage = responseData.message || errorMessage;
      details = responseData.details || responseData.errors || null;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', ');
      }
    } else if (typeof responseData === 'string' && responseData.length > 0) {
      errorMessage = responseData;
    }

    throw new ApiError({
      status: response.status,
      code: errorCode,
      message: errorMessage,
      requestId: serverRequestId,
      details
    });
  }

  return responseData;
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};

// ==============================================================================
// Domain Services
// ==============================================================================

export const authApi = {
  getMe: () => apiClient.get('/auth/me'),
  login: (identifier, password) => apiClient.post('/auth/login', { identifier, password }),
  registerStudent: (data) => apiClient.post('/auth/register/student', data),
  registerTeacher: (data) => apiClient.post('/auth/register/teacher', data),
  logout: () => apiClient.post('/auth/logout'),
  logoutAll: () => apiClient.post('/auth/logout-all'),
  getSessions: () => apiClient.get('/auth/sessions'),
  revokeSession: (sessionId) => apiClient.post(`/auth/sessions/${sessionId}/revoke`)
};

export const curriculumApi = {
  getGrades: () => apiClient.get('/curriculum/grades'),
  getOptions: () => apiClient.get('/curriculum/options'),
  getSkills: (grade = 9) => apiClient.get(`/curriculum/skills?grade=${grade}`)
};

export const studentApi = {
  getProfile: () => apiClient.get('/student/profile'),
  updateOnboarding: (data) => apiClient.patch('/student/onboarding', data),
  getMastery: () => apiClient.get('/student/mastery'),
  getLearningPath: () => apiClient.get('/student/learning-path'),
  getMistakes: (isMastered) => {
    const query = isMastered !== undefined ? `?isMastered=${isMastered}` : '';
    return apiClient.get(`/student/mistakes${query}`);
  },
  updateMistake: (mistakeId, data) => apiClient.patch(`/student/mistakes/${mistakeId}`, data)
};

export const diagnosticApi = {
  startAttempt: () => apiClient.post('/diagnostic/start'),
  answerQuestion: (data) => apiClient.post('/diagnostic/answer', data),
  submitAttempt: (attemptId) => apiClient.post(`/diagnostic/submit/${attemptId}`),
  getAttemptResult: (attemptId) => apiClient.get(`/diagnostic/results/${attemptId}`)
};

export const classroomApi = {
  getTeacherClassrooms: () => apiClient.get('/classrooms'),
  createClassroom: (data) => apiClient.post('/classrooms', data),
  getClassroomDetails: (classId) => apiClient.get(`/classrooms/${classId}`),
  getClassroomStudents: (classId) => apiClient.get(`/classrooms/${classId}/students`),
  generateInviteCode: (classId, data) => apiClient.post(`/classrooms/${classId}/invite-codes`, data),
  revokeInviteCode: (classId, codeId) => apiClient.post(`/classrooms/${classId}/invite-codes/${codeId}/revoke`),
  joinClassroom: (code) =>
    apiClient.post('/classrooms/join', { code: typeof code === 'object' ? code.code : code })
};

export const assignmentApi = {
  createAssignment: (classId, data) => apiClient.post(`/classrooms/${classId}/assignments`, data),
  getClassAssignments: (classId) => apiClient.get(`/classrooms/${classId}/assignments`),
  getAssignmentSubmissions: (classId, assignmentId) =>
    apiClient.get(`/classrooms/${classId}/assignments/${assignmentId}/submissions`),
  deleteAssignment: (classId, assignmentId) =>
    apiClient.delete(`/classrooms/${classId}/assignments/${assignmentId}`),
  getAssignmentForTaking: (assignmentId) => apiClient.get(`/assignments/${assignmentId}/take`),
  submitAssignment: (assignmentId, data) => apiClient.post(`/assignments/${assignmentId}/submit`, data),
  getAssignmentResult: (assignmentId) => apiClient.get(`/assignments/${assignmentId}/result`)
};

export const adminApi = {
  getOverview: () => apiClient.get('/admin/overview'),
  getTeacherApplicants: () => apiClient.get('/admin/teachers/applicants'),
  reviewTeacherApplicant: (teacherId, data) => apiClient.post(`/admin/teachers/${teacherId}/review`, data),
  getQuestions: (status, skillId) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (skillId) params.append('skillId', skillId);
    const queryString = params.toString();
    return apiClient.get(`/admin/questions${queryString ? `?${queryString}` : ''}`);
  },
  createQuestion: (data) => apiClient.post('/admin/questions', data),
  reviewQuestion: (questionId, data) => apiClient.patch(`/admin/questions/${questionId}/review`, data),
  getAuditLogs: (limit = 50) => apiClient.get(`/admin/audit-logs?limit=${limit}`),
  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.role) searchParams.append('role', params.role);
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    const qs = searchParams.toString();
    return apiClient.get(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUserStatus: (userId, status) => apiClient.patch(`/admin/users/${userId}/status`, { status }),
  resetUserPassword: (userId, newPassword) => apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  getAllClassrooms: () => apiClient.get('/admin/classrooms'),
  getCurriculumStats: () => apiClient.get('/admin/curriculum-stats')
};
