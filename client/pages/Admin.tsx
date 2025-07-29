import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { adminApi, checkBackendConnection } from "@/lib/api";
import {
  Users,
  Plus,
  Trash2,
  BarChart3,
  Trophy,
  BookOpen,
  ArrowLeft,
  Search,
  Download,
  Eye,
  Settings,
  Wifi,
  WifiOff
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  lastPlayed: string;
  achievements: string[];
}

export default function Admin() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Check backend connectivity on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkBackendConnection();
      setIsOnline(connected);
      if (!connected) {
        setError("Backend server is not available. Using offline mode.");
      }
    };
    checkConnection();
  }, []);

  // Admin authentication using backend API
  const handleAdminLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await adminApi.login("teacher", adminPassword);
        if (response.success) {
          setIsAuthenticated(true);
          loadStudents();
          loadAnalytics();
        } else {
          setError(response.error || "Invalid credentials");
        }
      } else {
        // Fallback for offline mode
        if (adminPassword === "teacher123") {
          setIsAuthenticated(true);
          loadStudentsFromLocal();
        } else {
          setError("Invalid admin password!");
        }
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load students from backend API
  const loadStudents = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        const response = await adminApi.getAllStudents();
        if (response.success && response.data) {
          setStudents(response.data.students);
        } else {
          setError(response.error || "Failed to load students");
        }
      } else {
        loadStudentsFromLocal();
      }
    } catch (error) {
      setError("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback: Load students from localStorage
  const loadStudentsFromLocal = () => {
    const storedStudents = localStorage.getItem('letterTwistStudents');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
  };

  // Load analytics from backend
  const loadAnalytics = async () => {
    try {
      if (isOnline) {
        const response = await adminApi.getAnalytics();
        if (response.success && response.data) {
          setAnalytics(response.data.analytics);
        }
      }
    } catch (error) {
      console.log("Failed to load analytics:", error);
    }
  };

  // Add new student
  const addStudent = async () => {
    if (!newStudentName || !newStudentEmail) return;

    setIsLoading(true);
    try {
      if (isOnline) {
        const response = await adminApi.addStudent(newStudentName, newStudentEmail);
        if (response.success && response.data) {
          setStudents([...students, response.data.student]);
          setNewStudentName("");
          setNewStudentEmail("");
        } else {
          setError(response.error || "Failed to add student");
        }
      } else {
        // Fallback for offline mode
        const newStudent: Student = {
          id: Date.now().toString(),
          name: newStudentName,
          email: newStudentEmail,
          totalScore: 0,
          gamesPlayed: 0,
          averageScore: 0,
          lastPlayed: "Never",
          achievements: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        localStorage.setItem('letterTwistStudents', JSON.stringify(updatedStudents));
        setNewStudentName("");
        setNewStudentEmail("");
      }
    } catch (error) {
      setError("Failed to add student");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      if (isOnline) {
        const response = await adminApi.deleteStudent(studentId);
        if (response.success) {
          setStudents(students.filter(s => s.id !== studentId));
        } else {
          setError(response.error || "Failed to delete student");
        }
      } else {
        // Fallback for offline mode
        const updatedStudents = students.filter(s => s.id !== studentId);
        setStudents(updatedStudents);
        localStorage.setItem('letterTwistStudents', JSON.stringify(updatedStudents));
      }
    } catch (error) {
      setError("Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export data to CSV
  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Total Score', 'Games Played', 'Average Score', 'Last Played', 'Achievements'],
      ...students.map(s => [
        s.name, 
        s.email, 
        s.totalScore.toString(), 
        s.gamesPlayed.toString(), 
        s.averageScore.toString(), 
        s.lastPlayed,
        s.achievements.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'letter-twist-students.csv';
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-blue-600">Admin Access</CardTitle>
            <p className="text-gray-600">Enter admin password to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full bg-blue-500 hover:bg-blue-600">
              Access Admin Panel
            </Button>
            <div className="text-center">
              <Link to="/" className="text-blue-500 hover:underline">
                Back to Home
              </Link>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Demo password: teacher123
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-6 h-6" />
                <span className="text-lg font-semibold">Back to App</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-blue-600">Teacher Admin Panel</h1>
              {isOnline ? (
                <Wifi className="w-6 h-6 text-green-500" title="Connected to backend" />
              ) : (
                <WifiOff className="w-6 h-6 text-orange-500" title="Offline mode" />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
              className="border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Connection Status */}
        {!isOnline && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span>Running in offline mode. Data may not sync with server.</span>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {students.reduce((acc, s) => acc + s.gamesPlayed, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Games Played</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {students.reduce((acc, s) => acc + s.achievements.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Achievements</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.totalScore, 0) / students.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Student Form */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Student
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Student Email/ID</Label>
                <Input
                  id="studentEmail"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="Enter student email or ID"
                />
              </div>
              <Button onClick={addStudent} className="w-full bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="lg:col-span-2 border-2 border-blue-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Student Management ({filteredStudents.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportData} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <div className="flex gap-2">
                          {student.achievements.map((achievement, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-sm font-semibold text-blue-600">
                        Score: {student.totalScore}
                      </div>
                      <div className="text-xs text-gray-500">
                        Games: {student.gamesPlayed}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full max-h-96 overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Student Details</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Score</div>
                    <div className="text-xl font-bold text-blue-600">{selectedStudent.totalScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Games Played</div>
                    <div className="text-xl font-bold text-green-600">{selectedStudent.gamesPlayed}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2">Achievements</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.achievements.length > 0 ? (
                      selectedStudent.achievements.map((achievement, index) => (
                        <Badge key={index} className="bg-yellow-100 text-yellow-800">
                          {achievement}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400">No achievements yet</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
