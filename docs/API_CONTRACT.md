# 📜 NOTE-ROUTE: OFFICIAL REST API CONTRACT & DATA SCHEMAS
**Versi Kontrak:** `1.0.0`  
**Status:** **LOCKED (Terkunci & Disepakati Bersama)**  
**Target Pemakai:**
- **Modul A (Backend Provider):** Ahmad Zakky Nurfauzan
- **Modul B (Android Consumer):** Izat Ibrahimovic Irawan

> **⚠️ ATURAN EMAS KONTRAK (GOLDEN RULE):**  
> Dilarang keras mengubah nama key JSON, tipe data, atau endpoint di bawah ini secara sepihak!  
> Jika ada penambahan / perubahan field, **wajib didiskusikan dan disetujui kedua belah pihak** sebelum kode diubah.

---

## 1. BASE URL CONFIGURATION

| Lingkungan | Alamat Base URL | Keterangan |
| :--- | :--- | :--- |
| **Production (Cloud)** | `https://noteroute.alwaysdata.net/api` | Hosting Alwaysdata dengan SSL HTTPS aktif |
| **Android Emulator** | `http://10.0.2.2:3000/api` | Akses backend lokal laptop dari emulator Android Studio |
| **Physical HP (1 WiFi)**| `http://<IP_LAPTOP_ZAKKY>:3000/api` | Akses backend lokal laptop dari HP fisik via WiFi lokal |

---

## 2. STANDAR FORMAT RESPON API

Semua endpoint mengembalikan format envelope standar:
```json
{
  "success": true,
  "message": "Deskripsi status sukses atau error",
  "data": { ... }
}
```
Jika terjadi galat (HTTP 4xx / 5xx):
```json
{
  "success": false,
  "message": "Pesan kesalahan yang ramah pengguna",
  "error_code": "RESOURCE_NOT_FOUND"
}
```

---

## 3. DAFTAR ENDPOINT & SPESIFIKASI DATA

### 🟢 A. Health Check & Konektivitas
* **Method & Path:** `GET /health`
* **Kegunaan:** Memeriksa apakah backend aktif dan MongoDB tersambung (TC-11).
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "NoteRoute Backend Engine is running",
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2026-11-04T10:00:00.000Z"
  }
}
```

---

### 🟢 B. Workspaces (Ruang Kerja Dokumen)
* **Method & Path:** `GET /workspaces`
* **Headers:** `Accept: application/json`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Daftar workspace berhasil diambil",
  "data": [
    {
      "id": "6727bd89f1a23b0012e84101",
      "name": "Materi Kuliah Semester 5",
      "description": "Slide kuliah, modul praktikum, dan riset",
      "document_count": 8,
      "created_at": "2026-11-04T08:00:00.000Z"
    }
  ]
}
```

---

### 🟢 C. Documents Explorer ("Ambil File dari Laptop" - Modul Izat TC-07)
* **Method & Path:** `GET /documents`
* **Query Parameters:** `workspace_id` (opsional, string)
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Daftar dokumen berhasil dimuat",
  "data": [
    {
      "id": "6727be01f1a23b0012e84102",
      "workspace_id": "6727bd89f1a23b0012e84101",
      "filename": "Slide_Bab3_Distributed_Systems.pdf",
      "file_size": 2457600,
      "file_size_formatted": "2.34 MB",
      "mime_type": "application/pdf",
      "summary": "Membahas arsitektur microservices, RPC, dan konsistensi data terdistribusi.",
      "preview_text": "Bab 3: Sistem Terdistribusi. 1. Definisi dan Karakteristik...",
      "created_at": "2026-11-04T08:15:00.000Z"
    },
    {
      "id": "6727be15f1a23b0012e84103",
      "workspace_id": "6727bd89f1a23b0012e84101",
      "filename": "Catatan_Riset_LLM_Router.md",
      "file_size": 15420,
      "file_size_formatted": "15.06 KB",
      "mime_type": "text/markdown",
      "summary": "Analisis perbandingan latensi antara Gemini 1.5 Flash dan Groq Llama 3.3.",
      "preview_text": "# Riset LLM Router\nEvaluasi penghematan token menggunakan 9Router...",
      "created_at": "2026-11-04T08:30:00.000Z"
    }
  ]
}
```

---

### 🟢 D. File Download Stream ("Unduh ke Memori HP" - Modul Izat TC-08)
* **Method & Path:** `GET /documents/:id/download`
* **Path Parameters:** `id` (Document ID)
* **Response (200 OK):**
  * `Content-Type`: `application/pdf` / `text/markdown` / `application/octet-stream`
  * `Content-Disposition`: `attachment; filename="Slide_Bab3_Distributed_Systems.pdf"`
  * `Content-Length`: `2457600`
  * **Body:** Binary Stream data berkas asli.
* **Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Dokumen tidak ditemukan atau berkas fisik terhapus",
  "error_code": "FILE_NOT_FOUND"
}
```

