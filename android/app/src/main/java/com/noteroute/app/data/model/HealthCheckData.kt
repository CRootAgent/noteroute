package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class HealthCheckData(
    @SerializedName("status") val status: String,
    @SerializedName("database") val database: String,
    @SerializedName("timestamp") val timestamp: String
)
