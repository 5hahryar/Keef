package controllers

import (
	"keef/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetStatsTotalSpending godoc
// @Summary Get total spending statistics
// @Description Get total spending amount for the authenticated user with optional filters
// @Tags statistics
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param category query string false "Category filter"
// @Param startDate query string false "Start date (RFC3339 format)"
// @Param endDate query string false "End date (RFC3339 format)"
// @Success 200 {object} map[string]interface{} "Total spending amount"
// @Failure 400 {object} map[string]string "message"
// @Router /statistics/total-spent [get]
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

// GetStatsTotalSpendingByCategory godoc
// @Summary Get spending statistics by category
// @Description Get total spending amount grouped by category for the authenticated user
// @Tags statistics
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param startDate query string false "Start date (RFC3339 format)"
// @Param endDate query string false "End date (RFC3339 format)"
// @Success 200 {object} map[string]interface{} "Spending by category"
// @Failure 400 {object} map[string]string "message"
// @Router /statistics/total-spent-category [get]
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
