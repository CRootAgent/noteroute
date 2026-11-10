package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class ChatRequest(
    @SerializedName("workspace_id") val workspaceId: String,
    @SerializedName("prompt") val prompt: String,
    @SerializedName("model_target") val modelTarget: String,
    @SerializedName("history") val history: List<ChatMessageHistory> = emptyList()
)

data class ChatMessageHistory(
    @SerializedName("role") val role: String,
    @SerializedName("content") val content: String
)
