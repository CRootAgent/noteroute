package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetProfileBinding
import com.noteroute.app.utils.UserPreferences

class ProfileBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        updateUserUi()

        binding.btnActionSwitchAccount.setOnClickListener {
            val authSheet = AuthBottomSheet.newInstance {
                updateUserUi()
            }
            authSheet.show(parentFragmentManager, AuthBottomSheet.TAG)
        }

        binding.btnActionConfigRouter.setOnClickListener {
            val aiConfigSheet = AiConfigBottomSheet.newInstance()
            aiConfigSheet.show(parentFragmentManager, AiConfigBottomSheet.TAG)
        }

        binding.btnActionLogout.setOnClickListener {
            val userPrefs = UserPreferences.getInstance(requireContext())
            userPrefs.logout()
            Toast.makeText(requireContext(), "Berhasil keluar dari akun.", Toast.LENGTH_SHORT).show()
            updateUserUi()
        }

        binding.btnCloseProfile.setOnClickListener {
            dismiss()
        }
    }

    private fun updateUserUi() {
        val userPrefs = UserPreferences.getInstance(requireContext())
        if (userPrefs.isLoggedIn) {
            binding.tvProfileName.text = userPrefs.userName
            binding.tvProfileEmail.text = "${userPrefs.userEmail} • NPM: ${userPrefs.userNpm}"
            binding.btnActionLogout.visibility = View.VISIBLE
        } else {
            binding.tvProfileName.text = "Tamu (Belum Masuk)"
            binding.tvProfileEmail.text = "Klik opsi di bawah untuk masuk akun NoteRoute"
            binding.btnActionLogout.visibility = View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "ProfileBottomSheet"
        fun newInstance() = ProfileBottomSheet()
    }
}
