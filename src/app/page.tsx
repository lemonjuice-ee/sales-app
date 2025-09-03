"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Home, Users, Box, CreditCard, CheckCircle} from "lucide-react"


import NewSaleForm from "@/app/components/NewSaleForm";
import SalesTable from "./components/SalesTable";
import ConfirmationModal from "./components/ConfirmartionModal";
import TotalSales from "@/app/components/TotalSales";
import CustomersTable from "./components/CustomersTable";
import NewUserForm from "./components/NewUserForm";
import NewProductForm from "./components/NewProductForm";
import ProductsCards from "./components/ProductsCards";
import NewCustomerForm from "./components/NewCustomerForm";
import DashboardPage from "./components/DashboardPage";
import ThemeToggle from "./components/ThemeToggle";

function SplashScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-600 overflow-hidden">
      <div className="relative text-center">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="App Logo"
          width={200}
          height={200}
          className="mx-auto relative z-10"
        />

        {/* Bubble container (shifted lower) */}
        <div className="absolute inset-0 w-[200px] h-[250px] mx-auto top-12 pointer-events-none">
          <span className="bubble bubble-1"></span>
          <span className="bubble bubble-2"></span>
          <span className="bubble bubble-3"></span>
          <span className="bubble bubble-4"></span>
          <span className="bubble bubble-5"></span>
          <span className="bubble bubble-6"></span>
          <span className="bubble bubble-7"></span>
          <span className="bubble bubble-8"></span>
          <span className="bubble bubble-9"></span>
          <span className="bubble bubble-10"></span>
        </div>
        <h1 className="font-bold text-xl text-center text-white">Loading Please wait...</h1>
      </div>
    </div>
  );
}




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


// 🌟 Splash Screen State
const [isLoading, setIsLoading] = useState(true);

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

const [activeView, setActiveView] = useState<
  "dashboard" | "sales" | "customers" | "products" | "users"
>("dashboard");

useEffect(() => {
  let mounted = true;

  const loadData = async () => {
    try {
      // run both: fetch all data + wait at least 3 seconds
      await Promise.all([
        Promise.all([
          fetchSales(),
          fetchCustomers(),
          fetchProducts(),
          fetchUsers(),
        ]),
        new Promise((resolve) => setTimeout(resolve, 1500)), // ⏳ min duration
      ]);
    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  loadData();

  return () => {
    mounted = false;
  };
}, []);


  /** FETCH DATA **/
  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
    fetchUsers();
  }, []);

  const pastTense = (verb: string) => {
  return verb.endsWith("e") ? `${verb}d` : `${verb}ed`;
};

const [currentTime, setCurrentTime] = useState<Date>(new Date());

