"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface Message {
  id: number;
  transaction_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  sent_by: string;
  created_at: string;
  sender?: {
    id: number;
    name: string;
  };
  receiver?: {
    id: number;
    name: string;
    plate_number?: string;
    vehicle_type?: string;
  };
}

// 1. TAMBAHAN: Masukkan customer_id dan driver_id
interface OrderInfo {
  customer_id: number; 
  driver_id: number;
  customer_name: string;
  driver_name: string;
  driver_plate_number: string;
  driver_vehicle_type: string;
}

export default function DriverChatPage({ params }: { params: { transactionId: string } }) {
  let transactionId = "";
  // @ts-ignore
  if (typeof params?.then === "function") {
    // @ts-ignore
    const resolved = require('react').use(params);
    transactionId = resolved.transactionId;
  } else {
    transactionId = params?.transactionId;
  }
  
  if (!transactionId || transactionId === "undefined") {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      const idx = pathParts.indexOf("chat");
      if (idx !== -1 && pathParts[idx + 1]) {
        transactionId = pathParts[idx + 1];
      }
    }
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Jika transactionId masih undefined
  if (!transactionId || transactionId === "undefined") {
    return (
      <div className="flex flex-col h-screen bg-[#F5F5F5] items-center justify-center">
        <div className="bg-[#1A534B] text-white rounded-xl px-6 py-4 shadow-lg text-center">
          <div className="text-lg font-bold mb-2">ID Order/Transaksi tidak ditemukan</div>
          <div className="text-xs">Silakan akses halaman chat dengan link yang benar.</div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchMessages() {
      if (!transactionId) return;
      setLoading(true);
      try {
        const res = await api.get(`/chat/${transactionId}`);
        const data = res.data;
        setMessages(data.messages || []);
        setOrderInfo(data.order_info || null);
      } catch (err) {
        setMessages([]);
        setOrderInfo(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [transactionId]);

  useEffect(() => {
    if (!transactionId) return;
    
    // Import dynamically or use the getEcho function we created
    let myEcho: any;
    
    const token = localStorage.getItem("token") || "";
    if (token) {
      import("@/lib/echo").then(({ getEcho }) => {
        myEcho = getEcho(token);
        if (myEcho) {
          const channel = myEcho.private(`chat.transaction.${transactionId}`);
          channel.listen("ChatMessageSent", (e: any) => {
            setMessages((prev) => {
              if (prev.some((m) => m.id === e.id)) return prev;
              return [...prev, e];
            });
          });
        }
      });
    }

    return () => {
      if (myEcho) {
        myEcho.leave(`chat.transaction.${transactionId}`);
      }
    };
  }, [transactionId]);

  // 2. PERUBAHAN: Fungsi kirim pesan untuk Driver
  const sendMessage = async () => {
    if (!inputMessage.trim() || !orderInfo || sending) return;
    setSending(true);
    try {
      const body = {
        transaction_id: Number(transactionId),
        sender_id: orderInfo.driver_id,      // Pengirim adalah Driver
        receiver_id: orderInfo.customer_id,  // Penerima adalah Customer
        message: inputMessage,
        sent_by: "driver"                    // Menandakan ini dikirim oleh driver
      };
      
      const res = await api.post("/chat", body);
      
      if (res.data && res.data.data) {
        setMessages(prev => [...prev, res.data.data]);
        setInputMessage("");
      }
    } catch (err) {
      // No error log
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F5F5F5]">
      {/* PWA: Tambahkan meta viewport di _app atau layout jika belum */}
      <div className="flex flex-col h-full bg-white rounded-none shadow-none border-none">
        <div className="bg-[#1A534B] px-4 py-3 rounded-b-2xl flex items-center justify-between relative">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="bg-white text-[#1A534B] rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-surface-100 active:scale-95 transition-all"
            aria-label="Kembali"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          {/* Customer Name */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-white text-base font-bold tracking-wide">
              {orderInfo ? orderInfo.customer_name : "Customer"}
            </span>
            <span className="text-white text-xs font-medium opacity-70">
              Chat
            </span>
          </div>
          {/* Avatar */}
          {orderInfo && (
            <div className="w-8 h-8 rounded-full bg-[#F9FAFB] flex items-center justify-center font-bold text-[#1A534B] text-base border-2 border-white shadow-md">
              {orderInfo.customer_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between min-h-[400px]">
          <div className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-[#1A534B]" />
              </div>
            ) : (
              messages.length === 0 ? (
                <div className="text-center text-neutral-400 mt-10">
                  Tidak ada pesan.<br />
                  {orderInfo && (
                    <span className="block mt-2 text-xs text-[#1A534B] font-bold">
                      Mulai chat dengan {orderInfo.customer_name}
                    </span>
                  )}
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sent_by === "driver";
                  return (
                    <div key={msg.id} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}> 
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm font-medium shadow-sm ${
                        isMe 
                          ? "bg-[#1A534B] text-white rounded-br-none" 
                          : "bg-white text-[#1A534B] rounded-bl-none border border-gray-100"
                      }`}>
                        <span>{msg.message}</span>
                        <div className={`text-[10px] mt-1 ${isMe ? "text-white/70 text-right" : "text-gray-400 text-left"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
          {/* Input area */}
          <div className="fixed bottom-0 left-0 w-full bg-white py-3 px-4 border-t border-surface-200 flex items-center gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <input
              type="text"
              placeholder="Tulis pesan..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#1A534B] focus:ring-1 focus:ring-[#1A534B] bg-[#F9FAFB]"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              disabled={sending}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            />
            <button
              className="bg-[#1A534B] text-white rounded-xl px-4 py-2 font-bold text-sm shadow-lg disabled:opacity-50 transition-all active:scale-95"
              disabled={sending || !inputMessage.trim()}
              onClick={sendMessage}
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
