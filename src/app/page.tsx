"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Home, Users, Box, CreditCard } from "lucide-react"

import NewSaleForm from "@/app/components/NewSaleForm";
import SalesTable from "./components/SalesTable";
import ConfirmationModal from "./components/ConfirmartionModal";
import TotalSales from "@/app/components/TotalSales";
import CustomersTable from "./components/CustomersTable";
import NewUserForm from "./components/NewUserForm";
import NewProductForm from "./components/NewProductForm";
import ProductsCards from "./components/ProductsCards";
import NewCustomerForm from "./components/NewCustomerForm";

// Types
type Sale = { id: number; customer: string; amount: number; createdAt: string };
type Customer = { id: number; name: string; email: string };
type Product = { id: number; name: string; capitalPerKilo: number };
type User = { id: number; name: string; email: string };

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Modals
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Confirmation modal
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const [activeView, setActiveView] = useState<"sales" | "customers" | "products" | "users">("sales");

  /** FETCH DATA **/
  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error();
      setSales(await res.json());
    } catch {
      toast.error("Failed to load sales.");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error();
      setCustomers(await res.json());
    } catch {
      toast.error("Failed to load customers.");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      toast.error("Failed to load products.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error("Failed to load users.");
    }
  };

  const closeConfirm = () => {
    setConfirmMessage("");
    setConfirmAction(() => {});
  };

  /** SALE HANDLERS **/
  const handleAddNewSale = () => { setEditingSale(null); setShowSaleModal(true); };
  const handleEditSale = (sale: Sale) => { setEditingSale(sale); setShowSaleModal(true); };
  const handleDeleteSale = (id: number) => {
    setConfirmMessage("Are you sure you want to delete this sale?");
    setConfirmAction(() => async () => {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { setSales(prev => prev.filter(s => s.id !== id)); toast.success("Sale deleted!"); }
      else toast.error("Failed to delete sale.");
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
          method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();

        if (editingSale) setSales(prev => prev.map(s => s.id === editingSale.id ? { ...s, ...data } : s));
        else setSales(prev => [...prev, { id: Date.now(), createdAt: new Date().toISOString(), ...data }]);

        setShowSaleModal(false);
        setEditingSale(null);
        toast.success(`Sale ${action}d successfully!`);
      } catch { toast.error(`Failed to ${action} sale.`); }
      closeConfirm();
    });
  };

  /** USER HANDLERS **/
  const handleAddNewUser = () => { setEditingUser(null); setShowUserModal(true); };
  const handleEditUser = (user: User) => { setEditingUser(user); setShowUserModal(true); };
  const handleRequestSaveUser = (data: { name: string; email: string }) => {
    const action = editingUser ? "update" : "add";
    setConfirmMessage(`Are you sure you want to ${action} this user?`);
    setConfirmAction(() => async () => {
      try {
        const method = editingUser ? "PUT" : "POST";
        const body = editingUser ? { id: editingUser.id, ...data } : data;
        const res = await fetch("/api/users", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();

        if (editingUser) setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
        else setUsers(prev => [...prev, { id: Date.now(), ...data }]);

        setShowUserModal(false);
        setEditingUser(null);
        toast.success(`User ${action}d successfully!`);
      } catch { toast.error(`Failed to ${action} user.`); }
      closeConfirm();
    });
  };

  /** PRODUCT HANDLERS **/
  const handleAddNewProduct = () => { setEditingProduct(null); setShowProductModal(true); };
  const handleEditProduct = (product: Product) => { setEditingProduct(product); setShowProductModal(true); };
  const handleRequestSaveProduct = (data: { name: string; capitalPerKilo: number }) => {
    const action = editingProduct ? "update" : "add";
    setConfirmMessage(`Are you sure you want to ${action} this product?`);
    setConfirmAction(() => async () => {
      try {
        const method = editingProduct ? "PUT" : "POST";
        const body = editingProduct
          ? { id: editingProduct.id, name: data.name, capitalPerKilo: data.capitalPerKilo }
          : { name: data.name, capitalPerKilo: data.capitalPerKilo };

        const res = await fetch("/api/products", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();

        if (editingProduct) {
          setProducts(prev =>
            prev.map(p => (p.id === editingProduct.id ? { ...p, name: data.name, capitalPerKilo: data.capitalPerKilo } : p))
          );
        } else {
          const newProduct: Product = { id: Date.now(), name: data.name, capitalPerKilo: data.capitalPerKilo };
          setProducts(prev => [...prev, newProduct]);
        }

        setShowProductModal(false);
        setEditingProduct(null);
        toast.success(`Product ${action}d successfully!`);
      } catch {
        toast.error(`Failed to ${action} product.`);
      }
      closeConfirm();
    });
  };
  const handleDeleteProduct = (id: number) => {
    setConfirmMessage("Are you sure you want to delete this product?");
    setConfirmAction(() => async () => {
      const res = await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) { setProducts(prev => prev.filter(p => p.id !== id)); toast.success("Product deleted successfully!"); }
      else toast.error("Failed to delete product.");
      closeConfirm();
    });
  };

  /** CUSTOMER HANDLERS **/
  const handleAddNewCustomer = () => { setEditingCustomer(null); setShowCustomerModal(true); };
  const handleEditCustomer = (customer: Customer) => { setEditingCustomer(customer); setShowCustomerModal(true); };
  const handleRequestSaveCustomer = (data: { name: string; email: string }) => {
    const action = editingCustomer ? "update" : "add";
    setConfirmMessage(`Are you sure you want to ${action} this customer?`);
    setConfirmAction(() => async () => {
      try {
        const method = editingCustomer ? "PUT" : "POST";
        const body = editingCustomer ? { id: editingCustomer.id, ...data } : data;
        const res = await fetch("/api/customers", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();

        if (editingCustomer) setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...data } : c));
        else setCustomers(prev => [...prev, { id: Date.now(), ...data }]);

        setShowCustomerModal(false);
        setEditingCustomer(null);
        toast.success(`Customer ${action}d successfully!`);
      } catch { toast.error(`Failed to ${action} customer.`); }
      closeConfirm();
    });
  };
  const handleDeleteCustomer = (id: number) => {
    setConfirmMessage("Are you sure you want to delete this customer?");
    setConfirmAction(() => async () => {
      const res = await fetch("/api/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) { setCustomers(prev => prev.filter(c => c.id !== id)); toast.success("Customer deleted successfully!"); }
      else toast.error("Failed to delete customer.");
      closeConfirm();
    });
  };

  /** RENDER CONTENT **/
  const renderContent = () => {
    switch (activeView) {
      case "customers":
        return (
<div className="overflow-x-auto">
  {/* Header with title and add button */}
  <div className="flex justify-between items-center mt-10">
    <h2 className="text-xl font-semibold text-gray-800 ml-6">Customers</h2>
    <button
      className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base mr-6"
      onClick={handleAddNewCustomer}
    >
      + Add Customer
    </button>
  </div>

  <CustomersTable
    customers={customers}
    onEdit={handleEditCustomer}
    onDelete={handleDeleteCustomer}
  />
</div>
        );

      case "products":
        return (
          <ProductsCards
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAddNew={handleAddNewProduct}
          />
        );

      case "users":
        return (
          <div className="overflow-x-auto">
            <div className="flex justify-end mb-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleAddNewUser}
              >
                New User
              </button>
            </div>
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">{user.id}</td>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2 flex gap-2">
                      <button className="text-blue-500" onClick={() => handleEditUser(user)}>Edit</button>
                      <button className="text-red-500" onClick={() => { setConfirmMessage("Are you sure you want to delete this user?"); setConfirmAction(() => async () => {
                        const res = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
                        if (res.ok) setUsers(prev => prev.filter(u => u.id !== user.id));
                        closeConfirm();
                      })}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "sales":
      default:
        return (
          <>
            <TotalSales sales={sales} />
            <div className="overflow-x-auto mb-6">
              <SalesTable
                sales={sales}
                onDelete={handleDeleteSale}
                onAddNew={handleAddNewSale}
                onEdit={handleEditSale}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Side Nav */}
{/* Side Nav */}
<aside className="w-64 bg-white  p-6 flex flex-col items-center gap-6">
  <div className="flex flex-col items-center mb-6">
    <Image src="/logo.png" alt="Logo" width={200} height={200} className="rounded-full" />
    <h2 className="font-bold text-xl mt-2">Welcome Admin!</h2>
  </div>
{[
  { view: "sales", label: "Sales", icon: <CreditCard className="mr-2" /> },
  { view: "customers", label: "Customers", icon: <Users className="mr-2" /> },
  { view: "products", label: "Products", icon: <Box className="mr-2" /> },
  { view: "users", label: "Users", icon: <Home className="mr-2" /> },
].map(({ view, label, icon }) => (
  <button
    key={view}
    className={`
      w-full flex items-center mb-4 transition 
      ${activeView === view 
        ? "bg-blue-500 text-white px-6 py-4 rounded-2xl " 
        : "hover:bg-gray-100 px-4 py-3 rounded-lg"}
    `}
    onClick={() => setActiveView(view as any)}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
))}
</aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-200 rounded-l-4xl">{renderContent()}</main>

      {/* Modals */}
      {showSaleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && setShowSaleModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">{editingSale ? "Edit Sale" : "New Sale"}</h2>
            <NewSaleForm initialData={editingSale ?? undefined} onRequestSave={handleRequestSaveSale} onCancel={() => setShowSaleModal(false)} />
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && setShowUserModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">{editingUser ? "Edit User" : "New User"}</h2>
            <NewUserForm initialData={editingUser ?? undefined} onRequestSave={handleRequestSaveUser} onCancel={() => setShowUserModal(false)} />
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && setShowProductModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">{editingProduct ? "Edit Product" : "New Product"}</h2>
            <NewProductForm initialData={editingProduct ?? undefined} onRequestSave={handleRequestSaveProduct} onCancel={() => setShowProductModal(false)} />
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && setShowCustomerModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">{editingCustomer ? "Edit Customer" : "New Customer"}</h2>
            <NewCustomerForm
              initialData={editingCustomer ?? undefined}
              onRequestSave={handleRequestSaveCustomer}
              onCancel={() => setShowCustomerModal(false)}
            />
          </div>
        </div>
      )}

      {confirmMessage && <ConfirmationModal message={confirmMessage} onConfirm={confirmAction} onCancel={closeConfirm} type={confirmMessage.toLowerCase().includes("delete") ? "delete" : "default"} confirmText={confirmMessage.toLowerCase().includes("delete") ? "Delete" : "Confirm"} />}
    </div>
  );
}
