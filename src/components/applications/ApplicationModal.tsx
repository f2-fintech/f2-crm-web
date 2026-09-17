"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  application?: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserOption {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function ApplicationModal({
  open,
  mode,
  application,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<UserOption[]>([]);

  const [form, setForm] = useState({
    applicantName: "",
    phone: "",
    email: "",
    loanType: "",
    loanAmount: "",
    lenderName: "",
    branchName: "",
    leadId: "",
    customerId: "",
    omsId: "",
    assignedTo: "",
    remarks: "",
  });

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");

      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!open) return;

    loadUsers();

    if (mode === "edit" && application) {
      setForm({
        applicantName: application.applicantName || "",
        phone: application.phone || "",
        email: application.email || "",
        loanType: application.loanType || "",
        loanAmount: application.loanAmount || "",
        lenderName: application.lenderName || "",
        branchName: application.branchName || "",
        leadId: application.leadId || "",
        customerId: application.customerId || "",
        omsId: application.omsId || "",
        assignedTo:
          application.assignedTo?._id ||
          application.assignedTo ||
          "",
        remarks: application.remarks || "",
      });
    } else {
      setForm({
        applicantName: "",
        phone: "",
        email: "",
        loanType: "",
        loanAmount: "",
        lenderName: "",
        branchName: "",
        leadId: "",
        customerId: "",
        omsId: "",
        assignedTo: "",
        remarks: "",
      });
    }
  }, [open, mode, application]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setForm({
      applicantName: "",
      phone: "",
      email: "",
      loanType: "",
      loanAmount: "",
      lenderName: "",
      branchName: "",
      leadId: "",
      customerId: "",
      omsId: "",
      assignedTo: "",
      remarks: "",
    });

    onClose();
  };

  const handleSubmit = async () => {
    if (!form.applicantName.trim()) {
      return alert("Applicant Name is required");
    }

    if (!form.phone.trim()) {
      return alert("Phone is required");
    }

    if (!form.loanType.trim()) {
      return alert("Loan Type is required");
    }

    if (!form.loanAmount) {
      return alert("Loan Amount is required");
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        loanAmount: Number(form.loanAmount),
      };

      const res =
        mode === "create"
          ? await api.post("/applications", payload)
          : await api.patch(
              `/applications/${application._id}`,
              payload
            );

      alert(res.data.message);

      onSuccess();

      handleClose();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-xl font-semibold">
              {mode === "create"
                ? "Create Application"
                : "Edit Application"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create or update loan application details.
            </p>

          </div>

          <button
            onClick={handleClose}
            className="text-2xl text-gray-400 hover:text-red-500"
          >
            ×
          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-6">

          <div className="grid grid-cols-2 gap-5">
            {/* Applicant Name */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Applicant Name
              </label>

              <input
                name="applicantName"
                value={form.applicantName}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="rahul@gmail.com"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Loan Type */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Loan Type
              </label>

              <input
                name="loanType"
                value={form.loanType}
                onChange={handleChange}
                placeholder="Home Loan"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Loan Amount */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Loan Amount
              </label>

              <input
                type="number"
                name="loanAmount"
                value={form.loanAmount}
                onChange={handleChange}
                placeholder="2500000"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Lender */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Lender Name
              </label>

              <input
                name="lenderName"
                value={form.lenderName}
                onChange={handleChange}
                placeholder="HDFC Bank"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Branch */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Branch Name
              </label>

              <input
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                placeholder="Noida Branch"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Lead */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Lead ID
              </label>

              <input
                name="leadId"
                value={form.leadId}
                onChange={handleChange}
                placeholder="LD000001"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Customer */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Customer ID
              </label>

              <input
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                placeholder="CUS000001"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* OMS */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                OMS ID
              </label>

              <input
                name="omsId"
                value={form.omsId}
                onChange={handleChange}
                placeholder="OMS000001"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* Assigned User */}

            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Assigned To
              </label>

              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              >
                <option value="">
                  Select User
                </option>

                {users.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                  >
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Remarks */}

            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Remarks
              </label>

              <textarea
                rows={4}
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks..."
                className="w-full rounded-lg border p-3"
              />
            </div>

          </div>

          {/* Preview */}

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

            <h3 className="mb-4 text-base font-semibold text-blue-700">
              Application Preview
            </h3>

            <div className="grid grid-cols-2 gap-5">

              <div>
                <p className="text-xs text-gray-500">
                  Applicant
                </p>
                <p className="font-medium">
                  {form.applicantName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Phone
                </p>
                <p className="font-medium">
                  {form.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Loan Type
                </p>
                <p className="font-medium">
                  {form.loanType || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Loan Amount
                </p>
                <p className="font-medium">
                  ₹ {form.loanAmount || "-"}
                </p>
              </div>

            </div>

          </div>
                  </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t px-6 py-5">

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? mode === "create"
                ? "Saving..."
                : "Updating..."
              : mode === "create"
              ? "Save Application"
              : "Update Application"}
          </button>

        </div>

      </div>
    </div>
  );
}