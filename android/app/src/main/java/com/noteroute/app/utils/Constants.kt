package com.noteroute.app.utils

object Constants {
    // Official Base URLs from API_CONTRACT.md
    const val BASE_URL_PRODUCTION = "https://noteroute.alwaysdata.net/api/"
    const val BASE_URL_EMULATOR = "http://10.0.2.2:3000/api/"
    const val BASE_URL_LAN_DEFAULT = "http://192.168.1.100:3000/api/"

    // Default Workspace ID
    const val DEFAULT_WORKSPACE_ID = "6727bd89f1a23b0012e84101"

    // HTTP Timeouts
    const val CONNECT_TIMEOUT_SECONDS = 15L
    const val READ_TIMEOUT_SECONDS = 30L
    const val WRITE_TIMEOUT_SECONDS = 30L
}
