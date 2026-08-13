package database

import (
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error
	dbPath := os.Getenv("DB_PATH")
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{DisableForeignKeyConstraintWhenMigrating: false})

	if err != nil {
		log.Fatal("Cannot connect to database!")
	}

	err = DB.AutoMigrate(&TransactionEntity{}, &BankEntity{}, &CategoryEntity{}, &TransactionTypeEntity{}, &UserEntity{}, &LoanEntity{}, &InstallmentEntity{}, &AssetEntity{}, &AssetTransactionEntity{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB.Exec("PRAGMA foreign_keys = ON;")

	log.Println("Database connection established!")
}
