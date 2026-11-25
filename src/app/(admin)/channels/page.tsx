"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Hash,
  Send,
  Users,
  Megaphone,
  Briefcase,
  HelpCircle,
  Paperclip,
  Smile,
  X,
  FileText,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

interface IChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

interface IChannelMessage {
  _id: string;
  senderId: string;
  channelId: string;
  senderName?: string;
  senderRole?: string;
  text: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  createdAt: string;
}

const CHANNELS: IChannel[] = [
  {
    id: "general",
    name: "general",
    description: "Company-wide discussion, teamwork, and casual banter",
    icon: Hash,
  },
  {
    id: "announcements",
    name: "announcements",
    description: "Official broadcast and management announcements",
    icon: Megaphone,
    badge: "Official",
  },
  {
    id: "leads-desk",
    name: "leads-desk",
    description: "Lead allocations, calling priorities, and target updates",
    icon: Briefcase,
  },
  {
    id: "support-ops",
    name: "support-ops",
    description: "Help desk, technical assistance, and system queries",
    icon: HelpCircle,
  },
];

const QUICK_EMOJIS = ["👍", "🙌", "🎯", "🔥", "🚀", "📢", "👏", "✅"];

export default function ChannelsPage() {
  const [activeChannel, setActiveChannel] = useState<IChannel>(CHANNELS[0]);
  const [messages, setMessages] = useState<IChannelMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    type: "image" | "file";
    name: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { user } = useAuth();
  const currentUserId = user?.id || (user as any)?._id;

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChannelMessages = async (channelId: string) => {
    try {
      const { data } = await api.get(`/chat/channel/${channelId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch channel messages", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchChannelMessages(activeChannel.id).finally(() => {
      if (isMounted) setLoading(false);
    });

    const interval = setInterval(() => {
      fetchChannelMessages(activeChannel.id);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeChannel.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("File exceeds 8MB limit.");
      return;
    }

    const isImg = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        url: reader.result as string,
        type: isImg ? "image" : "file",
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !attachment) || sending) return;

    const msgText = input.trim();
    const currentAtt = attachment;

    setInput("");
    setAttachment(null);
    setShowEmojiPicker(false);
    setSending(true);

    const nowIso = new Date().toISOString();

    const optimistic: IChannelMessage = {
      _id: `temp-${Date.now()}`,
      senderId: String(currentUserId),
      channelId: activeChannel.id,
      senderName: `${user?.firstName || "Me"} ${user?.lastName || ""}`.trim(),
      senderRole: (user as any)?.role || "Member",
      text: msgText,
      attachmentUrl: currentAtt?.url,
      attachmentType: currentAtt?.type,
      attachmentName: currentAtt?.name,
      createdAt: nowIso,
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.post(`/chat/channel/${activeChannel.id}`, {
        text: msgText,
        attachmentUrl: currentAtt?.url,
        attachmentType: currentAtt?.type,
        attachmentName: currentAtt?.name,
      });
      fetchChannelMessages(activeChannel.id);
    } catch (err) {
      console.error("Failed to send channel message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-185px)] max-h-[calc(100vh-185px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 text-gray-800 shadow-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Channels Sidebar */}
      <div className="flex w-72 flex-col border-r border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/60">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" size={22} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Team Channels
            </h2>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Open workspaces for department broadcasts & group discussions
          </p>
        </div>

        <div className="flex-1 space-y-1">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = activeChannel.id === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-200/60 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={18}
                    className={isSelected ? "text-white" : "text-gray-400"}
                  />
                  <span>#{ch.name}</span>
                </div>
                {ch.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? "bg-indigo-700 text-white"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {ch.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3 text-xs text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            📢 Company Notice
          </span>
          All channel updates are broadcasted in real time to all signed-in teammates.
        </div>
      </div>

      {/* Main Channel Area */}
      <div className="flex flex-1 flex-col bg-white dark:bg-gray-900">
        {/* Channel Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <activeChannel.icon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                #{activeChannel.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeChannel.description}
              </p>
            </div>
          </div>
        </div>

        {/* Channel Messages */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 space-y-4 overflow-y-auto p-6 bg-gray-50/40 dark:bg-gray-950/20"
        >
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <MessageSquare size={36} className="mb-2 text-indigo-400" />
              <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                Welcome to #{activeChannel.name}!
              </h4>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                This is the start of the #{activeChannel.name} channel. Send a message to start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = String(msg.senderId) === String(currentUserId);

              return (
                <div key={msg._id || index} className="flex items-start gap-3 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                    {msg.senderName
                      ? msg.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "TM"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {msg.senderName || "Team Member"}
                      </span>
                      {msg.senderRole && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {msg.senderRole.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                          (You)
                        </span>
                      )}
                    </div>

                    {msg.attachmentUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl inline-block max-w-sm">
                        {msg.attachmentType === "image" ? (
                          <img
                            src={msg.attachmentUrl}
                            alt="attachment"
                            onClick={() => setPreviewImage(msg.attachmentUrl!)}
                            className="max-h-60 rounded-lg object-cover cursor-pointer hover:opacity-95"
                          />
                        ) : (
                          <a
                            href={msg.attachmentUrl}
                            download={msg.attachmentName || "download"}
                            className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400 underline"
                          >
                            <FileText size={18} />
                            <span className="truncate max-w-[200px]">
                              {msg.attachmentName || "Download File"}
                            </span>
                          </a>
                        )}
                      </div>
                    )}

                    {msg.text && (
                      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                        {msg.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Attachment preview */}
        {attachment && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-800/80">
            <div className="flex items-center gap-2">
              {attachment.type === "image" ? (
                <ImageIcon size={18} className="text-indigo-600" />
              ) : (
                <FileText size={18} className="text-indigo-600" />
              )}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">
                {attachment.name}
              </span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Quick Emoji Bar */}
        {showEmojiPicker && (
          <div className="flex items-center gap-1.5 border-t border-gray-100 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-800">
            <span className="text-xs font-semibold text-gray-400 mr-1">Quick:</span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInput((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="rounded-lg p-1.5 text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Emoji"
            >
              <Smile size={20} />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              placeholder={`Message #${activeChannel.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900/50"
            />

            <button
              type="submit"
              disabled={(!input.trim() && !attachment) || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
