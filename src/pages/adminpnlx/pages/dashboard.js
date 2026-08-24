import Link from "next/link";
import Lottie from "lottie-react";
import expiredpolicies from "@/animation/expiredpolicies.json";
import activeAnimation from "@/animation/apporved.json";
import totalAnimation from "@/animation/amount.json";
import totalpolicies from "@/animation/totalpolicies.json";
import Image from "next/image";
import {
  homehealth,
  homebike,
  homecar,
  homecommercial,
  
} from "@/images/Image";
import {
  FaUserPlus,
  FaMoneyBill,
  FaBell,
  FaMoneyBillWave ,
  FaUsers ,
  FaChartLine 
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  LineChart,
} from "recharts";

export default function WelcomeBanner({
  collapsed,
  setCollapsed,
  openMenus,
  setOpenMenus,
  admindata,
}) {
  const categories = [
    { label: "Health", image: homehealth, redirectTo: "/health/common/insure" },
    {
      label: "Two Wheeler",
      image: homebike,
      redirectTo: "/motor/select-vehicle-type",
    },
    {
      label: "Four Wheeler",
      image: homecar,
      redirectTo: "/motor/select-vehicle-type",
    },
    {
      label: "Commercial",
      image: homecommercial,
      redirectTo: "/motor/select-vehicle-type",
    },
    {
      label: "Travel",
      image: homecommercial,
      redirectTo: "/motor/select-vehicle-type",
    },
  ];


   const cardData = [
    {
      title: "Total Policies",
      value: admindata?.policyCount ?? "--",
      subText: "All Time",
      animation: totalpolicies,
      bg: "from-blue-100 via-indigo-200 to-indigo-300",
    },
    {
      title: "Active Policies",
      value: admindata?.activepolicies ?? "--",
      subText: "Currently Active",
      animation: activeAnimation,
      bg: "from-green-100 via-emerald-200 to-teal-300",
    },
    {
      title: "Expired Policies",
      value: admindata?.expiredpolicies ?? "--",
      subText: "No Longer Active",
      animation: expiredpolicies,
      bg: "from-red-100 via-rose-200 to-pink-300",
    },
    {
      title: "Total Claims",
      value: admindata?.totalClaims ?? "--",
      subText: "Processed Claims",
      animation: totalAnimation,
      bg: "from-yellow-100 via-orange-200 to-amber-300",
    },
  ];



  const activityData = [
    { month: "Jan", active: 400, new: 240 },
    { month: "Feb", active: 300, new: 139 },
    { month: "Mar", active: 200, new: 980 },
    { month: "Apr", active: 278, new: 390 },
    { month: "May", active: 189, new: 480 },
  ];

 const recentUsers = (admindata?.userdata || []).map((u, index) => ({
    id: u.userId || index,
    name: u.name,
    email: u.email,
    date: u.date,
    // status: "Active", 
  }));

  const recentTransactions = (admindata?.payment || []).map((p, index) => ({
  id: p.policyno || `POL${index + 1}`, 
  user: p.proposar_name || "Unknown",
  amount: p.price ? `₹${p.price}` : "--",
  date: p.date || "--",
  status:  "Success",
}));

  const notifications = [
    { id: 1, text: "New policy request received", time: "2h ago" },
    { id: 2, text: "Server maintenance scheduled", time: "1d ago" },
  ];

  return (
    <div className="w-full space-y-6">
    
      <div
        className="relative bg-cover bg-center rounded-3xl overflow-hidden shadow-md p-6 flex items-center min-h-[200px] sm:min-h-[250px] md:min-h-[220px]"
        style={{ backgroundImage: "url('/images/dashboard/imgone.jpg')" }}
      >
        <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-3 min-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-700">
            Hello {admindata?.admin ? admindata.admin : "Guest"}...!
          </h1>
          <p className="text-gray-800 mt-2">
            Welcome to Digibima Insurance. Your trusted partner in securing your
            future.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center md:justify-between gap-6">
          {cardData.map((card, index) => (
            <div
              key={index}
              className={`relative w-60 h-52 rounded-3xl p-4 shadow-md text-black bg-gradient-to-br ${card.bg} overflow-hidden`}
            >
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${card.bg} opacity-40 mix-blend-overlay`}
              />
              <div
                className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-br ${card.bg} opacity-40 mix-blend-overlay`}
              />
              <div className="relative ">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">
                    {card.title.split(" ")[0]}
                    <br />
                    {card.title.split(" ")[1]}
                  </p>
                  <Lottie
                    animationData={card.animation}
                    className="w-20 h-18"
                  />
                </div>
                <div>
                  <h2 className="text-4xl font-bold">{card.value}</h2>
                  <p className="text-sm text-gray-700 mt-1">{card.subText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>



    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
  {/* User Activity Chart */}
  <div className="bg-gradient-to-br from-white via-indigo-50 to-white p-6 rounded-3xl shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300">
    <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
      <div className="p-2 bg-indigo-500 text-white rounded-full shadow-md">
        <FaChartLine size={18} />
      </div>
      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
        User Activity
      </span>
    </h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={activityData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#6B7280" />
        <YAxis stroke="#6B7280" />
        <Tooltip contentStyle={{ borderRadius: "10px", backgroundColor: "white", border: "1px solid #E5E7EB" }} />
        <Legend />
        <Line type="monotone" dataKey="active" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="new" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/*Notifications */}
  <div className="bg-gradient-to-br from-white via-blue-50 to-white p-6 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
      <div className="p-2 bg-blue-500 text-white rounded-full shadow-md">
        <FaBell size={18} />
      </div>
      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
        Notifications
      </span>
    </h3>
    <ul className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200">
      {notifications.map((note) => (
        <li 
          key={note.id} 
          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-gray-100"
        >
          <p className="text-sm text-gray-700">{note.text}</p>
          <span className="text-xs text-gray-400 mt-1 block">{note.time}</span>
        </li>
      ))}
    </ul>
  </div>
</div>

{/* Tables Section */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

  {/* Recent Users */}
  <div className="bg-gradient-to-br from-white via-green-50 to-white p-6 rounded-3xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
    <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
      <div className="p-2 bg-green-500 text-white rounded-full shadow-md">
        <FaUsers size={18} />
      </div>
      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-transparent bg-clip-text">
        Recent Users
      </span>
    </h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-gray-200 text-gray-600">
          <th>Name</th>
          <th>Email</th>
          <th>Date</th>
          {/* <th>Status</th> */}
        </tr>
      </thead>
      <tbody>
        {recentUsers.map((user) => (
          <tr key={user.id} className="border-b border-gray-100 hover:bg-green-50/50 transition-all duration-200">
            <td className="py-2">{user.name}</td>
            <td>{user.email}</td>
            <td>{user.date}</td>
            {/* <td>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                {user.status}
              </span>
            </td> */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/*Recent Transactions */}
  <div className="bg-gradient-to-br from-white via-pink-50 to-white p-6 rounded-3xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300">
    <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
      <div className="p-2 bg-pink-500 text-white rounded-full shadow-md">
        <FaMoneyBillWave size={18} />
      </div>
      <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
        Recent Transactions
      </span>
    </h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-gray-200 text-gray-600">
          <th>Policy No.</th>
          <th>User</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {recentTransactions.map((txn) => (
          <tr key={txn.id} className="border-b border-gray-100 hover:bg-pink-50/50 transition-all duration-200">
            <td className="py-2">{txn.id}</td>
            <td>{txn.user}</td>
            <td>{txn.amount}</td>
            <td>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.status === "Success" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                {txn.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      {/* Categories */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-md grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
        {categories.map((item, index) => (
          <Link
            key={index}
            href={item.redirectTo || "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-2 cursor-pointer"
          >
            <div className="w-20 h-20 md:w-18 md:h-18 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg hover:bg-blue-100">
              <Image
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-in-out hover:rotate-1"
                width={80}
                height={80}
                priority
              />
            </div>
            <div className="text-sm font-semibold text-gray-800 text-center">
              {item.label}
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
