"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Home, Users, Box, CreditCard, CheckCircle, ChartNoAxesCombined, ChartArea} from "lucide-react"


import ConfirmationModal from "./components/ConfirmartionModal";
import CustomersTable from "./components/CustomersTable";
import NewUserForm from "./components/NewUserForm";
import NewProductForm from "./components/NewProductForm";
import ProductsCards from "./components/ProductsCards";
import NewCustomerForm from "./components/NewCustomerForm";
import DashboardPage from "./components/DashboardPage";
import ThemeToggle from "./components/ThemeToggle";
import SalesTable from "./components/SalesTable";
import NewSaleForm from "./components/NewSaleForm";
import AnalyticsPage from "./components/AnalyticsPage";



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



type Customer = {
  id: number;
  name: string;
  email: string;
  productPrices?: CustomerProduct[];
  sales?: Sale[];
};

type Product = {
  id: number;
  name: string;
  capitalPerKilo: number;
  productPrices?: CustomerProduct[];
  sales?: SaleProduct[];
};

type User = {
  id: number;
  name: string;
  email: string;
};

type Sale = {
  id: number;
  customerId?: number; // make optional ✅
  customer: Customer;
  createdAt: string; // Prisma DateTime -> string when sent via API
  total: number;
  products: SaleProduct[];
};

type SaleProduct = {
  id: number;
  saleId: number;
  sale?: Sale;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
};

type CustomerProduct = {
  id: number;
  customerId: number;
  customer?: Customer;
  productId: number;
  product?: Product;
  pricePerKilo: number;
};


export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
 const [sales, setSales] = useState<Sale[]>([]);
 
 




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
  "dashboard" | "sales" | "customers" | "products" | "analytics"
>("dashboard");

useEffect(() => {
  let mounted = true;

  const loadData = async () => {
    try {
      // run both: fetch all data + wait at least 3 seconds
      await Promise.all([
        Promise.all([
          fetchCustomers(),
          fetchProducts(),
          fetchUsers(),
          fetchSales(),
        ]),
        new Promise((resolve) => setTimeout(resolve, 500)), // ⏳ min duration
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
    fetchCustomers();
    fetchProducts();
    fetchUsers();
    fetchSales();
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
      <div className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center p-4 border border-gray-200 dark:border-gray-700">
        {/* ✅ Apply your custom scale-in animation */}
        <CheckCircle className="h-8 w-8 text-green-500 mr-3 animate-scale-in" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
      </div>
    </div>
  ));
};
  const fetchSales = async () => {
    const res = await fetch("/api/sales");
    if (res.ok) {
      const data = await res.json();
      setSales(data);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  
  // Open edit modal
  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
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

 case "sales":
  return (
    <div className="overflow-x-auto mx-6">
      <div className="flex justify-between items-center mt-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Sales
        </h2>
        <button
          type="button"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          onClick={() => {
            setEditingSale(null); // reset when adding new
            setShowSaleModal(true);
          }}
        >
          + Add Sale
        </button>
      </div>

      <SalesTable
        sales={sales}
        onEdit={(sale) => {
          setEditingSale(sale as any);   // set sale to edit
          setShowSaleModal(true); // open modal
        }}
onDelete={(id) => {
  setConfirmMessage("Are you sure you want to delete this sale?");
  setConfirmAction(() => async () => {
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchSales(); // refresh table
        showSuccessPopup("Sale deleted successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete sale");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the sale.");
    }
    closeConfirm(); // close modal after action
  });
}}
      />
    </div>
  );



      case "customers":
        return (
<div className="overflow-x-auto">
  {/* Header with title and add button */}
  <div className="flex justify-between items-center mt-10">
<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 ml-6">
  Customers
</h2>
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

      case "analytics":
        return (
<div className="overflow-x-auto">

<AnalyticsPage/>

</div>
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

  {/* Welcome Admin with same bg as date */}
  <div
    className="rounded-2xl p-2 px-4 bg-gradient-to-r from-blue-50 to-gray-100 
               dark:from-gray-800 dark:to-gray-900 shadow-lg ring-1 ring-blue-200 
               dark:ring-blue-500/40 transition-all duration-500"
  >
    <h2 className="font-bold text-xl text-blue-600 dark:text-blue-400 drop-shadow-sm text-center">
      Welcome Admin!
    </h2>
  </div>
</div>

  {/* Dashboard Button */}
<button
  className={`
    w-full flex items-center mb-4 transition
    ${
      activeView === "dashboard"
        ? "bg-blue-500 text-white px-8 py-5 rounded-2xl text-lg"
        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 px-6 py-4 rounded-lg text-lg"
    }
  `}
  onClick={() => setActiveView("dashboard" as any)}
>
  <Home className="mr-3" />
  <span className="font-medium">Dashboard</span>
</button>

{[
  { view: "sales", label: "Sales", icon: <CreditCard className="mr-3" /> },
  { view: "customers", label: "Customers", icon: <Users className="mr-3" /> },
  { view: "products", label: "Products", icon: <Box className="mr-3" /> },
  { view: "analytics", label: "Analytics", icon: <ChartNoAxesCombined className="mr-3" /> },
].map(({ view, label, icon }) => (
  <button
    key={view}
    className={`
      w-full flex items-center mb-4 transition
      ${
        activeView === view
          ? "bg-blue-500 text-white px-8 py-5 rounded-2xl text-lg"
          : "text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700 px-6 py-4 rounded-lg text-lg"
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        {editingSale ? "Edit Sale" : "New Sale"}
      </h2>
      <NewSaleForm
        initialData={
          editingSale
            ? {
                id: editingSale.id,
                customerId: editingSale.customer.id,
                products: editingSale.products.map((sp) => ({
                  productId: sp.product.id,
                  name: sp.product.name,
                  price: sp.price,
                  quantity: sp.quantity,
                })),
                total: editingSale.total,
              }
            : undefined
        }
        onSaved={() => {
  setShowSaleModal(false);
  fetchSales(); // refresh table after save
  showSuccessPopup(
    editingSale ? "Sale updated successfully!" : "Sale added successfully!"
  );
}}
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
 {confirmMessage && (
  <ConfirmationModal
    message={confirmMessage}
    onConfirm={confirmAction}
    onCancel={closeConfirm}
    type={confirmMessage.toLowerCase().includes("delete") ? "delete" : "default"}
    confirmText={confirmMessage.toLowerCase().includes("delete") ? "Delete" : "Confirm"}
  />)}
    </div>
  );
}
