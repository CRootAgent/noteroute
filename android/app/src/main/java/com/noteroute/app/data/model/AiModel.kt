package com.noteroute.app.data.model

enum class AiModel(
    val targetKey: String,
    val displayName: String,
    val subtitle: String,
    val provider: String
) {
    GEMINI(
        targetKey = "gemini",
        displayName = "Gemini 1.5 Flash",
        subtitle = "Google AI (1M Token Context)",
        provider = "google"
    ),
    GROQ(
        targetKey = "groq",
        displayName = "Groq Llama 3.3",
        subtitle = "Groq Cloud (Ultra Fast)",
        provider = "groq"
    ),
    DEEPSEEK(
        targetKey = "deepseek",
        displayName = "DeepSeek R1",
        subtitle = "DeepSeek Reasoning (Cost-Effective)",
        provider = "deepseek"
    ),
    NINE_ROUTER(
        targetKey = "9router_local",
        displayName = "9Router Local",
        subtitle = "LAN Private Gateway :20128",
        provider = "local"
    );

    companion object {
        fun fromTargetKey(key: String): AiModel {
            return entries.firstOrNull { it.targetKey.equals(key, ignoreCase = true) } ?: GEMINI
        }
    }
}
