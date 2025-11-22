// @title Keef API
// @version 1.0
// @description A financial tracking API

// @host localhost:8080
// @BasePath /api

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
// @description Bearer token authentication

package main

import (
	"fmt"
	"keef/controllers"
	"keef/database"
	"keef/middlewares"
	"os"
	"strings"

	_ "keef/docs" // This line is necessary for go mod tidy

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, reading from system environment")
	}
	
	database.Connect()
	database.Seed()

	router := gin.Default()

	originsEnv := os.Getenv("CORS_ALLOW_ORIGINS")
	var allowOrigins []string
	if originsEnv != "" {
		allowOrigins = strings.Split(originsEnv, ",")
	}
	defConf := cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}
	router.Use(cors.New(defConf))
	
	api := router.Group("/api")

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	transactions := api.Group("/transactions")
	{
		transactions.Use(middlewares.AuthMiddleware())
		transactions.GET("", controllers.GetTransactions)
		transactions.POST("/create", controllers.CreateTransaction)
		transactions.DELETE("/:id/delete", controllers.DeleteTransactions)
	}
	statistics := api.Group("/statistics")
	{
		statistics.Use(middlewares.AuthMiddleware())
		statistics.GET("/total-spent", controllers.GetStatsTotalSpending)
		statistics.GET("/total-spent-category", controllers.GetStatsTotalSpendingByCategory)
	}
	users := api.Group("/users")
	{
		users.POST("/token", controllers.Login)
		users.POST("/change-password", middlewares.AuthMiddleware(), controllers.ChangePassword)
	}
	loans := api.Group("/loans")
	{
		loans.Use(middlewares.AuthMiddleware())
		loans.POST("", controllers.CreateLoan)
		loans.GET("", controllers.GetLoans)
		loans.GET("/:loanId", controllers.GetLoan)
		loans.GET("/installments", controllers.GetInstallments)
		loans.POST("/:loanId/installments/:installmentId/pay", controllers.PayInstallment)
	}

	port := os.Getenv("PORT")
	router.Run(port)
}
