'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/supabase/api';
import { Order, OrderStatus } from '@/types/database';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Send,
  PackageCheck,
  Phone,
  Mail,
  ChevronDown,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.email && o.email.toLowerCase().includes(q))
      );
    }

    return list;
  }, [orders, statusFilter, searchQuery]);

  const statusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'confirmed':
        return 'bg-rose-100/80 text-rose-900 border-rose-200';
      case 'in_progress':
        return 'bg-rose-200/80 text-rose-900 border-rose-300';
      case 'delivered':
        return 'bg-sage-100 text-sage-800 border-sage-200';
      default:
        return 'bg-cream-100 text-obsidian-800 border-cream-300';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-200/60 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-obsidian-950">Customer Orders</h1>
          <p className="text-xs text-obsidian-800/70 mt-1">
            Review customer contact details, custom text inputs, and update fulfillment progress.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-xl bg-white hover:bg-cream-100 text-xs font-semibold text-obsidian-900 border border-rose-200/80 transition-colors shadow-sm"
        >
          Refresh Orders
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-obsidian-800/60">Total Orders</span>
          <div className="text-2xl font-serif font-bold text-obsidian-950">{orders.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-800">Pending Payment</span>
          <div className="text-2xl font-serif font-bold text-amber-900">
            {orders.filter((o) => o.status === 'pending').length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-700">In Progress</span>
          <div className="text-2xl font-serif font-bold text-rose-900">
            {orders.filter((o) => o.status === 'in_progress').length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-sage-50 border border-sage-200 shadow-soft space-y-1">
          <span className="text-[10px] uppercase font-bold text-sage-700">Delivered</span>
          <div className="text-2xl font-serif font-bold text-sage-800">
            {orders.filter((o) => o.status === 'delivered').length}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-800/40" />
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-rose-200/80 text-xs text-obsidian-950 placeholder:text-obsidian-800/40 focus:outline-none focus:border-rose-500 shadow-sm"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'pending', 'confirmed', 'in_progress', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'bg-white text-obsidian-800 hover:text-obsidian-950 border border-rose-200/60 hover:bg-rose-50/60'
              }`}
            >
              {st === 'in_progress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-3xl bg-white border border-rose-100 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-rose-200/80 space-y-2 shadow-soft">
          <ShoppingBag className="w-8 h-8 text-rose-300 mx-auto" />
          <h3 className="text-base font-semibold text-obsidian-950">No orders found</h3>
          <p className="text-xs text-obsidian-800/60">There are no customer orders matching your query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl bg-white border border-rose-200/80 space-y-6 shadow-soft"
            >
              
              {/* Order Top Summary Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-rose-700">#{order.id}</span>
                    <span className="text-xs text-obsidian-800/60">• {formatDate(order.created_at)}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-obsidian-950 flex items-center gap-2">
                    {order.customer_name}
                  </h3>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-obsidian-800/70 font-medium">Status:</span>
                  <div className="relative">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border cursor-pointer focus:outline-none ${statusBadgeStyle(
                        order.status
                      )}`}
                    >
                      <option value="pending">pending (awaiting payment)</option>
                      <option value="confirmed">confirmed (paid)</option>
                      <option value="in_progress">in_progress (designing)</option>
                      <option value="delivered">delivered (sent via WA/email)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Customer Contact & Notes Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-cream-50/70 p-4 rounded-2xl border border-cream-200/80">
                <div>
                  <span className="text-[10px] text-obsidian-800/60 uppercase font-bold block mb-1">Customer Phone (WhatsApp)</span>
                  <a
                    href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.customer_name)}%2C%20regarding%20your%20Petal%20%26%20Ink%20order%20%23${order.id}...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sage-700 hover:text-sage-800 hover:underline font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.phone}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[10px] text-obsidian-800/60 uppercase font-bold block mb-1">Email Address</span>
                  {order.email ? (
                    <a href={`mailto:${order.email}`} className="text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{order.email}</span>
                    </a>
                  ) : (
                    <span className="text-obsidian-800/40 italic">No email provided</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-obsidian-800/60 uppercase font-bold block mb-1">Special Delivery Notes</span>
                  <p className="text-obsidian-900 italic">{order.notes || 'None'}</p>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Ordered Customized Items ({order.order_items?.length || 0})
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-cream-50/50 border border-cream-200/80 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-serif text-sm font-bold text-obsidian-950">
                          {item.product_name_snapshot} <span className="text-obsidian-800/60 font-sans text-xs">(x{item.quantity})</span>
                        </span>
                        <span className="font-serif text-xs font-bold text-rose-700">
                          {formatPKR(item.price_at_purchase * item.quantity)}
                        </span>
                      </div>

                      {/* Submitted Custom Fields List */}
                      {item.custom_field_values && Object.keys(item.custom_field_values).length > 0 && (
                        <div className="p-3 rounded-xl bg-white border border-rose-200/60 text-xs space-y-1 shadow-sm">
                          <span className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Submitted Custom Text:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-obsidian-800">
                            {Object.entries(item.custom_field_values).map(([k, v]) => (
                              <div key={k}>
                                <strong className="text-obsidian-950 font-medium">{k}:</strong>{' '}
                                <span className="text-rose-800 font-medium">{v || '(blank)'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Order Total */}
              <div className="flex justify-between items-center pt-3 border-t border-rose-100 text-sm font-bold">
                <span className="text-obsidian-800/70">Order Total Amount:</span>
                <span className="font-serif text-xl text-rose-700">{formatPKR(order.total_price)}</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
