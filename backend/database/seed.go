package database

import (
	"keef/common"

	"gorm.io/gorm"
)

func Seed() {
	seedCategories(DB)
	seedBanks(DB)
	seedExpenseTypes(DB)
	seedUsers(DB)
}

func seedCategories(db *gorm.DB) error {
	categories := []CategoryEntity{
		{ID: 1, Name: "Food"},
		{ID: 2, Name: "Transportation"},
		{ID: 3, Name: "Medical"},
		{ID: 4, Name: "Entertainment"},
		{ID: 5, Name: "Home"},
		{ID: 6, Name: "Investment"},
		{ID: 7, Name: "Debt"},
		{ID: 8, Name: "Clothes"},
		{ID: 9, Name: "Other"},
	}

	for _, c := range categories {
		var exists bool
		err := db.Model(&CategoryEntity{}).Select("count(*) > 0").
			Where("name = ?", c.Name).Find(&exists).Error
		if err != nil {
			return err
		}

		if !exists {
			if err := db.Create(&c).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

func seedBanks(db *gorm.DB) error {
	banks := []BankEntity{
		{ID: 1, Name: "Pasargad"},
		{ID: 2, Name: "Mellat"},
		{ID: 3, Name: "Blu"},
		{ID: 4, Name: "Wepod"},
		{ID: 5, Name: "MehrIran"},
	}

	for _, c := range banks {
		var exists bool
		err := db.Model(&BankEntity{}).Select("count(*) > 0").
			Where("name = ?", c.Name).Find(&exists).Error
		if err != nil {
			return err
		}

		if !exists {
			if err := db.Create(&c).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

func seedExpenseTypes(db *gorm.DB) error {
	exTypes := []TransactionTypeEntity{
		{ID: 1, Name: "Withdraw"},
		{ID: 2, Name: "Deposit"},
	}

	for _, c := range exTypes {
		var exists bool
		err := db.Model(&TransactionTypeEntity{}).Select("count(*) > 0").
			Where("name = ?", c.Name).Find(&exists).Error
		if err != nil {
			return err
		}

		if !exists {
			if err := db.Create(&c).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

func seedUsers(db *gorm.DB) error {
	hash, err := common.Hash("1234")
	if err != nil {
		return nil
	}

	users := []UserEntity{
		{Username: "a", PasswordHash: hash},
		{Username: "b", PasswordHash: hash},
	}

	for _, c := range users {
		var exists bool
		err := db.Model(&UserEntity{}).Select("count(*) > 0").
			Where("username = ?", c.Username).Find(&exists).Error
		if err != nil {
			return err
		}

		if !exists {
			if err := db.Create(&c).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
