package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class WorkspaceItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("document_count") val documentCount: Int = 0,
    @SerializedName("created_at") val createdAt: String
)
