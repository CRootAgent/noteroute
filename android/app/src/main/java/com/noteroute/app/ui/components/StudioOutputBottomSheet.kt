package com.noteroute.app.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.databinding.BottomSheetStudioOutputBinding

class StudioOutputBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetStudioOutputBinding? = null
    private val binding get() = _binding!!

    private var titleText: String = "Hasil Studio AI"
    private var contentText: String = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetStudioOutputBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvStudioOutputTitle.text = titleText
        binding.tvStudioOutputContent.text = contentText

        binding.btnCopyStudioOutput.setOnClickListener {
            val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText(titleText, contentText)
            clipboard.setPrimaryClip(clip)
            Toast.makeText(requireContext(), "Hasil studio disalin ke papan klip", Toast.LENGTH_SHORT).show()
        }

        binding.btnShareStudioOutput.setOnClickListener {
            val sendIntent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_TITLE, titleText)
                putExtra(Intent.EXTRA_TEXT, "*$titleText*\n\n$contentText\n\n_Dihasilkan dari NoteRoute AI Notebook_")
                type = "text/plain"
            }
            val shareIntent = Intent.createChooser(sendIntent, "Bagikan Hasil Studio AI")
            startActivity(shareIntent)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "StudioOutputBottomSheet"

        fun newInstance(title: String, content: String): StudioOutputBottomSheet {
            val sheet = StudioOutputBottomSheet()
            sheet.titleText = title
            sheet.contentText = content
            return sheet
        }
    }
}
