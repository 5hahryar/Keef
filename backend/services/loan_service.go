package services

import (
	"errors"
	"fmt"
	"keef/database"
	"keef/models"
	"log"
	"time"

	"github.com/google/uuid"
	ptime "github.com/yaa110/go-persian-calendar"
)

func CreateLoan(username string, loan *models.CreateLoanRequest) (id *uuid.UUID, err error) {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	// Parse first payment date if provided
	var firstPaymentDate *time.Time
	if loan.FirstPaymentDate != nil && *loan.FirstPaymentDate != "" {
		parsedDate, parseErr := time.Parse(time.RFC3339, *loan.FirstPaymentDate)
		if parseErr != nil {
			return nil, errors.New("invalid first payment date format")
		}
		firstPaymentDate = &parsedDate
	}

	var installments []database.InstallmentEntity
	// now := time.Now().UTC()

	dueDates := generateInstallmentDueDates(int(loan.DueDayNumber), int(loan.NumberOfInstallments), firstPaymentDate)

	for i := 0; i < int(loan.NumberOfInstallments); i++ {
		log.Println("creating number ", i)
		installment := database.InstallmentEntity{
			Amount:            loan.InstallmentAmount,
			DueDate:           dueDates[i],
			InstallmentNumber: int16(i) + 1,
			UserID:            userEntity.ID,
		}

		if time.Now().UTC().After(dueDates[i].UTC()) {
			installment.PaidDate = &dueDates[i]
		}


		// If first payment date is provided, mark installments as paid
		// that have due dates on or before the first payment date
		// and before or on today (to prevent marking future installments)
		// if firstPaymentDate != nil {
		// 	dueDateUTC := installment.DueDate.UTC()
		// 	firstPaymentUTC := firstPaymentDate.UTC()

		// 	// Installment is paid if:
		// 	// 1. Its due date is on or before the first payment date (meaning it was already paid)
		// 	// 2. Its due date is before or on today (can't mark future installments as paid)
		// 	dueDateBeforeFirstPayment := !dueDateUTC.After(firstPaymentUTC)
		// 	dueDateNotInFuture := !dueDateUTC.After(now)

		// 	if dueDateBeforeFirstPayment && dueDateNotInFuture {
		// 		// Use the first payment date as the paid date for all installments up to that point
		// 		paidDate := firstPaymentUTC
		// 		installment.PaidDate = &paidDate
		// 	}
		// }
		fmt.Println("INSTALLMENT:", installment)

		installments = append(installments, installment)
	}

	entity := database.LoanEntity{
		Name:                 loan.Name,
		InstallmentAmount:    loan.InstallmentAmount,
		NumberOfInstallments: loan.NumberOfInstallments,
		DueDayNumber:         loan.DueDayNumber,
		Installments:         installments,
		UserID:               userEntity.ID,
	}

	result := database.DB.Create(&entity)

	if result.Error != nil {
		fmt.Println(result.Error.Error())
		fmt.Println(entity)
		return &entity.ID, result.Error
	}

	return &entity.ID, nil
}

func GetAllLoans(username string) (loan []models.Loan, err error) {
	var loans []database.LoanEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)
	query := database.DB.Where("user_id = ?", userEntity.ID)

	query.Find(&loans)
	result := make([]models.Loan, len(loans))
	for i, entity := range loans {
		result[i] = models.Loan{
			Id:                   entity.ID,
			Name:                 entity.Name,
			NumberOfInstallments: entity.NumberOfInstallments,
			InstallmentAmount:    entity.InstallmentAmount,
			DueDayNumber:         entity.DueDayNumber,
		}
	}

	return result, nil
}

