"use client";

export default function MemberDetails({ memberName = "Akash", count = 1, onEdit = () => console.log("Edit Members Clicked") }) {
  return (
    <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-start">
      <div>
        <div className="font-semibold text-base text-black">Members Covered</div>
        <div className="text-sm text-gray-600 mt-1">
          {memberName}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-full transition"
      >
        Edit Members 
      </button>
    </div>
  );
}
