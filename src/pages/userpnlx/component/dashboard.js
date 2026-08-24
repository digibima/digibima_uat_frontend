import React from "react";
import Image from "next/image";
export default function Dashboard({ usersData }) {

  const quoteOptions = [
    { label: "Health", icon: "❤️", bg: "bg-blue-600", text: "text-white" },
    { label: "Two Wheeler", icon: "🛵" },
    { label: "Four Wheeler", icon: "🚗" },
    { label: "Commercial", icon: "🚚" },
    { label: "Travel", icon: "✈️" },
  ];

  const stats = [
    {
      title: "Total Policies",
      count: "00",
      bg: "bg-purple-200",
      icon: "🏛️",
    },
    {
      title: "Active Policies",
      count: "00",
      bg: "bg-pink-200",
      icon: "📄",
    },
    {
      title: "Expired Policies",
      count: "00",
      bg: "bg-orange-200",
      icon: "➕",
    },
    {
      title: "Total Claims",
      count: "00",
      bg: "bg-red-500 text-white",
      icon: "👥",
    },
  ];
  return (
    
   
    <div className="p-6 space-y-6  mx-auto bg-[#f4f4fa]">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl shadow p-6">
        <div>
          <h2 className="text-xl font-bold text-blue-600">
            Hello {usersData?.name}..! 🎉
          </h2>
          <p className="text-gray-600">
            Welcome to DigiBima Insurance. Your trusted partner in securing your
            future.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Image
            src=""
            alt="User"
            className="w-24 h-24"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-xl shadow-md p-4 text-white flex flex-col justify-between ${item.bg}`}
          >
            <div className="text-2xl font-bold">{item.count}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm">{item.title}</span>
              <span className="text-3xl ">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Create Quote</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {quoteOptions.map((item, idx) => (
            <button
              key={idx}
              className={`rounded-lg p-4 text-center font-semibold border hover:bg-blue-100 transition ${
                item.bg || "bg-gray-100"
              } ${item.text || "text-gray-700"}`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div>{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
    
  );
}
