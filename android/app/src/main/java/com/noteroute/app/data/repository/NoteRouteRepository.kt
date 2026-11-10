package com.noteroute.app.data.repository

import android.content.Context
import com.noteroute.app.data.api.ApiClient
import com.noteroute.app.data.api.NoteRouteApiService
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.model.ChatResponseData
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.data.model.MetricsData
import com.noteroute.app.data.model.WorkspaceItem
import com.noteroute.app.utils.FileUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class NoteRouteRepository(
    private val apiService: NoteRouteApiService = ApiClient.apiService
) {

    suspend fun getHealth(): Result<HealthCheckData> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getHealth()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getWorkspaces(): Result<List<WorkspaceItem>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getWorkspaces()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDocuments(workspaceId: String? = null): Result<List<DocumentItem>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getDocuments(workspaceId)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun downloadDocument(
        context: Context,
        documentId: String,
        filename: String,
        onProgress: ((bytesRead: Long, totalBytes: Long) -> Unit)? = null
    ): Result<File> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.downloadDocument(documentId)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val contentLength = body.contentLength()
                val file = FileUtils.saveStreamToFile(
                    context = context,
                    filename = filename,
                    inputStream = body.byteStream(),
                    onProgress = onProgress,
                    totalBytes = contentLength
                )
                Result.success(file)
            } else {
                Result.failure(Exception("Gagal mengunduh file: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendChat(request: ChatRequest): Result<ChatResponseData> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.chat(request)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMetrics(): Result<MetricsData> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getMetrics()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
