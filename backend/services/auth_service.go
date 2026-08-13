package services

import (
	"errors"
	"keef/common"
	"keef/database"
	"keef/models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GetAccessToken(username string, password string) (accessToken string, err error) {
	var user database.UserEntity
	lookupErr := database.DB.Where("username = ?", username).First(&user).Error
	if lookupErr != nil || !common.VerifyHash(password, user.PasswordHash) { // Wrong username or password
		return "", errors.New("wrong username or password")
	}

	expirationTime := time.Now().Add(720 * time.Hour)
	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expirationTime),
		Subject:   username,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ChangePassword(username string, request models.ChangePasswordRequest) (err error) {
	if request.NewPassword != request.RepeatNewPassword {
		return errors.New("New password not equal to repeated one")
	}

	var user database.UserEntity
	lookupErr := database.DB.Where("username = ?", username).First(&user).Error
	if lookupErr != nil || !common.VerifyHash(request.Password, user.PasswordHash) { // Wrong username or password
		return errors.New("wrong username or password")
	}

	hash, error := common.Hash(request.NewPassword)
	if error != nil {
		return errors.New("Something went wrong")
	}

	database.DB.Model(&user).Update("password_hash", hash)

	return nil
}
