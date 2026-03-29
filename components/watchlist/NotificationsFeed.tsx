"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BellRing, CheckCircle2, Clock, X, XCircle } from 'lucide-react';

export default function NotificationsFeed() {
    const { data: notificationsRes, isLoading, refetch } = useQuery({
        queryKey: ['notifications-feed'],
        queryFn: async () => {
            const res = await axios.get('/api/notifications');
            return res.data;
        },
        refetchInterval: 10000 // Poll every 10s for updates
    });

    const notifications = notificationsRes?.notifications || [];

    const markAsRead = async (id?: string) => {
        await axios.patch('/api/notifications', { id });
        refetch();
    };

    const deleteNotification = async (id?: string) => {
        await axios.delete(`/api/notifications${id ? `?id=${id}` : ''}`);
        refetch();
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <BellRing className="w-4 h-4" /> Activity Feed
                </h3>
                {notifications.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => markAsRead()}
                            className="text-[10px] text-primary hover:text-primary/80 font-medium"
                        >
                            Mark all read
                        </button>
                        <button
                            onClick={() => deleteNotification()}
                            className="text-[10px] text-red-500 hover:text-red-400 font-medium"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-sm py-4">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4 bg-white/5 rounded-xl">No recent notifications.</div>
                ) : (
                    notifications.map((notif: any) => (
                        <div
                            key={notif.id}
                            onClick={() => !notif.read && markAsRead(notif.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${notif.read ? 'bg-white/5 border-white/10 opacity-70' : 'bg-primary/10 border-primary/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold flex items-center gap-1 ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                    {notif.type === 'ALARM' ? <BellRing className="w-3 h-3 text-orange-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                    {notif.title}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500">
                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notif.id);
                                        }}
                                        className="text-gray-500 hover:text-red-400"
                                    >
                                        <XCircle className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-300'}`}>
                                {notif.message}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
