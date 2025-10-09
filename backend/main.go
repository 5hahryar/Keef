package main

import (
	"keef/controllers"
	"keef/database"
	"keef/middlewares"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()
	database.Seed()

	router := gin.Default()
	api := router.Group("/api")

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
