package com.noteroute.app.data.repository

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.noteroute.app.data.api.ApiClient
import com.noteroute.app.data.api.NoteRouteApiService
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.model.ChatResponseData
import com.noteroute.app.data.model.CreateWorkspaceRequest
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.data.model.MetricsData
import com.noteroute.app.data.model.WorkspaceItem
import com.noteroute.app.utils.FileUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class NoteRouteRepository(
    private val customApiService: NoteRouteApiService? = null
) {
    private val apiService: NoteRouteApiService
        get() = customApiService ?: ApiClient.apiService

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

    suspend fun createWorkspace(name: String, description: String? = null): Result<WorkspaceItem> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.createWorkspace(CreateWorkspaceRequest(name, description))
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

    suspend fun uploadDocument(
        context: Context,
        uri: Uri,
        workspaceId: String? = null
    ): Result<DocumentItem> = withContext(Dispatchers.IO) {
        try {
            val contentResolver = context.contentResolver
            val filename = getFileNameFromUri(contentResolver, uri) ?: "document_${System.currentTimeMillis()}"
            val mimeType = contentResolver.getType(uri) ?: "application/octet-stream"
            val inputStream = contentResolver.openInputStream(uri) ?: throw Exception("Gagal membaca file dari HP")
            val bytes = inputStream.use { it.readBytes() }
            val requestFile = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
            val filePart = MultipartBody.Part.createFormData("file", filename, requestFile)

            val wsRequestBody = workspaceId?.let {
                it.toRequestBody("text/plain".toMediaTypeOrNull())
            }

            val response = apiService.uploadDocument(filePart, wsRequestBody)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun getFileNameFromUri(contentResolver: ContentResolver, uri: Uri): String? {
        var name: String? = null
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val index = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (index != -1) {
                    name = it.getString(index)
                }
            }
        }
        return name
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

