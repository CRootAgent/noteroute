package com.noteroute.app.utils

object Constants {
    // Official Base URLs
    const val BASE_URL_RENDER_DEFAULT = "https://noteroute-backend.onrender.com/api/"
    const val BASE_URL_PRODUCTION = BASE_URL_RENDER_DEFAULT
    const val BASE_URL_LAN_DEFAULT = "http://192.168.0.102:3000/api/"
    const val BASE_URL_EMULATOR = "http://10.0.2.2:3000/api/"

    // LocalTunnel Specific IP Confirmation & Bypass Header
    const val LOCALTUNNEL_BYPASS_IP = "103.139.10.180"
    const val HEADER_BYPASS_TUNNEL = "Bypass-Tunnel-Reminder"

    // Default Workspace ID
    const val DEFAULT_WORKSPACE_ID = "6727bd89f1a23b0012e84101"

    // HTTP Timeouts
    const val CONNECT_TIMEOUT_SECONDS = 15L
    const val READ_TIMEOUT_SECONDS = 30L
    const val WRITE_TIMEOUT_SECONDS = 30L
}
