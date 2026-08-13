package controllers

import (
	"keef/models"
	"keef/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetLoan godoc
// @Summary Get all Loans
// @Description Get all loans for a user
// @Tags loans
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {object} []models.Loan "Loans"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /loans [get]
func GetLoans(ctx *gin.Context) {
	loans, err := services.GetAllLoans(ctx.GetString("username"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, loans)
}

// CreateLoan godoc
// @Summary Create a new Loan
// @Description Create a new loan for the authenticated user
// @Tags loans
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param transaction body models.CreateLoanRequest true "Loan data"
// @Success 201 {object} map[string]int "id"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /loans [post]
func CreateLoan(ctx *gin.Context) {
	var loan models.CreateLoanRequest
	err := ctx.ShouldBindJSON(&loan)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Request format is wrong!"})
		return
	}

	id, err := services.CreateLoan(ctx.GetString("username"), &loan)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, id)
}

// GetLoan godoc
// @Summary Get Loan information
// @Description Get details of a loan by ID
// @Tags loans
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param loanId path string true "Loan ID"
// @Success 200 {object} models.LoanDetail "Loan details"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /loans/{loanId} [get]
func GetLoan(ctx *gin.Context) {
	id, error := uuid.Parse(ctx.Param("loanId"))
	if error != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid id!"})
		return
	}

	loan, err := services.GetLoanInformation(ctx.GetString("username"), id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, loan)
}

// GetLoan godoc
// @Summary Get installments
// @Description Get installments by time
// @Tags loans
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param fromDueDate query string false "Start due date (RFC3339 format)"
// @Param toDueDate query string false "End due date (RFC3339 format)"
// @Success 200 {object} []models.Installment "Installments"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /loans/installments [get]
func GetInstallments(ctx *gin.Context) {
	var fromDueDate *time.Time
	var toDueDate *time.Time
	fromDueDateQuery := ctx.Query("fromDueDate")
	toDueDateQuery := ctx.Query("toDueDate")

	if fromDueDateQuery != "" {
		parsedDate, error := time.Parse(time.RFC3339, fromDueDateQuery)
		if error != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": error.Error()})
			return
		}
		fromDueDate = &parsedDate
	}
	if toDueDateQuery != "" {
		parsedDate, error := time.Parse(time.RFC3339, toDueDateQuery)
		if error != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid end date"})
			return
		}
		toDueDate = &parsedDate
	}

	total := services.GetInstallments(ctx.GetString("username"), fromDueDate, toDueDate)

	ctx.JSON(http.StatusOK, total)
}

// PayInstallment godoc
// @Summary Pay installment
// @Description Mark installment as paid
// @Tags loans
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param loanId path string true "Loan ID"
// @Param installmentId path string true "Installment ID"
// @Success 200 
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /loans/{loanId}/installments/{installmentId}/pay [post]
func PayInstallment(ctx *gin.Context) {
	loanId, error := uuid.Parse(ctx.Param("loanId"))
	if error != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid loan id!"})
		return
	}
	installmentId, error := uuid.Parse(ctx.Param("installmentId"))
	if error != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid loan id!"})
		return
	}

	err := services.PayInstallment(ctx.GetString("username"), loanId, installmentId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, nil)
}