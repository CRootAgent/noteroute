package com.noteroute.app.utils

import android.content.Context
import android.content.SharedPreferences

class AiPreferences(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    var geminiApiKey: String
        get() = prefs.getString(KEY_GEMINI_KEY, "") ?: ""
        set(value) = prefs.edit().putString(KEY_GEMINI_KEY, value).apply()

    var groqApiKey: String
        get() = prefs.getString(KEY_GROQ_KEY, "") ?: ""
        set(value) = prefs.edit().putString(KEY_GROQ_KEY, value).apply()

    var deepseekApiKey: String
        get() = prefs.getString(KEY_DEEPSEEK_KEY, "") ?: ""
        set(value) = prefs.edit().putString(KEY_DEEPSEEK_KEY, value).apply()

    var nineRouterUrl: String
        get() = prefs.getString(KEY_9ROUTER_URL, "http://localhost:20128/v1") ?: "http://localhost:20128/v1"
        set(value) = prefs.edit().putString(KEY_9ROUTER_URL, value).apply()

    var primaryModel: String
        get() = prefs.getString(KEY_PRIMARY_MODEL, "gemini") ?: "gemini"
        set(value) = prefs.edit().putString(KEY_PRIMARY_MODEL, value).apply()

    var secondaryModel: String
        get() = prefs.getString(KEY_SECONDARY_MODEL, "groq") ?: "groq"
        set(value) = prefs.edit().putString(KEY_SECONDARY_MODEL, value).apply()

    var tertiaryModel: String
        get() = prefs.getString(KEY_TERTIARY_MODEL, "9router_local") ?: "9router_local"
        set(value) = prefs.edit().putString(KEY_TERTIARY_MODEL, value).apply()

    var autoFailoverEnabled: Boolean
        get() = prefs.getBoolean(KEY_AUTO_FAILOVER, true)
        set(value) = prefs.edit().putBoolean(KEY_AUTO_FAILOVER, value).apply()

    fun getPriorityList(): List<String> {
        return listOf(primaryModel, secondaryModel, tertiaryModel)
    }

    companion object {
        private const val PREF_NAME = "noteroute_ai_prefs"
        private const val KEY_GEMINI_KEY = "gemini_api_key"
        private const val KEY_GROQ_KEY = "groq_api_key"
        private const val KEY_DEEPSEEK_KEY = "deepseek_api_key"
        private const val KEY_9ROUTER_URL = "9router_url"
        private const val KEY_PRIMARY_MODEL = "primary_model"
        private const val KEY_SECONDARY_MODEL = "secondary_model"
        private const val KEY_TERTIARY_MODEL = "tertiary_model"
        private const val KEY_AUTO_FAILOVER = "auto_failover"

        @Volatile
        private var INSTANCE: AiPreferences? = null

        fun getInstance(context: Context): AiPreferences {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AiPreferences(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
}
