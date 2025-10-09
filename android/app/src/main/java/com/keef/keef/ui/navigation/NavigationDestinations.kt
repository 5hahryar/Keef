package com.keef.keef.ui.navigation

enum class NavigationDestinations(
    val route: String,
) {
    Dashboard("dashboard"),
    AddTransaction("addTransaction"),
    ChangeCategory("changeCategory"),
    Category("category"),
    Account("account"),
    Stats("stats"),
}