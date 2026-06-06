'use client';

import { useState, useEffect } from 'react';
import { getVendorsList, onboardVendor, updateVendorStatus, Vendor } from '../../../services/vendor';
import { getVendorUsersList } from '../../../services/auth';
import StatusBadge from '../../../components/StatusBadge';
import { Search, Plus, Loader2, Globe, Building2, MapPin, Phone, ShieldCheck, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorsPage() {
  // State variables
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: number; email: string; firstName: string; lastName: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [selectedUserId, setSelectedUserId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Manufacturing');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  // Fetch Vendors list on filter/page changes
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendorsList({
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        page,
        limit: 10
      });
      if (res.success && res.data) {
        setVendors(res.data.vendors);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        toast.error(res.error || 'Failed to retrieve vendors');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, page]);

  // Fetch unlinked vendor users when modal opens
  const openOnboardModal = async () => {
    setIsModalOpen(true);
    try {
      const res = await getVendorUsersList();
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load vendor users:', err);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please map a user account');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onboardVendor({
        userId: parseInt(selectedUserId, 10),
        companyName,
        gstNumber,
        category: selectedCategory,
        contactNumber,
        address
      });

      if (res.success) {
        toast.success('Vendor profile created successfully!');
        setIsModalOpen(false);
        // Reset Form
        setSelectedUserId('');
        setCompanyName('');
        setGstNumber('');
        setContactNumber('');
        setAddress('');
        fetchVendors();
      } else {
        toast.error(res.error || 'Failed to onboard vendor');
      }
    } catch (err) {
      toast.error('Network failure on submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBlockStatus = async (vendor: Vendor) => {
    const nextStatus = vendor.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    const actionLabel = vendor.status === 'BLOCKED' ? 'unblock' : 'block';

    try {
      const res = await updateVendorStatus(vendor.id, nextStatus);
      if (res.success) {
        toast.success(`Vendor ${vendor.companyName} is now ${nextStatus.toLowerCase()}.`);
        fetchVendors();
      } else {
        toast.error(res.error || `Failed to ${actionLabel} vendor.`);
      }
    } catch (err) {
      toast.error('Could not communicate status update.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#212529]">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Vendor Profiles Directory</h1>
          <p className="text-sm text-[#6b7280] mt-1">Manage qualified business partners and suppliers.</p>
        </div>
        <button
          onClick={openOnboardModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Vendor</span>
        </button>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        {/* Status Tabs */}
        <div className="flex border-b border-[#e5e5e5]">
          {['ALL', 'ACTIVE', 'PENDING', 'BLOCKED'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all -mb-[2px] ${
                status === tab
                  ? 'border-[#714B67] text-[#714B67]'
                  : 'border-transparent text-[#6b7280] hover:text-[#212529]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8F8F8F]" />
            <input
              type="text"
              placeholder="Search by company name or GSTIN..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-[#f8f9fa] w-full pl-9 pr-4 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] transition-all text-[#212529]"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-[#f8f9fa] w-full px-3 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] text-[#212529]"
            >
              <option value="">All Categories</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="IT Services">IT Services</option>
              <option value="Logistics">Logistics</option>
              <option value="Consulting">Consulting</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs text-[#6b7280] mt-2 font-semibold">Retrieving verified profiles...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <Globe className="w-12 h-12 text-[#8F8F8F] mx-auto stroke-[1.5]" />
            <div className="text-sm font-bold text-[#212529]">No Suppliers Registered</div>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto">No profiles matched your search parameters. Click &quot;Onboard Vendor&quot; to register a supplier profile.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e5e5e5] text-[#212529] font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">Company Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Contact Detail</th>
                  <th className="p-4">System Account</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor, index) => (
                  <tr
                    key={vendor.id}
                    className={`border-b border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbfd]'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#212529]">{vendor.companyName}</div>
                      <div className="text-[10px] text-[#6b7280] mt-0.5 flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                        <span>{vendor.address}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#f8f9fa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[10px] font-semibold">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-700">{vendor.gstNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        <span>{vendor.contactNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">
                        {vendor.user.firstName} {vendor.user.lastName}
                      </div>
                      <div className="text-[10px] text-[#6b7280]">{vendor.user.email}</div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={vendor.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleBlockStatus(vendor)}
                        className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold border transition-all ${
                          vendor.status === 'BLOCKED'
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {vendor.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between">
                <div className="text-[11px] text-[#6b7280]">
                  Page <b>{page}</b> of <b>{totalPages}</b>
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[4px] text-[11px] font-bold disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Onboard Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#212529]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[12px] border border-[#e5e5e5] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#714B67] p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <h2 className="text-base font-bold">Onboard New Vendor Profile</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleOnboardSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Select User Account */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6b7280] block">Link user credentials account</label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  required
                  className="bg-[#f8f9fa] w-full px-3 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] text-[#212529]"
                >
                  <option value="">Select Vendor Account...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Select the registered user that this supplier profile will link to.</p>
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6b7280] block">Company Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Odoo Supplies Corp"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              {/* GSTIN */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6b7280] block">GSTIN Number (15-characters)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="e.g. 24ABCDE1234F1Z5"
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs font-mono uppercase outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6b7280] block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-[#f8f9fa] w-full px-3 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] text-[#212529]"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6b7280] block">Contact Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8F8F8F]">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99999 88888"
                      value={contactNumber}
                      onChange={e => setContactNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs outline-none focus:border-[#714B67]"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6b7280] block">Address</label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3 text-[#8F8F8F]">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. 102 Business Plaza, Sector 15, Ahmedabad"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Onboard Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
