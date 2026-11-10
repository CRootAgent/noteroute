package com.noteroute.app.ui.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetProfileBinding

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

        binding.btnActionSwitchAccount.setOnClickListener {
            Toast.makeText(requireContext(), "Ganti akun: Masukkan kredensial akun NoteRoute lainnya.", Toast.LENGTH_SHORT).show()
            dismiss()
        }

        binding.btnActionConfigRouter.setOnClickListener {
            Toast.makeText(requireContext(), "Router: Gemini 1.5 Flash -> Groq -> 9Router Local", Toast.LENGTH_SHORT).show()
            dismiss()
        }

        binding.btnActionLogout.setOnClickListener {
            Toast.makeText(requireContext(), "Berhasil keluar dari akun.", Toast.LENGTH_SHORT).show()
            dismiss()
        }

        binding.btnCloseProfile.setOnClickListener {
            dismiss()
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
