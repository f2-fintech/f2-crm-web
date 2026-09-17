"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface AddressInfo {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
}

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState<AddressInfo>({
    country: "",
    state: "",
    city: "",
    postalCode: "",
    streetAddress: "",
  });

  const [form, setForm] = useState<AddressInfo>({
    country: "",
    state: "",
    city: "",
    postalCode: "",
    streetAddress: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const profile = res.data.data ?? res.data;

        if (profile.address) {
          setAddress(profile.address);
          setForm(profile.address);
        } else {
          setAddress({
            country: profile.country || "",
            state: profile.state || "",
            city: profile.city || "",
            postalCode: profile.postalCode || "",
            streetAddress: profile.streetAddress || profile.addressText || "",
          });
          setForm({
            country: profile.country || "",
            state: profile.state || "",
            city: profile.city || "",
            postalCode: profile.postalCode || "",
            streetAddress: profile.streetAddress || profile.addressText || "",
          });
        }
      } catch (error) {
        console.error("Address Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleOpenModal = () => {
    setForm(address);
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { address: form, ...form };
      let res;
      try {
        res = await api.patch("/auth/profile", payload);
      } catch (err) {
        res = await api.put("/auth/profile", payload);
      }

      const updated = res.data.data ?? res.data;
      const newAddress = updated.address || form;
      setAddress(newAddress);
      closeModal();
    } catch (error) {
      console.error("Save Address Error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Address Information
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.country || "--"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                State
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.state || "--"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                City
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.city || "--"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Postal Code
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.postalCode || "--"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.streetAddress || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Address information is not available.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex lg:w-auto shrink-0"
        >
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Edit Address Information
            </h4>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Update your address details.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={form.country || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>State</Label>
                <Input
                  type="text"
                  name="state"
                  value={form.state || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  type="text"
                  name="city"
                  value={form.city || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input
                  type="text"
                  name="postalCode"
                  value={form.postalCode || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="lg:col-span-2">
                <Label>Street Address</Label>
                <Input
                  type="text"
                  name="streetAddress"
                  value={form.streetAddress || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeModal}
                disabled={saving}
              >
                Close
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}