---

### 🟢 E. Document Chat & Multi-Model Inference (Modul Izat TC-09, TC-10 & Modul Zakky TC-03, TC-04, TC-05)
* **Method & Path:** `POST /router/chat`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "workspace_id": "6727bd89f1a23b0012e84101",
  "prompt": "Apa kesimpulan bab 3 mengenai konsistensi data terdistribusi?",
  "model_target": "gemini",
  "history": [
    {
      "role": "user",
      "content": "Halo NoteRoute"
    },
    {
      "role": "assistant",
      "content": "Halo! Ada yang bisa saya bantu dengan dokumen laptop Anda?"
    }
  ]
}
```
> **Pilihan `model_target`:**
> - `"gemini"` -> Google Gemini 1.5 Flash (Gratis 1M Token Context)
> - `"groq"` -> Groq Cloud Llama 3.3 70B (Respon Kilat)
> - `"deepseek"` -> DeepSeek R1 / V3 (Penalaran Rendah Biaya)
> - `"9router_local"` -> Bridge ke 9Router/OmniRoute Lokal port 20128

* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Inferensi sukses",
  "data": {
    "response_text": "Berdasarkan Slide Bab 3, kesimpulan utamanya adalah bahwa dalam sistem terdistribusi, teorema CAP menyatakan bahwa kita hanya dapat menjamin dua dari tiga sifat: Consistency, Availability, dan Partition Tolerance.",
    "model_used": "gemini-1.5-flash",
    "latency_ms": 482,
    "fallback_triggered": false,
    "citations": [
      {
        "doc_id": "6727be01f1a23b0012e84102",
        "filename": "Slide_Bab3_Distributed_Systems.pdf",
        "page": 14,
        "snippet": "Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat secara bersamaan dengan ketersediaan penuh pada partisi jaringan."
      }
    ]
  }
}
```

---

### 🟢 F. Token Efficiency & Metrics (Modul Zakky TC-06)
* **Method & Path:** `GET /router/metrics`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Metrik token dan penghematan biaya berhasil dimuat",
  "data": {
    "total_queries": 142,
    "prompt_tokens_total": 524000,
    "completion_tokens_total": 48200,
    "cost_saved_usd": 12.85,
    "cost_saved_idr": 208500,
    "active_providers": [
      { "name": "gemini", "status": "active", "priority": 1 },
      { "name": "groq", "status": "active", "priority": 2 },
      { "name": "9router_local", "status": "standby", "priority": 3 }
    ]
  }
}
```

---

## 4. KOTLIN DATA CLASSES KESIAPAN MODUL B (KOTLIN RETROFIT MODELS)

Izat dapat langsung menggunakan data model Kotlin ini di `android/app/src/main/java/com/noteroute/app/data/model/`:

```kotlin
package com.noteroute.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: T? = null,
    @SerializedName("error_code") val errorCode: String? = null
)

data class DocumentItem(
    @SerializedName("id") val id: String,
    @SerializedName("workspace_id") val workspaceId: String,
    @SerializedName("filename") val filename: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("file_size_formatted") val fileSizeFormatted: String,
    @SerializedName("mime_type") val mimeType: String,
    @SerializedName("summary") val summary: String?,
    @SerializedName("preview_text") val previewText: String?,
    @SerializedName("created_at") val createdAt: String
)

data class ChatRequest(
    @SerializedName("workspace_id") val workspaceId: String,
    @SerializedName("prompt") val prompt: String,
    @SerializedName("model_target") val modelTarget: String,
    @SerializedName("history") val history: List<ChatMessageHistory> = emptyList()
)

data class ChatMessageHistory(
    @SerializedName("role") val role: String,
    @SerializedName("content") val content: String
)

data class ChatResponseData(
    @SerializedName("response_text") val responseText: String,
    @SerializedName("model_used") val modelUsed: String,
    @SerializedName("latency_ms") val latencyMs: Long,
    @SerializedName("fallback_triggered") val fallbackTriggered: Boolean,
    @SerializedName("citations") val citations: List<CitationItem>
)

data class CitationItem(
    @SerializedName("doc_id") val docId: String,
    @SerializedName("filename") val filename: String,
    @SerializedName("page") val page: Int,
    @SerializedName("snippet") val snippet: String
)
```
Dengan data class di atas, Izat dapat langsung mengembangkan Retrofit Interface, Repository, dan ViewModel bahkan sebelum server backend selesai dibuat!
