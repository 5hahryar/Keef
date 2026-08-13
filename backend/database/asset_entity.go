package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AssetEntity struct {
	ID           uuid.UUID `gorm:"type:text;primaryKey"`
	Name         string
	Symbol       string
	Type         string
	Quantity     float64
	CurrentPrice float64

	UserID uint
	User   UserEntity

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type AssetTransactionEntity struct {
	ID uuid.UUID `gorm:"type:text;primaryKey"`
	Type        string
	Quantity    float64
	Price       float64
	Date        string
	Description string
	
	AssetID uuid.UUID
	Asset   AssetEntity

	UserID uint
	User   UserEntity

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (l *AssetEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == uuid.Nil {
		l.ID = uuid.Must(uuid.NewV7())
	}
	return
}

func (l *AssetTransactionEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == uuid.Nil {
		l.ID = uuid.Must(uuid.NewV7())
	}
	return
}
