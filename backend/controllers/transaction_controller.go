package controllers

import (
	"keef/models"
	"keef/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateTransaction godoc
// @Summary Create a new transaction
// @Description Create a new financial transaction for the authenticated user
// @Tags transactions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param transaction body models.Transaction true "Transaction data"
// @Success 201 {object} map[string]int "id"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /transactions/create [post]
func CreateTransaction(ctx *gin.Context) {
	var transaction models.Transaction

	err := ctx.ShouldBindJSON(&transaction)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Request format is wrong!"})
		return
	}

	id, err := services.CreateTransaction(ctx.GetString("username"), &transaction)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, id)
}

// GetTransactions godoc
// @Summary Get user transactions
// @Description Retrieve paginated transactions for the authenticated user with optional category filter
// @Tags transactions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param page query int true "Page number"
// @Param category query string false "Category filter"
// @Success 200 {array} models.Transaction "List of transactions"
// @Failure 400 {object} map[string]string "message"
// @Router /transactions [get]
func GetTransactions(ctx *gin.Context) {
	page, err := strconv.Atoi(ctx.Query("page"))

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid page number!"})
		return
	}

	category := ctx.Query("category")
	transactions := services.GetTransactions(ctx.GetString("username"), page, category)

	ctx.JSON(http.StatusOK, transactions)
}

// DeleteTransactions godoc
// @Summary Delete a transaction
// @Description Delete a specific transaction by ID for the authenticated user
// @Tags transactions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Transaction ID"
// @Success 200 "Transaction deleted successfully"
// @Failure 400 {object} map[string]string "message"
// @Router /transactions/{id}/delete [delete]
func DeleteTransactions(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid id!"})
		return
	}

	services.DeleteTransaction(ctx.GetString("username"), id)
	ctx.JSON(http.StatusOK, nil)
}
