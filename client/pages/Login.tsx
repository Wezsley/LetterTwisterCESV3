import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SoundButton } from "@/components/SoundButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studentApi, localStorageApi, checkBackendConnection } from "@/lib/api";
import {
  BookOpen,
  User,
  ArrowLeft,
  Sparkles,
  LogIn,
  Wifi,
  WifiOff
} from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check backend connectivity
  useState(() => {
    const checkConnection = async () => {
      const connected = await checkBackendConnection();
      setIsOnline(connected);
    };
    checkConnection();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter your name!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to find student in backend
        const response = await studentApi.findStudent(username.trim());

        if (response.success && response.data) {
          // Student found in backend
          const studentData = {
            id: response.data.student.id,
            name: response.data.student.name,
            email: response.data.student.email,
            loginTime: new Date().toISOString(),
            totalScore: response.data.student.totalScore,
            gamesPlayed: response.data.student.gamesPlayed,
            achievements: response.data.student.achievements,
            isBackendConnected: true
          };

          localStorageApi.saveStudentProgress(studentData);
          navigate('/dashboard');
        } else {
          // Student not found in backend, create guest session
          const guestData = {
            name: username.trim(),
            loginTime: new Date().toISOString(),
            totalScore: 0,
            gamesPlayed: 0,
            achievements: [],
            isGuest: true,
            isBackendConnected: true
          };

          localStorageApi.saveStudentProgress(guestData);
          navigate('/dashboard');
        }
      } else {
        // Offline mode - use localStorage only
        const existingData = localStorageApi.getStudentProgress();
        const userData = {
          name: username.trim(),
          loginTime: new Date().toISOString(),
          totalScore: existingData?.totalScore || 0,
          gamesPlayed: existingData?.gamesPlayed || 0,
          achievements: existingData?.achievements || [],
          isBackendConnected: false
        };

        localStorageApi.saveStudentProgress(userData);
        navigate('/dashboard');
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestPlay = () => {
    // Clear any existing user data for guest mode
    localStorage.removeItem('letterTwistUser');
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bubblegum/20 via-background to-lavender/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b-4 border-bubblegum shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-bubblegum hover:text-bubblegum/80">
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bubblegum rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-bubblegum">Letter Twist</h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-bubblegum animate-pulse" />
              <User className="w-10 h-10 text-lavender" />
              <Sparkles className="w-8 h-8 text-sunshine animate-pulse delay-200" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Welcome Back! 👋
            </h2>
            <p className="text-lg text-muted-foreground">
              Enter your name to track your progress and achievements!
            </p>
          </div>

          <Card className="border-4 border-bubblegum bg-white/90 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl text-bubblegum">Student Login</CardTitle>
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" title="Connected to server" />
                ) : (
                  <WifiOff className="w-5 h-5 text-orange-500" title="Offline mode" />
                )}
              </div>
              {!isOnline && (
                <p className="text-sm text-orange-600">Offline mode - progress may not sync</p>
              )}
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-lg font-semibold text-muted-foreground">
                    Your Name
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your first name..."
                    className="text-lg py-3 px-4 border-2 border-bubblegum/30 rounded-xl focus:border-bubblegum"
                    disabled={isLoading}
                  />
                </div>

                <SoundButton
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  soundType="success"
                  className="w-full bg-bubblegum hover:bg-bubblegum/90 text-white text-lg py-6 rounded-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Start Learning!
                    </>
                  )}
                </SoundButton>
              </form>

              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-muted-foreground">or</span>
                  </div>
                </div>
                
                <SoundButton
                  variant="outline"
                  onClick={handleGuestPlay}
                  soundType="navigation"
                  className="w-full mt-4 border-2 border-lavender text-lavender hover:bg-lavender hover:text-white text-lg py-6 rounded-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Play as Guest
                </SoundButton>
                
                <p className="text-sm text-muted-foreground mt-3">
                  Playing as guest won't save your progress
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits of Logging In */}
          <Card className="mt-6 border-2 border-sunshine bg-white/70">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-sunshine mb-4">
                  🌟 Why Create an Account?
                </h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-muted-foreground">Track your spelling progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-muted-foreground">Earn badges and achievements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-muted-foreground">See detailed performance stats</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-muted-foreground">Continue where you left off</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
