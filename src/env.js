const constant = {
  USER: "",
  EMAIL_ID: "",
  COOKIE: {
    HEADER: "@#$%^AZ##",
  },
  BASE_URL: "https://stage.digibima.com/",
  SERVERIMG_URL: "https://stage.digibima.com/public/front/logo",
  ROUTES: {
    INDEX: "/",
    LOGIN: {
      HEALTHLOGIN: "/login?type=health",
      MOTORLOGIN: "/login?type=motor",
    },
    HEALTH: {
      // 'INDEX': '/health',

      INSURE: "/health/common/insure",
      ILLNESS: "/health/common/illness",
      PLANS: "/health/common/plans",

      CARESUPEREME: {
        CHECKOUT: "/health/vendors/caresupereme/checkout",
        PROPOSAL: "/health/vendors/caresupereme/journey",
        PAYMENT: "/health/payment",
      },

      ULTIMATECARE: {
        CHECKOUT: "/health/vendors/ultimatecare/checkout",
        PROPOSAL: "/health/vendors/ultimatecare/journey",
        PAYMENT: "/health/payment",
      },
      BAJAJ: {
        CHECKOUT: "/health/vendors/bajaj/checkout",
        PROPOSAL: "/health/vendors/bajaj/journey",
        PAYMENT: "/health/payment",
      },
      BAJAJMHCP9: {
        CHECKOUT: "/health/vendors/bajajmhcp9/checkout",
        PROPOSAL: "/health/vendors/bajajmhcp9/journey",
        PAYMENT: "/health/payment",
      },
      ADITYABIRLA: {
        CHECKOUT: "/health/vendors/adityabirla/checkout",
        PROPOSAL: "/health/vendors/adityabirla/journey",
        PAYMENT: "/health/payment",
      },
      ADITYABIRLAMAX: {
        CHECKOUT: "/health/vendors/adityabirlamax/checkout",
        PROPOSAL: "/health/vendors/bajaj/journey",
        PAYMENT: "/health/payment",
      },

      VENDOR: {
        100: "/health/vendors/caresupereme/checkout",
        102: "/health/vendors/ultimatecare/checkout",
        106: "/health/vendors/bajaj/checkout",
        108: "/health/vendors/adityabirla/checkout",
        109: "/health/vendors/adityabirlamax/checkout",
        110: "/health/vendors/bajajmhcp9/checkout",
      },
    },
    MOTOR: {
      // 'INDEX': '/motor',
      SELECTVEHICLE: "/motor/select-vehicle-type",
      CAR: {
        KNOWCARSTEPTWO: "/motor/car/knowcarstep-two",
        KNOWCARSTEPTHREE: "/motor/car/knowcarstep-three",
        NEWCAR: "/motor/car/new-car",
        PLANS: "/motor/car/plans",

        SHRIRAM: {
          SHRIRAMJOURNEY: "/motor/car/vendor/shriram/journey",
        },
        GODIGIT: {
          SHRIRAMJOURNEY: "/motor/car/vendor/godigit/journey",
        },
        ZUNO: {
          SHRIRAMJOURNEY: "/motor/car/vendor/zuno/journey",
        },
      },

      BIKE: {
        KNOWBIKESTEPTWO: "/motor/bike/knowbikestep-two",
        KNOWBIKESTEPTHREE: "/motor/bike/knowbikestep-three",
        NEWBIKE: "/motor/bike/new-bike",
        BIKEPLANS: "/motor/bike/plans",
        SHRIRAM: {
          SHRIRAMJOURNEY: "/motor/bike/vendor/shriram/journey",
        },
      },

      VENDOR: {
        CAR: {
          101: "/motor/car/vendor/shriram/journey",
          103: "/motor/car/vendor/godigit/journey",
          105: "/motor/car/vendor/bajaj/journey",
          107: "/motor/car/vendor/zuno/journey",

          // Add other car vendors
        },
        BIKE: {
          101: "/motor/bike/vendor/shriram/journey",
          103: "/motor/bike/vendor/godigit/journey",
          105: "/motor/bike/vendor/bajaj/journey",

          // Add other bike vendors
        },
      },
    },
    USER: {
      INDEX: "/userpnlx",
      CLAIM: "/userpnlx/claim",
      POLICY: "/userpnlx/policy",
      PROFILE: "/userpnlx/user-dashboard",
      // 'DASHBOARD': '/userpnlx/dashboard'
    },
    ADMIN: {
      INDEX: "/dashboard/admin/login",
      ADMINDASHBOARD: "dashboard/admin/components",
    },
  },
  API: {
    HEALTH: {
      SENDOTP: "/api/sendotp",
      VERIFYOTP: "/api/verifyotp",
      REVERIFYOTP: "/api/relogin",
      PINCODE: "/api/acpincode",
      // UPDATEAGE: "/api/updateage",
      
      PLANTYPE: "/api/plantype",
      GETPLANTYPE: "/api/getplantype",
      INSUREVIEW: "/api/insureview",
      GETINSURE: "/api/getinsureinfo",
      ILLNESS: "/api/illnesses",
      SAVEILLNESS: "/api/saveillnesses",
      PLANDATA: "/api/quoteview",
      FILTERPLAN: "/api/filterplan",
      GETQUOTE: "/api/health-quotation-generate",
      ACPINCODE: "/api/acdetails",
      UPDATEPINCODE: "/api/updatepincode",

      CARESUPEREME: {
        UPDATEAGE: "/api/health-caresupereme/updateage",
        CHECKOUT: "/api/health-caresupereme/addon",
        SETPREMIUM: "/api/health-caresupereme/setpremium",
        PlANCHECKOUT: "/api/health-caresupereme/plancheckout",
        ADDADDONS: "/api/health-caresupereme/addaddon",
        PANVERIFY: "/api/health-caresupereme/verifypan",
        PANOTPVERIFY: "/api/health-caresupereme/verifyotp",
        UPLOADDOCUMENT: "/api/health-caresupereme/uploadfile",
        AADHARVERIFY: "/api/health-caresupereme/verifyadhar",
        CHANGEPINCODE: "/api/health-caresupereme/newpincode",
        CHANGECUMMUNIPINCODE: "/api/health-caresupereme/commpincode",
        SAVESTEPONE: "/api/health-caresupereme/proposalStepOne",
        SAVESTEPTWO: "/api/health-caresupereme/proposalStepTwo",
        SAVESTEPPORT: "/api/health-caresupereme/proposalStepPort",
        SAVESTEPTHREE: "/api/health-caresupereme/proposalStepThree",
        CREATEPOLICY: "/api/health-caresupereme/createpolicy",
        GETPROPOSAL: "/api/health-caresupereme/carepayment",
      },
      ULTIMATECARE: {
        UPDATEAGE: "/api/health-ultimatecare/updateage",
        CHECKOUT: "/api/health-ultimatecare/addon",
        SETPREMIUM: "/api/health-ultimatecare/setpremium",
        PlANCHECKOUT: "/api/health-ultimatecare/plancheckout",
        ADDADDONS: "/api/health-ultimatecare/addaddon",
        PANVERIFY: "/api/health-ultimatecare/verifypan",
        PANOTPVERIFY: "/api/health-ultimatecare/verifyotp",
        UPLOADDOCUMENT: "/api/health-ultimatecare/uploadfile",
        AADHARVERIFY: "/api/verifyadhar",
        CHANGEPINCODE: "/api/health-ultimatecare/newpincode",
        SAVESTEPONE: "/api/health-ultimatecare/proposalStepOne",
        SAVESTEPTWO: "/api/health-ultimatecare/proposalStepTwo",
        SAVESTEPPORT: "/api/health-ultimatecare/proposalStepPort",
        SAVESTEPTHREE: "/api/health-ultimatecare/proposalStepThree",
        CREATEPOLICY: "/api/health-ultimatecare/createpolicy",
        GETPROPOSAL: "/api/health-ultimatecare/payment",
      },
      BAJAJ: {
        UPDATEAGE: "/api/bajaj-myhealthcare/updateage",
        CHECKOUT: "/api/bajaj-myhealthcare/addon",
        SETPREMIUM: "/api/bajaj-myhealthcare/setpremium",
        PlANCHECKOUT: "/api/bajaj-myhealthcare/plancheckout",
        ADDADDONS: "/api/bajaj-myhealthcare/addaddon",
        IDENTITYVERIFY: "/api/bajaj-myhealthcare/validateckycdetails",
        PANVERIFY: "/api/health-ultimatecare/verifypan",
        UPLOADDOCUMENT: "/api/bajaj-myhealthcare/uploadfile",
        AADHARVERIFY: "/api/verifyadhar",
        CHANGEPINCODE: "/api/bajaj-myhealthcare/newpincode",
        SAVESTEPONE: "/api/bajaj-myhealthcare/proposalStepOne",
        SAVESTEPTWO: "/api/bajaj-myhealthcare/proposalStepTwo",
        SAVESTEPPORT: "/api/bajaj-myhealthcare/proposalStepPort",
        SAVESTEPTHREE: "/api/bajaj-myhealthcare/proposalStepThree",
        CREATEPOLICY: "/api/bajaj-myhealthcare/createpolicy",
        GETPROPOSAL: "/api/bajaj-myhealthcare/payment",
      },
      BAJAJMHCP9: {
        CHECKOUT: "/api/bajaj-myhealthcareplan9/addon",
        SETPREMIUM: "/api/bajaj-myhealthcareplan9/setpremium",
        PlANCHECKOUT: "/api/bajaj-myhealthcareplan9/plancheckout",
        ADDADDONS: "/api/bajaj-myhealthcareplan9/addaddon",
        IDENTITYVERIFY: "/api/bajaj-myhealthcareplan9/validateckycdetails",
        PANVERIFY: "/api/health-ultimatecare/verifypan",
        UPLOADDOCUMENT: "/api/bajaj-myhealthcareplan9/uploadfile",
        AADHARVERIFY: "/api/verifyadhar",
        CHANGEPINCODE: "/api/bajaj-myhealthcareplan9/newpincode",
        SAVESTEPONE: "/api/bajaj-myhealthcareplan9/proposalStepOne",
        SAVESTEPTWO: "/api/bajaj-myhealthcareplan9/proposalStepTwo",
        SAVESTEPPORT: "/api/bajaj-myhealthcareplan9/proposalStepPort",
        SAVESTEPTHREE: "/api/bajaj-myhealthcareplan9/proposalStepThree",
        CREATEPOLICY: "/api/bajaj-myhealthcareplan9/createpolicy",
        GETPROPOSAL: "/api/bajaj-myhealthcareplan9/payment",
      },
      ADITYABIRLA: { 
         UPDATEAGE: "/api/adityabirla-health/ageupdate",
        CHECKOUT: "/api/adityabirla-health/addon",
        SETPREMIUM: "/api/health-caresupereme/setpremium",
        PlANCHECKOUT: "/api/adityabirla-health/plancheckout",
        ADDADDONS: "/api/adityabirla-health/addaddon",
        PANVERIFY: "/api/adityabirla-health/kyc/start",
        KYCRESULT: "/api/adityabirla-health/kyc/result",
        // PANOTPVERIFY: "/api/health-caresupereme/verifyotp",
        UPLOADDOCUMENT: "/api/health-caresupereme/uploadfile",
        AADHARVERIFY: "/api/health-caresupereme/verifyadhar",
        CHANGEPINCODE: "/api/health-caresupereme/newpincode",
        CHANGECUMMUNIPINCODE: "/api/health-caresupereme/commpincode",
        SAVESTEPONE: "/api/adityabirla-health/proposalStepOne",
        SAVESTEPTWO: "/api/adityabirla-health/proposalStepTwo",
        SAVESTEPPORT: "/api/adityabirla-health/proposalStepPort",
        SAVESTEPTHREE: "/api/adityabirla-health/proposalStepThree",
        INITIATE: "/api/adityabirla-health/payment/initiate",
        PAYMENTSTATUS: "/api/adityabirla-health/payment-status",
        CREATEPOLICY: "/api/adityabirla-health/createpolicy",
        GETPROPOSAL: "/api/adityabirla-health/carepayment",
      },
      ADITYABIRLAMAX: { 
         UPDATEAGE: "/api/adityabirlamax-health/ageupdate",
        CHECKOUT: "/api/adityabirlamax-health/addon",
        SETPREMIUM: "/api/health-caresupereme/setpremium",
        PlANCHECKOUT: "/api/adityabirlamax-health/plancheckout",
        ADDADDONS: "/api/adityabirlamax-health/addaddon",
        PANVERIFY: "/api/adityabirlamax-health/kyc/start",
        KYCRESULT: "/api/adityabirlamax-health/kyc/result",
        // PANOTPVERIFY: "/api/health-caresupereme/verifyotp",
        UPLOADDOCUMENT: "/api/health-caresupereme/uploadfile",
        AADHARVERIFY: "/api/health-caresupereme/verifyadhar",
        CHANGEPINCODE: "/api/health-caresupereme/newpincode",
        CHANGECUMMUNIPINCODE: "/api/health-caresupereme/commpincode",
        SAVESTEPONE: "/api/adityabirlamax-health/proposalStepOne",
        SAVESTEPTWO: "/api/adityabirlamax-health/proposalStepTwo",
        SAVESTEPPORT: "/api/adityabirlamax-health/proposalStepPort",
        SAVESTEPTHREE: "/api/adityabirlamax-health/proposalStepThree",
        INITIATE: "/api/adityabirlamax-health/payment/initiate",
        PAYMENTSTATUS: "/api/adityabirlamax-health/payment-status",
        CREATEPOLICY: "/api/adityabirlamax-health/createpolicy",
        GETPROPOSAL: "/api/adityabirlamax-health/carepayment",
      },
    },

    MOTOR: {
      LOGIN: "/api/motor/vehicle-type-select",
      VERIFYRTO: "/api/motor/verifyrto",
      BIKEVERIFYRTO: "/api/motor/bikeverifyrto",
      BRANDS: "/api/motor/getbrand",
      MODELS: "/api/motor/getmodel",
      GETCITY: "/api/motor/getcity",

      CAR: {
        SAVESTEPONE: "/api/motor-car/kn-car-details",
        KNOWCARDETAILSTWO: "/api/motor-car/kn-car-steptwo",
        KNOWCARDETAILSTHREE: "/api/motor-car/knowcarstepthree",
        NEWCARDETAILS: "/api/motor-car/new-car-details",
        NEWCARDETAILSTWO: "/api/motor-car/new-car-detailstwo",
        PLANS: "/api/motor-car/plans",
        ADDADDONS: "/api/motor-car/addaddon",
        QUOTE: "/api/motor-car/getcarquote",
        UPDATEIDV: "/api/motor-car/updateidv",
        CHANGEPLAN: "/api/motor-car/change-plan-type",
        PACOVERREASON: "/api/motor-car/pacoverreason",
        GETCACHEQUOTE: "/api/motor-car/getcachecarquote",
        ACCESSORIES: "/api/motor-car/accessories",

        SHRIRAM: {
          SAVEDATA: "/api/motor-car-shriram/journey",
          UPLOADDOCUMENT: "/api/motor-car-shriram/uploadfile",
          SAVESTEPONE: "/api/motor-car-shriram/savestepone",
          SAVESTEPTWO: "/api/motor-car-shriram/savesteptwo",
          SAVESTEPTHREE: "/api/motor-car-shriram/savestepthree",
        },
        BAJAJ: {
          SAVEDATA: "/api/motor-car-bajaj/journey",
          PANVERIFY: "/api/motor-car-bajaj/verifypan",
          UPLOADDOCUMENT: "/api/motor-car-bajaj/uploadfile",
          SAVESTEPONE: "/api/motor-car-bajaj/savestepone",
        },
        ZUNO: {
          SAVEDATA: "/api/motor-car-zuno/journey",
          UPLOADDOCUMENT: "/api/motor-car-zuno/uploadfile",
          SAVESTEPONE: "/api/motor-car-zuno/savestepone",
          SAVESTEPTWO: "/api/motor-car-shriram/savesteptwo",
          SAVESTEPTHREE: "/api/motor-car-shriram/savestepthree",
        },
        GODIGIT: {
          SAVEDATA: "/api/motor-car-godigit/journey",
          UPLOADDOCUMENT: "/api/motor-car-shriram/uploadfile",
          SAVESTEPONE: "/api/motor-car-godigit/savestepone",
          OVDKYC: "/api/motor-car-godigit/ovdkyc",
        },
      },

      BIKE: {
        BIKESAVESTEPONE: "/api/motor-bike/kn-bike-details",
        KNOWBIKEDETAILSTWO: "/api/motor-bike/kn-bike-step-two",
        KNOWBIKEDETAILSTHREE: "/api/motor-bike/kn-bike-step-three",
        NEWBIKE: "/api/motor-bike/new-bike-details",
        NEWBIKEDETAILSTWO: "/api/motor-bike/new-bike-step-two",
        ADDADDONS: "/api/motor-bike/addaddon",
        PLANS: "/api/motor-bike/bike-plan",
        QUOTE: "/api/motor-bike/getbikequote",
        UPDATEIDV: "/api/motor-bike/updateidv",
        CHANGEPLAN: "/api/motor-bike/change-plan-type",
        PACOVERREASON: "/api/motor-bike/pacoverreason",
        GETCACHEQUOTE: "/api/motor-bike/getcachebikequote",
        ACCESSORIES: "/api/motor-bike/accessories",

        SHRIRAM: {
          SAVEDATA: "/api/motor-bike-shriram/bike-journey",
          UPLOADDOCUMENT: "/api/motor-car-shriram/uploadfile",
          SAVESTEPONE: "/api/motor-bike-shriram/bikestepone",
        },
        GODIGIT: {
          SAVEDATA: "/api/motor-bike-godigit/bike-journey",
          UPLOADDOCUMENT: "/api/motor-car-shriram/uploadfile",
          SAVESTEPONE: "/api/motor-bike-godigit/savestepone",
        },
        BAJAJ: {
          SAVEDATA: "/api/motor-bike-bajaj/journey",
          PANVERIFY: "/api/motor-bike-bajaj/verifypan",
          UPLOADDOCUMENT: "/api/motor-bike-bajaj/uploadfile",
          SAVESTEPONE: "/api/motor-bike-bajaj/savestepone",
        },
      },
    },
    USER: {
      NOTIFICATION: "/api/userpnlx/notification-show",
      MARKNOTIFICATION: "/api/userpnlx/user-notification",
      USERDASHBOARD: "/api/userpnlx/user-profile",
      PROFILEUPDATE: "/api/userpnlx/user-profile-update",
      POLICY: "/api/userpnlx/user-policy",
      DOWNLOADPOLICY: "api/userpnlx/policy-Pdf",
      // DOWNLOADPOLICYPDF: "/api/downloadpolicypdf",
      DOWNLOADPOLICYPDF: "/api/userpnlx/policydownload",
    },
    ADMIN: {
      ADMINLOGIN: "/api/adminpnlx/admin-login",
      SENDOTP: "/api/adminpnlx/sendotp",
      VERIFYOTP: "/api/adminpnlx/verifyotp",
      ADMINLOGINDATA: "/api/adminpnlx/admin-dashboard",
      MANAGEPLAN: "/api/adminpnlx/manage-plan",
      EDITPLAN: "/api/adminpnlx/manage-updateplan",
      ADDNEWPLAN: "/api/adminpnlx/manage-saveplan",
      // vendor
      MANAGEVENDOR: "/api/adminpnlx/manage-vendor",
      EDITVENDOR: "/api/adminpnlx/update-vendor",
      DELETEVENDOR: "/api/adminpnlx/delete-vendor",
      ADDNEWVENDOR: "/api/adminpnlx/add-vendor",
      // product
      PRODUCT: "/api/adminpnlx/manage-product",
      EDITPRODUCT: "/api/adminpnlx/edit-vendor",
      DELETEPRODUCT: "/api/adminpnlx/manage-deleteplan",
      ADDNEWPRODUCT: "/api/adminpnlx/add-vendor",
      // user
      MANAGEUSER: "/api/adminpnlx/manage-user",
      //  managepolicy
      MANAGEPOLICY: "/api/adminpnlx/admin-policy",
      //  recyclebin
      RECYCLEBIN: "/api/adminpnlx/recycle-bin",
    },
      EMPLOYEE:{
      EMPLOYEELOGIN:"/api/admin-employee-login",
      EMPLOYEELOGOUT:"/api/admin-employee-logout",
      EMPLOYEELOGINVENDORS:"/api/vendors",
      POLICYUPLOAD:"/api/upload_poilcy",
    }
  },
  DBSTORE: {
    HEALTH: {
      INSURE: "healthinsuredata",
      PLANS: {
        HEALTHPLANDATA: "healthplandata",
        HEALTHPLANVENDOR: "healthplanvendor",
      },
      CARE: {
        CARECHECKOUTDATA: "CarecheckoutData",
        CARECHECKOUTTENUREDATA: "CarecheckouttenureData",
      },
      ULTIMATE: {
        ULTIMATECHECKOUTDATA: "ultimatecheckoutData",
        ULTIMATECHECKOUTTENUREDATA: "ultimatecheckouttenureData",
      },
      BAJAJ: {
        BAJAJCHECKOUTDATA: "bajajcheckoutData",
        BAJAJCHECKOUTTENUREDATA: "bajajcheckouttenureData",
        TENURETXN: "tenureTxn",
      },
      BAJAJMHCP9: {
        BAJAJCHECKOUTDATA: "bajajmhcp9checkoutData",
        BAJAJCHECKOUTTENUREDATA: "bajajmhcp9checkouttenureData",
        TENURETXN: "tenureTxn",
      },
      ADITYABIRLA: {
       ABIRLACHECKOUTDATA: "adityabirlacheckoutData",
        ABIRLACHECKOUTTENUREDATA: "adityabirlacheckouttenureData",
      },
      ADITYABIRLAMAX: {
       ABIRLACHECKOUTDATA: "adityabirlamaxcheckoutData",
        ABIRLACHECKOUTTENUREDATA: "adityabirlamaxcheckouttenureData",
      },
    },
    MOTOR: {
      CAR: {
        PLANS: {
          MOTORPLANDATA: "motorcarplandata",
          MOTORPLANVENDOR: "motorcarplanvendor",
        },
      },
    },
  },
  QUESTION: {
    CAREDISEASE: {
      11: "Cancer or Tumor of any kind?",
      12: "Any heart related or circulatory system disorders?",
      13: "Hypertension/High Blood Pressure/Cholesterol disorder?",
      14: "Breathing/Respiratory issues (E.g.TB, Asthma, etc.)?",
      15: "Endocrine disorders (E.g. Thyroid related disorders, etc)?",
      16: "Diabetes/High blood sugar?",
      17: "Muscles or Nervous system related disorder or Stroke/Epilepsy/Paralysis or other brain related disorders?",
      18: "Liver/gallbladder or any other Gastro-Intestinal Disease?",
      19: "Kidney failure/Stone/Dialysis/Gynaecological/Prostate disease?",
      110: "Auto-immune or Blood related disorders (Rheumatoid arthritis, Thalassemia, etc.)?",
      111: "Any Congenital Disorder?",
      112: "HIV/AIDS/STD?",
      113: "Any other disease/health adversity/injury/condition/treatment not mentioned above?",
      114: "Has any of the Proposed to be Insured consulted/taken treatment or been recommended to take investigations/medication/surgery other than for childbirth/minor injuries?",
      115: "Has any of the Proposed to be Insured been hospitalized or has been under any prolonged treatment for any illness/injury or has undergone surgery other than for childbirth/minor injuries?",
      21: "Has any of the new person(s) to be insured ever filed a claim with their current / previous insurer?",
      22: "Has any proposal for Health Insurance of the new person(s) to be insured, been declined, cancelled or charged a higher premium?",
      23: "Is any of the person(s) to be insured already covered under any other health insurance policy of Care Health Insurance?",
      24: "Already covered",
      25: "Have any of the above mentioned person(s) to be insured been diagnosed / hospitalized for any illness / injury during the last 48 months?",
    },
    LIFESTYLE: {
      31: "Personal habit of smoking/ alcohol/gutkha/ tobacco/paan?",
      // You can add more if needed
    },
  },

 ULTIMATEPORTQUESTION: {
    CAREDISEASE: {
      105: "Joint Pain?",
      114: "Cancer?",
      122: "Congenital Disorder?",
      129: "Kidney Disease?",
      143: "Cardiac Disease?",
      147: "HIV/AIDS?",
      164: "Paralysis?",
      205: "Diabetes?",
      207: "Hypertension / High Blood Pressure",
      210: "Any other diseases or ailments not mentioned above (description add)?",
      222: "PEDillnessDetails?",
      232: "Liver Disease?",
      250: "Respiratory disorders inclusion?",
      502: "PEDillnessDetails",
      503: "PEDSurgeryDetails",
      504: "PEDSmokeDetails",
      H001: "Have any ... last 48 months?",
      H002: "Have any ... filed a claim?",
      H003: "Has any proposal ... declined/cancelled/higher premium?",
      H004: "Already covered under any other policy?",
    },
  },
  BAJAJQUESTION: {
    HEALTH: {
      1: {
        label:
          "Has any of the persons to be insured suffered from or been investigated for any of the following: Disorder of the heart or circulatory system, chest pain, high blood pressure, stroke, asthma or any respiratory condition, cancer or tumor lump of any kind, diabetes, hepatitis, disorder of urinary tract or kidneys, blood disorder, mental or psychiatric condition, brain/nervous system disease, fits (epilepsy), slipped disc, backache, congenital/birth defects/urinary diseases, AIDS or positive HIV?",
        name: "mempreexistdisease",
      },
      2: {
        label:
          "Do you or any of the family members to be covered have/had health complaints or met with any accident in the past 4 years and prior to 4 years and have been taking treatment, regular medication, or planned for any treatment/surgery/hospitalization?",
        name: "memasthma",
      },
      3: {
        label:
          "Do you smoke cigarettes or consume tobacco (chewing/smoking)/alcohol/narcotic or marijuana in any form? Please give duration and daily consumption.",
        name: "memsmkertbco",
      },
      4: {
        label:
          "Have you or any of your immediate family members (father, mother, brother, or sister) had cancer, heart attack, or stroke and at what age? Prior to age 60?",
        name: "memcholstrldisordr",
      },
      5: {
        label:
          "Has any proposal for life, critical illness, or health-related insurance on your life or lives ever been postponed, declined, or accepted on special terms? If yes, give details.",
        name: "memheartdisease",
      },
    },
    LIFESTYLE: {
      31: {
        label: "Personal habit of smoking / alcohol / gutkha / tobacco / paan?",
        name: "memlifestyle",
      },
    },
  },
};

export default constant;
