package database

import (
	"time"

	"gorm.io/gorm"
)

type TransactionEntity struct {
	gorm.Model
	Title       string
	Amount      int64
	Description string
	Date		time.Time

	BankID uint
	Bank   BankEntity

	CategoryID uint
	Category   CategoryEntity

	TypeID uint
	Type   TransactionTypeEntity

	UserID uint
	User   UserEntity	
}

type CategoryEntity struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

type BankEntity struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

type TransactionTypeEntity struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}
