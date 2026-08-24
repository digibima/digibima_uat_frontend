import Link from "next/link";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import expiredpolicies from "@/animation/expiredpolicies.json";
import activeAnimation from "@/animation/apporved.json";
import totalAnimation from "@/animation/amount.json";
import totalpolicies from "@/animation/totalpolicies.json";
import { CallApi } from "@/api";
import constant from "@/env";
import Image from "next/image";
import Modal from "@/components/modal";
import {
  FaBell,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
  FaRegCalendarAlt,
  FaHeadset,
  FaClock,
  FaBuilding,
  FaCarSide,
  FaFileAlt,
  FaIdCard,
  FaRupeeSign,
  FaCopy,
} from "react-icons/fa";
// recharts imports can stay commented if charts are disabled
// import { ... } from "recharts";
import {
  homehealth,
  homebike,
  homecar,
  homecommercial,
  
} from "@/images/Image";

export default function WelcomeBanner({
  collapsed,
  setCollapsed,
  openMenus,
  setOpenMenus,
}) {
  const [stats, setStats] = useState({
    totalpolicies: 0,
    totalactivepolicies: 0,
    totalclaims: 0,
    expiredPolicies: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openNote, setOpenNote] = useState(null);
  const openNoteModal = (note) => setOpenNote(note);
  const closeNoteModal = () => setOpenNote(null);

  const formatINR = (n) => {
    if (n == null) return "-";
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `₹${n}`;
    }
  };
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text ?? ""));
    } catch {}
  };
  const pickSummary = (n) =>
    n?.summary ??
    n?.description ??
    n?.title ??
    n?.message ??
    "No summary available.";

  const InfoRow = ({ icon: Icon, label, value, mono, canCopy = true }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/70 hover:shadow-sm transition">
        <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2 text-slate-600">
          <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div
            className={`text-sm text-slate-800 break-words ${
              mono ? "font-mono" : ""
            }`}
          >
            {value}
          </div>
        </div>
        {canCopy && (
          <button
            onClick={() => copy(value)}
            className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50 active:scale-95"
            title="Copy"
          >
            <div className="flex items-center gap-1">
              <FaCopy size={10} />
              Copy
            </div>
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await CallApi(constant.API.USER.USERDASHBOARD, "GET");
        if (res?.status) {
          setStats({
            totalpolicies: res.totalpolicies ?? 0,
            totalactivepolicies: res.totalactivepolicies ?? 0,
            totalclaims: res.totalclaims ?? 0,
            expiredPolicies: res.expiredPolicies ?? 0,
          });
          setNotifications(
            Array.isArray(res.notification) ? res.notification : []
          );
          setPayments(Array.isArray(res.payment) ? res.payment : []);
          setUser(res?.data?.user ?? null);
        } else {
          setStats({
            totalpolicies: 0,
            totalactivepolicies: 0,
            totalclaims: 0,
            expiredPolicies: 0,
          });
          setNotifications([]);
          setPayments([]);
          setUser(null);
        }
      } catch (error) {
        console.error(error);
        setStats({ totalpolicies: 0, totalactivepolicies: 0, totalclaims: 0,expiredPolicies: 0 });
        setNotifications([]);
        setPayments([]);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchdata();
  }, []);


  const cardData = [
    {
      title: "Total Policies",
      value: stats.totalpolicies,
      subText: "All Time",
      animation: totalpolicies,
      bg: "from-blue-100 via-indigo-200 to-indigo-300",
    },
    {
      title: "Active Policies",
      value: stats.totalactivepolicies,
      subText: "Currently Active",
      animation: activeAnimation,
      bg: "from-green-100 via-emerald-200 to-teal-300",
    },
    {
      title: "Expired Policies",
      value: stats.expiredPolicies,
      subText: "No Longer Active",
      animation: expiredpolicies,
      bg: "from-red-100 via-rose-200 to-pink-300",
    },
    {
      title: "Total Claims",
      value: stats.totalclaims,
      subText: "Processed Claims",
      animation: totalAnimation,
      bg: "from-yellow-100 via-orange-200 to-amber-300",
    },
  ];

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

  const [renewals] = useState([
    { id: 1, policy: "Health Insurance", expiry: "12 Aug 2025" },
    { id: 2, policy: "Car Insurance", expiry: "18 Aug 2025" },
  ]);
  const handleCloseAndCallApi = async () => {
  try {
    closeNoteModal();
  } catch (err) {
    console.error("Failed to call API on close:", err);
  }
};


  return (
    <>
      <div className="w-full space-y-6">
        {openNote && (
          <Modal
            isOpen={!!openNote}
             onClose={handleCloseAndCallApi}
            title="Notification"
            width="max-w-2xl"
            showCancelButton={true}
            cancelText="Close"
            showConfirmButton={false} 
          >

            <div className="text-base sm:text-lg font-semibold leading-snug line-clamp-2">
              {openNote.message || pickSummary(openNote)}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {openNote.time && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700">
                  <FaClock size={10} /> {openNote.time}
                </span>
              )}
              {openNote.vendor && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700">
                  <FaBuilding size={10} /> {openNote.vendor}
                </span>
              )}
              {openNote.type && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700">
                  <FaIdCard size={10} /> {openNote.type}
                </span>
              )}
            </div>

            <div className="py-2 sm:py-6  bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow
                  icon={FaFileAlt}
                  label="Policy No"
                  value={openNote.policyno}
                  mono
                />
                <InfoRow
                  icon={FaIdCard}
                  label="Proposal No"
                  value={openNote.proposalno}
                  mono
                />
                <InfoRow
                  icon={FaUser}
                  label="Proposer"
                  value={openNote.proposar_name}
                />
                <InfoRow
                  icon={FaCarSide}
                  label="Vehicle Type"
                  value={openNote.vehicle_type}
                />
                <InfoRow
                  icon={FaRupeeSign}
                  label="Price"
                  value={formatINR(openNote.price)}
                  canCopy={false}
                />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-1" />
            </div>
          </Modal>
        )}

        <div
          className="relative bg-cover bg-center rounded-3xl overflow-hidden shadow-md p-4 sm:p-6 flex items-center min-h-[180px] sm:min-h-[220px] md:min-h-[250px]"
          style={{ backgroundImage: "url('/images/dashboard/imgone.jpg')" }}
        >
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 md:p-5 w-full max-w-xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">
              Hello{user?.name ? `, ${user.name}` : " ...!"}
            </h1>
            <p className="text-sm sm:text-base text-gray-800 mt-2">
              Welcome to Digibima Insurance. Your trusted partner in securing
              your future.
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

        <div className="bg-gradient-to-br from-white via-blue-50 to-white p-6 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-full shadow-md">
              <FaBell size={18} />
            </div>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
              Notifications
            </span>
          </h3>

         <ul className="space-y-3 max-h-64 pr-1 overflow-y-auto overflow-x-hidden">
  {notifications.length === 0 ? (
    <li className="p-4 bg-white rounded-xl border text-sm text-gray-500">
      You’re all caught up!
    </li>
  ) : (
    notifications.map((note, idx) => (
      <li
        key={idx}
        className="group p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md  transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition">
              {note.message}
            </p>
            {note?.time && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                {note.time}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => openNoteModal(note)}
            className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                     bg-white/70 text-blue-700 border border-blue-200
                     hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800
                     transition-colors"
          >
            View
          </button>
        </div>
      </li>
    ))
  )}
