package com.keef.keef.data

import com.keef.keef.common.Resource
import com.keef.keef.model.Token
import com.keef.keef.remote.ApiService

interface UserRepository {
    suspend fun getAccessToken(username: String, password: String): Resource<Token>
}

class UserRepositoryImpl(private val apiService: ApiService) : UserRepository {

    override suspend fun getAccessToken(
        username: String,
        password: String
    ): Resource<Token> =
        apiService.getAccessToken(username, password)

}