useEffect(() => {
  setCurrentTime(new Date()); // Just set once
}, []);

  
const showSuccessPopup = (message: string) => {
  // 🔊 Play sound
  const audio = new Audio("/sounds/success.mp3");
  audio.play();

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } fixed top-5 right-5 z-[9999]`}
    >
      <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center p-4">
        {/* ✅ Apply your custom scale-in animation */}
        <CheckCircle className="h-8 w-8 text-green-500 mr-3 animate-scale-in" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
      </div>
    </div>
  ));
};


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
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (editingSale) {
        setSales((prev) =>
          prev.map((s) =>
            s.id === editingSale.id ? { ...s, ...data } : s
          )
        );
      } else {
        setSales((prev) => [
          ...prev,
          { id: Date.now(), createdAt: new Date().toISOString(), ...data },
        ]);
      }

      setShowSaleModal(false);
      setEditingSale(null);
      showSuccessPopup(`Customer ${pastTense(action)} successfully!`);
    } catch {
      toast.error(`Failed to ${action} sale.`);
    }
    closeConfirm();
  });
};

  /** USER HANDLERS **/
const handleAddNewUser = () => { 
  setEditingUser(null); 
  setShowUserModal(true); 
};

const handleEditUser = (user: User) => { 
  setEditingUser(user); 
  setShowUserModal(true); 
};

const handleRequestSaveUser = (data: { name: string; email: string }) => {
  const action = editingUser ? "update" : "add";
  setConfirmMessage(`Are you sure you want to ${action} this user?`);
  setConfirmAction(() => async () => {
    try {
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser ? { id: editingUser.id, ...data } : data;
      const res = await fetch("/api/users", { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
      if (!res.ok) throw new Error();

      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
      } else {
        setUsers(prev => [...prev, { id: Date.now(), ...data }]);
      }

      setShowUserModal(false);
      setEditingUser(null);
      showSuccessPopup(`User ${pastTense(action)} successfully!`);
    } catch { 
      toast.error(`Failed to ${action} user.`); 
    }
    closeConfirm();
  });
};

  /** PRODUCT HANDLERS **/
const handleAddNewProduct = () => {
  setEditingProduct(null);
  setShowProductModal(true);
};

const handleEditProduct = (product: Product) => {
  setEditingProduct(product);
  setShowProductModal(true);
};

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
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, name: data.name, capitalPerKilo: data.capitalPerKilo }
              : p
          )
        );
      } else {
        const newProduct: Product = {
          id: Date.now(),
          name: data.name,
          capitalPerKilo: data.capitalPerKilo,
        };
        setProducts(prev => [...prev, newProduct]);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      showSuccessPopup(`Product ${pastTense(action)} successfully!`);
    } catch {
      toast.error(`Failed to ${action} product.`);
    }
    closeConfirm();
  });
};

const handleDeleteProduct = (id: number) => {
  setConfirmMessage("Are you sure you want to delete this product?");
  setConfirmAction(() => async () => {
    const res = await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccessPopup("Product deleted successfully!");
    } else {
      toast.error("Failed to delete product.");
    }

    closeConfirm();
  });
};

  /** CUSTOMER HANDLERS **/
const handleAddNewCustomer = () => {
  setEditingCustomer(null);
  setShowCustomerModal(true);
};

const handleEditCustomer = (customer: Customer) => {
  setEditingCustomer(customer);
  setShowCustomerModal(true);
};

const handleRequestSaveCustomer = (data: { name: string; email: string }) => {
  const action = editingCustomer ? "update" : "add";
  setConfirmMessage(`Are you sure you want to ${action} this customer?`);
  setConfirmAction(() => async () => {
    try {
      const method = editingCustomer ? "PUT" : "POST";
      const body = editingCustomer ? { id: editingCustomer.id, ...data } : data;

      const res = await fetch("/api/customers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (editingCustomer) {
        setCustomers(prev =>
          prev.map(c => (c.id === editingCustomer.id ? { ...c, ...data } : c))
        );
      } else {
        setCustomers(prev => [...prev, { id: Date.now(), ...data }]);
      }

      setShowCustomerModal(false);
      setEditingCustomer(null);
      showSuccessPopup(`Customer ${pastTense(action)} successfully!`);
    } catch {
      toast.error(`Failed to ${action} customer.`);
    }
    closeConfirm();
  });
};

const handleDeleteCustomer = (id: number) => {
  setConfirmMessage("Are you sure you want to delete this customer?");
  setConfirmAction(() => async () => {
    const res = await fetch("/api/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      showSuccessPopup("Customer deleted successfully!");
    } else {
      toast.error("Failed to delete customer.");
    }

    closeConfirm();
  });
};

if (isLoading) {
  return <SplashScreen />;
}


  /** RENDER CONTENT **/
  const renderContent = () => {
    switch (activeView) {

case "dashboard":
  return <DashboardPage />;


      case "customers":
        return (
<div className="overflow-x-auto">
  {/* Header with title and add button */}
  <div className="flex justify-between items-center mt-10">
    <h2 className="text-2xl font-bold text-gray-800 ml-6">Customers</h2>
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
<div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
  {/* Side Nav */}
  <aside className="w-72 bg-white dark:bg-gray-800 p-6 flex flex-col items-center gap-6">
  <div className="flex flex-col items-center mb-6">
    <Image
      src="/textlogo.png"
      alt="Logo"
      width={200}
      height={200}
      className="mt-10 mb-10"
    />
    <h2 className="font-bold text-xl mt-2 text-blue-600 drop-shadow">
      Welcome Admin!
    </h2>
  </div>

  {/* Dashboard Button */}
<button
  className={`
    w-full flex items-center mb-4 transition
    ${
      activeView === "dashboard"
        ? "bg-blue-500 text-white px-6 py-4 rounded-2xl"
        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg"
    }
  `}
  onClick={() => setActiveView("dashboard" as any)}
>
  <Home className="mr-2" />
  <span className="font-medium">Dashboard</span>
</button>

{[
  { view: "sales", label: "Sales", icon: <CreditCard className="mr-2" /> },
  { view: "customers", label: "Customers", icon: <Users className="mr-2" /> },
  { view: "products", label: "Products", icon: <Box className="mr-2" /> },
  { view: "users", label: "Users", icon: <Users className="mr-2" /> },
].map(({ view, label, icon }) => (
  <button
    key={view}
    className={`
      w-full flex items-center mb-4 transition
      ${
        activeView === view
          ? "bg-blue-500 text-white px-6 py-4 rounded-2xl"
          : "text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 px-4 py-3 rounded-lg"
      }
    `}
    onClick={() => setActiveView(view as any)}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
))}

  {/* Bottom Section (Theme Toggle + Calendar) */}
  <div className="w-full mt-auto">
    {/* Theme Toggle (right aligned) */}
    <div className="flex mb-3">
      <ThemeToggle />
    </div>

    {/* Calendar Card */}
    <div
      className="w-full rounded-2xl p-4 text-center 
                 bg-gradient-to-r from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 
                 shadow-lg ring-1 ring-blue-200 dark:ring-blue-500/40 
                 transition-all duration-500"
    >
      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 drop-shadow-sm">
        {currentTime.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  </div>
</aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-200 dark:bg-gray-900 rounded-l-4xl">{renderContent()}</main>

{/* Modals */}
{showSaleModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && setShowSaleModal(false)}
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        {editingSale ? "Edit Sale" : "New Sale"}
      </h2>
      <NewSaleForm
        initialData={editingSale ?? undefined}
        onRequestSave={handleRequestSaveSale}
        onCancel={() => setShowSaleModal(false)}
      />
    </div>
  </div>
)}

{showUserModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && setShowUserModal(false)}
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        {editingUser ? "Edit User" : "New User"}
      </h2>
      <NewUserForm
        initialData={editingUser ?? undefined}
        onRequestSave={handleRequestSaveUser}
        onCancel={() => setShowUserModal(false)}
      />
    </div>
  </div>
)}

{showProductModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && setShowProductModal(false)}
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        {editingProduct ? "Edit Product" : "New Product"}
      </h2>
      <NewProductForm
        initialData={editingProduct ?? undefined}
        onRequestSave={handleRequestSaveProduct}
        onCancel={() => setShowProductModal(false)}
      />
    </div>
  </div>
)}

{showCustomerModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && setShowCustomerModal(false)}
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        {editingCustomer ? "Edit Customer" : "New Customer"}
      </h2>
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
