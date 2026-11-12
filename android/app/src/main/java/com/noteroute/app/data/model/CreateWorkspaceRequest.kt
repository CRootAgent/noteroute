package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class CreateWorkspaceRequest(
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = null
)
