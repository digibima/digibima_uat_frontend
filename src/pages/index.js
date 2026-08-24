"use client";

import { homebike, homecar, homecommercial, homehealth } from "@/images/Image";
import Image from "next/image";
import Link from "next/link";


 const routesMap = {
  Car: "/login?type=motor",
  Bike: "/login?type=motor",
  Commercial: "/login?type=motor",
  Health: "/login?type=health",
  };

export default function Main() {
  return (
    <div className="min-h-screen bgcolor flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-6xl w-full flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6">
          <h2 className="text-[#2F4A7E] text-xl md:text-2xl font-semibold">
            <span className="font-bold">At DigiBima,</span> we understand the complexities of the insurance industry.
          </h2>
          <p className="text-[#2F4A7E] text-lg">
            Our software is built on years of expertise and is designed to adapt to your evolving needs.
          </p>

          <button className="bg-[#7998F4]  text-white font-medium px-6 py-2 rounded-full shadow">
            Connect with us
          </button>

          <p>
          <span className="text-green-600 font-medium">Get in touch with us,</span> we&apos;ll be pleased to assist you!
        </p>

        </div>

        <div className="flex-1 grid grid-cols-2 gap-6">
          {[
            { label: "Car", src: homecar },
            { label: "Bike", src: homebike},
            { label: "Health", src: homehealth },
            { label: "Commercial", src: homecommercial },
          ].map(({ label, src }, index) => (
               <Link href={routesMap[label]} key={index}>
            <div key={index} className="text-center border-2 border-blue-300 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={src}
                alt={label}
                width={200}
                height={100}
                className="w-full h-[120px] object-cover"
              />
              <div className="py-2 font-medium text-lg">{label}</div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
