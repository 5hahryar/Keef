import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { type ChangePasswordRequest, type LoginRequest } from '../lib/api'

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      authService.setToken(data.access_token)
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) => 
      authService.changePassword(passwordData),
  })
}

export const useLogout = () => {
  return useMutation({
    mutationFn: () => {
      authService.removeToken()
      return Promise.resolve()
    },
  })
}
