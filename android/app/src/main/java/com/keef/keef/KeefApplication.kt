package com.keef.keef

import android.app.Application
import android.content.SharedPreferences
import com.keef.keef.common.Const
import com.keef.keef.remote.ApiService
import com.keef.keef.remote.ApiServiceImpl
import com.keef.keef.ui.account.AccountViewModel
import com.keef.keef.ui.category.CategoryTransactionsViewModel
import com.keef.keef.ui.home.TransactionsViewModel
import com.keef.keef.ui.home.newTransaction.NewTransactionViewModel
import com.keef.keef.data.TransactionRepository
import com.keef.keef.data.TransactionRepositoryImpl
import com.keef.keef.data.UserRepository
import com.keef.keef.data.UserRepositoryImpl
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.core.context.startKoin
import org.koin.dsl.module

class KeefApplication: Application() {

    private val appModule = module {

        viewModel { TransactionsViewModel(get()) }
        viewModel { AccountViewModel(get(), get()) }
        viewModel { NewTransactionViewModel(get()) }
        viewModel { params -> CategoryTransactionsViewModel(get(), params.get()) }

        single<TransactionRepository> { TransactionRepositoryImpl(get()) }
        single<UserRepository> { UserRepositoryImpl(get()) }

        single<SharedPreferences> { applicationContext.getSharedPreferences("Keef", MODE_PRIVATE) }

        single {
            val sharedPrefs = get<SharedPreferences>()
            HttpClient(OkHttp) {
                expectSuccess = true
                install(Logging) {
                    level = LogLevel.ALL
                }
                install(ContentNegotiation) {
                    json(Json {
                        ignoreUnknownKeys = true
                    })
                }

                defaultRequest {
                    contentType(ContentType.Application.Json)
                    url(BuildConfig.BASE_URL)
                }

                install(Auth) {
                    bearer {
                        loadTokens {
                            BearerTokens(
                                accessToken = sharedPrefs.getString(Const.PREFS_ACCESS_TOKEN_KEY, null) ?: "",
                                refreshToken = ""
                            )
                        }
                        refreshTokens {
                            sharedPrefs.edit().putString(Const.PREFS_ACCESS_TOKEN_KEY, null)
                            null
                        }
                    }
                }
            }
        }

        single<ApiService> { ApiServiceImpl(get()) }
    }

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@KeefApplication)
            modules(appModule)
        }
    }
}
