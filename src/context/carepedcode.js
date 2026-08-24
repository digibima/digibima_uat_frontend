const questionCode = {
    CAREPORT: {
  // ===== UI QUESTIONS (same as before) =====
  11: "Cancer/Tumor/Cyst/Polyp (Any Type of Growth in/on Body)",
  12: "Was Malignancy detected?",

  21: "Angioplasty/ Bypass surgery/ Heart Attack / Coronary artery disease",
  22: "Pacemaker implantation",
  23: "Heart valve disorder",
  24: "By Birth heart disorder like hole in heart",
  25: "Palpitations / Irregular Heart beat",
  26: "High cholesterol/Hyperlipidemia",
  27: "Increased/ decreased heart rate e.g Tachycardia or bradicardia",
  28: "Any Other",

  31: "Hypertension / High Blood Pressure",

  41: "Asthma",
  42: "COPD",
  43: "Bronchitis",
  44: "Interstitial lung disease ( ILD)",
  45: "Tuberculosis ( TB)",
  46: "Pleural effusion",
  47: "Emphysema of Lung",
  48: "Any Other",

  51: "Hypothyroidism",
  52: "Hyperthyroidism",
  53: "Any Other",

  61: "Diabetes (High Blood Sugar)",
  62: "Any complications caused by diabetes?(radio) Eg. Complications (Diabetic Foot, Neuropathy, Non-Healing Ulcer, Diabetic Retinopathy, etc.)",

  71: "Brain stroke / cerebrovascular accident (CVA)",
  72: "Epilepsy/ seizure",
  73: "Parkinson disease",
  74: "Cerebral palsy",
  75: "Multiple sclerosis",
  76: "Ankylosing spondylitis",
  77: "Intervertebral disc disorders / Slip Disc",
  78: "Any Other",

  81: "Anxiety disorder",
  82: "Depression",
  83: "Bipolar disorder",
  84: "Schizophrenia",
  85: "Any other",

  91: "Fatty liver",
  92: "Pancreatitis",
  93: "Liver disease / Cirrhosis of liver",
  94: "Hepatitis",
  95: "Wilson disease",
  96: "Any other",

  101: "Kidney or urinary stone",
  102: "Renal failure / Kidney disease",
  103: "Prostate disorder",
  104: "Any other",

  111: "Anemia",
  112: "Hemophilia",
  113: "Blood clot",
  114: "Thalassemia",
  115: "Any other",

  121: "Rheumatoid arthritis",
  122: "Lupus",
  123: "Multiple sclerosis",
  124: "Any other",

  131: "HIV/ AIDS",
  132: "Syphlis",
  133: "Gonorrhea",
  134: "Any other",

  141: "Obesity/High BMI",
  142: "Any other",
  151: "Have you had any adverse finding to any diagnostic test or procedures, have symptoms or complaints needing doctors consultation, been advised or had been hospitalized for more than 5 days in total, or undergone any surgery in the last 12 months? If yes, please provide details in the additional information section below.",
  161: "Have you consulted a doctor or a health professional four or more times during the last six months or have any follow-up in the upcoming year? (This excludes visits for common cold, cough, flu, acute respiratory tract infection or pregnancy )",

  171: "Do you smoke, consume alcohol, or chew tobacco, ghutka or paan?",

  181: "Beer",
  182: "Hard liquor (Whisky/Vodka/Rum etc)",
  183: "Wine",

  191: "Chewing Tobacco/Gutka/Pan Masala/Mawa etc",
  201: "Smoking (Bidi/Cigarrete/Cigar/E-Cigarrete etc.)",
  211: "Recreational Drugs",
  221: "Has any of the person(s) to be insured ever filed a claim with their current / previous insurer?",
  231: "Has any proposal(s) for health insurance of the new person(s) to be insured, been declined cancelled or charged a higher premium?",
  241: "Is any of the person(s) proposed for insurance covered under any other health insurance policy with the Care Health Insurance?",
  251: "Does any of the insured members fall in the category of Politically Exposed Persons (PEPs)?",
  261: "Does any member fall under the category of Diffrently Abled Persons?",


  // ===== META FOR =====
  META: {
  
  // =========================
  // Q1 (YES / NO)
  // =========================
  1: {
    main: {
      elementCd: "pedYesNo",
      questionSetCd: "yesNoExist",
      questionCd: 800
    }
  },

  // =========================
  // Q1(a) CANCER
  // =========================
  11: {
    main: {
      elementCd: "114",
      questionSetCd: "PEDcancer",
      questionCd: 801
    },
    fields: {
      date: {
        elementCd: "cancerExistingSince",
        questionSetCd: "PEDcancerExistingSince",
        questionCd: 802
      }
    }
  },
    12: {
    main: {
        elementCd: "PED1A", 
        questionSetCd: "PEDmalignancy",
        questionCd: 701
    },
    fields: {
        malignancy: {
        elementCd: "PED1A",
        questionSetCd: "PEDmalignancy",
        questionCd: 701
        }
    }
    },

  // =========================
  // Q1(b) CARDIO SECTION
  // =========================

  21: {
    main: {
      elementCd: "524",
      questionSetCd: "PEDangioplasty",
      questionCd: 803
    },
    fields: {
      date: {
        elementCd: "angioplastyExistingSince",
        questionSetCd: "PEDangioplastyExistingSince",
        questionCd: 804
      }
    }
  },

  22: {
    main: {
      elementCd: "525",
      questionSetCd: "PEDpacemaker",
      questionCd: 805
    },
    fields: {
      date: {
        elementCd: "pacemakerExistingSince",
        questionSetCd: "pacemakerExistingSince",
        questionCd: 806
      }
    }
  },

  23: {
    main: {
      elementCd: "526",
      questionSetCd: "Dheartvaluedisord",
      questionCd: 807
    },
    fields: {
      date: {
        elementCd: "heartvalveExistingSince",
        questionSetCd: "valueDisorderExist",
        questionCd: 808
      }
    }
  },

  24: {
    main: {
      elementCd: "527",
      questionSetCd: "PEDbybirthheart",
      questionCd: 809
    },
    fields: {
      date: {
        elementCd: "birthheartExisting",
        questionSetCd: "birthheartExisting",
        questionCd: 810
      }
    }
  },

  25: {
    main: {
      elementCd: "528",
      questionSetCd: "PEDpalpitations",
      questionCd: 811
    },
    fields: {
      date: {
        elementCd: "palpitationsExisting",
        questionSetCd: "palpitationsExisting",
        questionCd: 812
      }
    }
  },

  26: {
    main: {
      elementCd: "608",
      questionSetCd: "PEDhyperlipidemia",
      questionCd: 731
    },
    fields: {
      date: {
        elementCd: "hyperlipidemiaExisting",
        questionSetCd: "perlipidemiaExisting",
        questionCd: 732
      }
    }
  },

  27: {
    main: {
      elementCd: "529",
      questionSetCd: "Dincreasedheartrate",
      questionCd: 813
    },
    fields: {
      date: {
        elementCd: "increasedheartrateExistingSince",
        questionSetCd: "PEDincreasedheartrateExistingSince",
        questionCd: 814
      }
    }
  },

  28: {
    main: {
      elementCd: "530",
      questionSetCd: "PEDanycardiovascular",
      questionCd: 815
    },
    fields: {
      further: {
        elementCd: "703",
        questionSetCd: "PEDanycardiovasculardetails",
        questionCd: 703
      },
      date: {
        elementCd: "anycardiovascularExistingSince",
        questionSetCd: "PEDanycardiovascularExistingSince",
        questionCd: 816
      }
    }
  },

    // =========================
    // Q1(c): HYPERTENSION
    // =========================
    31: {
    main: {
        elementCd: "207",
        questionSetCd: "PEDhypertension",
        questionCd: 817
    },
    fields: {
        date: {
        elementCd: "hypertensionExistingSince",
        questionSetCd: "PEDhypertensionExistingSince",
        questionCd: 818
        },
        medicine: {
        elementCd: "PED3A",
        questionSetCd: "PEDmedicine",
        questionCd: 702
        }
    }
    },

    // =========================
    // Q1(d): RESPIRATORY
    // =========================

    41: {
    main: {
        elementCd: "214",
        questionSetCd: "PEDasthma",
        questionCd: 819
    },
    fields: {
        date: {
        elementCd: "asthmaExistingSince",
        questionSetCd: "PEDasthmaExistingSince",
        questionCd: 820
        }
    }
    },

    42: {
    main: {
        elementCd: "217",
        questionSetCd: "PEDCOPD",
        questionCd: 821
    },
    fields: {
        date: {
        elementCd: "COPDExistingSince",
        questionSetCd: "PEDCOPDExistingSince",
        questionCd: 822
        }
    }
    },

    43: {
    main: {
        elementCd: "220",
        questionSetCd: "PEDbronchitis",
        questionCd: 823
    },
    fields: {
        date: {
        elementCd: "bronchitisExistingSince",
        questionSetCd: "PEDbronchitisExistingSince",
        questionCd: 824
        }
    }
    },

    44: {
    main: {
        elementCd: "531",
        questionSetCd: "PEDinterstitiallung",
        questionCd: 825
    },
    fields: {
        date: {
        elementCd: "interstitiallungExistingSince",
        questionSetCd: "PEDinterstitiallungExistingSince",
        questionCd: 826
        }
    }
    },

    45: {
    main: {
        elementCd: "505",
        questionSetCd: "PEDtuberculosis",
        questionCd: 827
    },
    fields: {
        date: {
        elementCd: "tuberculosisExistingSince",
        questionSetCd: "PEDtuberculosisExistingSince",
        questionCd: 828
        }
    }
    },

    46: {
    main: {
        elementCd: "506",
        questionSetCd: "PEDpleuraleffusion",
        questionCd: 829
    },
    fields: {
        date: {
        elementCd: "pleuraleffusionExistingSince",
        questionSetCd: "PEDpleuraleffusionExistingSince",
        questionCd: 830
        }
    }
    },

    47: {
    main: {
        elementCd: "507",
        questionSetCd: "PEDEmphysema",
        questionCd: 831
    },
    fields: {
        date: {
        elementCd: "EmphysemaExistingSince",
        questionSetCd: "PEDEmphysemaExistingSince",
        questionCd: 832
        }
    }
    },

    48: {
    main: {
        elementCd: "532",
        questionSetCd: "PEDanyrespiratory",
        questionCd: 833
    },
    fields: {
        further: {
        elementCd: "704",
        questionSetCd: "PEDanyrespiratorydetails",
        questionCd: 704
        },
        date: {
        elementCd: "DanyrespiratoryExistingSince",
        questionSetCd: "PEDanyrespiratoryExistingSince",
        questionCd: 834
        }
    }
    },

    // =========================
    // Q1(e): THYROID
    // =========================

    51: {
    main: {
        elementCd: "533",
        questionSetCd: "PEDhypothyroidism",
        questionCd: 835
    },
    fields: {
        date: {
        elementCd: "hypothyroidismExistingSince",
        questionSetCd: "PEDhypothyroidismExistingSince",
        questionCd: 836
        }
    }
    },

    52: {
    main: {
        elementCd: "534",
        questionSetCd: "PEDhyperthyroidism",
        questionCd: 837
    },
    fields: {
        date: {
        elementCd: "PEDhyperthyroidism",
        questionSetCd: "PEDhyperthyroidismExistingSince",
        questionCd: 838
        }
    }
    },

    53: {
    main: {
        elementCd: "535",
        questionSetCd: "PEDanythyroid",
        questionCd: 839
    },
    fields: {
        further: {
        elementCd: "705",
        questionSetCd: "PEDanythyroiddetails",
        questionCd: 705
        },
        date: {
        elementCd: "anythyroidExistingSince",
        questionSetCd: "PEDanythyroidExistingSince",
        questionCd: 840
        }
    }
    },

    // =========================
    // Q1(f): DIABETES
    // =========================

    61: {
    main: {
        elementCd: "205",
        questionSetCd: "PEDdiabetes",
        questionCd: 841
    },
    fields: {
        date: {
        elementCd: "diabetesExistingSince",
        questionSetCd: "PEDdiabetesExistingSince",
        questionCd: 842
        },
        insulin: {
        elementCd: "543",
        questionSetCd: "PEDtakeinsulin",
        questionCd: 843
        }
    }
    },

    62: {
    main: {
        elementCd: "PEDanycomplications",
        questionSetCd: "PEDdiabetessetcd",
        questionCd: 845
    },
    fields: {
        further: {
        elementCd: "706",
        questionSetCd: "PEDanycomplicationsdetails",
        questionCd: 706
        }
    }
    },

    // =========================
    // Q1(g): BRAIN / NEURO
    // =========================

    71: {
    main: {
        elementCd: "178",
        questionSetCd: "PEDbrainstroke",
        questionCd: 847
    },
    fields: {
        date: {
        elementCd: "brainstrokeExistingSince",
        questionSetCd: "PEDbrainstrokeExistingSince",
        questionCd: 848
        }
    }
    },

    72: {
    main: {
        elementCd: "223",
        questionSetCd: "PEDepilepsy",
        questionCd: 849
    },
    fields: {
        date: {
        elementCd: "epilepsyExistingSince",
        questionSetCd: "PEDepilepsyExistingSince",
        questionCd: 850
        }
    }
    },

    73: {
    main: {
        elementCd: "165",
        questionSetCd: "PEDparkinsondisease",
        questionCd: 851
    },
    fields: {
        date: {
        elementCd: "parkinsondiseaseExistingSince",
        questionSetCd: "PEDparkinsondiseaseExistingSince",
        questionCd: 852
        }
    }
    },

    74: {
    main: {
        elementCd: "523",
        questionSetCd: "PEDcerebralpalsy",
        questionCd: 853
    },
    fields: {
        date: {
        elementCd: "cerebralpalsyExistingSince",
        questionSetCd: "PEDcerebralpalsyExistingSince",
        questionCd: 854
        }
    }
    },

    75: {
    main: {
        elementCd: "159",
        questionSetCd: "PEDmultiplesclerosis",
        questionCd: 855
    },
    fields: {
        date: {
        elementCd: "multiplesclerosisExistingSince",
        questionSetCd: "PEDmultiplesclerosisExistingSince",
        questionCd: 856
        }
    }
    },

    76: {
    main: {
        elementCd: "512",
        questionSetCd: "PEDankylosingspondylitis",
        questionCd: 857
    },
    fields: {
        date: {
        elementCd: "ankylosingspondylitisExistingSince",
        questionSetCd: "PEDankylosingspondylitisExistingSince",
        questionCd: 858
        }
    }
    },

    77: {
    main: {
        elementCd: "177",
        questionSetCd: "PEDintervertebraldisc",
        questionCd: 859
    },
    fields: {
        date: {
        elementCd: "intevertebraldiscExistingSince",
        questionSetCd: "PEDintervertebraldiscExistingSince",
        questionCd: 860
        }
    }
    },

    78: {
    main: {
        elementCd: "536",
        questionSetCd: "PEDanybrain",
        questionCd: 861
    },
    fields: {
        further: {
        elementCd: "707",
        questionSetCd: "PEDanybraindetails",
        questionCd: 707
        },
        date: {
        elementCd: "anybrainExistingSince",
        questionSetCd: "PEDanybrainExistingSince",
        questionCd: 862
        }
    }
    },

    // =========================
    // Q1(h): MENTAL ILLNESS
    // =========================

    81: {
    main: {
        elementCd: "519",
        questionSetCd: "PEDanxietydisorder",
        questionCd: 863
    },
    fields: {
        date: {
        elementCd: "anxietydisorderExistingSince",
        questionSetCd: "PEDanxietydisorderExistingSince",
        questionCd: 864
        }
    }
    },

    82: {
    main: {
        elementCd: "520",
        questionSetCd: "PEDdepression",
        questionCd: 865
    },
    fields: {
        date: {
        elementCd: "depressionExistingSince",
        questionSetCd: "PEDdepressionExistingSince",
        questionCd: 866
        }
    }
    },

    83: {
    main: {
        elementCd: "521",
        questionSetCd: "PEDbipolardisorder",
        questionCd: 867
    },
    fields: {
        date: {
        elementCd: "bipolardisorderExistingSince",
        questionSetCd: "PEDbipolardisorderExistingSince",
        questionCd: 868
        }
    }
    },

    84: {
    main: {
        elementCd: "522",
        questionSetCd: "PEDschizophrenia",
        questionCd: 869
    },
    fields: {
        date: {
        elementCd: "schizophreniaExistingSince",
        questionSetCd: "PEDschizophreniaExistingSince",
        questionCd: 870
        }
    }
    },

    85: {
    main: {
        elementCd: "537",
        questionSetCd: "PEDanymentalillness",
        questionCd: 871
    },
    fields: {
        further: {
        elementCd: "708",
        questionSetCd: "PEDanymentalillnessdetails",
        questionCd: 708
        },
        date: {
        elementCd: "anymentalillnessExistingSince",
        questionSetCd: "PEDanymentalillnessExistingSince",
        questionCd: 872
        }
    }
    },

    // =========================
    // Q1(i): LIVER / PANCREAS
    // =========================

    91: {
    main: {
        elementCd: "516",
        questionSetCd: "PEDfattyliver",
        questionCd: 873
    },
    fields: {
        date: {
        elementCd: "fattyliverExistingSince",
        questionSetCd: "PEDfattyliverExistingSince",
        questionCd: 874
        }
    }
    },

    92: {
    main: {
        elementCd: "517",
        questionSetCd: "PEDpancreatitis",
        questionCd: 875
    },
    fields: {
        date: {
        elementCd: "pancreatitisExistingSince",
        questionSetCd: "PEDpancreatitisExistingSince",
        questionCd: 876
        }
    }
    },

    93: {
    main: {
        elementCd: "128",
        questionSetCd: "PEDliverdisease",
        questionCd: 877
    },
    fields: {
        date: {
        elementCd: "liverdiseaseExistingSince",
        questionSetCd: "PEDliverdiseaseExistingSince",
        questionCd: 878
        }
    }
    },

    94: {
    main: {
        elementCd: "228",
        questionSetCd: "PEDhepatitis",
        questionCd: 879
    },
    fields: {
        date: {
        elementCd: "hepatitisExistingSince",
        questionSetCd: "PEDhepatitisExistingSince",
        questionCd: 880
        }
    }
    },

    95: {
    main: {
        elementCd: "518",
        questionSetCd: "PEDwilsondisease",
        questionCd: 881
    },
    fields: {
        date: {
        elementCd: "wilsondiseaseExistingSince",
        questionSetCd: "PEDwilsondiseaseExistingSince",
        questionCd: 882
        }
    }
    },

    96: {
    main: {
        elementCd: "538",
        questionSetCd: "PEDanypancreatitis",
        questionCd: 883
    },
    fields: {
        further: {
        elementCd: "709",
        questionSetCd: "PEDanypancreatitisdetails",
        questionCd: 709
        },
        date: {
        elementCd: "anypancreatitisExistingSince",
        questionSetCd: "PEDanypancreatitisExistingSince",
        questionCd: 884
        }
    }
    },

    // =========================
    // Q1(j): KIDNEY / URINARY
    // =========================

    101: {
    main: {
        elementCd: "152",
        questionSetCd: "PEDkidney",
        questionCd: 885
    },
    fields: {
        date: {
        elementCd: "kidneyExistingSince",
        questionSetCd: "PEDkidneyExistingSince",
        questionCd: 886
        }
    }
    },

    102: {
    main: {
        elementCd: "129",
        questionSetCd: "PEDrenalfailure",
        questionCd: 887
    },
    fields: {
        date: {
        elementCd: "renalfailureExistingSince",
        questionSetCd: "PEDrenalfailureExistingSince",
        questionCd: 888
        }
    }
    },

    103: {
    main: {
        elementCd: "257",
        questionSetCd: "PEDprostatedisorder",
        questionCd: 889
    },
    fields: {
        date: {
        elementCd: "prostatedisorderExistingSince",
        questionSetCd: "PEDprostatedisorderExistingSince",
        questionCd: 890
        }
    }
    },

    104: {
    main: {
        elementCd: "539",
        questionSetCd: "PEDanykidney",
        questionCd: 891
    },
    fields: {
        further: {
        elementCd: "710",
        questionSetCd: "PEDanykidneydetails",
        questionCd: 710
        },
        date: {
        elementCd: "anyKidneyExistingSince",
        questionSetCd: "PEDanykidneyExistingSince",
        questionCd: 892
        }
    }
    },

    // =========================
    // Q1(k): BLOOD DISORDER
    // =========================

    111: {
    main: {
        elementCd: "213",
        questionSetCd: "PEDanemia",
        questionCd: 893
    },
    fields: {
        date: {
        elementCd: "anemiaExistingSince",
        questionSetCd: "PEDanemiaExistingSince",
        questionCd: 894
        }
    }
    },

    112: {
    main: {
        elementCd: "513",
        questionSetCd: "PEDhemophilia ",
        questionCd: 895
    },
    fields: {
        date: {
        elementCd: "hemophiliaExistingSince",
        questionSetCd: "PEDhemophiliaExistingSince ",
        questionCd: 896
        }
    }
    },

    113: {
    main: {
        elementCd: "ExistingSince",
        questionSetCd: "PEDbloodclot",
        questionCd: 897
    },
    fields: {
        date: {
        elementCd: "bloodclotExistingSince",
        questionSetCd: "PEDbloodclotExistingSince",
        questionCd: 898
        }
    }
    },

    114: {
    main: {
        elementCd: "515",
        questionSetCd: "PEDthalassemia",
        questionCd: 899
    },
    fields: {
        date: {
        elementCd: "thalassemiaExistingSince",
        questionSetCd: "PEDthalassemiaExistingSince",
        questionCd: 900
        }
    }
    },

    115: {
    main: {
        elementCd: "540",
        questionSetCd: "PEDanyblooddisorder",
        questionCd: 901
    },
    fields: {
        further: {
        elementCd: "711",
        questionSetCd: "PEDanyblooddisorderdetails",
        questionCd: 711
        },
        date: {
        elementCd: "anyblooddisorderExistingSince",
        questionSetCd: "PEDanyblooddisorderExistingSince",
        questionCd: 902
        }
    }
    },

    // =========================
    // Q1(l): AUTOIMMUNE
    // =========================

    121: {
    main: {
        elementCd: "510",
        questionSetCd: "PEDrheumatoidarthritis",
        questionCd: 903
    },
    fields: {
        date: {
        elementCd: "rheumatoidarthritisExistingSince",
        questionSetCd: "PEDrheumatoidarthritisExistingSince",
        questionCd: 904
        }
    }
    },

    122: {
    main: {
        elementCd: "511",
        questionSetCd: "PEDlupus",
        questionCd: 905
    },
    fields: {
        date: {
        elementCd: "lupusExistingSince",
        questionSetCd: "PEDlupusExistingSince",
        questionCd: 906
        }
    }
    },

    123: {
    main: {
        elementCd: "159",
        questionSetCd: "PEDmultiplesclerosis",
        questionCd: 907
    },
    fields: {
        date: {
        elementCd: "multiplesclerosisExistingSince",
        questionSetCd: "PEDmultiplesclerosisExistingSince",
        questionCd: 908
        }
    }
    },

    124: {
    main: {
        elementCd: "541",
        questionSetCd: "PEDanyautoimmune",
        questionCd: 911
    },
    fields: {
        further: {
        elementCd: "712",
        questionSetCd: "PEDanyautoimmunedetails",
        questionCd: 712
        },
        date: {
        elementCd: "anyautoimmuneExistingSince",
        questionSetCd: "PEDanyautoimmuneExistingSince",
        questionCd: 912
        }
    }
    },

    // =========================
    // Q1(m): STD (SEXUALLY TRANSMITTED)
    // =========================

    131: {
    main: {
        elementCd: "147",
        questionSetCd: "PEDhiv",
        questionCd: 913
    },
    fields: {
        date: {
        elementCd: "hivExistingSince",
        questionSetCd: "PEDhivExistingSince",
        questionCd: 914
        }
    }
    },

    132: {
    main: {
        elementCd: "508",
        questionSetCd: "PEDsyphlis",
        questionCd: 915
    },
    fields: {
        date: {
        elementCd: "syphlisExistingSince",
        questionSetCd: "PEDsyphlisExistingSince",
        questionCd: 916
        }
    }
    },

    133: {
    main: {
        elementCd: "509",
        questionSetCd: "PEDgonorrhea",
        questionCd: 917
    },
    fields: {
        date: {
        elementCd: "gonorrheaExistingSince",
        questionSetCd: "PEDgonorrheaExistingSince",
        questionCd: 918
        }
    }
    },

    134: {
    main: {
        elementCd: "542",
        questionSetCd: "PEDanysexually",
        questionCd: 919
    },
    fields: {
        further: {
        elementCd: "713",
        questionSetCd: "PEDanysexuallydetails",
        questionCd: 713
        },
        date: {
        elementCd: "anysexuallyExistingSince",
        questionSetCd: "PEDanysexuallyExistingSince",
        questionCd: 920
        }
    }
    },

    // =========================
    // Q1(n): OBESITY / ANY OTHER
    // =========================

    141: {
    main: {
        elementCd: "161",
        questionSetCd: "PEDobesity",
        questionCd: 733
    },
    fields: {
        obesity: {
        elementCd: "ObesityRadio",
        questionSetCd: "PEDobesity",
        questionCd: 736
        }
    }
    },

    142: {
    main: {
        elementCd: "210",
        questionSetCd: "PEDanyother",
        questionCd: 921
    },
    fields: {
        date: {
        elementCd: "anyotherExistingSince",
        questionSetCd: "PEDanyotherExistingSince",
        questionCd: 922
        },
        further: {
        elementCd: "714",
        questionSetCd: "PEDanyotherdetails",
        questionCd: 714
        }
    }
    },

    // =========================
    // Q2: DIAGNOSTIC TEST
    // =========================

    151: {
    main: {
        elementCd: "H070",
        questionSetCd: "HEDdiagnostictest",
        questionCd: 923
    },
    fields: {
        date: {
        elementCd: "H070diagnostictestsince",
        questionSetCd: "HEDdiagnostictestsince",
        questionCd: 729
        },
        specify: {
        elementCd: "H900",
        questionSetCd: "HEDdiagnostictestdetails",
        questionCd: 715
        }
    }
    },

    // =========================
    // Q3: DOCTOR CONSULTATION
    // =========================

    161: {
    main: {
        elementCd: "H069",
        questionSetCd: "HEDconsulteddoctorsixmonth",
        questionCd: 924
    },
    fields: {
        specify: {
        elementCd: "H901",
        questionSetCd: "HEDconsulteddoctorsixmonthdetails",
        questionCd: 716
        }
    }
    },

    // =========================
    // Q4: LIFESTYLE (SMOKE)
    // =========================


    171: {
    main: {
        elementCd: "H068",   // ya jo API expect karti hai
        questionSetCd: "HEDsmoke",
        questionCd: 925
    },
    fields: {
        smoke: {
        elementCd: "H068",
        questionSetCd: "HEDsmoke",
        questionCd: 925
        }
    }
    },

    // =========================
    // Q4(a): ALCOHOL
    // =========================

    181: {
    main: {
        elementCd: "H068beer",
        questionSetCd: "HEDbeer",
        questionCd: 927
    },
    fields: {
        frequency: {
        elementCd: "H068beerfrequency",
        questionSetCd: "HEDbeerfrequency",
        questionCd: 929
        },
        unit: {
        elementCd: "H068beerunitofmeasure",
        questionSetCd: "HEDbeerunitofmeasure",
        questionCd: 930
        },
        volume: {
        elementCd: "H068beervolume",
        questionSetCd: "HEDbeervolume",
        questionCd: 721
        }
    }
    },

    182: {
    main: {
        elementCd: "H068whisky",
        questionSetCd: "HEDwhisky",
        questionCd: 931
    },
    fields: {
        frequency: {
        elementCd: "H068whiskyfrequency",
        questionSetCd: "HEDwhiskyfrequency",
        questionCd: 933
        },
        unit: {
        elementCd: "H068whiskyunitofmeasure",
        questionSetCd: "HEDwhiskyunitofmeasure",
        questionCd: 934
        },
        volume: {
        elementCd: "H068whiskyvolume",
        questionSetCd: "HEDwhiskyvolume",
        questionCd: 722
        }
    }
    },

    183: {
    main: {
        elementCd: "H068wine",
        questionSetCd: "HEDwine",
        questionCd: 943
    },
    fields: {
        frequency: {
        elementCd: "H068winefrequency",
        questionSetCd: "HEDwinefrequency",
        questionCd: 945
        },
        unit: {
        elementCd: "H068wineunitofmeasure",
        questionSetCd: "HEDwineunitofmeasure",
        questionCd: 946
        },
        volume: {
        elementCd: "H068winevolume",
        questionSetCd: "HEDwinevolume",
        questionCd: 725
        }
    }
    },

    // =========================
    // Q4(b): TOBACCO
    // =========================

    191: {
    main: {
        elementCd: "H068tobacco",
        questionSetCd: "HEDtobacco",
        questionCd: 952
    },
    fields: {
        date: {
        elementCd: "H068tobaccosince",
        questionSetCd: "HEDtobaccosince",
        questionCd: 953
        },
        frequency: {
        elementCd: "H068tobaccofrequency",
        questionSetCd: "HEDtobaccofrequency",
        questionCd: 954
        },
        quantity: {
        elementCd: "H068tobaccovolume",
        questionSetCd: "HEDtobaccovolume",
        questionCd: 727
        }
    }
    },

    // =========================
    // Q4(c): SMOKING
    // =========================

    201: {
    main: {
        elementCd: "H068bidi",
        questionSetCd: "HEDbidi",
        questionCd: 969
    },
    fields: {
        date: {
        elementCd: "H068bidisince",
        questionSetCd: "HEDbidisince",
        questionCd: 970
        },
        frequency: {
        elementCd: "H068bidifrequency",
        questionSetCd: "HEDbidifrequency",
        questionCd: 971
        },
        quantity: {
        elementCd: "H068bidivolume",
        questionSetCd: "HEDbidivolume",
        questionCd: 972
        }
    }
    },
        // =========================
    // Q4(d): RECREATIONAL DRUGS
    // =========================

    211: {
    main: {
        elementCd: "H068recreationaldrugs1",
        questionSetCd: "HEDrecreationaldrugs",
        questionCd: 986
    },
    fields: {
        drugs: {
        elementCd: "H068recreationaldrugssince",
        questionSetCd: "HEDrecreationaldrugssince",
        questionCd: 987
        }
    }
    },

    // =========================
    // Q5: CLAIM FILED
    // =========================

    221: {
    main: {
        elementCd: "H002",
        questionSetCd: "HEDclaimfiled",
        questionCd: 930
    },
    fields: {
        date: {
        elementCd: "H002claimfiledsince",
        questionSetCd: "HEDclaimfiledsince",
        questionCd: 730
        },
        specify: {
        elementCd: "H902",
        questionSetCd: "HEDclaimfileddetails",
        questionCd: 717
        }
    }
    },

    // =========================
    // Q6: DECLINED / CANCELLED
    // =========================

    231: {
    main: {
        elementCd: "H003",
        questionSetCd: "HEDdeclinedorcancelled",
        questionCd: 991
    },
    fields: {
        specify: {
        elementCd: "H903",
        questionSetCd: "HEDdeclinedorcancelleddetails",
        questionCd: 718
        }
    }
    },

    // =========================
    // Q7: COVERED UNDER POLICY
    // =========================

    241: {
    main: {
        elementCd: "H004",
        questionSetCd: "HEDcoveredundercare",
        questionCd: 992
    },
    fields: {
        specify: {
        elementCd: "H904",
        questionSetCd: "HEDcoveredundercaredetails",
        questionCd: 719
        }
    }
    },

    // =========================
    // Q8: POLITICALLY EXPOSED
    // =========================

    251: {
    main: {
        elementCd: "H067",
        questionSetCd: "HEDpoliticallyexposed",
        questionCd: 993
    },
    fields: {
        specify: {
        elementCd: "H905",
        questionSetCd: "HEDpoliticallyexposeddetails",
        questionCd: 720
        }
    }
    },

    // =========================
    // Q9: DISABILITY
    // =========================

    261: {
    main: {
        elementCd: "H066",
        questionSetCd: "HEDdisability",
        questionCd: 994
    },
    fields: {
        impairmentType: {
        elementCd: "H066impairement",
        questionSetCd: "HEDimpairement",
        questionCd: 995
        },
        impairmentPercent: {
        elementCd: "H066percentageimpairement",
        questionSetCd: "HEDpercentageimpairement",
        questionCd: 996
        },
        udid: {
        elementCd: "H066udid",
        questionSetCd: "HEDudid",
        questionCd: 997
        }
    },
    },
        
}
}
}

export default questionCode;