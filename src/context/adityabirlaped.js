
const diseaseFields = [
  {
    key: "disease_name",
    text: "Disease name",
    type: "text",
  },
  {
    key: "diagnosis_date",
    text: "Date of Diagnosis",
    type: "date",
  },
  {
    key: "consultation_date",
    text: "Last Consultation Date",
    type: "date",
  },
  {
    key: "surgery_name",
    text: "Name of Surgery (if any)",
    type: "text",
  },
  {
    key: "treatment_details",
    text: "Details of Treatment given(hospitalization/OPD, other)",
    type: "textarea",
  },
  {
    key: "disability",
    text: "Disability %",
    type: "number",
  },
  {
    key: "hospitalization_period",
    text: "Period of hospitalization (if any)",
    type: "text",
  },
  {
    key: "other_information",
    text: "Any Other information",
    type: "textarea",
  },
];

// Question 3 Dropdown Fields (Hypertension / High BP / Lipid)
const hypertensionFields = [
  {
    key: "disease_name",
    text: "Disease name",
    type: "select",
    options: [
      { label: "Hypertension / High Blood Pressure", value: "hypertension" },
      { label: "High Cholesterol", value: "high_cholesterol" },
      { label: "Lipid Disorders", value: "lipid_disorders" },
      { label: "Other", value: "other" },
    ],
  },
  ...diseaseFields.slice(1),
];

// Question 4  Dropdown Fields (Asthma & COPD)
const asthmaFields = [
  {
    key: "disease_name",
    text: "Disease name",
    type: "select",
    options: [
      { label: "Asthma", value: "asthma" },
      { label: "COPD", value: "copd" },
      { label: "Tuberculosis (TB)", value: "tb" },
      { label: "Bronchitis", value: "bronchitis" },
      { label: "Emphysema", value: "emphysema" },
      { label: "Pleural Effusion", value: "pleural_effusion" },
      { label: "Other Respiratory Disease", value: "other" },
    ],
  },
  ...diseaseFields.slice(1),
];

const covidFields = [
  {
    key: "diagnosis_date",
    text: "Date of Diagnosis",
    type: "date",
  },
  {
    key: "consultation_date",
    text: "Last Consultation Date",
    type: "date",
  },
  {
    key: "complications",
    text: "Complications (if any)",
    type: "textarea",
  },
  {
    key: "other_information",
    text: "Any Other information",
    type: "textarea",
  },
];

const policyDeclinedFields = [
  {
    key: "insurer_name",
    text: "Insurer Name",
    type: "text",
  },
  {
    key: "reason",
    text: "Reason",
    type: "textarea",
  },
  {
    key: "decision_date",
    text: "Decision Date",
    type: "date",
  },
  {
    key: "other_information",
    text: "Any Other information",
    type: "textarea",
  },
];

