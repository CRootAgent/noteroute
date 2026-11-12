package com.noteroute.app.ui.components

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.databinding.BottomSheetPreviewBinding

class DocumentPreviewBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetPreviewBinding? = null
    private val binding get() = _binding!!

    private var documentItem: DocumentItem? = null
    var onDownloadClickListener: ((DocumentItem) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetPreviewBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        documentItem?.let { doc ->
            binding.tvPreviewTitle.text = doc.filename
            binding.tvPreviewMeta.text = "${doc.fileSizeFormatted} • ${doc.mimeType}"
            binding.tvPreviewSummary.text = doc.summary ?: "Tidak ada ringkasan."
            binding.tvPreviewText.text = doc.previewText ?: "Tidak ada teks pratinjau."

            binding.btnDownloadFromPreview.setOnClickListener {
                dismiss()
                onDownloadClickListener?.invoke(doc)
            }
        }

        binding.btnClosePreview.setOnClickListener {
            documentItem?.let { doc ->
                val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(Intent.EXTRA_TITLE, doc.filename)
                    putExtra(
                        Intent.EXTRA_TEXT,
                        "📄 *${doc.filename}*\n\n📌 *Ringkasan:* ${doc.summary ?: "-"}\n\n_Akses berkas lengkap di NoteRoute Cross-Device Agent_"
                    )
                    type = "text/plain"
                }
                startActivity(Intent.createChooser(sendIntent, "Bagikan Informasi Dokumen"))
            } ?: dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "DocumentPreviewBottomSheet"

        fun newInstance(
            document: DocumentItem,
            onDownload: ((DocumentItem) -> Unit)? = null
        ): DocumentPreviewBottomSheet {
            val fragment = DocumentPreviewBottomSheet()
            fragment.documentItem = document
            fragment.onDownloadClickListener = onDownload
            return fragment
        }
    }
}
