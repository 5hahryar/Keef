package controllers

import (
	"keef/models"
	"keef/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateAsset godoc
// @Summary Create a new asset
// @Description Create a new investment asset for the authenticated user
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param asset body models.CreateAssetRequest true "Asset data"
// @Success 201 {object} map[string]uuid.UUID "id"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /assets [post]
func CreateAsset(ctx *gin.Context) {
	var asset models.CreateAssetRequest

	err := ctx.ShouldBindJSON(&asset)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Request format is wrong!"})
		return
	}

	id, err := services.CreateAsset(ctx.GetString("username"), &asset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"id": id})
}

// GetAssets godoc
// @Summary Get all assets
// @Description Retrieve all assets for the authenticated user
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {array} models.Asset "List of assets"
// @Failure 500 {object} map[string]string "message"
// @Router /assets [get]
func GetAssets(ctx *gin.Context) {
	assets := services.GetAssets(ctx.GetString("username"))
	ctx.JSON(http.StatusOK, assets)
}

// GetAsset godoc
// @Summary Get a single asset
// @Description Retrieve a specific asset by ID for the authenticated user
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Asset ID"
// @Success 200 {object} models.Asset "Asset details"
// @Failure 400 {object} map[string]string "message"
// @Failure 404 {object} map[string]string "message"
// @Router /assets/:id [get]
func GetAsset(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid asset ID"})
		return
	}

	asset, err := services.GetAsset(ctx.GetString("username"), uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Asset not found"})
		return
	}

	ctx.JSON(http.StatusOK, asset)
}

// UpdateAsset godoc
// @Summary Update an asset
// @Description Update an existing asset for the authenticated user
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Asset ID"
// @Param asset body models.UpdateAssetRequest true "Asset update data"
// @Success 200 {object} map[string]string "message"
// @Failure 400 {object} map[string]string "message"
// @Failure 404 {object} map[string]string "message"
// @Router /assets/:id [put]
func UpdateAsset(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid asset ID"})
		return
	}

	var updates models.UpdateAssetRequest
	err = ctx.ShouldBindJSON(&updates)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Request format is wrong!"})
		return
	}

	err = services.UpdateAsset(ctx.GetString("username"), id, &updates)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Asset not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Asset updated successfully"})
}

// DeleteAsset godoc
// @Summary Delete an asset
// @Description Delete an asset and all its transactions for the authenticated user
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Asset ID"
// @Success 200 {object} map[string]string "message"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /assets/:id [delete]
func DeleteAsset(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid asset ID"})
		return
	}

	err = services.DeleteAsset(ctx.GetString("username"), id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Asset deleted successfully"})
}

// CreateAssetTransaction godoc
// @Summary Create a new asset transaction
// @Description Create a new buy or sell transaction for an asset
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param transaction body models.CreateAssetTransactionRequest true "Transaction data"
// @Success 201 {object} map[string]uint "id"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /assets/transactions [post]
func CreateAssetTransaction(ctx *gin.Context) {
	var transaction models.CreateAssetTransactionRequest

	err := ctx.ShouldBindJSON(&transaction)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Request format is wrong!"})
		return
	}

	id, err := services.CreateAssetTransaction(ctx.GetString("username"), &transaction)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"id": id})
}

// GetAssetTransactions godoc
// @Summary Get transactions for an asset
// @Description Retrieve all transactions for a specific asset
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param assetId query int true "Asset ID"
// @Success 200 {array} models.AssetTransaction "List of transactions"
// @Failure 400 {object} map[string]string "message"
// @Router /assets/transactions [get]
func GetAssetTransactions(ctx *gin.Context) {
	assetIDStr := ctx.Query("assetId")
	if assetIDStr == "" {
		// Get all transactions if no assetId specified
		transactions := services.GetAllAssetTransactions(ctx.GetString("username"))
		ctx.JSON(http.StatusOK, transactions)
		return
	}

	assetID, err := uuid.Parse(assetIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid asset ID"})
		return
	}

	transactions := services.GetAssetTransactions(ctx.GetString("username"), assetID)
	ctx.JSON(http.StatusOK, transactions)
}

// DeleteAssetTransaction godoc
// @Summary Delete an asset transaction
// @Description Delete a transaction and reverse its effect on the asset
// @Tags assets
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "Transaction ID"
// @Success 200 {object} map[string]string "message"
// @Failure 400 {object} map[string]string "message"
// @Failure 500 {object} map[string]string "message"
// @Router /assets/transactions/:id [delete]
func DeleteAssetTransaction(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid transaction ID"})
		return
	}

	err = services.DeleteAssetTransaction(ctx.GetString("username"), id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