const questionnaire = {
  sections: [
    {
      key: "medical",
      title: "Medical History",

      main_question: {
        question_id: "1362472429092023",
        text:
          "Have you ever been diagnosed with / advised / taken treatment or observation is suggested or undergone any investigation or consulted a doctor or undergone or advised surgery or hospitalized for any one or more from the following? If YES then please mention Details in the additional information section below",
      },

      questions: [
        {
          question_id: "1362473029092023",
          key: "cancer",
          text: "1.Cancer, tumor, polyp or cyst",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362474029092023",
          key: "heart",
          text:
            "2. Any heart disease or disorder, chest pain or discomfort, irregular heartbeats, palpitations or heart murmur",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362474329092023",
          key: "hypertension",
          text:
            "3. Hypertension / High Blood Pressure(BP) / High Cholesterol/Any other Lipid disorders",
          type: "toggle",
          children: hypertensionFields,
        },
        {
          question_id: "1362474629092023",
          key: "asthma",
          text:
            "4. Asthma / Tuberculosis (TB) / COPD / Pleural effusion / Bronchitis / Emphysema or any other disease of Lungs, Pleura and airway or Respiratory disease?",
          type: "toggle",
          children: asthmaFields,
        },
        {
          question_id: "1362474929092023",
          key: "thyroid",
          text:
            "5. Thyroid disease/ Cushing's disease/ Parathyroid Disease/ Addison's disease / Pituitary tumor/ disease or any other disorder of Endocrine system?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362475229092023",
          key: "diabetes",
          text:
            "6. Diabetes Mellitus / High Blood Sugar / Diabetes on Insulin or medication",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362475529092023",
          key: "neuro",
          text:
            "7. Motor Neuron Disease/ Muscular dystrophies/ Myasthenia Gravis/ Demyelinating disease or any other disease of Neuromuscular system (muscles and/or nervous system)",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362475829092023",
          key: "brain",
          text:
            "8. Stroke/Paralysis/Transient Ischemic Attack/Multiple Sclerosis/Epilepsy/Mental-Psychiatric illness/Parkinsonism/Alzheimer's/Depression/Dementia or any other disease of Brain and Nervous System?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362476129092023",
          key: "digestive",
          text:
            "9. Cirrhosis / Hepatitis / Wilson's disease / Pancreatitis / Liver disease / Crohn's disease / Ulcerative Colitis / Inflammatory Bowel Diseases / Piles or any other disease of Mouth, Esophagus, Liver, Gall bladder, Stomach or Intestines or any other part of Digestive System?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362476429092023",
          key: "kidney",
          text:
            "10. Kidney Stones / Renal Failure / Dialysis / Chronic Kidney Disease / Prostate Disease or any other disease of Kidney, Urinary Tract or reproductive organs?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362471029092023",
          key: "blood",
          text:
            "11. HIV/SLE/ Rheumatoid Arthiritis / Scleroderma / Sarcoidosis / Psoriasis/ bleeding or clotting disorders or any other diseases of Blood, Bone marrow/ Immunity or Skin.",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362471229092023",
          key: "ent",
          text:
            "12. Disease or disorder of eye, ear, nose or throat (except any sight related problems corrected by prescription lenses)?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362471529092023",
          key: "ortho",
          text:
            "13. Disease of the musculoskeletal system / Orthopedic disorders / Degeneration, Fracture or dislocation of bones or joints / avascular necrosis of joints or any other disorder related to it?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362471829092023",
          key: "other",
          text:
            "14. Any other disease / health adversity / injury / condition / treatment not mentioned above",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362472129092023",
          key: "hospitalized",
          text:
            "15. Has any of the Proposed to be Insured been hospitalized / recommended to take investigations / medication or has been under any prolonged treatment / undergone surgery for any illness / injury other than for childbirth / minor injuries?",
          type: "toggle",
          children: diseaseFields,
        },
        {
          question_id: "1362472729092023",
          key: "covid",
          text:
            "16. Has any of the Proposed to be Insured have been suffering/suffered from Covid-19 disease? If yes, confirm if any complications arise due to covid-19.",
          type: "toggle",
          children: covidFields,
        },
      ],
    },

    {
      key: "previous",
      title: "Previous / Existing Insurance",

      questions: [
        {
          question_id: "1362476729092023",
          key: "policy",
          text:
            "Do you have Previous / Current policy or proposal applied for life, health, hospital daily cash or critical illness or Cancer or personal accident insurance?",
          type: "toggle",
        },
        {
          question_id: "1362477029092023",
          key: "portability",
          text:
            "Do You want to consider this Health policy for Portability",
          type: "toggle",
        },
        {
          question_id: "1362477329092023",
          key: "insurer",
          text: "Insurer Name",
          type: "text",
        },
        {
          question_id: "1362477429092023",
          key: "claim",
          text: "Claim in previous policy",
          type: "text",
        },
        {
          question_id: "1362477529092023",
          key: "declined",
          text:
            "Was any proposal/policy declined / deferred / withdrawn / accepted with modified terms / cancelled, if Yes please provide details in additional information",
          type: "toggle",
          children: policyDeclinedFields,
        },
      ],
    },

    {
      key: "lifestyle",
      title: "Lifestyle History",

      questions: [
        {
          question_id: "1362473329092023",
          key: "substance",
          text:
            "Do you consume any of the following substances?(if yes, please mention the quantity)",
          type: "toggle",
        },
        {
          question_id: "1362473629092023",
          key: "alcohol",
          text:
            "Alcohol [30ml (number of pegs) of hard liquor / pints of beer / glass of wines] per Week.",
          type: "number",
        },
        {
          question_id: "1362473729092023",
          key: "smoking",
          text:
            "Smoking (Number of Cigarette/bidi sticks) per Week",
          type: "number",
        },
        {
          question_id: "1362473829092023",
          key: "gutkha",
          text:
            "Pan Masala/Gutkha (Number of small Pouches) per Week",
          type: "number",
        },
        {
          question_id: "1362473929092023",
          key: "other_substance",
          text:
            "Any Other substance (Name & Quantity) per Week",
          type: "text",
        },
      ],
    },

    {
      key: "declaration",
      title: "Declaration",

      questions: [
        {
          question_id: "agreeTnC",
          key: "agreeTnC",
          text:
            "I hereby agree to the Terms & Conditions of the purchase of this policy.",
          type: "checkbox",
        },
      ],
    },
  ],
};

export default questionnaire;