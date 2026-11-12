package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.R
import com.noteroute.app.data.model.UserData
import com.noteroute.app.databinding.BottomSheetAuthBinding
import com.noteroute.app.utils.UserPreferences

class AuthBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetAuthBinding? = null
    private val binding get() = _binding!!

    private var isRegisterMode: Boolean = false
    var onAuthSuccessListener: (() -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetAuthBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setAuthMode(false)

        binding.btnTabLogin.setOnClickListener {
            setAuthMode(false)
        }

        binding.btnTabRegister.setOnClickListener {
            setAuthMode(true)
        }

        binding.btnSubmitAuth.setOnClickListener {
            processAuth()
        }

        binding.btnCancelAuth.setOnClickListener {
            val userPrefs = UserPreferences.getInstance(requireContext())
            if (!userPrefs.isLoggedIn) {
                userPrefs.saveUser(
                    UserData(
                        userId = "usr_guest",
                        name = "Ahmad Zakky Nurfauzan",
                        email = "ahmadzakky@ulbi.ac.id",
                        npm = "714250028"
                    )
                )
            }
            onAuthSuccessListener?.invoke()
            dismiss()
        }
    }

    private fun setAuthMode(register: Boolean) {
        isRegisterMode = register
        val context = requireContext()
        if (register) {
            binding.tvAuthTitle.text = "Daftar Akun Baru"
            binding.btnTabRegister.setBackgroundResource(R.drawable.bg_chat_user)
            binding.btnTabRegister.setTextColor(ContextCompat.getColor(context, R.color.white))
            binding.btnTabLogin.setBackgroundColor(0)
            binding.btnTabLogin.setTextColor(ContextCompat.getColor(context, R.color.slate_400))
            binding.tilName.visibility = View.VISIBLE
            binding.tilNpm.visibility = View.VISIBLE
            binding.btnSubmitAuth.text = "Daftar Akun Baru"
        } else {
            binding.tvAuthTitle.text = "Masuk ke NoteRoute"
            binding.btnTabLogin.setBackgroundResource(R.drawable.bg_chat_user)
            binding.btnTabLogin.setTextColor(ContextCompat.getColor(context, R.color.white))
            binding.btnTabRegister.setBackgroundColor(0)
            binding.btnTabRegister.setTextColor(ContextCompat.getColor(context, R.color.slate_400))
            binding.tilName.visibility = View.GONE
            binding.tilNpm.visibility = View.GONE
            binding.btnSubmitAuth.text = "Masuk Akun"
        }
    }

    private fun processAuth() {
        val email = binding.etAuthEmail.text?.toString()?.trim().orEmpty()
        val password = binding.etAuthPassword.text?.toString()?.trim().orEmpty()

        val userPrefs = UserPreferences.getInstance(requireContext())

        if (isRegisterMode) {
            val name = binding.etAuthName.text?.toString()?.trim().orEmpty().ifEmpty { if (email.isNotBlank()) email.substringBefore("@") else "Ahmad Zakky Nurfauzan" }
            val npm = binding.etAuthNpm.text?.toString()?.trim().orEmpty().ifEmpty { "714250028" }

            userPrefs.saveUser(
                UserData(
                    userId = "usr_${System.currentTimeMillis()}",
                    name = name,
                    email = email.ifEmpty { "ahmadzakky@ulbi.ac.id" },
                    npm = npm,
                    token = "jwt_${System.currentTimeMillis()}"
                )
            )
            Toast.makeText(requireContext(), "Pendaftaran berhasil! Selamat datang, $name.", Toast.LENGTH_SHORT).show()
        } else {
            val resolvedEmail = email.ifEmpty { "ahmadzakky@ulbi.ac.id" }
            val name = if (resolvedEmail.contains("zakky", true)) "Ahmad Zakky Nurfauzan" else if (resolvedEmail.contains("izat", true)) "Izat Ibrahimovic" else resolvedEmail.substringBefore("@")
            userPrefs.saveUser(
                UserData(
                    userId = "usr_${System.currentTimeMillis()}",
                    name = name,
                    email = resolvedEmail,
                    npm = "714250028",
                    token = "jwt_${System.currentTimeMillis()}"
                )
            )
            Toast.makeText(requireContext(), "Berhasil masuk! Selamat datang, $name.", Toast.LENGTH_SHORT).show()
        }

        onAuthSuccessListener?.invoke()
        dismiss()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "AuthBottomSheet"

        fun newInstance(onSuccess: (() -> Unit)? = null): AuthBottomSheet {
            val sheet = AuthBottomSheet()
            sheet.onAuthSuccessListener = onSuccess
            return sheet
        }
    }
}
