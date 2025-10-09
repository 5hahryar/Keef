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

	database.DB.
		Table("transaction_entities as t").
		Select("c.name as name, sum(t.amount) as total").
		Joins("JOIN category_entities as c on t.category_id = c.id").
		Where("t.user_id = ?", userEntity.ID).
		Where("t.created_at >= ?", startDate).
		Where("t.created_at <= ?", endDate).
		Group("c.name").
		Scan(&results)

	if results == nil {
		return []CategorySpending{}
	}

	return results
}

type CategorySpending struct {
	Name  string  `json:"name" binding:"required"`
	Total float64 `json:"total" binding:"required"`
}
