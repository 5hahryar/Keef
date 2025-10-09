package database

import "gorm.io/gorm"

type UserEntity struct {
	gorm.Model
	Username       string	`gorm:"unique;not null"`
	PasswordHash   string
}