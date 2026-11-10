package com.noteroute.app.data.api

import com.noteroute.app.data.model.ApiResponse
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.model.ChatResponseData
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.data.model.MetricsData
import com.noteroute.app.data.model.WorkspaceItem
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Streaming

interface NoteRouteApiService {

    @GET("health")
    suspend fun getHealth(): ApiResponse<HealthCheckData>

    @Headers("Accept: application/json")
    @GET("workspaces")
    suspend fun getWorkspaces(): ApiResponse<List<WorkspaceItem>>

    @GET("documents")
    suspend fun getDocuments(
        @Query("workspace_id") workspaceId: String? = null
    ): ApiResponse<List<DocumentItem>>

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
