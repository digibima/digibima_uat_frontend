

import Image from "next/image";
import logo from "../../public/images/dashboard/logo.png";


const response = {
  policy: {
    core: {
      platformName: "DIGIBIMA",
      insurerName: "Care Health Insurance Limited",
      planName: "Ultimate Care – Floater",
      policyNumber: "56389321",
      policyType: "Floater",
      policyStatus: "ACTIVE",
      policyStartDate: "2025-07-29",
      policyEndDate: "2026-07-28",
      issueDate: "2025-07-29",
      issuedVia: "DIGIBIMA"
    },

    proposer: {
      name: "Manoj Kumar Jain",
      mobile: "XXXXXX0794",
      email: "masked@email.com",
      address:
        "24, Pan Dariba Jain Mandir Ke Bagal Me, Allahabad, UP – 211003"
    },

    members: [
      {
        name: "Manoj Kumar Jain",
        relation: "Self",
        age: 58,
        gender: "Male",
        sumInsured: 500000
      },
      {
        name: "Khushbu Jain",
        relation: "Spouse",
        age: 52,
        gender: "Female",
        sumInsured: 500000
      }
    ],

    premium: {
      basePremium: 37894,
      gst: 6821,
      totalPremium: 44716
    },

    sections: [
      {
        title: "Coverage Details",
        type: "table",
        data: [
          ["In-Patient Hospitalization", "Up to Sum Insured"],
          ["Room Rent", "No Limit"],
          ["ICU Charges", "Covered"],
          ["AYUSH Treatment", "Covered"]
        ]
      },
      {
        title: "Waiting Periods",
        type: "table",
        data: [
          ["Initial Waiting Period", "30 Days"],
          ["Pre-Existing Diseases", "36 Months"]
        ]
      },
      {
        title: "Special Conditions",
        type: "list",
        data: [
          "Co-payment applicable as per policy terms",
          "Zone based deductible applicable"
        ]
      }
    ],

    nominee: {
      name: "Saumya Jain",
      relation: "Daughter",
      sharePercentage: 100
    }
  }
};

const policy = response.policy;

/* ================= PAGE ================= */

export default function PolicyPdfView() {
  return (
    <div className=" py-10">

      <PdfPage pageNo={1} totalPages={2}>
        <Title />

        <KeyValueTable
          title="Policy Details"
          rows={[
            ["Insurance Company", policy.core.insurerName],
            ["Plan Name", policy.core.planName],
            ["Policy Number", policy.core.policyNumber],
            ["Policy Type", policy.core.policyType],
            [
              "Policy Period",
              `${policy.core.policyStartDate} to ${policy.core.policyEndDate}`
            ],
            ["Issued Via", policy.core.issuedVia]
          ]}
        />

        <KeyValueTable
          title="Proposer Details"
          rows={[
            ["Name", policy.proposer.name],
            ["Mobile", policy.proposer.mobile],
            ["Email", policy.proposer.email],
            ["Address", policy.proposer.address]
          ]}
        />

        <MembersTable members={policy.members} />
      </PdfPage>

      <div className="page-break" />

      <PdfPage pageNo={2} totalPages={2}>
        {policy.sections.map((section, i) => {
          if (section.type === "table") {
            return (
              <TwoColumnTable
                key={i}
                title={section.title}
                rows={section.data}
              />
            );
          }

          if (section.type === "list") {
            return (
              <div key={i}>
                <SectionTitle text={section.title} />
                <ul className="text-xs list-disc pl-5 space-y-1">
                  {section.data.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          }

          return null;
        })}

        <TwoColumnTable
          title="Premium Details"
          rows={[
            ["Base Premium", `₹ ${policy.premium.basePremium}`],
            ["GST", `₹ ${policy.premium.gst}`],
            ["Total Premium Paid", `₹ ${policy.premium.totalPremium}`]
          ]}
        />

        <TwoColumnTable
          title="Nominee Details"
          rows={[
            ["Nominee Name", policy.nominee.name],
            ["Relation", policy.nominee.relation],
            ["Share", `${policy.nominee.sharePercentage}%`]
          ]}
        />
      </PdfPage>

      <style jsx global>{`
        @media print {
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}

/* ================= PAGE WRAPPER ================= */

function PdfPage({ children, pageNo, totalPages }) {
  return (
    <div className="relative bg-white w-[210mm] min-h-[297mm] mx-auto p-10 shadow-xl overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('/images/dashboard/policypdf-watermark.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "360px",
          backgroundPosition: "center",
          opacity: 0.08,
          transform: "rotate(-14deg)"
        }}
      />

      <div className="relative z-10 mb-6 border-b pb-2 flex justify-between">
        <Image src={logo} alt="DIGIBIMA" className="h-9 w-auto" />
        <div className="text-xs text-right">
          <div className="font-bold uppercase">Policy Certificate</div>
          <div>Status: <b>{policy.core.policyStatus}</b></div>
        </div>
      </div>

      <div className="relative z-10">{children}</div>

      <div className="absolute bottom-4 left-10 right-10 border-t pt-1 text-[9px] text-gray-600 flex justify-between">
        <div>
          Insurance is the subject matter of solicitation. Issued digitally via DIGIBIMA.
        </div>
        <div>
          Page {pageNo} of {totalPages}
        </div>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Title() {
  return (
    <div className="text-center mb-6">
      <h1 className="text-lg font-bold uppercase">
        Health Insurance Policy Schedule
      </h1>
      <div className="text-xs text-gray-600">
        Issued digitally via DIGIBIMA
      </div>
    </div>
  );
}

function SectionTitle({ text }) {
  return (
    <div className="mt-6 mb-2 font-bold text-sm border-b border-teal-600 pb-1">
      {text}
    </div>
  );
}

function KeyValueTable({ title, rows }) {
  return (
    <>
      <SectionTitle text={title} />
      <table className="w-full border border-black text-xs">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border px-2 py-1 font-semibold w-1/3">
                {r[0]}
              </td>
              <td className="border px-2 py-1">{r[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function MembersTable({ members }) {
  return (
    <>
      <SectionTitle text="Insured Member Details" />
      <table className="w-full border border-black text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Relation</th>
            <th className="border px-2 py-1">Age</th>
            <th className="border px-2 py-1">Sum Insured</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{m.name}</td>
              <td className="border px-2 py-1">{m.relation}</td>
              <td className="border px-2 py-1">{m.age}</td>
              <td className="border px-2 py-1">₹ {m.sumInsured}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function TwoColumnTable({ title, rows }) {
  return (
    <>
      <SectionTitle text={title} />
      <table className="w-full border border-black text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{r[0]}</td>
              <td className="border px-2 py-1">{r[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
