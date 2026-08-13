package services

import (
	"errors"
	"keef/database"
	"keef/models"
	"log"

	"github.com/google/uuid"
)

// CreateAsset creates a new asset for the user
func CreateAsset(username string, asset *models.CreateAssetRequest) (*uuid.UUID, error) {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	entity := database.AssetEntity{
		Name:         asset.Name,
		Symbol:       asset.Symbol,
		Type:         asset.Type,
		Quantity:     0, // Start with 0, will be updated by transactions
		CurrentPrice: asset.CurrentPrice,
		UserID:       userEntity.ID,
	}

	result := database.DB.Create(&entity)
	if result.Error != nil {
		log.Println("Unable to create asset!")
		return nil, result.Error
	}

	return &entity.ID, nil
}

// GetAssets retrieves all assets for the user
func GetAssets(username string) []models.Asset {
	var entities []database.AssetEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	database.DB.Where("user_id = ?", userEntity.ID).Find(&entities)

	result := make([]models.Asset, len(entities))
	for i, entity := range entities {
		result[i] = models.Asset{
			ID:           entity.ID,
			Name:         entity.Name,
			Symbol:       entity.Symbol,
			Type:         entity.Type,
			Quantity:     entity.Quantity,
			CurrentPrice: entity.CurrentPrice,
		}
	}

	return result
}

// GetAsset retrieves a single asset by ID
func GetAsset(username string, assetID uint) (*models.Asset, error) {
	var entity database.AssetEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	result := database.DB.Where("id = ? AND user_id = ?", assetID, userEntity.ID).First(&entity)
	if result.Error != nil {
		return nil, result.Error
	}

	return &models.Asset{
		ID:           entity.ID,
		Name:         entity.Name,
		Symbol:       entity.Symbol,
		Type:         entity.Type,
		Quantity:     entity.Quantity,
		CurrentPrice: entity.CurrentPrice,
	}, nil
}

// UpdateAsset updates an existing asset
func UpdateAsset(username string, assetID uuid.UUID, updates *models.UpdateAssetRequest) error {
	var entity database.AssetEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	result := database.DB.Where("id = ? AND user_id = ?", assetID, userEntity.ID).First(&entity)
	if result.Error != nil {
		return result.Error
	}

	if updates.Name != "" {
		entity.Name = updates.Name
	}
	if updates.Symbol != "" {
		entity.Symbol = updates.Symbol
	}
	if updates.Type != "" {
		entity.Type = updates.Type
	}
	if updates.CurrentPrice > 0 {
		entity.CurrentPrice = updates.CurrentPrice
	}

	database.DB.Save(&entity)
	return nil
}

// DeleteAsset deletes an asset and all its transactions
func DeleteAsset(username string, assetID uuid.UUID) error {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	// Delete all transactions for this asset
	database.DB.Where("asset_id = ? AND user_id = ?", assetID, userEntity.ID).Delete(&database.AssetTransactionEntity{})

	// Delete the asset
	result := database.DB.Where("id = ? AND user_id = ?", assetID, userEntity.ID).Delete(&database.AssetEntity{})
	return result.Error
}

