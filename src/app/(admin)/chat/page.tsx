"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Send, User, MoreVertical, Phone, Video, MessageSquare, CheckCheck, Check, Smile, Paperclip, Mic } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  roleId?: { displayName?: string; name?: string };
  isOnline?: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
}

const initials = (f?: string, l?: string) =>
  `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";

const formatChatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  }
};

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
        const [{ data: usersData }, { data: summaryData }] = await Promise.all([
          api.get("/users", { params: { limit: 100 } }),
          api.get("/chat/summary").catch(() => ({ data: {} }))
        ]);
        
        const list = Array.isArray(usersData) ? usersData : usersData.data || [];
        const summary = summaryData || {};
        
        // Simple presence logic: Consider online if lastLogin was within the last 30 minutes
        const now = Date.now();
        const thirtyMins = 30 * 60 * 1000;
        
        const withOnlineStatus = list.map((u: any) => {
          let isOnline = false;
          if (u.lastLogin) {
            const lastLoginTime = new Date(u.lastLogin).getTime();
            if (now - lastLoginTime < thirtyMins) {
              isOnline = true;
            }
          }
          // Fallback to ensuring the current logged-in user isn't marked offline if they just logged in
          if (user && (u.id === user.id || u._id === user.id)) {
            isOnline = true;
          }
          
          const chatInfo = summary[u._id] || {};
          return { 
            ...u, 
            isOnline,
            lastMessage: chatInfo.lastMessage || "",
            lastMessageAt: chatInfo.lastMessageAt || "",
            unreadCount: chatInfo.unreadCount || 0
          };
        });
        
        // Sort users: those with recent messages first
        withOnlineStatus.sort((a: any, b: any) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });

        setUsers(withOnlineStatus);
      } catch (err) {
        console.error("Failed to load chat users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user?.id, user?._id]);

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
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {user.firstName} {user.lastName}
                    </h4>
                    {user.lastMessageAt && (
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {formatChatDate(user.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs line-clamp-1 pr-2 ${user.unreadCount ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                      {user.lastMessage ? user.lastMessage : <span className="capitalize">{((user as any).role || user.roleId?.displayName || user.roleId?.name || "Member").toLowerCase().replace('_', ' ')}</span>}
                    </p>
                    {!!user.unreadCount && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                        {user.unreadCount > 99 ? '99+' : user.unreadCount}
                      </span>
                    )}
                  </div>
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-[#efeae2] dark:bg-[#0b141a] space-y-3 relative" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px', backgroundBlendMode: 'overlay' }}>
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center flex-col text-gray-500">
                  <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg text-sm text-center max-w-sm backdrop-blur-sm shadow-sm">
                    Messages are end-to-end encrypted. No one outside of this chat, not even the CRM, can read or listen to them.
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === (user?.id || user?._id);
                  const msgDate = new Date(msg.createdAt).toLocaleDateString();
                  const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null;
                  const showDateDivider = msgDate !== prevMsgDate;
                  
                  let dateLabel = msgDate;
                  if (msgDate === new Date().toLocaleDateString()) dateLabel = "TODAY";
                  else {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (msgDate === yesterday.toLocaleDateString()) dateLabel = "YESTERDAY";
                  }
                  
                  return (
                    <React.Fragment key={msg._id}>
                      {showDateDivider && (
                        <div className="flex justify-center my-4">
                          <span className="bg-white/90 dark:bg-[#182229]/90 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-lg shadow-sm backdrop-blur-sm uppercase font-medium">
                            {dateLabel}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-2.5 py-1.5 text-[15px] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] relative group ${
                            isMe
                              ? "bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef] rounded-tr-none"
                              : "bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef] rounded-tl-none"
                          }`}
                        >
                          <div className="pr-14 pb-0.5 whitespace-pre-wrap break-words">{msg.text}</div>
                          <div className="absolute right-2 bottom-1 flex items-center gap-1">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400/80">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            {isMe && (
                              <span className="text-[#53bdeb]">
                                {msg.isRead !== false ? <CheckCheck size={14} /> : <Check size={14} className="text-gray-400" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex items-center gap-3">
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-600 transition-colors p-1">
                <Smile size={24} />
              </button>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-600 transition-colors p-1">
                <Paperclip size={24} />
              </button>
              
              <form onSubmit={handleSendMessage} className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full rounded-lg bg-white dark:bg-[#2a3942] py-2.5 pl-4 pr-4 text-[15px] text-gray-800 dark:text-white outline-none placeholder:text-gray-500 shadow-sm"
                />
              </form>
              
              {input.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-500 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Send size={24} className="text-[#00a884]" />
                </button>
              ) : (
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Mic size={24} />
                </button>
              )}
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
