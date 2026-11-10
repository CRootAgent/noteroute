package com.noteroute.app

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.noteroute.app.data.model.ApiResponse
import com.noteroute.app.data.model.HealthCheckData
import com.noteroute.app.utils.Constants
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * TC-11: Health Check & Connectivity (Modul Izat)
 * Validates backend health check parsing and multi-environment URL configurations.
 */
class TC11_HealthCheckConnectivityTest {

    private val gson = Gson()

    private val healthJson = """
    {
      "success": true,
      "message": "NoteRoute Backend Engine is running",
      "data": {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2026-11-04T10:00:00.000Z"
      }
    }
    """.trimIndent()

    @Test
    fun `TC-11-01 - Parse health check response correctly`() {
        val type = object : TypeToken<ApiResponse<HealthCheckData>>() {}.type
        val response: ApiResponse<HealthCheckData> = gson.fromJson(healthJson, type)

        assertTrue(response.success)
        assertNotNull(response.data)
        assertEquals("healthy", response.data!!.status)
        assertEquals("connected", response.data!!.database)
        assertEquals("2026-11-04T10:00:00.000Z", response.data!!.timestamp)
    }

    @Test
    fun `TC-11-02 - Validate Base URLs matching API_CONTRACT specification`() {
        assertEquals("https://noteroute-zakky.loca.lt/api/", Constants.BASE_URL_PRODUCTION)
        assertEquals("https://noteroute-zakky.loca.lt/api/", Constants.BASE_URL_LOCALTUNNEL)
        assertEquals("103.139.10.180", Constants.LOCALTUNNEL_BYPASS_IP)
        assertEquals("http://10.0.2.2:3000/api/", Constants.BASE_URL_EMULATOR)
        assertTrue(Constants.BASE_URL_LAN_DEFAULT.startsWith("http://"))
    }
}
