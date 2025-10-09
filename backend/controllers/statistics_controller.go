package controllers

import (
	"keef/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetStatsTotalSpending(ctx *gin.Context) {
	var startDate *time.Time
	var endDate *time.Time
	category := ctx.Query("category")
	startDateQuery := ctx.Query("startDate")
	endDateQuery := ctx.Query("endDate")

	if startDateQuery != "" {
		parsedDate, error := time.Parse(time.RFC3339, startDateQuery)
		if error != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": error.Error()})
			return
		}
		startDate = &parsedDate
	}

	if endDateQuery != "" {
		paredDate, error := time.Parse(time.RFC3339, endDateQuery)
		if error != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid end date"})
			return
		}
		endDate = &paredDate
	}
	total := services.GetStatsTotalSpending(ctx.GetString("username"), category, startDate, endDate)

	ctx.JSON(http.StatusOK, total)
}

func GetStatsTotalSpendingByCategory(ctx *gin.Context) {
	var startDate *time.Time
	var endDate *time.Time
	startDateQuery := ctx.Query("startDate")
	endDateQuery := ctx.Query("endDate")

	if startDateQuery != "" {
		parsedDate, error := time.Parse(time.RFC3339, startDateQuery)
		if error != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": error.Error()})
			return
		}
		startDate = &parsedDate
	}

	if endDateQuery != "" {
		paredDate, error := time.Parse(time.RFC3339, endDateQuery)
		if error != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid end date"})
			return
		}
		endDate = &paredDate
	}
	total := services.GetStatsSpendingForAllCategories(ctx.GetString("username"), startDate, endDate)

	ctx.JSON(http.StatusOK, total)
}
