package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort() // Abort the request, do not proceed to the next handler
			return
		}

		// Check for "Bearer " prefix and remove it
		if len(tokenString) < 7 || tokenString[:7] != "Bearer " {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format (missing Bearer prefix)"})
			c.Abort()
			return
		}
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Set user info in context for subsequent handlers
		// For example, if you stored the username under "sub" (subject) claim:
		username, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Username claim not found or invalid"})
			c.Abort()
			return
		}
		c.Set("username", username)
		// You can also set other claims like user ID, roles, etc.
		// c.Set("user_id", claims["user_id"])
		// c.Set("roles", claims["roles"])

		c.Next() // Proceed to the next handler in the chain
	}
}