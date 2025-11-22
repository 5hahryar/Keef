package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LoanEntity struct {
	ID                   uuid.UUID `gorm:"type:text;primaryKey"`
	Name                 string
	InstallmentAmount    int64
	NumberOfInstallments int16
	DueDayNumber         int8

	Installments []InstallmentEntity `gorm:"foreignKey:LoanID"`

	UserID uint
	User   UserEntity

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (l *LoanEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == uuid.Nil {
		l.ID = uuid.Must(uuid.NewV7())
	}
	return
}
