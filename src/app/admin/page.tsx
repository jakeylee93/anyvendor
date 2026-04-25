"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Building2,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  AlertCircle,
} from "lucide-react";

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  vendorSlug?: string;
  createdAt: string;
}

interface StoredVendor {
  slug: string;
  name: string;
  category: string;
  location: string;
  email?: string;
  verified?: boolean;
  createdAt: string;
}

interface EventRequest {
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: string;
  services: string[];
  details: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"users" | "vendors" | "requests">("users");
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [vendors, setVendors] = useState<StoredVendor[]>([]);
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setUsers(JSON.parse(localStorage.getItem("anyvendor_users") || "[]"));
    setVendors(JSON.parse(localStorage.getItem("anyvendor_vendors") || "[]"));
    setRequests(JSON.parse(localStorage.getItem("anyvendor_event_requests") || "[]"));
  }

  function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    const updated = users.filter((u) => u.id !== id);
    localStorage.setItem("anyvendor_users", JSON.stringify(updated));
    setUsers(updated);
  }

  function deleteVendor(slug: string) {
    if (!confirm("Delete this vendor listing?")) return;
    const updated = vendors.filter((v) => v.slug !== slug);
    localStorage.setItem("anyvendor_vendors", JSON.stringify(updated));
    setVendors(updated);
  }

  function toggleVerify(slug: string) {
    const updated = vendors.map((v) =>
      v.slug === slug ? { ...v, verified: !v.verified } : v
    );
    localStorage.setItem("anyvendor_vendors", JSON.stringify(updated));
    setVendors(updated);
  }

  function deleteRequest(idx: number) {
    if (!confirm("Delete this event request?")) return;
    const updated = requests.filter((_, i) => i !== idx);
    localStorage.setItem("anyvendor_event_requests", JSON.stringify(updated));
    setRequests(updated);
  }

  // Not admin? Block access
  if (!user || user.role !== "admin") {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-black text-gray-900">Access Denied</h1>
          <p className="text-gray-500 text-sm mt-2">You need an admin account to access this page.</p>
          <Link href="/login" className="inline-block mt-6 bg-[#1a1a2e] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#16213e] transition-colors">Sign In</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#e2b33e]/10 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-[#e2b33e]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-xs">Manage users, vendors, and event requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <Users size={18} className="text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{users.length}</p>
            <p className="text-gray-500 text-xs">Registered Users</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <Building2 size={18} className="text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{vendors.length}</p>
            <p className="text-gray-500 text-xs">Listed Vendors</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <FileText size={18} className="text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{requests.length}</p>
            <p className="text-gray-500 text-xs">Event Requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 max-w-md">
          {([
            { key: "users", label: "Users", icon: Users },
            { key: "vendors", label: "Vendors", icon: Building2 },
            { key: "requests", label: "Requests", icon: FileText },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:border-[#e2b33e] focus:outline-none"
          />
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No registered users yet.</p>
            ) : (
              users
                .filter((u) => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                })
                .map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-bold">{u.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === "admin" ? "bg-[#e2b33e]/10 text-[#e2b33e]" :
                          u.role === "vendor" ? "bg-blue-50 text-blue-500" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{u.email}</p>
                      {u.vendorSlug && <p className="text-gray-400 text-[10px] mt-0.5">Vendor: {u.vendorSlug}</p>}
                      <p className="text-gray-300 text-[10px]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : ""}</p>
                    </div>
                    <div className="flex gap-1">
                      {u.role !== "admin" && (
                        <button onClick={() => deleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {tab === "vendors" && (
          <div className="space-y-2">
            {vendors.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No user-created vendors yet. (Built-in demo vendors are hardcoded.)</p>
            ) : (
              vendors
                .filter((v) => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  return v.name?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q);
                })
                .map((v) => (
                  <div key={v.slug} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-bold">{v.name}</p>
                        {v.verified && <CheckCircle2 size={14} className="text-[#2ec4b6]" />}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{v.category} · {v.location}</p>
                      <p className="text-gray-300 text-[10px]">{v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-GB") : ""}</p>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/vendor/${v.slug}`} className="p-2 text-gray-400 hover:text-[#1a1a2e] rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => toggleVerify(v.slug)}
                        className={`p-2 rounded-lg transition-colors ${
                          v.verified ? "text-[#2ec4b6] hover:bg-[#2ec4b6]/10" : "text-gray-400 hover:text-[#2ec4b6] hover:bg-[#2ec4b6]/10"
                        }`}
                        title={v.verified ? "Remove verification" : "Verify vendor"}
                      >
                        {v.verified ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      </button>
                      <button onClick={() => deleteVendor(v.slug)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === "requests" && (
          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No event requests yet.</p>
            ) : (
              requests.map((r, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-900 text-sm font-bold">{r.eventType} — {r.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{r.email} · {r.location} · {r.guestCount} guests</p>
                      {r.eventDate && <p className="text-gray-400 text-xs mt-0.5">Date: {new Date(r.eventDate).toLocaleDateString("en-GB")}</p>}
                      {r.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.services.map((s) => (
                            <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      {r.details && <p className="text-gray-500 text-xs mt-2 italic">&ldquo;{r.details}&rdquo;</p>}
                    </div>
                    <button onClick={() => deleteRequest(idx)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
