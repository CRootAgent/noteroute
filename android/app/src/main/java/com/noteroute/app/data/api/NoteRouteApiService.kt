package com.noteroute.app.data.api

import com.noteroute.app.data.model.ApiResponse
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.model.ChatResponseData
import com.noteroute.app.data.model.CreateWorkspaceRequest
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.data.model.MetricsData
import com.noteroute.app.data.model.WorkspaceItem
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Streaming

interface NoteRouteApiService {

    @GET("health")
    suspend fun getHealth(): ApiResponse<HealthCheckData>

    @Headers("Accept: application/json")
    @GET("workspaces")
    suspend fun getWorkspaces(): ApiResponse<List<WorkspaceItem>>

    @Headers("Content-Type: application/json")
    @POST("workspaces")
    suspend fun createWorkspace(
        @Body request: CreateWorkspaceRequest
    ): ApiResponse<WorkspaceItem>

    @GET("documents")
    suspend fun getDocuments(
        @Query("workspace_id") workspaceId: String? = null
    ): ApiResponse<List<DocumentItem>>

    @Multipart
    @POST("documents/upload")
    suspend fun uploadDocument(
        @Part file: MultipartBody.Part,
        @Part("workspace_id") workspaceId: RequestBody? = null
    ): ApiResponse<DocumentItem>

    @Streaming
    @GET("documents/{id}/download")
    suspend fun downloadDocument(
        @Path("id") id: String
    ): Response<ResponseBody>

    @Headers("Content-Type: application/json")
    @POST("router/chat")
    suspend fun chat(
        @Body request: ChatRequest
    ): ApiResponse<ChatResponseData>

    @GET("router/metrics")
    suspend fun getMetrics(): ApiResponse<MetricsData>
}

