import { useQueryClient } from "@tanstack/react-query"
import LoginForm from "../components/LoginForm"
import { useLogin } from "../hooks/useAuth"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    const loginMutation = useLogin()
    const queryClient = useQueryClient()
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full mx-4">
            <h1 className="text-2xl font-bold text-center mb-6">ورود به سیستم</h1>
            <LoginForm 
              onSubmit={async (username, password) => {
                try {
                  await loginMutation.mutateAsync({ username, password })
                  await queryClient.invalidateQueries()
                  toast.success('با موفقیت وارد شدید');
                  navigate('/');
                } catch (e) {
                    toast.error('ورود ناموفق بود')
                }
              }} 
              loading={loginMutation.isPending}
            />
            <div className="mt-4 text-center text-sm text-gray-500">
              برای دسترسی به داشبورد، ابتدا وارد شوید
            </div>
          </div>
        </div>
      )
}