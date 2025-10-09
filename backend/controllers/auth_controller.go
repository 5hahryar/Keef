package controllers

import (
	"keef/models"
	"keef/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Login godoc
// @Summary Login user
// @Description Authenticate user and return access token
// @Tags authentication
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login credentials"
// @Success 200 {object} map[string]string "access_token"
// @Failure 400 {object} map[string]string "error"
// @Router /users/token [post]
func Login(ctx *gin.Context) {
	var request models.LoginRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, err := services.GetAccessToken(request.Username, request.Password)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"access_token": accessToken})
}

// ChangePassword godoc
// @Summary Change user password
// @Description Change the password for the authenticated user
// @Tags authentication
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param request body models.ChangePasswordRequest true "Password change data"
// @Success 200 "Password changed successfully"
// @Failure 400 {object} map[string]string "error"
// @Router /users/change-password [post]
func ChangePassword(ctx *gin.Context) {
	var request models.ChangePasswordRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := services.ChangePassword(ctx.GetString("username"), request)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, nil)
}
