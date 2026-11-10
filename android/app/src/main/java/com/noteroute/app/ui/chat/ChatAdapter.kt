package com.noteroute.app.ui.chat

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.noteroute.app.data.model.ChatMessage
import com.noteroute.app.data.model.CitationItem
import com.noteroute.app.databinding.ItemChatAssistantBinding
import com.noteroute.app.databinding.ItemChatUserBinding
import com.noteroute.app.databinding.ItemCitationBadgeBinding

class ChatAdapter(
    private val onCitationClick: (CitationItem, Int) -> Unit
) : ListAdapter<ChatMessage, RecyclerView.ViewHolder>(DiffCallback) {

    override fun getItemViewType(position: Int): Int {
        return if (getItem(position).isUser) VIEW_TYPE_USER else VIEW_TYPE_ASSISTANT
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == VIEW_TYPE_USER) {
            val binding = ItemChatUserBinding.inflate(inflater, parent, false)
            UserViewHolder(binding)
        } else {
            val binding = ItemChatAssistantBinding.inflate(inflater, parent, false)
            AssistantViewHolder(binding, onCitationClick)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = getItem(position)
        if (holder is UserViewHolder) {
            holder.bind(item)
        } else if (holder is AssistantViewHolder) {
            holder.bind(item)
        }
    }

    class UserViewHolder(private val binding: ItemChatUserBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ChatMessage) {
            binding.tvUserMessage.text = item.text
            binding.tvTimestamp.text = item.timestamp
        }
    }

    class AssistantViewHolder(
        private val binding: ItemChatAssistantBinding,
        private val onCitationClick: (CitationItem, Int) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: ChatMessage) {
            binding.tvAssistantMessage.text = item.text
            binding.tvAssistantTimestamp.text = item.timestamp
            binding.tvModelBadge.text = item.modelUsed ?: "Gemini 1.5 Flash (Grounded)"

            if (item.latencyMs != null && item.latencyMs > 0) {
                binding.tvLatency.visibility = View.VISIBLE
                binding.tvLatency.text = "${item.latencyMs} ms"
            } else {
                binding.tvLatency.visibility = View.GONE
            }

            binding.tvFallbackFlag.visibility = if (item.fallbackTriggered) View.VISIBLE else View.GONE

            // Citations Rendering (NotebookLM Style Badges)
            binding.containerCitationBadges.removeAllViews()
            if (item.citations.isNotEmpty()) {
                binding.layoutCitationsSection.visibility = View.VISIBLE
                val inflater = LayoutInflater.from(binding.root.context)

                item.citations.forEachIndexed { index, citation ->
                    val badgeBinding = ItemCitationBadgeBinding.inflate(inflater, binding.containerCitationBadges, false)
                    val citationNum = index + 1
                    badgeBinding.tvCitationNumber.text = citationNum.toString()
                    badgeBinding.tvCitationLabel.text = "${citation.filename} : Hal ${citation.page}"
                    badgeBinding.root.setOnClickListener {
                        onCitationClick(citation, citationNum)
                    }
                    binding.containerCitationBadges.addView(badgeBinding.root)
                }
            } else {
                binding.layoutCitationsSection.visibility = View.GONE
            }
        }
    }

    companion object {
        private const val VIEW_TYPE_USER = 1
        private const val VIEW_TYPE_ASSISTANT = 2

        private val DiffCallback = object : DiffUtil.ItemCallback<ChatMessage>() {
            override fun areItemsTheSame(oldItem: ChatMessage, newItem: ChatMessage): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: ChatMessage, newItem: ChatMessage): Boolean {
                return oldItem == newItem
            }
        }
    }
}
