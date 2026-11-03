# 🔐 SPESIFIKASI KONTRAK RELEASE KEYSTORE & GITHUB ACTIONS SECRETS
**Tujuan:** Memastikan pipeline CI/CD Zakky (`.github/workflows/android-release.yml`) dapat menandatangani file `app-release.apk` dan `app-release.aab` dari kode Kotlin Izat secara 100% mulus tanpa bentrok atau salah nama variabel.

---

## 1. DAFTAR NAMA RAHASIA RESMI (GITHUB SECRETS)

Zakky akan memasukkan 4 variabel ini ke dalam **Settings -> Secrets and variables -> Actions** di repositori GitHub `CRootAgent/noteroute`:

| Nama Secret GitHub Actions | Tipe | Contoh Nilai | Deskripsi & Pemilik |
| :--- | :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | String (Base64) | `MIIKuAIBAzCC...` | Hasil konversi binary file `note-route-release.jks` ke teks Base64 (Dibuat oleh Izat). |
| `ANDROID_KEY_ALIAS` | String Plaintext | `noteroute_key` | Alias kunci yang dibuat Izat saat generate keystore. |
| `ANDROID_KEYSTORE_PASSWORD` | String Plaintext | `RahasiaKuat123!` | Password keystore file. |
| `ANDROID_KEY_PASSWORD` | String Plaintext | `RahasiaKuat123!` | Password alias kunci (bisa sama dengan keystore password). |

---

## 2. PANDUAN IZAT: CARA MEMBUAT KEYSTORE & MENGUBAH KE BASE64

Izat menjalankan perintah berikut di terminal laptopnya:

### Langkah A: Buat File Keystore (.jks)
```bash
keytool -genkey -v -keystore note-route-release.jks -alias noteroute_key -keyalg RSA -keysize 2048 -validity 10000
```
*(Catat password dan alias yang diinputkan!)*

### Langkah B: Konversi ke Base64 Teks
* **Di Mac / Linux:**
  ```bash
  base64 -i note-route-release.jks | tr -d '\n' > keystore_base64.txt
  ```
* **Di Windows PowerShell:**
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("note-route-release.jks")) | Out-File -Encoding utf8 keystore_base64.txt
  ```

### Langkah C: Serahkan ke Zakky
Kirimkan isi file `keystore_base64.txt` serta nama alias & password ke Zakky secara privat (WhatsApp/Discord/Telegram).  
**DILARANG meng-upload file `.jks` ke dalam git! (Sudah diproteksi oleh `.gitignore`)**.

---

## 3. PANDUAN IZAT: KONFIGURASI `android/app/build.gradle.kts`

Izat cukup menambahkan konfigurasi `signingConfigs` berikut di file `android/app/build.gradle.kts`:

```kotlin
android {
    ...
    signingConfigs {
        create("release") {
            // Membaca file keystore hasil decode CI/CD atau lokal
            val keystoreFile = rootProject.file("release.keystore")
            if (keystoreFile.exists()) {
                storeFile = keystoreFile
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: "default_pwd"
                keyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: "default_alias"
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD") ?: "default_pwd"
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

---

## 4. BAGAIMANA ZAKKY MENGGUNAKANNYA DI GITHUB ACTIONS

Di dalam `.github/workflows/android-release.yml`, Zakky akan mendekode base64 menjadi file fisik sebelum proses build:

```yaml
- name: Decode Release Keystore
  run: |
    echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > android/release.keystore

- name: Build Signed APK & AAB
  env:
    ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
    ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
    ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
  run: |
    cd android
    chmod +x gradlew
    ./gradlew assembleRelease bundleRelease
```

Dengan standarisasi ini, tidak akan ada kebingungan atau kegagalan build pada proses rilis!
