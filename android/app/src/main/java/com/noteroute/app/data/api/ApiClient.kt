package com.noteroute.app.data.api

import com.noteroute.app.utils.Constants
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    private var currentBaseUrl: String = Constants.BASE_URL_PRODUCTION
    val mockInterceptor = MockInterceptor()

    private var okHttpClient: OkHttpClient = buildOkHttpClient()
    private var retrofit: Retrofit = buildRetrofit(currentBaseUrl, okHttpClient)
    var apiService: NoteRouteApiService = retrofit.create(NoteRouteApiService::class.java)
        private set

    private fun buildOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(mockInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(Constants.CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(Constants.READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(Constants.WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    private fun buildRetrofit(baseUrl: String, client: OkHttpClient): Retrofit {
        val sanitizedUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
        return Retrofit.Builder()
            .baseUrl(sanitizedUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun setBaseUrl(newBaseUrl: String) {
        currentBaseUrl = newBaseUrl
        retrofit = buildRetrofit(currentBaseUrl, okHttpClient)
        apiService = retrofit.create(NoteRouteApiService::class.java)
    }

    fun getBaseUrl(): String = currentBaseUrl

    fun enableMock(enabled: Boolean) {
        mockInterceptor.isMockEnabled = enabled
    }
}