</ul>

        </div>

        <div className="bg-gradient-to-br from-white via-green-50 to-white p-6 rounded-3xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-full shadow-md">
              <FaRegCalendarAlt size={18} />
            </div>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-transparent bg-clip-text">
              Upcoming Renewals
            </span>
          </h3>
          <ul className="divide-y">
            {renewals.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>{item.policy}</span>
                <span className="text-gray-500">{item.expiry}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-full shadow-md">
              <FaHeadset size={18} />
            </div>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
              Support & Help
            </span>
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center bg-blue-50 p-4 rounded-xl hover:bg-blue-100">
              <FaPhoneAlt className="text-blue-500 text-2xl" />
              <span className="mt-2 text-sm">Call Us</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 p-4 rounded-xl hover:bg-green-100">
              <FaEnvelope className="text-green-500 text-2xl" />
              <span className="mt-2 text-sm">Email Support</span>
            </div>
            <div className="flex flex-col items-center bg-purple-50 p-4 rounded-xl hover:bg-purple-100">
              <FaUser className="text-purple-500 text-2xl" />
              <span className="mt-2 text-sm">Live Chat</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-md grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
          {categories.map((item, index) => (
            <Link
              key={index}
              href={item.redirectTo || "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 cursor-pointer w-full"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg hover:bg-blue-100">
                <Image
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-in-out hover:rotate-1"
                  width={80}
                  height={80}
                  priority
                />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-800 text-center">
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
