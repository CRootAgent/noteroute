package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class ChatResponseData(
    @SerializedName("response_text") val responseText: String,
    @SerializedName("model_used") val modelUsed: String,
    @SerializedName("latency_ms") val latencyMs: Long,
    @SerializedName("fallback_triggered") val fallbackTriggered: Boolean = false,
    @SerializedName("citations") val citations: List<CitationItem> = emptyList()
)

data class CitationItem(
    @SerializedName("doc_id") val docId: String,
    @SerializedName("filename") val filename: String,
    @SerializedName("page") val page: Int,
    @SerializedName("snippet") val snippet: String
)