// CreateAssetTransaction creates a new buy/sell transaction
func CreateAssetTransaction(username string, transaction *models.CreateAssetTransactionRequest) (*uuid.UUID, error) {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	// Verify asset belongs to user
	var asset database.AssetEntity
	result := database.DB.Where("id = ? AND user_id = ?", transaction.AssetID, userEntity.ID).First(&asset)
	if result.Error != nil {
		return nil, result.Error
	}

	// Validate sell transaction
	if transaction.Type == "sell" && transaction.Quantity > asset.Quantity {
		return nil, errors.New("insufficient quantity to sell")
	}

	// Create transaction
	entity := database.AssetTransactionEntity{
		AssetID:     transaction.AssetID,
		Type:        transaction.Type,
		Quantity:    transaction.Quantity,
		Price:       transaction.Price,
		Date:        transaction.Date,
		Description: transaction.Description,
		UserID:      userEntity.ID,
	}

	result = database.DB.Create(&entity)
	if result.Error != nil {
		log.Println("Unable to create asset transaction!")
		return nil, result.Error
	}

	// Update asset quantity and average price
	if transaction.Type == "buy" {
		// Calculate new average price: (oldTotal + newTotal) / (oldQuantity + newQuantity)
		oldTotal := asset.Quantity * asset.CurrentPrice
		newTotal := transaction.Quantity * transaction.Price
		newQuantity := asset.Quantity + transaction.Quantity
		asset.Quantity = newQuantity
		if newQuantity > 0 {
			asset.CurrentPrice = (oldTotal + newTotal) / newQuantity
		}
	} else if transaction.Type == "sell" {
		// Reduce quantity (FIFO - first in, first out)
		asset.Quantity = asset.Quantity - transaction.Quantity
		// Average price stays the same when selling
	}

	database.DB.Save(&asset)

	return &entity.ID, nil
}

// GetAssetTransactions retrieves all transactions for a specific asset
func GetAssetTransactions(username string, assetID uuid.UUID) []models.AssetTransaction {
	var entities []database.AssetTransactionEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	database.DB.Where("asset_id = ? AND user_id = ?", assetID, userEntity.ID).
		Order("date DESC, created_at DESC").
		Find(&entities)

	result := make([]models.AssetTransaction, len(entities))
	for i, entity := range entities {
		result[i] = models.AssetTransaction{
			ID:          entity.ID,
			AssetID:     entity.AssetID,
			Type:        entity.Type,
			Quantity:    entity.Quantity,
			Price:       entity.Price,
			Date:        entity.Date,
			Description: entity.Description,
		}
	}

	return result
}

// GetAllAssetTransactions retrieves all asset transactions for the user
func GetAllAssetTransactions(username string) []models.AssetTransaction {
	var entities []database.AssetTransactionEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	database.DB.Where("user_id = ?", userEntity.ID).
		Preload("Asset").
		Order("date DESC, created_at DESC").
		Find(&entities)

	result := make([]models.AssetTransaction, len(entities))
	for i, entity := range entities {
		result[i] = models.AssetTransaction{
			ID:          entity.ID,
			AssetID:     entity.AssetID,
			Type:        entity.Type,
			Quantity:    entity.Quantity,
			Price:       entity.Price,
			Date:        entity.Date,
			Description: entity.Description,
		}
	}

	return result
}

// DeleteAssetTransaction deletes a transaction and reverses its effect on the asset
func DeleteAssetTransaction(username string, transactionID uuid.UUID) error {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	var transaction database.AssetTransactionEntity
	result := database.DB.Where("id = ? AND user_id = ?", transactionID, userEntity.ID).First(&transaction)
	if result.Error != nil {
		return result.Error
	}

	var asset database.AssetEntity
	database.DB.Where("id = ?", transaction.AssetID).First(&asset)

	// Reverse the transaction effect on asset
	if transaction.Type == "buy" {
		// Reverse buy: reduce quantity
		asset.Quantity = asset.Quantity - transaction.Quantity
		// Recalculate average price from remaining buy transactions
		var remainingTransactions []database.AssetTransactionEntity
		database.DB.Where("asset_id = ? AND type = ? AND id != ?", transaction.AssetID, "buy", transactionID).
			Order("date ASC").
			Find(&remainingTransactions)

		if len(remainingTransactions) > 0 {
			var totalCost float64
			var totalQuantity float64
			for _, t := range remainingTransactions {
				totalCost += t.Quantity * t.Price
				totalQuantity += t.Quantity
			}
		}
	} else if transaction.Type == "sell" {
		// Reverse sell: add back quantity
		asset.Quantity = asset.Quantity + transaction.Quantity
	}

	database.DB.Save(&asset)

	// Delete the transaction
	database.DB.Delete(&transaction)
	return nil
}
