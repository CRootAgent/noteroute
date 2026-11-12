package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class UserData(
    @SerializedName("user_id") val userId: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("npm") val npm: String? = null,
    @SerializedName("token") val token: String? = null
)
