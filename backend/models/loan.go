package models

import (
	"time"

	"github.com/google/uuid"
)

type CreateLoanRequest struct {
	Name                 string  `json:"name"`
	NumberOfInstallments int16   `json:"numberOfInstallments"`
	InstallmentAmount    int64   `json:"installmentAmount"`
	DueDayNumber         int8    `json:"numberOfDueDay"`
	FirstPaymentDate     *string `json:"firstPaymentDate,omitempty"` // ISO 8601 format, optional
}

type Loan struct {
	Id                   uuid.UUID  `json:"id"`
	Name                 string     `json:"name"`
	NumberOfInstallments int16      `json:"numberOfInstallments"`
	InstallmentAmount    int64      `json:"installmentAmount"`
	DueDayNumber         int8       `json:"numberOfDueDay"`
	IsPaid         		 bool		`json:"isPaid"`
}

type LoanDetail struct {
	Id                   uuid.UUID     `json:"id"`
	Name                 string        `json:"name"`
	NumberOfInstallments int           `json:"numberOfInstallments"`
	InstallmentAmount    int64         `json:"installmentAmount"`
	NumberOfDueDay       int8          `json:"numberOfDueDay"`
	IsPaid         		 bool		   `json:"isPaid"`
	Installments         []Installment `json:"installments"`
}

type Installment struct {
	Id                uuid.UUID         `json:"id"`
	Amount            int64             `json:"amount"`
	DueDate           time.Time         `json:"dueDate"`
	InstallmentNumber int               `json:"installmentNumber"`
	Status            InstallmentStatus `json:"status"`
	Loan              Loan              `json:"loan"`
}

type InstallmentStatus string

const (
	InstallmentPending InstallmentStatus = "pending"
	InstallmentPaid    InstallmentStatus = "paid"
	InstallmentOverdue InstallmentStatus = "overdue"
)

type LoanStatus string

const (
	LoanActive  LoanStatus = "active"
	LoanPaid    LoanStatus = "paid"
)
