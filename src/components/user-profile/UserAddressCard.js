"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "@/redux/features/auth-slice";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function UserAddressCard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const {
    isOpen,
    openModal,
    closeModal
  } = useModal();

  // Use first address if available
  const address = user?.addresses && user.addresses.length > 0 ? user.addresses[0] : null;

  // Local state for address fields
  const [formData, setFormData] = useState({
    address_1: "",
    address_2: "",
    type: 0,
  });

  // Load address data into form when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentAddress = user?.addresses && user.addresses.length > 0 ? user.addresses[0] : {};
      setFormData({
        address_1: currentAddress.address_1 || "",
        address_2: currentAddress.address_2 || "",
        type: currentAddress.type !== undefined ? currentAddress.type : 0,
      });
    }
  }, [isOpen, user]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    console.log("Saving address...", formData);
    try {
      await dispatch(updateProfile({
        ...user, // Send current user data to avoid wiping other fields if backend requires all
        name: user.name, // Required field
        address_1: formData.address_1,
        address_2: formData.address_2,
        type: formData.type
      })).unwrap();
      closeModal();
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (parseInt(type)) {
      case 0: return "Home";
      case 1: return "Office";
      case 2: return "Other";
      default: return "Home";
    }
  };

  return <>
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Address
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address Type
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address ? getAddressTypeLabel(address.type) : "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address Line 1
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address ? address.address_1 || "N/A" : "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address Line 2 (City/State)
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address ? address.address_2 || "N/A" : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <button onClick={openModal} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
          </svg>
          Edit
        </button>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto z-[10000]">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      Edit Address
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-200 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        <div className="col-span-2">
                          <Label>Address Type</Label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          >
                            <option value="0">Home</option>
                            <option value="1">Office</option>
                            <option value="2">Other</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <Label>Address Line 1</Label>
                          <Input type="text" name="address_1" value={formData.address_1} onChange={handleChange} />
                        </div>

                        <div className="col-span-2">
                          <Label>Address Line 2</Label>
                          <Input type="text" name="address_2" value={formData.address_2} onChange={handleChange} />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 mt-auto">
                    <Button size="sm" variant="outline" onClick={closeModal} type="button">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} type="button">
                      Save Changes
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  </>;
}