package com.noteroute.app.ui.home

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.noteroute.app.R
import com.noteroute.app.data.model.WorkspaceItem
import com.noteroute.app.databinding.ItemNotebookBinding

class NotebookAdapter(
    private val onNotebookClick: (WorkspaceItem) -> Unit
) : ListAdapter<WorkspaceItem, NotebookAdapter.NotebookViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotebookViewHolder {
        val binding = ItemNotebookBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return NotebookViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NotebookViewHolder, position: Int) {
        holder.bind(getItem(position), position)
    }

    inner class NotebookViewHolder(
        private val binding: ItemNotebookBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: WorkspaceItem, position: Int) {
            binding.tvNotebookTitle.text = item.name
            binding.tvNotebookMeta.text = "${item.documentCount} sumber • Barusan diedit"

            val isEven = (position % 2 == 0)
            val iconTint = if (isEven) 0xFFF59E0B.toInt() else 0xFF3B82F6.toInt()
            val bgTint = if (isEven) 0x26F59E0B.toInt() else 0x263B82F6.toInt()

            binding.layoutIconContainer.backgroundTintList = android.content.res.ColorStateList.valueOf(bgTint)
            binding.ivNotebookIcon.setColorFilter(iconTint)

            binding.root.setOnClickListener {
                onNotebookClick(item)
            }
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<WorkspaceItem>() {
            override fun areItemsTheSame(oldItem: WorkspaceItem, newItem: WorkspaceItem): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: WorkspaceItem, newItem: WorkspaceItem): Boolean {
                return oldItem == newItem
            }
        }
    }
}
