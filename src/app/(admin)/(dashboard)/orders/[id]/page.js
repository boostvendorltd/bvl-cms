"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { fetchOrder, updateOrderStatus, updateOrder, clearCurrentOrder } from "@/redux/features/order-slice";
import {
    ArrowLeftIcon,
    PrinterIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    UserIcon,
    BanknotesIcon,
    TruckIcon,
    ChatBubbleBottomCenterTextIcon,
    BookmarkIcon,
    EnvelopeOpenIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import RouteGuard from "@/components/security/RouteGuard";
import Badge from "@/components/ui/badge/Badge";
import { BoxCubeIcon } from "@/icons/index";

const STATUS_MAP = {
    0: { label: "Pending", color: "warning" },
    1: { label: "Processing", color: "info" },
    2: { label: "Shipped", color: "primary" },
    3: { label: "Delivered", color: "success" },
    4: { label: "Cancelled", color: "error" },
    5: { label: "Refunded", color: "gray" },
};

const PAYMENT_STATUS_MAP = {
    0: { label: "Pending", color: "warning" },
    1: { label: "Paid", color: "success" },
    2: { label: "Partial", color: "info" },
    3: { label: "Failed", color: "error" },
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentOrder: order, loading } = useSelector((state) => state.order);

    const [isEditingNote, setIsEditingNote] = useState(false);
    const [note, setNote] = useState("");
    const [financials, setFinancials] = useState({
        payment_status: 0,
        advance_payment: 0,
        due_payment: 0,
        payment_details: "",
        payment_date: "",
        payment_transaction_id: ""
    });

    useEffect(() => {
        dispatch(fetchOrder(id));
        return () => dispatch(clearCurrentOrder());
    }, [dispatch, id]);

    useEffect(() => {
        if (order) {
            setNote(order.shop_note || "");
            setFinancials({
                payment_status: order.payment_status,
                advance_payment: order.advance_payment || 0,
                due_payment: order.due_payment || 0,
                payment_details: order.payment_details || "",
                payment_date: order.payment_date ? order.payment_date.split('T')[0] : "",
                payment_transaction_id: order.payment_transaction_id || ""
            });
        }
    }, [order]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await toast.promise(
                dispatch(updateOrderStatus({ id, status: newStatus })).unwrap(),
                {
                    loading: 'Updating status...',
                    success: 'Status updated',
                    error: 'Failed to update status'
                }
            );
        } catch (error) { }
    };

    const handleSaveNote = async () => {
        try {
            await toast.promise(
                dispatch(updateOrder({ id, data: { shop_note: note } })).unwrap(),
                {
                    loading: 'Saving note...',
                    success: 'Note updated',
                    error: 'Failed to save note'
                }
            );
            setIsEditingNote(false);
        } catch (error) { }
    };

    const handleSaveFinancials = async () => {
        try {
            await toast.promise(
                dispatch(updateOrder({ id, data: financials })).unwrap(),
                {
                    loading: 'Updating financials...',
                    success: 'Financials updated',
                    error: 'Failed to update financials'
                }
            );
        } catch (error) { }
    };

    if (loading && !order) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading order details...</div>;
    }

    if (!order) {
        return <div className="p-6 text-center text-red-500 dark:text-error-500">Order not found.</div>;
    }

    return (
        <>
            <PageBreadCrumb pageTitle={`Order ${order.order_number}`} />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Orders
                </button>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-white/[0.03]">
                        <PrinterIcon className="w-4 h-4" />
                        Print Invoice
                    </button>
                    <div className="relative inline-block text-left">
                        <select
                            value={order.order_status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 outline-none appearance-none cursor-pointer pr-10"
                        >
                            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                                <option key={val} value={val} className="text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-300">{label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-white">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-800 dark:text-white/90">Order Items</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="text-sm">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                                                        {item.product_image ? (
                                                            <img
                                                                src={item.product_image.startsWith('http') ? item.product_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '/storage')}/${item.product_image}`}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <BoxCubeIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-white/90">{item.product_name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.product_sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                                                ${parseFloat(item.product_price).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                                                {item.quantity}
                                            </td>
                                            <td className="px-5 py-4 text-right font-medium text-gray-800 dark:text-white/90">
                                                ${parseFloat(item.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-500" />
                                Shop Note
                            </h3>
                            {!isEditingNote ? (
                                <button onClick={() => setIsEditingNote(true)} className="text-sm text-blue-600 hover:underline">Edit</button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditingNote(false)} className="text-sm text-gray-500">Cancel</button>
                                    <button onClick={handleSaveNote} className="text-sm text-blue-600 font-semibold">Save</button>
                                </div>
                            )}
                        </div>
                        {isEditingNote ? (
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                placeholder="Add a note to this order..."
                            />
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg italic">
                                {order.shop_note || "No shop note added to this order."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar: Details Summaries */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white/90 border-b pb-3 mb-4">Summary</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                            <span className="font-medium text-gray-800 dark:text-white/90">${parseFloat(order.sub_total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Tax</span>
                            <span className="font-medium text-gray-800 dark:text-white/90">${parseFloat(order.tax_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                            <span className="font-medium text-gray-800 dark:text-white/90">${parseFloat(order.shipping_cost).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <span className="flex flex-col">
                                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                                {order.discount_details && (
                                    <span className="text-[10px] italic">{order.discount_details.description || 'Voucher Applied'}</span>
                                )}
                            </span>
                            <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                        </div>
                        {order.commission_amount > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-500/5 p-3 rounded-lg space-y-2 mt-2">
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Marketplace Commission</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700 dark:text-blue-400">Rate ({order.commission_type === 'percentage' ? `${order.commission_rate}%` : 'Fixed'})</span>
                                    <span className="font-semibold text-blue-700 dark:text-blue-400">-${parseFloat(order.commission_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        <div className="pt-3 border-t flex justify-between items-center border-gray-100 dark:border-gray-700">
                            <span className="font-bold text-gray-800 dark:text-white/90">Total Payable</span>
                            <span className="text-xl font-bold text-blue-600">${parseFloat(order.grand_total).toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm font-medium border-t pt-3 border-gray-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Advance Payment</span>
                            <span className="text-green-600">${parseFloat(order.advance_payment || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-600 dark:text-gray-400">Due Payment</span>
                            <span className="text-red-600">${parseFloat(order.due_payment || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {order.note && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 border-b pb-3 mb-4 border-gray-100 dark:border-gray-700">
                                <BookmarkIcon className="w-5 h-5 text-gray-400" />
                                Customer Note
                            </h3>
                            <div className="text-sm space-y-3">
                                <div className="flex gap-3">
                                    <EnvelopeOpenIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white/90">{order.note}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 border-b pb-3 mb-4 border-gray-100 dark:border-gray-700">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                            Customer Info
                        </h3>
                        <div className="text-sm space-y-3">
                            <div className="flex gap-3">
                                <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white/90">{order.user_name}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-500">{order.user_id ? "Registered User" : "Guest Customer"}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                                <EnvelopeIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="break-all">{order.user_email || "N/A"}</p>
                            </div>
                            <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                                <PhoneIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p>{order.user_phone || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 border-b pb-3 mb-4 border-gray-100 dark:border-gray-700">
                            <TruckIcon className="w-5 h-5 text-gray-400" />
                            Shipping Details
                        </h3>
                        <div className="text-sm space-y-3">
                            <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                                <TruckIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white/90">{order.shipping_method_name || "Standard Delivery"}</p>
                                    <p className="text-xs text-gray-500">Selected Method</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="leading-relaxed">{order.user_address || "No address provided."}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 border-b pb-3 mb-4 border-gray-100 dark:border-gray-700">
                            <BanknotesIcon className="w-5 h-5 text-gray-400" />
                            Financial Updates
                        </h3>
                        <div className="text-sm space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Order Placed</span>
                                <span className="font-medium uppercase text-gray-800 dark:text-white/90">{new Date(order.order_date).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                                <span className="font-medium uppercase text-gray-800 dark:text-white/90">{order.payment_method || 'COD'}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Transaction ID</label>
                                <input 
                                    type="text"
                                    value={financials.payment_transaction_id}
                                    onChange={(e) => setFinancials({...financials, payment_transaction_id: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all uppercase placeholder:normal-case font-mono"
                                    placeholder="e.g. TRX-12345"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Payment Status</label>
                                <select
                                    value={financials.payment_status}
                                    onChange={(e) => setFinancials({...financials, payment_status: e.target.value})}
                                    className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none
                                        ${parseInt(financials.payment_status) === 1 ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:border-success-500/20' :
                                            parseInt(financials.payment_status) === 0 ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:border-warning-500/20' :
                                                'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:border-gray-700'}`}
                                >
                                    {Object.entries(PAYMENT_STATUS_MAP).map(([val, { label }]) => (
                                        <option key={val} value={val} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Payment Date</label>
                                <input
                                    type="date"
                                    value={financials.payment_date}
                                    onChange={(e) => setFinancials({...financials, payment_date: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Advance</label>
                                    <input
                                        type="number"
                                        value={financials.advance_payment}
                                        onChange={(e) => setFinancials({...financials, advance_payment: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Due</label>
                                    <input
                                        type="number"
                                        value={financials.due_payment}
                                        onChange={(e) => setFinancials({...financials, due_payment: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Transaction/Payment Details</label>
                                <textarea
                                    value={financials.payment_details}
                                    onChange={(e) => setFinancials({...financials, payment_details: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all rows-2"
                                    placeholder="Enter transaction ID, notes, etc."
                                />
                            </div>

                            <button 
                                onClick={handleSaveFinancials}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-blue-200 dark:shadow-none mt-2"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function OrderDetailWrapper() {
    return (
        <RouteGuard allowedRoles={['account', 'shop']} requireShop={true}>
            <OrderDetailPage />
        </RouteGuard>
    );
}
