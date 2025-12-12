package models

import "github.com/google/uuid"

type Asset struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name" binding:"required"`
	Symbol       string    `json:"symbol" binding:"required"`
	Type         string    `json:"type" binding:"required"`
	Quantity     float64   `json:"quantity"`
	CurrentPrice float64   `json:"currentPrice"`
}

type AssetTransaction struct {
	ID          uuid.UUID `json:"id"`
	AssetID     uuid.UUID `json:"assetId" binding:"required"`
	Type        string    `json:"type" binding:"required"`
	Quantity    float64   `json:"quantity" binding:"required"`
	Price       float64   `json:"price" binding:"required"`
	Date        string    `json:"date" binding:"required"`
	Description string    `json:"description"`
}

type CreateAssetRequest struct {
	Name         string  `json:"name" binding:"required"`
	Symbol       string  `json:"symbol" binding:"required"`
	Type         string  `json:"type" binding:"required"`
	CurrentPrice float64 `json:"currentPrice" binding:"required"`
}

type UpdateAssetRequest struct {
	Name         string  `json:"name"`
	Symbol       string  `json:"symbol"`
	Type         string  `json:"type"`
	CurrentPrice float64 `json:"currentPrice"`
}

type CreateAssetTransactionRequest struct {
	AssetID     uuid.UUID `json:"assetId" binding:"required"`
	Type        string    `json:"type" binding:"required"`
	Quantity    float64   `json:"quantity" binding:"required"`
	Price       float64   `json:"price" binding:"required"`
	Date        string    `json:"date" binding:"required"`
	Description string    `json:"description"`
}
