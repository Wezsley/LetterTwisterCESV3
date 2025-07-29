// API service for backend communication

const API_BASE_URL = '/api';

interface Student {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  lastPlayed: string;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Admin API functions
export const adminApi = {
  // Admin login
  login: async (username: string, password: string) => {
    return apiRequest<{ admin: any; token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Get all students
  getAllStudents: async () => {
    return apiRequest<{ students: Student[]; count: number }>('/admin/students');
  },

  // Add new student
  addStudent: async (name: string, email: string) => {
    return apiRequest<{ student: Student }>('/admin/students', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  },

  // Update student progress
  updateStudentProgress: async (
    studentId: string, 
    data: { totalScore?: number; gamesPlayed?: number; achievements?: string[] }
  ) => {
    return apiRequest<{ student: Student }>(`/admin/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete student
  deleteStudent: async (studentId: string) => {
    return apiRequest<{ student: Student }>(`/admin/students/${studentId}`, {
      method: 'DELETE',
    });
  },

  // Get student by ID
  getStudentById: async (studentId: string) => {
    return apiRequest<{ student: Student }>(`/admin/students/${studentId}`);
  },

  // Get analytics
  getAnalytics: async () => {
    return apiRequest<{
      analytics: {
        overview: {
          totalStudents: number;
          totalGames: number;
          totalScore: number;
          totalAchievements: number;
          averageScore: number;
        };
        topPerformers: Student[];
        recentActivity: Student[];
      };
    }>('/admin/analytics');
  },
};

// Student progress API (for login and game progress)
export const studentApi = {
  // Find student by name/email for login
  findStudent: async (identifier: string) => {
    const studentsResponse = await adminApi.getAllStudents();
    if (!studentsResponse.success || !studentsResponse.data) {
      return { success: false, error: 'Failed to get students' };
    }

    const student = studentsResponse.data.students.find(
      s => s.name.toLowerCase() === identifier.toLowerCase() || 
           s.email.toLowerCase() === identifier.toLowerCase()
    );

    if (student) {
      return { success: true, data: { student } };
    } else {
      return { success: false, error: 'Student not found' };
    }
  },

  // Update student progress after game
  updateProgress: async (
    studentId: string,
    gameData: {
      scoreToAdd: number;
      newAchievements: string[];
    }
  ) => {
    // First get current student data
    const currentResponse = await adminApi.getStudentById(studentId);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Failed to get current student data' };
    }

    const currentStudent = currentResponse.data.student;
    
    // Calculate new values
    const newTotalScore = currentStudent.totalScore + gameData.scoreToAdd;
    const newGamesPlayed = currentStudent.gamesPlayed + 1;
    const combinedAchievements = [
      ...new Set([...currentStudent.achievements, ...gameData.newAchievements])
    ];

    // Update student
    return adminApi.updateStudentProgress(studentId, {
      totalScore: newTotalScore,
      gamesPlayed: newGamesPlayed,
      achievements: combinedAchievements,
    });
  },
};

// Local storage fallback for offline mode
export const localStorageApi = {
  // Save data locally as backup
  saveStudentProgress: (studentData: any) => {
    localStorage.setItem('letterTwistUser', JSON.stringify(studentData));
  },

  // Get local student data
  getStudentProgress: () => {
    const data = localStorage.getItem('letterTwistUser');
    return data ? JSON.parse(data) : null;
  },

  // Clear local data
  clearStudentProgress: () => {
    localStorage.removeItem('letterTwistUser');
  },
};

// Helper function to check if backend is available
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/ping');
    return response.ok;
  } catch {
    return false;
  }
};
