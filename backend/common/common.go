package common

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func Hash(input string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input), bcrypt.MinCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

func VerifyHash(input, hashedInput string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedInput), []byte(input))
	return err == nil
}