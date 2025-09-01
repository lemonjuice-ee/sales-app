"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import NewSaleForm from "@/app/components/NewSaleForm";
import SalesTable from "./components/SalesTable";
import ConfirmationModal from "./components/ConfirmartionModal";
import TotalSales from "@/app/components/TotalSales";

// Types
type Sale = {
  id: number;
  customer: string;
  amount: number;
  createdAt: string;
};

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);

  // Sale modals
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Confirmation modal
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  
  

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error("Failed to fetch sales");
      const data: Sale[] = await res.json();
      setSales(data);
    } catch {
      toast.error("Failed to load sales.");
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Confirmation modal
  const closeConfirm = () => {
    setConfirmMessage("");
    setConfirmAction(() => {});
  };

  /** SALE HANDLERS **/
  const handleAddNewSale = () => {
    setEditingSale(null);
    setShowSaleModal(true);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  };

  const handleDeleteSale = (id: number) => {
    setConfirmMessage("Are you sure you want to delete this sale?");
    setConfirmAction(() => async () => {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSales((prev) => prev.filter((s) => s.id !== id));
        toast.success("Sale deleted successfully!");
      } else toast.error("Failed to delete sale.");
      closeConfirm();
    });
  };

  const handleRequestSaveSale = (data: { customer: string; amount: number }) => {
    const action = editingSale ? "update" : "add";
    setConfirmMessage(`Are you sure you want to ${action} this sale?`);
    setConfirmAction(() => async () => {
      try {
        const method = editingSale ? "PUT" : "POST";
        const body = editingSale ? { id: editingSale.id, ...data } : data;
        const res = await fetch("/api/sales", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to save sale");

        if (editingSale) {
          setSales((prev) =>
            prev.map((s) => (s.id === editingSale.id ? { ...s, ...data } : s))
          );
        } else {
          const newSale: Sale = {
            id: Date.now(), // temporary ID
            customer: data.customer,
            amount: data.amount,
            createdAt: new Date().toISOString(),
          };
          setSales((prev) => [...prev, newSale]);
        }
        setShowSaleModal(false);
        setEditingSale(null);
        toast.success(`Sale ${action}d successfully!`);
      } catch {
        toast.error(`Failed to ${action} sale.`);
      }
      closeConfirm();
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={150}
          height={150}
          className="rounded-full"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Welcome, Admin!
        </h1>
      </div>

      {/* Total Sales */}
      <TotalSales sales={sales} />

      {/* Sales Table */}
      <div className="overflow-x-auto mb-6">
        <SalesTable
          sales={sales}
          onDelete={handleDeleteSale}
          onAddNew={handleAddNewSale}
          onEdit={handleEditSale}
        />
      </div>

      {/* Sale Modal */}
      {showSaleModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSaleModal(false);
              setEditingSale(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
              {editingSale ? "Edit Sale" : "New Sale"}
            </h2>
            <NewSaleForm
              initialData={editingSale ?? undefined}
              onRequestSave={handleRequestSaveSale}
              onCancel={() => {
                setShowSaleModal(false);
                setEditingSale(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmMessage && (
        <ConfirmationModal
          message={confirmMessage}
          onConfirm={confirmAction}
          onCancel={closeConfirm}
          type={confirmMessage.toLowerCase().includes("delete") ? "delete" : "default"}
          confirmText={confirmMessage.toLowerCase().includes("delete") ? "Delete" : "Confirm"}
        />
      )}
    </div>
  );
}
