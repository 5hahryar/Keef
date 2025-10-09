package controllers

import (
	"keef/models"
	"keef/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

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

func DeleteTransactions(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid id!"})
		return
	}

	services.DeleteTransaction(ctx.GetString("username"), id)
	ctx.JSON(http.StatusOK, nil)
}
