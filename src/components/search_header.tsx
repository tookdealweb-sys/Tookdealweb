"use client";
import { useState } from "react";
import { FaSearch, FaBell, FaHeart } from "react-icons/fa";
import Link from "next/link";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${searchQuery}`); // replace with real logic
  };

  return (
    <header className="fixed z-[999] top-0 left-0 w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <img
              className="h-10 w-auto object-contain"
              src="./images/Frame 1.png"
              alt="TookDeal Logo"
            />
      </div>

      {/* Middle: Search bar (pill style like screenshot) */}
      <form
        onSubmit={handleSearch}
        className="flex items-center flex-1 mx-6 max-w-xl bg-gray-50 rounded-full pl-4 pr-2 py-2 border border-gray-200"
      >
        <input
          type="text"
          placeholder="Search for business..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-100"
        >
          <FaSearch className="text-gray-600 text-sm" />
        </button>
      </form>

      {/* Right: Icons */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <FaBell className="text-xl cursor-pointer" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            9
          </span>
        </div>

        {/* Wishlist (linked to /favorites) */}
        <Link
          href="/favorites"
          className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200"
          aria-label="Favorites"
        >
          <FaHeart className="text-lg text-black" />
        </Link>

        {/* Profile Image */}
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="h-10 w-10 rounded-full border"
        />
      </div>
    </header>
  );
}
