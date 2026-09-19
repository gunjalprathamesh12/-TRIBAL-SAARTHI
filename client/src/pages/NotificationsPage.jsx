import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  Bell,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Filter,
  Clock,
  ExternalLink,
  Smartphone,
  Mail,
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters.js';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const { addToast } = useNotification();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      addToast({
        title: 'Updated',
        message: 'All notifications marked as read.',
        type: 'success',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'DISBURSEMENT') return n.type === 'DISBURSEMENT';
    if (activeFilter === 'DEFICIENCY') return n.type === 'DEFICIENCY';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'DISBURSEMENT':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'DEFICIENCY':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'VERIFICATION':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gov-navy-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Notification & Dispatch Center
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Multi-channel statutory alerts, SMS dispatches, DBT transfer acknowledgements, and officer remediation orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
              {unreadCount} Unread
            </span>
          )}
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-slate-600" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'DISBURSEMENT', label: 'DBT Disbursements' },
          { id: 'DEFICIENCY', label: 'Deficiencies' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-gov-navy-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No alerts found</div>
            <p className="text-xs text-slate-500">
              You are all caught up with your scholarship announcements and DBT updates.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              className={`p-4 rounded-xl border transition-all ${
                notif.isRead
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-amber-50/40 border-amber-200 shadow-xs ring-1 ring-amber-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{notif.message}</p>

                  {/* Multi-channel simulation pill */}
                  {notif.metadata?.smsText && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SMS Gateway: Dispatched to registered mobile</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>Email: Verified e-Notification sent</span>
                      </div>
                    </div>
                  )}

                  {notif.link && (
                    <div className="pt-2">
                      <Link
                        to={notif.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gov-navy-900 hover:text-amber-700"
                      >
                        View Related Application / Action <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
