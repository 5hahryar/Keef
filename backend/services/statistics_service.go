package services

import (
	"keef/database"
	"time"
)

func GetStatsTotalSpending(username string, category string, startDate *time.Time, endDate *time.Time) int64 {
	var total int64

	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)
	query := database.DB.Model(&database.TransactionEntity{}).Where("user_id = ?", userEntity.ID)

	if startDate != nil {
		query.Where("created_at >= ?", startDate)
	}

	if endDate != nil {
		query.Where("created_at <= ?", endDate)
	}

	if category != "" {
		var categoryEntity database.CategoryEntity
		err := database.DB.Where("name = ?", category).First(&categoryEntity).Error
		if err != nil {
			return 0
		}
		query = query.Where("category_id = ?", categoryEntity.ID)
	}

	query.Select("sum(amount) as total").Scan(&total)

	return total
}

func GetStatsSpendingForAllCategories(username string, startDate *time.Time, endDate *time.Time) []CategorySpending {
	var results []CategorySpending
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	query := database.DB.
		Table("transaction_entities as t").
		Select("c.name as name, sum(t.amount) as total, count(t.id) as transaction_count").
		Joins("JOIN category_entities as c on t.category_id = c.id").
		Where("t.user_id = ?", userEntity.ID)

	if startDate != nil {
		query = query.Where("t.created_at >= ?", startDate)
	}

	if endDate != nil {
		query = query.Where("t.created_at <= ?", endDate)
	}

	query.Group("c.name").Scan(&results)

	if results == nil {
		return []CategorySpending{}
	}

	return results
}

func GetStatsTransactionCount(username string, startDate *time.Time, endDate *time.Time) int64 {
	var count int64
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	query := database.DB.Model(&database.TransactionEntity{}).Where("user_id = ?", userEntity.ID)

	if startDate != nil {
		query = query.Where("created_at >= ?", startDate)
	}

	if endDate != nil {
		query = query.Where("created_at <= ?", endDate)
	}

	query.Count(&count)
	return count
}

type CategorySpending struct {
	Name            string  `json:"name" binding:"required"`
	Total           float64 `json:"total" binding:"required"`
	TransactionCount int64  `json:"transaction_count" binding:"required"`
}
