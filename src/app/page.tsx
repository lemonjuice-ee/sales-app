"use client";

import { useState, useEffect, FormEvent } from "react";

// Define a User type matching Prisma schema
type User = {
  id: number;
  name: string;
  email: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "" });

  // Fetch users from API
  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data: User[] = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "" });
    fetchUsers(); // refresh list
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Users</h1>

      {/* Add User Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border px-3 py-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </form>

      {/* User List */}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="border p-2 rounded">
            {u.name} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
