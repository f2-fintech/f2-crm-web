"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Send, User, MoreVertical, Phone, Video, MessageSquare } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  roleId?: { displayName?: string; name?: string };
  isOnline?: boolean;
}

interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

const initials = (f?: string, l?: string) =>
  `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";

export default function ChatPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const { user } = useAuth();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users", { params: { limit: 100 } });
        const list = Array.isArray(data) ? data : data.data || [];
        // Simulate online status for UI demonstration
        const withOnlineStatus = list.map((u: any, idx: number) => ({
          ...u,
          isOnline: idx % 3 !== 0 // Mock: some are online, some are offline
        }));
        setUsers(withOnlineStatus);
      } catch (err) {
        console.error("Failed to load chat users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchMessages = async (targetId: string) => {
    try {
      const { data } = await api.get(`/chat/${targetId}`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    if (activeUser) {
      fetchMessages(activeUser._id);
      // mark as read
      api.patch(`/chat/${activeUser._id}/read`).catch(() => {});
      
      const interval = setInterval(() => {
        fetchMessages(activeUser._id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeUser]);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term)
    );
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeUser || !user) return;

    const msgText = input.trim();
    setInput("");

    // Optimistic UI
    const optimisticMsg: IMessage = {
      _id: Date.now().toString(),
      senderId: user.id || user._id,
      receiverId: activeUser._id,
      text: msgText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await api.post("/chat", {
        receiverId: activeUser._id,
        text: msgText,
      });
      fetchMessages(activeUser._id);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      
      {/* Sidebar: Users List */}
      <div className="flex w-full max-w-[320px] flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Internal Chat</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setActiveUser(user)}
                className={`w-full flex items-center gap-3 border-b border-gray-100 p-4 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800 ${
                  activeUser?._id === user._id ? "bg-white dark:bg-gray-800 border-l-4 border-l-brand-500" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.firstName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                      {initials(user.firstName, user.lastName)}
                    </div>
                  )}
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {user.firstName} {user.lastName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {user.roleId?.displayName || user.roleId?.name || "Member"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-white dark:bg-gray-900">
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeUser.profileImage ? (
                    <img src={activeUser.profileImage} alt={activeUser.firstName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                      {initials(activeUser.firstName, activeUser.lastName)}
                    </div>
                  )}
                  {activeUser.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-success-500 dark:border-gray-900" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {activeUser.firstName} {activeUser.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeUser.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-gray-600 dark:hover:text-gray-200"><Phone size={18} /></button>
                <button className="hover:text-gray-600 dark:hover:text-gray-200"><Video size={18} /></button>
                <button className="hover:text-gray-600 dark:hover:text-gray-200"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center flex-col text-gray-400">
                  <User size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Start a conversation with {activeUser.firstName}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === (user?.id || user?._id);
                  return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? "bg-brand-500 text-white rounded-tr-sm"
                            : "bg-white text-gray-800 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[10px] mt-1 text-right ${isMe ? "text-brand-100" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-800 bg-white dark:bg-gray-900">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-12 text-sm text-gray-800 outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">Internal Team Chat</p>
            <p className="text-sm">Select a user from the left to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
