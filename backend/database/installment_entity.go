package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InstallmentEntity struct {
	ID                   uuid.UUID `gorm:"type:text;primaryKey"`
	InstallmentNumber int16
	Amount int64
	DueDate time.Time
	PaidDate *time.Time

	LoanID uuid.UUID
	Loan LoanEntity

	UserID uint
	User   UserEntity

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (l *InstallmentEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == uuid.Nil {
		l.ID = uuid.Must(uuid.NewV7())
	}
	return
}