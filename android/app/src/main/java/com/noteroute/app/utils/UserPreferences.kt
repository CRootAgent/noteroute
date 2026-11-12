package com.noteroute.app.utils

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.noteroute.app.data.model.UserData
import com.noteroute.app.data.model.WorkspaceItem

class UserPreferences(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    var isLoggedIn: Boolean
        get() = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        set(value) = prefs.edit().putBoolean(KEY_IS_LOGGED_IN, value).apply()

    var userName: String
        get() = prefs.getString(KEY_USER_NAME, "Ahmad Zakky Nurfauzan") ?: "Ahmad Zakky Nurfauzan"
        set(value) = prefs.edit().putString(KEY_USER_NAME, value).apply()

    var userEmail: String
        get() = prefs.getString(KEY_USER_EMAIL, "ahmadzakky@ulbi.ac.id") ?: "ahmadzakky@ulbi.ac.id"
        set(value) = prefs.edit().putString(KEY_USER_EMAIL, value).apply()

    var userNpm: String
        get() = prefs.getString(KEY_USER_NPM, "714250028") ?: "714250028"
        set(value) = prefs.edit().putString(KEY_USER_NPM, value).apply()

    var userToken: String?
        get() = prefs.getString(KEY_USER_TOKEN, "demo_jwt_token_123456")
        set(value) = prefs.edit().putString(KEY_USER_TOKEN, value).apply()

    fun getUserInitial(): String {
        val name = userName.trim()
        if (name.isEmpty()) return "N"
        return name.first().toString().uppercase()
    }

    fun saveUser(user: UserData) {
        isLoggedIn = true
        userName = user.name
        userEmail = user.email
        user.npm?.let { userNpm = it }
        user.token?.let { userToken = it }
    }

    fun logout() {
        prefs.edit().remove(KEY_IS_LOGGED_IN).remove(KEY_USER_TOKEN).apply()
        isLoggedIn = false
    }

    fun getLocalWorkspaces(): List<WorkspaceItem> {
        val json = prefs.getString(KEY_WORKSPACES_JSON, null) ?: return emptyList()
        val type = object : TypeToken<List<WorkspaceItem>>() {}.type
        return try {
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveLocalWorkspaces(list: List<WorkspaceItem>) {
        val json = gson.toJson(list)
        prefs.edit().putString(KEY_WORKSPACES_JSON, json).apply()
    }

    fun addLocalWorkspace(workspace: WorkspaceItem) {
        val current = getLocalWorkspaces().toMutableList()
        current.add(0, workspace)
        saveLocalWorkspaces(current)
    }

    fun updateLocalWorkspaceName(id: String, newName: String) {
        val current = getLocalWorkspaces().map {
            if (it.id == id) it.copy(name = newName) else it
        }
        saveLocalWorkspaces(current)
    }

    fun deleteLocalWorkspace(id: String) {
        val current = getLocalWorkspaces().filterNot { it.id == id }
        saveLocalWorkspaces(current)
    }

    fun deleteLocalWorkspacesBatch(ids: Set<String>) {
        val current = getLocalWorkspaces().filterNot { ids.contains(it.id) }
        saveLocalWorkspaces(current)
    }

    companion object {
        private const val PREF_NAME = "noteroute_user_prefs"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_NPM = "user_npm"
        private const val KEY_USER_TOKEN = "user_token"
        private const val KEY_WORKSPACES_JSON = "workspaces_json"

        @Volatile
        private var INSTANCE: UserPreferences? = null

        fun getInstance(context: Context): UserPreferences {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: UserPreferences(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
}
