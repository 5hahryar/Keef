package models

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	Password string `json:"password" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
	RepeatNewPassword string `json:"repeatNewPassword" binding:"required"`
}