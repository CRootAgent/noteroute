package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class MetricsData(
    @SerializedName("total_queries") val totalQueries: Long = 0,
    @SerializedName("prompt_tokens_total") val promptTokensTotal: Long = 0,
    @SerializedName("completion_tokens_total") val completionTokensTotal: Long = 0,
    @SerializedName("cost_saved_usd") val costSavedUsd: Double = 0.0,
    @SerializedName("cost_saved_idr") val costSavedIdr: Long = 0,
    @SerializedName("active_providers") val activeProviders: List<ActiveProvider> = emptyList()
)

data class ActiveProvider(
    @SerializedName("name") val name: String,
    @SerializedName("status") val status: String,
    @SerializedName("priority") val priority: Int
)
