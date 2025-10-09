package com.keef.keef.ui.home

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.keef.keef.common.Resource
import com.keef.keef.model.Category
import com.keef.keef.model.Transaction
import com.keef.keef.remote.ApiService

class TransactionPagingSource(
    private val apiService: ApiService,
    private val category: Category? = null,
): PagingSource<Int, Transaction>() {

    override fun getRefreshKey(state: PagingState<Int, Transaction>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Transaction> {
        return try {
            val page = params.key ?: 1
            val response = apiService.getTransactions(page, category?.name)

            when(response) {
                is Resource.Error -> LoadResult.Error(Exception(response.message))
                is Resource.Success -> {
                    LoadResult.Page(
                        data = response.data,
                        prevKey = null,
                        nextKey = if (response.data.isEmpty()) null else page + 1
                    )
                }
            }
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}