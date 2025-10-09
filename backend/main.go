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
	"keef/controllers"
	"keef/database"
	"keef/middlewares"
	"os"

	_ "keef/docs" // This line is necessary for go mod tidy

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	database.Connect()
	database.Seed()

	router := gin.Default()
	api := router.Group("/api")

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	transactions := api.Group("/transactions")
	{
		transactions.Use(middlewares.AuthMiddleware())
		transactions.GET("/", controllers.GetTransactions)
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

	port := os.Getenv("PORT")
	router.Run(port)
}
