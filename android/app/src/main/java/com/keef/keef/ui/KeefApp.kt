package com.keef.keef.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.navigation.ModalBottomSheetLayout
import androidx.compose.material.navigation.bottomSheet
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.keef.keef.model.Category
import com.keef.keef.ui.category.CategoryTransactionsScreen
import com.keef.keef.ui.home.HomeScreen
import com.keef.keef.ui.home.SelectCategoryBottomSheet
import com.keef.keef.ui.home.newTransaction.NewTransactionScreen
import com.keef.keef.ui.navigation.NavigationDestinations
import com.keef.keef.ui.stats.StatsScreen

/**
 *  This is our root compose entry point.
 */
@Composable
fun KeefApp() {
    val bottomSheetNavigator = com.keef.keef.ui.navigation.rememberBottomSheetNavigator(skipHalfExpanded = true)
    val navController = rememberNavController(bottomSheetNavigator)

    Surface(modifier = Modifier.fillMaxSize()) {
        ModalBottomSheetLayout(bottomSheetNavigator) {
            KeefNavHost(navController)
        }
    }
}

@Composable
private fun KeefNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = NavigationDestinations.Dashboard.route
    ) {
        composable(NavigationDestinations.Dashboard.route) {
            HomeScreen(
                onNavigateToAddTransaction = {
                    navController.navigate(NavigationDestinations.AddTransaction.route)
                },
                onNavigateToChangeCategory = {
                    navController.navigate("${NavigationDestinations.ChangeCategory.route}/${it.id}")
                },
                onNavigateToCategory = {
                    navController.navigate("${NavigationDestinations.Category.route}/$it")
                },
                onNavigateToStats = {
                    navController.navigate(NavigationDestinations.Stats.route)
                }
            )
        }

        composable(
            route = "${NavigationDestinations.Category.route}/{category}",
            arguments = listOf(navArgument("category") {
                type = NavType.StringType
            })
        ) { backStackEntry ->
            CategoryTransactionsScreen(
                category = Category.valueOf(
                    backStackEntry.arguments?.getString("category") ?: Category.Food.name
                ),
                onNavigateBack = { navController.navigateUp() }
            )
        }

        composable(NavigationDestinations.Stats.route) {
            StatsScreen(
                onBackClicked = navController::navigateUp
            )
        }

        bottomSheet(NavigationDestinations.AddTransaction.route) {
            NewTransactionScreen(
                onNavigateBack = { navController.navigateUp() }
            )
        }

        bottomSheet(
            route = "${NavigationDestinations.ChangeCategory.route}/{id}",
            arguments = listOf(navArgument("id") {
                type = NavType.IntType
            })
        ) { backStackEntry ->
            SelectCategoryBottomSheet(
                transactionId = backStackEntry.arguments?.getInt("id") ?: -1,
                onNavigateBack = { navController.navigateUp() }
            )
        }

        bottomSheet(
            route = NavigationDestinations.Account.route
        ) { backStackEntry ->
//            FirebaseAuth.getInstance().currentUser?.let {
//                AccountBottomSheetScreen()
//            }
        }
    }
}

