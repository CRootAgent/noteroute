package com.noteroute.app.ui.explorer

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.noteroute.app.R
import com.noteroute.app.data.model.DocumentItem
import com.noteroute.app.databinding.ItemDocumentBinding
import com.noteroute.app.utils.FileUtils

class DocumentAdapter(
    private val onPreviewClick: (DocumentItem) -> Unit,
    private val onDownloadClick: (DocumentItem) -> Unit
) : ListAdapter<DocumentItem, DocumentAdapter.DocumentViewHolder>(DiffCallback) {

    private var downloadingDocumentId: String? = null

    fun setDownloadingId(id: String?) {
        downloadingDocumentId = id
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DocumentViewHolder {
        val binding = ItemDocumentBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return DocumentViewHolder(binding)
    }

    override fun onBindViewHolder(holder: DocumentViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class DocumentViewHolder(
        private val binding: ItemDocumentBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: DocumentItem) {
            val badgeText = FileUtils.getBadgeText(item.mimeType, item.filename)
            binding.tvFileBadge.text = badgeText

            val context = binding.root.context
            when (badgeText) {
                "PDF" -> binding.tvFileBadge.setTextColor(ContextCompat.getColor(context, R.color.badge_pdf))
                "MD" -> binding.tvFileBadge.setTextColor(ContextCompat.getColor(context, R.color.badge_md))
                "DOCX" -> binding.tvFileBadge.setTextColor(ContextCompat.getColor(context, R.color.badge_docx))
                else -> binding.tvFileBadge.setTextColor(ContextCompat.getColor(context, R.color.badge_code))
            }

            binding.tvFilename.text = item.filename
            binding.tvFileMeta.text = "${item.fileSizeFormatted} • Tersinkron"

            val isDownloading = (item.id == downloadingDocumentId)
            binding.pbDownload.visibility = if (isDownloading) View.VISIBLE else View.GONE
            binding.btnDownload.isEnabled = !isDownloading
            binding.btnDownload.text = if (isDownloading) {
                context.getString(R.string.downloading)
            } else {
                "Ke HP"
            }

            binding.layoutDocContent.setOnClickListener {
                onPreviewClick(item)
            }
            binding.root.setOnClickListener {
                onPreviewClick(item)
            }
            binding.btnDownload.setOnClickListener {
                onDownloadClick(item)
            }
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<DocumentItem>() {
            override fun areItemsTheSame(oldItem: DocumentItem, newItem: DocumentItem): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: DocumentItem, newItem: DocumentItem): Boolean {
                return oldItem == newItem
            }
        }
    }
}
