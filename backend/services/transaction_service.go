package services

import (
	"keef/database"
	"keef/models"
	"log"
	"time"
)

func CreateTransaction(username string, transaction *models.Transaction) (id *uint, err error) {
	var category database.CategoryEntity
	var bank database.BankEntity
	var exType database.TransactionTypeEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)
	database.DB.Where("name = ?", transaction.Category).First(&category)
	database.DB.Where("name = ?", transaction.Bank).First(&bank)
	database.DB.Where("name = ?", transaction.Type).First(&exType)
	date, err := time.Parse(time.RFC3339, transaction.Date)
	if err != nil {
		date = time.Now()
	}

	entity := database.TransactionEntity{
		Title:       transaction.Title,
		Amount:      transaction.Amount,
		Description: transaction.Description,
		Bank:        bank,
		Category:    category,
		Type:        exType,
		UserID:      userEntity.ID,
		Date:	 	 date,
	}

	result := database.DB.Create(&entity)

	if result.Error != nil {
		log.Println("Unable to create transaction!")
		return &entity.ID, result.Error
	}

	return &entity.ID, nil
}

func GetTransactions(username string, page int, category string) []models.Transaction {
	limit := 20
	offset := (page - 1) * limit

	var entities []database.TransactionEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)
	query := database.DB.Where("user_id = ?", userEntity.ID).Limit(limit).Offset(offset).Preload("Category").Preload("Type").Preload("Bank").Order("created_at DESC")
	if category != "" {
		var categoryEntity database.CategoryEntity
		err := database.DB.Where("name = ?", category).First(&categoryEntity).Error
		if err != nil {
			return []models.Transaction{}
		}
		query = query.Where("category_id = ?", categoryEntity.ID)
	}

	query.Find(&entities)

	result := make([]models.Transaction, len(entities))
	for i, entity := range entities {
		result[i] = models.Transaction{
			Id:          int(entity.ID),
			Title:       entity.Title,
			Description: entity.Description,
			Amount:      entity.Amount,
			Bank:        entity.Bank.Name,
			Category:    entity.Category.Name,
			Type:        entity.Type.Name,
			Date:        entity.Date.UTC().Format(time.RFC3339),
		}
	}

	return result
}

func UpdateTransaction(username string, id int, transaction *models.Transaction) error {
	var entity database.TransactionEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	result := database.DB.Where("id = ? AND user_id = ?", id, userEntity.ID).First(&entity)
	if result.Error != nil {
		return result.Error
	}

	var category database.CategoryEntity
	var bank database.BankEntity
	var exType database.TransactionTypeEntity
	database.DB.Where("name = ?", transaction.Category).First(&category)
	database.DB.Where("name = ?", transaction.Bank).First(&bank)
	database.DB.Where("name = ?", transaction.Type).First(&exType)

	date, err := time.Parse(time.RFC3339, transaction.Date)
	if err != nil {
		date = entity.Date
	}

	entity.Title = transaction.Title
	entity.Description = transaction.Description
	entity.Amount = transaction.Amount
	entity.BankID = bank.ID
	entity.CategoryID = category.ID
	entity.TypeID = exType.ID
	entity.Date = date

	return database.DB.Save(&entity).Error
}

func DeleteTransaction(username string, id int) {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)
	database.DB.Where("user_id = ?", userEntity.ID).Delete(&database.TransactionEntity{}, id)
}
