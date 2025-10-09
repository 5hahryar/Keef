package com.keef.keef.remote

import com.keef.keef.common.Resource
import com.keef.keef.model.Bank
import com.keef.keef.model.Category
import com.keef.keef.model.Token
import com.keef.keef.model.Transaction
import com.keef.keef.model.TransactionType
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.plugins.RedirectResponseException
import io.ktor.client.plugins.ServerResponseException
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import kotlinx.datetime.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

interface ApiService {
    suspend fun getTransactions(page: Int, category: String? = null): Resource<List<Transaction>>
    suspend fun createTransaction(transaction: Transaction): Resource<Int>
    suspend fun deleteTransaction(transactionId: Int): Resource<Unit>
    suspend fun getTotalSpending(category: String? = null, startTime: Instant? = null, endTime: Instant? = null): Resource<Long>
    suspend fun getStatsTotalSpendingByCategory(startTime: Instant, endTime: Instant): Resource<Map<Category, Long>>
    suspend fun getAccessToken(username: String, password: String): Resource<Token>
}

class ApiServiceImpl(private val client: HttpClient) : ApiService {

    override suspend fun getTransactions(page: Int, category: String?): Resource<List<Transaction>> {
        return handleApiCall {
            client.get("transactions") {
                url {
                    parameters.append("page", page.toString())
                    category?.let { parameters.append("category", it) }
                }
            }.body<List<RemoteTransaction>>().map {
                return@map Transaction(
                    id = it.id,
                    title = it.title,
                    description = it.description,
                    amount = it.amount,
                    transactionType = TransactionType.valueOf(it.type),
                    datetime = it.date,
                    bank = Bank.valueOf(it.bank),
                    category = Category.valueOf(it.category)
                )
            }
        }
    }

    override suspend fun createTransaction(transaction: Transaction): Resource<Int> {
        return handleApiCall {
            client.post("transactions/create") {
                setBody(
                    RemoteTransaction(
                        -1,
                        transaction.title,
                        transaction.description,
                        transaction.amount,
                        transaction.transactionType.name,
                        "",
                        transaction.bank.name,
                        transaction.category.name
                    )
                )
            }.body()
        }
    }

    override suspend fun deleteTransaction(transactionId: Int): Resource<Unit> {
        return handleApiCall { client.delete("transactions/$transactionId/delete") }
    }

    override suspend fun getTotalSpending(category: String?, startTime: Instant?, endTime: Instant?): Resource<Long> {
        return handleApiCall { client.get("statistics/total-spent") {
            url {
                category?.let { parameters.append("category", it) }
                startTime?.let { parameters.append("startDate", it.toString()) }
                endTime?.let { parameters.append("endDate", it.toString()) }
            }
        }.body() }
    }

    override suspend fun getStatsTotalSpendingByCategory(
        startTime: Instant,
        endTime: Instant
    ): Resource<Map<Category, Long>> {
        return handleApiCall { client.get("statistics/total-spent-category"){
            url {
                parameters.append("startDate", startTime.toString())
                parameters.append("endDate", endTime.toString())
            }
        }.body<List<RemoteCategoryTotal>>().associate { item -> Category.valueOf(item.categoryName) to item.total } }
    }

    override suspend fun getAccessToken(
        username: String,
        password: String
    ): Resource<Token> {
        return handleApiCall { client.post("users/token") {
            setBody(LoginRequest(username, password))
        }.body() }
    }

    private suspend fun <T> handleApiCall(apiCall: suspend () -> T): Resource<T> {
        return try {
            Resource.Success(apiCall())
        } catch (e: RedirectResponseException) {
            Resource.Error("Redirection error: ${e.response.status.description} (${e.response.status.value})")
        } catch (e: ClientRequestException) {
            Resource.Error("Client error: ${e.response.status.description} (${e.response.status.value}) message: ${e.response.bodyAsText()}")
        } catch (e: ServerResponseException) {
            Resource.Error("Server error: ${e.response.status.description} (${e.response.status.value})")
        } catch (e: io.ktor.serialization.JsonConvertException) {
            Resource.Error("Data parsing error: ${e.localizedMessage}")
        } catch (e: Exception) {
            Resource.Error("An unexpected error occurred: ${e.localizedMessage}")
        }
    }
}

@Serializable
private data class RemoteTransaction(
    val id: Int,
    val title: String,
    val description: String? = null,
    val amount: Long,
    val type: String,
    val date: String,
    val bank: String,
    val category: String,
)

@Serializable
private data class LoginRequest(
    val username: String,
    val password: String,
)

@Serializable
private data class RemoteCategoryTotal(
    @SerialName("name") val categoryName: String,
    @SerialName("total") val total: Long,
)