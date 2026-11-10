package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class DocumentItem(
    @SerializedName("id") val id: String,
    @SerializedName("workspace_id") val workspaceId: String,
    @SerializedName("filename") val filename: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("file_size_formatted") val fileSizeFormatted: String,
    @SerializedName("mime_type") val mimeType: String,
    @SerializedName("summary") val summary: String? = null,
    @SerializedName("preview_text") val previewText: String? = null,
    @SerializedName("created_at") val createdAt: String
)