func GetLoanInformation(username string, loanId uuid.UUID) (loan *models.LoanDetail, err error) {
	var userEntity database.UserEntity
	var entity database.LoanEntity
	database.DB.Where("username = ?", username).First(&userEntity)
	err = database.DB.Where("id = ? AND user_id = ?", loanId, userEntity.ID).
		Preload("Installments").First(&entity).Error

	if err != nil {
		log.Println("Unable to get loan info!")
		return nil, err
	}

	installments := make([]models.Installment, len(entity.Installments))
	for i, entity := range entity.Installments {
		status := models.InstallmentPending
		if entity.PaidDate != nil {
			status = models.InstallmentPaid
		} else if time.Now().UTC().After(entity.DueDate.UTC()) {
			status = models.InstallmentOverdue
		}

		installments[i] = models.Installment{
			Id:                entity.ID,
			Amount:            entity.Amount,
			DueDate:           entity.DueDate,
			InstallmentNumber: int(entity.InstallmentNumber),
			Status:            status,
		}
	}
	result := models.LoanDetail{
		Id:                   entity.ID,
		Name:                 entity.Name,
		NumberOfInstallments: int(entity.NumberOfInstallments),
		InstallmentAmount:    entity.InstallmentAmount,
		NumberOfDueDay:       entity.DueDayNumber,
		Installments:         installments,
	}

	return &result, nil
}

func generateInstallmentDueDates(dueDayNumber int, numInstallments int, firstPaymentDate *time.Time) []time.Time {
	var dates []time.Time

	now := ptime.Now()
	year := now.Year()
	month := now.Month() + 1 // start from next month

	if firstPaymentDate != nil {
		now = ptime.New(*firstPaymentDate)
		month = now.Month()
	}

	for i := 0; i < numInstallments; i++ {
		// handle month overflow
		for month > 12 {
			month -= 12
			year++
		}

		// make sure due day does not exceed month length
		day := dueDayNumber
		// lastDay := ptime.DaysInMonth(year, month)
		// if day > lastDay {
		// 	day = lastDay
		// }

		// create the due date in Persian calendar
		dueDate := ptime.Date(year, month, day, 0, 0, 0, 0, time.Local)
		dates = append(dates, dueDate.Time())

		month++ // move to next month
	}

	fmt.Println("firstPaymentDate: ", firstPaymentDate)
	fmt.Println("dates: ", dates)

	return dates
}

func GetInstallments(username string, fromDueDate *time.Time, toDueDate *time.Time) []models.Installment {
	var installments []database.InstallmentEntity
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	database.DB.Where("user_id = ?", userEntity.ID).Where("due_date >= ?", fromDueDate).Where("due_date <= ?", toDueDate).Preload("Loan").Find(&installments)

	if installments == nil {
		return []models.Installment{}
	}

	result := make([]models.Installment, len(installments))
	for i, entity := range installments {
		status := models.InstallmentPending
		if entity.PaidDate != nil {
			status = models.InstallmentPaid
		} else if time.Now().UTC().After(entity.DueDate.UTC()) {
			status = models.InstallmentOverdue
		}

		result[i] = models.Installment{
			Id:                entity.ID,
			Amount:            entity.Amount,
			DueDate:           entity.DueDate,
			Status:            status,
			InstallmentNumber: int(entity.InstallmentNumber),
			Loan: models.Loan{
				Id:                   entity.Loan.ID,
				Name:                 entity.Loan.Name,
				NumberOfInstallments: entity.Loan.NumberOfInstallments,
				InstallmentAmount:    entity.Loan.InstallmentAmount,
				DueDayNumber:         entity.Loan.DueDayNumber,
			},
		}
	}

	return result
}

func PayInstallment(username string, loanId uuid.UUID, installmentId uuid.UUID) error {
	var userEntity database.UserEntity
	database.DB.Where("username = ?", username).First(&userEntity)

	var installmentEntity database.InstallmentEntity
	database.DB.Where("id = ? AND user_id = ?", installmentId, userEntity.ID).First(&installmentEntity)

	if installmentEntity.ID == uuid.Nil {
		return errors.New("installment not found")
	}

	if installmentEntity.LoanID != loanId {
		return errors.New("installment does not belong to the loan")
	}

	now := time.Now().UTC()
	installmentEntity.PaidDate = &now
	database.DB.Save(&installmentEntity)

	return nil
}
