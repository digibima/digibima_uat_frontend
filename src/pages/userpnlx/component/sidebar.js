import React from "react";
import { useRouter } from "next/router";
import constant from "../../../env";
import { TiHome } from "react-icons/ti";
import { MdPerson } from "react-icons/md";
import { FaHandHoldingHeart } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa";


const SidebarItem = ({ icon, title, link }) => {
  const router = useRouter();
  const isActive = router.pathname === link;

  return (
    <div
      className={`flex items-center p-2 cursor-pointer rounded ${
        isActive ? "bg-blue-100" : ""
      }`}
      onClick={() => router.push(link)}
    >
      <div className="mr-2">{icon}</div>
      <div>{title}</div>
    </div>
  );
};

 const Sidebar = () => {
  return (
    <div className="flex flex-col h-screen w-[200px]">
      <SidebarItem
        icon={<TiHome />}
        title="Dashboard"
        link={constant.ROUTES.USER.INDEX}
        // link={constant.ROUTES.USER.DASHBOARD}
      />
      <SidebarItem
        icon={<FaHandshake />}
        title="Policies"
        link={constant.ROUTES.USER.POLICY}
      />
      <SidebarItem
        icon={<FaHandHoldingHeart />}
        title="Claims"
        link={constant.ROUTES.USER.CLAIM}
      />
      <SidebarItem
        icon={<MdPerson />}
        title="Profile"
        link={constant.ROUTES.USER.PROFILE}
      />
    </div>
  );
};
export default Sidebar;