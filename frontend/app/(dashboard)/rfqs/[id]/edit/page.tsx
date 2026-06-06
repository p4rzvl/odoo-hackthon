'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVendorsList, Vendor } from '../../../../../services/vendor';
import { getRfqDetail, updateRfq, RfqLineItem, RfqVendor, publishRfq, uploadRfqFile } from '../../../../../services/rfq';
import RoleGuard from '../../../../../components/RoleGuard';
import { toast } from 'sonner';
import { 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Loader2, 
  Building2, 
  CheckCircle2, 
  Users,
  ListTodo,
  FileText,
  AlertCircle,
  UploadCloud,
  Paperclip,
  X
} from 'lucide-react';

interface FormLineItem {
  itemName: string;
  quantity: number;
  unit: string;
}

export default function EditRfqPage() {
  const router = useRouter();
  const params = useParams();
  const rfqId = parseInt(params.id as string, 10);

  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableVendors, setAvailableVendors] = useState<Vendor[]>([]);

  // Step 1 Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Raw Materials');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 Line Items
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);

  // Step 3 Vendor Assignments
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);

  // Attachments state
  const [attachments, setAttachments] = useState<{ name: string; size: string; path: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFilesUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const toastId = toast.loading(`Uploading ${file.name} to server...`);
      try {
        const res = await uploadRfqFile(file);
        if (res.success && res.data) {
          setAttachments(prev => [...prev, {
            name: res.data!.fileName,
            size: (file.size / 1024).toFixed(1) + ' KB',
            path: res.data!.filePath
          }]);
          toast.success(`${file.name} uploaded successfully!`, { id: toastId });
        } else {
          toast.error(`Failed to upload ${file.name}: ${res.error || 'Unknown error'}`, { id: toastId });
        }
      } catch (err) {
        toast.error(`Upload error for ${file.name}`, { id: toastId });
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Load RFQ data on mount
  useEffect(() => {
    const loadRfqData = async () => {
      setLoadingData(true);
      try {
        const res = await getRfqDetail(rfqId);
        if (res.success && res.data?.rfq) {
          const rfq = res.data.rfq;
          if (rfq.status !== 'DRAFT') {
            toast.error('Only RFQs in DRAFT status can be modified.');
            router.push(`/rfqs/${rfqId}`);
            return;
          }
          setTitle(rfq.title);
          setCategory(rfq.category);
          // Format ISO date to local input datetime format: YYYY-MM-DDThh:mm
          const localDeadline = new Date(rfq.deadline).toISOString().slice(0, 16);
          setDeadline(localDeadline);
          setDescription(rfq.description);
          setLineItems(rfq.lineItems.map((item: RfqLineItem) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit
          })));
          setSelectedVendorIds(rfq.rfqVendors.map((rv: RfqVendor) => rv.vendorId));
          if (rfq.attachments && rfq.attachments.length > 0) {
            setAttachments(rfq.attachments.map((att: any) => ({
              name: att.fileName,
              size: 'Attached',
              path: att.filePath
            })));
          }
        } else {
          toast.error(res.error || 'Failed to load RFQ specifications');
          router.push('/rfqs');
        }
      } catch (err) {
        toast.error('Network failure trying to load RFQ data.');
        router.push('/rfqs');
      } finally {
        setLoadingData(false);
      }
    };

    if (!isNaN(rfqId)) {
      loadRfqData();
    }
  }, [rfqId, router]);

  // Load active vendors list when step is 3
  useEffect(() => {
    if (step === 3 && availableVendors.length === 0) {
      const fetchVendors = async () => {
        setLoadingVendors(true);
        try {
          const res = await getVendorsList({ status: 'ACTIVE', page: 1, limit: 100 });
          if (res.success && res.data) {
            setAvailableVendors(res.data.vendors);
          }
        } catch (err) {
          toast.error('Failed to load active vendors directory');
        } finally {
          setLoadingVendors(false);
        }
      };
      fetchVendors();
    }
  }, [step, availableVendors.length]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { itemName: '', quantity: 1, unit: 'pcs' }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error('At least one line item is required');
      return;
    }
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
  };

  const handleLineItemChange = (index: number, field: keyof FormLineItem, value: any) => {
    const updated = [...lineItems];
    if (field === 'quantity') {
      updated[index][field] = Math.max(1, parseFloat(value) || 0);
    } else {
      updated[index][field] = value;
    }
    setLineItems(updated);
  };

  const handleVendorCheckboxChange = (vendorId: number) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendorId));
    } else {
      setSelectedVendorIds([...selectedVendorIds, vendorId]);
    }
  };

  const validateStep1 = () => {
    if (!title.trim()) return 'Title is required';
    if (!deadline) return 'Deadline is required';
    if (new Date(deadline) <= new Date()) return 'Deadline must be in the future';
    if (!description.trim()) return 'Description is required';
    return null;
  };

  const validateStep2 = () => {
    for (let i = 0; i < lineItems.length; i++) {
      if (!lineItems[i].itemName.trim()) {
        return `Item name in row ${i + 1} is required`;
      }
      if (lineItems[i].quantity <= 0) {
        return `Quantity in row ${i + 1} must be greater than zero`;
      }
      if (!lineItems[i].unit.trim()) {
        return `Unit in row ${i + 1} is required`;
      }
    }
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
      const error = validateStep1();
      if (error) {
        toast.error(error);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const error = validateStep2();
      if (error) {
        toast.error(error);
        return;
      }
      setStep(3);
    }
  };

  const handleUpdateRfq = async (shouldPublish: boolean = false) => {
    if (selectedVendorIds.length === 0) {
      toast.error('Please select at least one vendor to invite');
      return;
    }

    setSubmitting(true);
    try {
      const isoDeadline = new Date(deadline).toISOString();

      const res = await updateRfq(rfqId, {
        title,
        category,
        description,
        deadline: isoDeadline,
        lineItems,
        assignedVendorIds: selectedVendorIds,
        attachments: attachments.map(a => ({
          fileName: a.name,
          filePath: a.path
        }))
      });

      if (res.success) {
        if (shouldPublish) {
          const publishRes = await publishRfq(rfqId);
          if (publishRes.success) {
            toast.success('RFQ Draft updated and Published successfully!');
          } else {
            toast.warning('RFQ Draft updated, but failed to publish: ' + publishRes.error);
          }
        } else {
          toast.success('RFQ Draft updated successfully!');
        }
        router.push(`/rfqs/${rfqId}`);
      } else {
        toast.error(res.error || 'Failed to update RFQ.');
      }
    } catch (err) {
      toast.error('Network failure while saving RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-[#6b7280] mt-2 font-semibold">Loading RFQ workspace details...</p>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['OFFICER']}>
      <div className="max-w-3xl mx-auto space-y-6 font-sans text-[#212529]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#212529]">Edit RFQ Draft</h1>
            <p className="text-sm text-[#6b7280] mt-1">Modify your draft RFQ items, deadline, and invited vendor parameters.</p>
          </div>
          <button
            onClick={() => router.push(`/rfqs/${rfqId}`)}
            className="px-3 py-1.5 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
          >
            Cancel Edits
          </button>
        </div>

        {/* Stepper Wizard Indicator */}
        <div className="bg-white p-4 rounded-[8px] border border-[#e5e5e5] shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-6 w-full max-w-md mx-auto">
            {/* Step 1 */}
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-[#714B67]' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#714B67] text-white' : 'bg-slate-200'}`}>
                1
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {/* Step 2 */}
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-[#714B67]' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#714B67] text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Items</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {/* Step 3 */}
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-[#714B67]' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#714B67] text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Vendors</span>
            </div>
          </div>
        </div>

        {/* Wizard Form Panel */}
        <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-sm p-6">
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#e5e5e5] pb-3 mb-4">
                <FileText className="w-5 h-5 text-[#714B67]" />
                <h3 className="text-sm font-bold text-[#212529]">Step 1: RFQ Parameters</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-[#6b7280] block">RFQ Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Wire Supply Q3"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs outline-none focus:border-[#714B67] text-[#212529]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6b7280] block">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-[#f8f9fa] w-full px-3 py-2 rounded-[6px] text-xs outline-none border border-[#e5e5e5] focus:border-[#714B67] text-[#212529]"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6b7280] block">Bidding Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs outline-none focus:border-[#714B67] text-[#212529]"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-[#6b7280] block">RFQ Description / Terms</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Declare technical specs..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px] text-xs outline-none focus:border-[#714B67] text-[#212529]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Line Items */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <ListTodo className="w-5 h-5 text-[#714B67]" />
                  <h3 className="text-sm font-bold text-[#212529]">Step 2: Material Items Inventory</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#714B67] hover:bg-[#9e7592] text-white text-[10px] font-bold rounded-[4px] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Items Table list */}
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#f8f9fa] border border-[#e5e5e5] rounded-[6px]">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Item name / specification"
                        value={item.itemName}
                        onChange={e => handleLineItemChange(index, 'itemName', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-[4px] text-xs outline-none focus:border-[#714B67]"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min={1}
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={e => handleLineItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-[4px] text-xs outline-none focus:border-[#714B67]"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        placeholder="Unit (e.g. kg)"
                        value={item.unit}
                        onChange={e => handleLineItemChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-[4px] text-xs outline-none focus:border-[#714B67]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-[4px] transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Assign Vendors */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#e5e5e5] pb-3 mb-4">
                <Users className="w-5 h-5 text-[#714B67]" />
                <h3 className="text-sm font-bold text-[#212529]">Step 3: Supplier Invitation Assignments</h3>
              </div>

              {loadingVendors ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#714B67] mx-auto" />
                  <p className="text-xs text-[#6b7280] mt-2 font-semibold">Retrieving active suppliers...</p>
                </div>
              ) : availableVendors.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8F8F8F] border border-dashed border-[#e5e5e5] rounded-[6px]">
                  No active suppliers available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                  {availableVendors.map(vendor => {
                    const isChecked = selectedVendorIds.includes(vendor.id);
                    return (
                      <div 
                        key={vendor.id}
                        onClick={() => handleVendorCheckboxChange(vendor.id)}
                        className={`p-3 border rounded-[6px] cursor-pointer flex items-center justify-between transition-all ${
                          isChecked 
                            ? 'bg-[#714B67]/5 border-[#714B67]' 
                            : 'bg-white border-[#e5e5e5] hover:bg-[#f8f9fa]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-slate-400" />
                          <div>
                            <div className="text-xs font-bold text-[#212529]">{vendor.companyName}</div>
                            <div className="text-[10px] text-[#6b7280]">{vendor.category} | GSTIN: {vendor.gstNumber}</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#714B67] border-[#714B67] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Attachments Section */}
              <div className="space-y-2 pt-4 border-t border-[#e5e5e5] mt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Attachments</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[8px] p-6 text-center transition-all ${
                    dragActive 
                      ? 'border-[#714B67] bg-[#714B67]/5' 
                      : 'border-slate-300 hover:border-slate-400 bg-[#f8f9fa]'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-edit"
                  />
                  <label htmlFor="file-upload-edit" className="cursor-pointer block">
                    <UploadCloud className="w-8 h-8 text-[#714B67] mx-auto mb-2 opacity-80" />
                    <span className="text-xs text-[#212529] font-medium block">
                      Drag & drop files or <span className="text-[#714B67] font-semibold underline">click to upload</span>
                    </span>
                    <span className="text-[10px] text-[#6b7280] mt-1 block">
                      Supports PDF, PNG, JPG, XLSX (Max 10MB)
                    </span>
                  </label>
                </div>

                {/* Display attached files */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-[#e5e5e5] rounded-[6px] text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-[#212529] truncate">{file.name}</span>
                          <span className="text-[10px] text-[#6b7280] shrink-0">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded transition-all shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-[#e5e5e5] mt-6">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  router.push(`/rfqs/${rfqId}`);
                } else {
                  setStep(step - 1);
                }
              }}
              className="flex items-center space-x-1 px-4 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1 px-5 py-2 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleUpdateRfq(false)}
                  className="px-4 py-2 border border-[#e5e5e5] hover:bg-[#f8f9fa] rounded-[6px] text-xs font-semibold text-[#212529] transition-all disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleUpdateRfq(true)}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-[#714B67] hover:bg-[#9e7592] active:bg-[#5a3c52] text-white text-xs font-semibold rounded-[6px] transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Send to Vendors</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
