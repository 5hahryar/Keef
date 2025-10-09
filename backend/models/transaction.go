package models

type Transaction struct {
	Id int `json:"id"`
	Title string `json:"title"`
	Description string `json:"description"`
	Amount int64 `json:"amount"`
	Date string `json:"date"`
	Bank string `json:"bank"`
	Category string `json:"category"`
	Type string `json:"type"`
}