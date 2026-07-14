"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SaathiBharatNetwork from "./saathi-bharat-network";
import { SiteFooter } from "@/components/site-footer";
import { TrustCompliance } from "@/components/trust-compliance";

const TRANSLATIONS = {
  en: {
    discussionUrl: "https://wa.me/919625727372?text=" + encodeURIComponent("Hi ANSH Apps — I'd like to talk about becoming an ANSH Saathi."),
    bookDiscussion: "Book a Discussion",
    becomeSaathi: "Become a Saathi",
    alreadySaathi: "Already a Saathi",
    backHome: "Back to Home",
    anshSaathi: "ANSH Saathi",
    becomeAn: "Become an",
    saathChalein: "Saath Chalein. Saath Badhein.",
    heroDesc: "Walk alongside Indian businesses. Help MSMEs grow with simple software — and build your own recurring income on the same journey.",
    affiliateNote: "ANSH Saathi is not an affiliate program. Saathis walk with businesses — generate leads, demo products, and close customers. Founding Saathi benefits are limited to the first 20 approved members.",
    whatSaathiMeans: "What Saathi Means",
    saathiDefinitionTitle: "In India, a Saathi is not just a partner.",
    saathiDefinitionDesc1: "A Saathi is someone who walks alongside you, supports your journey, and grows together with you.",
    saathiDefinitionDesc2: "ANSH Saathi represents people who believe in supporting Indian businesses — helping MSMEs discover better ways of working, while building their own recurring income. This is about connection, trust, and shared growth — not just commissions.",
    aboutAnshTitle: "About ANSH Apps",
    aboutAnshDesc: "Simple, affordable business software for MSMEs and growing businesses.",
    aboutAnshSub: "Built for Bharat. Ready for the World.",
    aboutAnshFooter: "You walk with the customer. We build and support the software.",
    whyBecomeSaathi: "Why Become a Saathi?",
    whyBecomeSaathiDesc: "Grow with Bharat's businesses — not just from them",
    foundingOffer: "Founding Saathi Offer",
    commissionStructure: "Commission Structure",
    commissionLimit: "Limited to the first 20 Saathis only.",
    months1to12: "Months 1–12",
    commissionDesc1: "Recurring commission on active subscriptions",
    months13onwards: "Month 13 onwards",
    commissionDesc2: "Recurring commission thereafter",
    example: "Example",
    customerPays: "Customer pays",
    earnsMonths1to12: "Saathi earns",
    earnsMonths13onwards: "Saathi earns",
    asAnshSaathi: "As an ANSH Saathi",
    whatYouDo: "What you do",
    whatAnshHandles: "What ANSH Handles",
    whatWeDo: "What we do",
    weBuildSupport: "“You walk with the customer. We build and support the software.”",
    whoCanBecomeSaathi: "Who Can Become a Saathi?",
    anyoneCanBecome: "Anyone can become an ANSH Saathi",
    builtForPeople: "Built for people who stand with Bharat's businesses",
    noTechBackground: "No technical background required. If you help businesses solve problems, create opportunities, or grow, you can become an ANSH Saathi.",
    togetherSmarterBharat: "Together, let's build a smarter Bharat.",
    saathiJourney: "Saathi Journey",
    journeyDesc: "From apply to grow together",
    faq: "FAQ",
    frequentlyAskedQuestions: "Frequently Asked Questions",
    trustLabel: "Trust & Compliance",
    trustTitle: "ANSH Apps",
    trustTagline: "Built for Bharat, ready for the world",
    trustDescription:
      "ANSH Apps is a Government of India MSME-registered software company building simple, affordable, and modern business software for teams, startups, and growing businesses.",
    trustMsmeTitle: "MSME Registered Enterprise",
    trustMsmeSubtitle: "Government of India Udyam Registered",
    trustUdyamLabel: "Udyam Registration Number",
    trustGstinLabel: "GSTIN",
    joinAnshSaathi: "Join ANSH Saathi",
    applyFoundingSaathi: "Apply to become a Founding Saathi",
    applyDesc: "Tell us about yourself and why you want to walk this journey with ANSH. We review every application and reach out with next steps for training and onboarding.",
    applyCheck1: "No joining fee",
    applyCheck2: "First 20 founding Saathis only will get 40% commission for first year",
    applyCheck3: "Training and sales materials included",
    formFullName: "Full Name *",
    formFullNamePlaceholder: "Your full name",
    formCompanyName: "Company Name",
    formCompanyNamePlaceholder: "Your company",
    formEmail: "Email Address *",
    formEmailPlaceholder: "you@company.com",
    formPhone: "Phone Number *",
    formPhonePlaceholder: "10-digit number",
    formCity: "City *",
    formCityPlaceholder: "Your city",
    formWebsite: "Website / LinkedIn Profile",
    formWebsitePlaceholder: "Website or LinkedIn URL",
    formBusinessType: "Profession Type *",
    formBusinessTypePlaceholder: "Select profession type",
    formExperience: "Experience in Sales or Consulting",
    formExperiencePlaceholder: "Briefly share your relevant experience",
    formWhySaathi: "Why do you want to become an ANSH Saathi? *",
    formWhySaathiPlaceholder: "Share what draws you to this journey — supporting MSMEs, building income, or growing with Bharat",
    btnSubmit: "Apply to Become a Saathi",
    btnSubmitting: "Sending...",
    submitSuccessTitle: "Welcome to the journey",
    submitSuccessDesc: "Thank you, {name}. We'll review your Saathi application and get back to you soon.",
    btnScheduleCall: "Schedule a Call",
    readyToWalk: "Ready to walk this journey with ANSH?",
    readyToWalkDesc: "Join the Founding ANSH Saathi circle. Support Indian businesses with better software — and grow your recurring income alongside them.",
    scheduleCall: "Schedule a Call",
    validation: {
      fullName: "Please enter your full name",
      email: "Please enter a valid email address",
      phone: "Please enter a valid 10-digit phone number",
      city: "Please enter your city",
      businessType: "Please select your business type",
      whyPartner: "Please tell us why you want to become a Saathi"
    },

    // Arrays
    highlights: [
      "40% Recurring Commission for the First 12 Months",
      "25% Recurring Commission Thereafter",
      "Limited to the First 20 Founding Saathis",
      "No Joining Fee",
    ],
    products: [
      "ANSH Tasks",
      "ANSH HR",
      "ANSH Expense",
      "ANSH Visitor",
      "ANSH Forms",
      "ANSH Links",
    ],
    benefits: [
      "Walk alongside Indian businesses as they grow",
      "Earn recurring income while creating real impact",
      "Help MSMEs adopt simple, affordable software",
      "Dedicated Saathi support from ANSH",
      "Product training and sales materials provided",
      "Multiple products to share and cross-sell",
      "A long-term journey of growing together",
    ],
    responsibilities: [
      "Generate leads",
      "Identify business opportunities",
      "Demo ANSH products",
      "Close customers",
      "Maintain customer relationships",
    ],
    anshHandles: [
      "Product development",
      "Hosting and infrastructure",
      "Customer support",
      "Product updates",
      "Training",
      "Documentation",
      "Onboarding assistance",
      "Social media and marketing",
    ],
    journey: [
      { step: "01", title: "Apply as a Saathi" },
      { step: "02", title: "Application Review" },
      { step: "03", title: "Training & Onboarding" },
      { step: "04", title: "Start Supporting Businesses" },
      { step: "05", title: "Grow Together" },
    ],
    faqs: [
      { q: "Is there any joining fee?", a: "No. Becoming an ANSH Saathi is completely free." },
      { q: "Do I need technical knowledge?", a: "No. Basic understanding of business software is sufficient." },
      { q: "How are commissions paid?", a: "Commissions are paid on active customer subscriptions." },
      { q: "Will I receive training?", a: "Yes. Product training and sales materials are provided." },
      { q: "Can I sell multiple ANSH products?", a: "Yes. Saathis can share all current and future ANSH Apps products." },
      { q: "Is the 40% commission permanent?", a: "40% applies for the first 12 months. After that, 25% recurring commission applies." },
    ],
    businessTypes: [
      "Student",
      "Business Consultant",
      "CA Firm",
      "HR Consultant",
      "Digital Marketing Agency",
      "IT Service Provider",
      "Freelancer",
      "Startup Advisor",
      "ERP / Software Consultant",
      "Other",
    ]
  },
  hi: {
    discussionUrl: "https://wa.me/919625727372?text=" + encodeURIComponent("नमस्ते ANSH Apps — मैं ANSH साथी बनने के बारे में चर्चा करना चाहता हूँ।"),
    bookDiscussion: "चर्चा बुक करें",
    becomeSaathi: "साथी बनें",
    alreadySaathi: "पहले से साथी हैं?",
    backHome: "होम पर वापस जाएं",
    anshSaathi: "ANSH साथी",
    becomeAn: "बनें",
    saathChalein: "साथ चलें। साथ बढ़ें।",
    heroDesc: "भारतीय व्यवसायों के साथ चलें। सरल सॉफ़्टवेयर के साथ MSMEs को आगे बढ़ने में मदद करें — और उसी यात्रा पर अपनी खुद की आवर्ती आय (recurring income) बनाएं।",
    affiliateNote: "ANSH साथी कोई एफिलिएट प्रोग्राम नहीं है। साथी व्यवसायों के साथ चलते हैं — लीड उत्पन्न करते हैं, उत्पादों का डेमो देते हैं, और ग्राहकों को क्लोज करते हैं। संस्थापक साथी के लाभ केवल पहले 20 स्वीकृत सदस्यों तक सीमित हैं।",
    whatSaathiMeans: "साथी का अर्थ",
    saathiDefinitionTitle: "भारत में, साथी केवल एक पार्टनर नहीं होता।",
    saathiDefinitionDesc1: "एक साथी वह होता है जो आपके साथ चलता है, आपकी यात्रा का समर्थन करता है, और मिलकर आपके साथ आगे बढ़ता है।",
    saathiDefinitionDesc2: "ANSH साथी उन लोगों का प्रतिनिधित्व करता है जो भारतीय व्यवसायों का समर्थन करने में विश्वास रखते हैं — MSMEs को काम करने के बेहतर तरीकों की खोज करने में मदद करते हुए, अपनी खुद की आवर्ती आय का निर्माण करते हैं। यह कनेक्शन, विश्वास और साझा विकास के बारे में है — केवल कमीशन के बारे में नहीं।",
    aboutAnshTitle: "ANSH ऐप्स के बारे में",
    aboutAnshDesc: "MSMEs और बढ़ते व्यवसायों के लिए सरल, किफायती व्यावसायिक सॉफ़्टवेयर।",
    aboutAnshSub: "भारत के लिए निर्मित। विश्व के लिए तैयार।",
    aboutAnshFooter: "आप ग्राहक के साथ चलते हैं। हम सॉफ़्टवेयर का निर्माण और समर्थन करते हैं।",
    whyBecomeSaathi: "साथी क्यों बनें?",
    whyBecomeSaathiDesc: "भारत के व्यवसायों के साथ बढ़ें — केवल उनसे नहीं",
    foundingOffer: "संस्थापक साथी ऑफर",
    commissionStructure: "कमीशन संरचना",
    commissionLimit: "केवल पहले 20 साथियों तक सीमित।",
    months1to12: "महीने 1–12",
    commissionDesc1: "सक्रिय ग्राहक सब्सक्रिप्शन पर आवर्ती कमीशन (recurring commission)",
    months13onwards: "महीने 13 से आगे",
    commissionDesc2: "उसके बाद आवर्ती कमीशन (recurring commission)",
    example: "उदाहरण",
    customerPays: "ग्राहक भुगतान करता है",
    earnsMonths1to12: "साथी कमाता है",
    earnsMonths13onwards: "साथी कमाता है",
    asAnshSaathi: "ANSH साथी के रूप में",
    whatYouDo: "आप क्या करते हैं",
    whatAnshHandles: "ANSH क्या संभालता है",
    whatWeDo: "हम क्या करते हैं",
    weBuildSupport: "“आप ग्राहक के साथ चलते हैं। हम सॉफ़्टवेयर का निर्माण और समर्थन करते हैं।”",
    whoCanBecomeSaathi: "साथी कौन बन सकता है?",
    anyoneCanBecome: "कोई भी ANSH साथी बन सकता है",
    builtForPeople: "उन लोगों के लिए निर्मित जो भारत के व्यवसायों के साथ खड़े हैं",
    noTechBackground: "किसी तकनीकी पृष्ठभूमि की आवश्यकता नहीं है। यदि आप व्यवसायों को समस्याओं को हल करने, अवसर पैदा करने या बढ़ने में मदद करते हैं, तो आप ANSH साथी बन सकते हैं।",
    togetherSmarterBharat: "आइए मिलकर एक स्मार्ट भारत का निर्माण करें।",
    saathiJourney: "साथी यात्रा",
    journeyDesc: "आवेदन से लेकर मिलकर बढ़ने तक",
    faq: "सामान्य प्रश्न",
    frequentlyAskedQuestions: "अक्सर पूछे जाने वाले प्रश्न",
    trustLabel: "विश्वास और अनुपालन",
    trustTitle: "ANSH Apps",
    trustTagline: "भारत के लिए निर्मित, दुनिया के लिए तैयार",
    trustDescription:
      "ANSH Apps भारत सरकार की MSME-पंजीकृत सॉफ़्टवेयर कंपनी है जो टीमों, स्टार्टअप्स और बढ़ते व्यवसायों के लिए सरल, किफायती और आधुनिक व्यावसायिक सॉफ़्टवेयर बनाती है।",
    trustMsmeTitle: "MSME पंजीकृत उद्यम",
    trustMsmeSubtitle: "भारत सरकार उद्यम पंजीकृत",
    trustUdyamLabel: "उद्यम पंजीकरण संख्या",
    trustGstinLabel: "GSTIN",
    joinAnshSaathi: "ANSH साथी से जुड़ें",
    applyFoundingSaathi: "संस्थापक साथी बनने के लिए आवेदन करें",
    applyDesc: "हमें अपने बारे में बताएं और आप ANSH के साथ इस यात्रा पर क्यों चलना चाहते हैं। हम प्रत्येक आवेदन की समीक्षा करते हैं और प्रशिक्षण और ऑनबोर्डिंग के लिए अगले कदमों के साथ संपर्क करते हैं।",
    applyCheck1: "कोई ज्वाइनिंग फीस नहीं",
    applyCheck2: "केवल पहले 20 संस्थापक साथी",
    applyCheck3: "प्रशिक्षण और बिक्री सामग्री शामिल",
    formFullName: "पूरा नाम *",
    formFullNamePlaceholder: "आपका पूरा नाम",
    formCompanyName: "कंपनी का नाम",
    formCompanyNamePlaceholder: "आपकी कंपनी",
    formEmail: "ईमेल पता *",
    formEmailPlaceholder: "you@company.com",
    formPhone: "फ़ोन नंबर *",
    formPhonePlaceholder: "10-अंकीय नंबर",
    formCity: "शहर *",
    formCityPlaceholder: "आपका शहर",
    formWebsite: "वेबसाइट / लिंक्डइन प्रोफाइल",
    formWebsitePlaceholder: "वेबसाइट या लिंक्डइन यूआरएल",
    formBusinessType: "पेशा / प्रोफेशन का प्रकार *",
    formBusinessTypePlaceholder: "प्रोफेशन का प्रकार चुनें",
    formExperience: "बिक्री या परामर्श में अनुभव",
    formExperiencePlaceholder: "संक्षेप में अपना प्रासंगिक अनुभव साझा करें",
    formWhySaathi: "आप ANSH साथी क्यों बनना चाहते हैं? *",
    formWhySaathiPlaceholder: "साझा करें कि क्या आपको इस यात्रा की ओर आकर्षित करता है — MSMEs का समर्थन करना, आय का निर्माण करना, या भारत के साथ बढ़ना",
    btnSubmit: "साथी बनने के लिए आवेदन करें",
    btnSubmitting: "भेज रहा है...",
    submitSuccessTitle: "यात्रा में आपका स्वागत है",
    submitSuccessDesc: "धन्यवाद, {name}। हम आपके साथी आवेदन की समीक्षा करेंगे और जल्द ही आपसे संपर्क करेंगे।",
    btnScheduleCall: "कॉल शेड्यूल करें",
    readyToWalk: "ANSH के साथ इस यात्रा पर चलने के लिए तैयार हैं?",
    readyToWalkDesc: "संस्थापक ANSH साथी सर्कल में शामिल हों। बेहतर सॉफ़्टवेयर के साथ भारतीय व्यवसायों का समर्थन करें — और उनके साथ अपनी आवर्ती आय बढ़ाएं।",
    scheduleCall: "कॉल शेड्यूल करें",
    validation: {
      fullName: "कृपया अपना पूरा नाम दर्ज करें",
      email: "कृपया एक मान्य ईमेल पता दर्ज करें",
      phone: "कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें",
      city: "कृपया अपना शहर दर्ज करें",
      businessType: "कृपया अपना व्यवसाय प्रकार चुनें",
      whyPartner: "कृपया हमें बताएं कि आप साथी क्यों बनना चाहते हैं"
    },

    // Arrays
    highlights: [
      "पहले 12 महीनों के लिए 40% आवर्ती कमीशन",
      "उसके बाद 25% आवर्ती कमीशन",
      "पहले 20 संस्थापक साथियों तक सीमित",
      "कोई ज्वाइनिंग फीस नहीं",
    ],
    products: [
      "ANSH Tasks",
      "ANSH HR",
      "ANSH Expense",
      "ANSH Visitor",
      "ANSH Forms",
      "ANSH Links",
    ],
    benefits: [
      "भारतीय व्यवसायों के बढ़ने के साथ-साथ उनके साथ चलें",
      "वास्तविक प्रभाव पैदा करते हुए आवर्ती आय अर्जित करें",
      "MSMEs को सरल, किफायती सॉफ़्टवेयर अपनाने में मदद करें",
      "ANSH से समर्पित साथी सहायता",
      "उत्पाद प्रशिक्षण और बिक्री सामग्री प्रदान की जाती है",
      "साझा करने और क्रॉस-सेल करने के लिए कई उत्पाद",
      "मिलकर बढ़ने की एक दीर्घकालिक यात्रा",
    ],
    responsibilities: [
      "लीड उत्पन्न करना",
      "व्यावसायिक अवसरों की पहचान करना",
      "ANSH उत्पादों का डेमो देना",
      "ग्राहकों को क्लोज करना",
      "ग्राहक संबंध बनाए रखना",
    ],
    anshHandles: [
      "उत्पाद विकास",
      "होस्टिंग और इंफ्रास्ट्रक्चर",
      "ग्राहक सहायता",
      "उत्पाद अपडेट",
      "प्रशिक्षण",
      "दस्तावेज़ीकरण",
      "ऑनबोर्डिंग सहायता",
      "सोशल मीडिया और मार्केटिंग",
    ],
    journey: [
      { step: "01", title: "साथी के रूप में आवेदन करें" },
      { step: "02", title: "आवेदन की समीक्षा" },
      { step: "03", title: "प्रशिक्षण और ऑनबोर्डिंग" },
      { step: "04", title: "व्यवसायों का समर्थन शुरू करें" },
      { step: "05", title: "मिलकर बढ़ें" },
    ],
    faqs: [
      { q: "क्या कोई ज्वाइनिंग फीस है?", a: "नहीं। ANSH साथी बनना पूरी तरह से मुफ्त है।" },
      { q: "क्या मुझे तकनीकी ज्ञान की आवश्यकता है?", a: "नहीं। व्यावसायिक सॉफ़्टवेयर की बुनियादी समझ पर्याप्त है।" },
      { q: "कमिशन का भुगतान कैसे किया जाता है?", a: "सक्रिय ग्राहक सब्सक्रिप्शन पर कमीशन का भुगतान किया जाता है।" },
      { q: "क्या मुझे प्रशिक्षण मिलेगा?", a: "हाँ। उत्पाद प्रशिक्षण और बिक्री सामग्री प्रदान की जाती है।" },
      { q: "क्या मैं कई ANSH उत्पाद बेच सकता हूँ?", a: "हाँ। साथी सभी वर्तमान और भविष्य के ANSH ऐप्स उत्पादों को साझा कर सकते हैं।" },
      { q: "क्या 40% कमीशन स्थायी है?", a: "40% पहले 12 महीनों के लिए लागू होता है। उसके बाद, 25% आवर्ती कमीशन लागू होता है।" },
    ],
    businessTypes: [
      "छात्र (Student)",
      "व्यावसायिक सलाहकार (Business Consultant)",
      "सीए फर्म (CA Firm)",
      "एचआर सलाहकार (HR Consultant)",
      "डिजिटल मार्केटिंग एजेंसी",
      "आईटी सेवा प्रदाता (IT Service Provider)",
      "फ्रीलांसर (Freelancer)",
      "स्टार्टअप सलाहकार",
      "ईआरपी / सॉफ्टवेयर सलाहकार",
      "अन्य (Other)",
    ]
  }
};

type FormState = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
  website: string;
  businessType: string;
  experience: string;
  whyPartner: string;

  // Step 2: Bank details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;

  // Step 3: Important documents & confirmations
  aadhaarNumber: string;
  aadhaarCardUrl: string;
  panNumber: string;
  panCardUrl: string;
  is18Plus: boolean;
  hasLaptopAndInternet: boolean;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  pincode: "",
  city: "",
  state: "",
  address: "",
  website: "",
  businessType: "",
  experience: "",
  whyPartner: "",

  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  upiId: "",

  aadhaarNumber: "",
  aadhaarCardUrl: "",
  panNumber: "",
  panCardUrl: "",
  is18Plus: false,
  hasLaptopAndInternet: false,
};

export default function SaathiClient() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [formStep, setFormStep] = useState(1);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]); // Re-observe when translations re-render elements

  useEffect(() => {
    if (!isLangOpen) return;
    const handleClose = () => setIsLangOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isLangOpen]);

  useEffect(() => {
    // Force dark mode on the landing page so it never follows light mode overrides
    const html = document.documentElement;
    html.classList.remove("light");
    html.classList.add("dark");

    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const val = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePincodeChange = async (val: string) => {
    const cleanVal = val.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: cleanVal }));

    if (formErrors.pincode) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.pincode;
        return next;
      });
    }

    if (cleanVal.length === 6) {
      setLoadingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanVal}`);
        const data = await res.json();
        if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: po.District || "",
            state: po.State || "",
            address: po.Name || "",
          }));

          // Clear errors for auto-filled inputs
          setFormErrors((prev) => {
            const next = { ...prev };
            delete next.city;
            delete next.state;
            delete next.address;
            return next;
          });
        }
      } catch {
        /* silent */
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // Only compress images (PDFs or other docs are uploaded untouched)
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Limit max dimensions to 1200px
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 70% quality compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                console.log(`[Upload Compression] Reduced ${file.name} from ${(file.size / 1024).toFixed(1)}KB to ${(compressedFile.size / 1024).toFixed(1)}KB`);
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.7
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: "aadhaar" | "pan") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitError("");
    if (docType === "aadhaar") {
      setUploadingAadhaar(true);
    } else {
      setUploadingPan(true);
    }

    try {
      const compressedFile = await compressImage(file);
      const uploadData = new FormData();
      uploadData.append("file", compressedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFormData((prev) => ({
        ...prev,
        [docType === "aadhaar" ? "aadhaarCardUrl" : "panCardUrl"]: data.url,
      }));

      // Clear upload error if any
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[docType === "aadhaar" ? "aadhaarCardUrl" : "panCardUrl"];
        return next;
      });
    } catch (err: any) {
      setSubmitError(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      if (docType === "aadhaar") {
        setUploadingAadhaar(false);
      } else {
        setUploadingPan(false);
      }
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Please enter your full name";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Please enter a valid email address";
    if (!formData.phone.trim() || formData.phone.trim().length !== 10) errors.phone = "Please enter a valid 10-digit phone number";
    if (!formData.pincode.trim() || formData.pincode.trim().length !== 6) errors.pincode = "Please enter a valid 6-digit pincode";
    if (!formData.city.trim()) errors.city = "Please enter your city";
    if (!formData.state.trim()) errors.state = "Please enter your state";
    if (!formData.address.trim()) errors.address = "Please enter your address";
    if (!formData.businessType) errors.businessType = "Please select your profession type";
    if (!formData.whyPartner.trim()) errors.whyPartner = "Please tell us why you want to become a Saathi";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (formData.ifsc.trim() && formData.ifsc.trim().length !== 11) {
      errors.ifsc = "IFSC code must be exactly 11 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.trim().length !== 12) {
      errors.aadhaarNumber = "Please enter a valid 12-digit Aadhaar number";
    }
    if (!formData.aadhaarCardUrl) {
      errors.aadhaarCardUrl = "Please upload Aadhaar card";
    }
    if (!formData.panNumber.trim() || formData.panNumber.trim().length !== 10) {
      errors.panNumber = "Please enter a valid 10-digit PAN number";
    }
    if (!formData.panCardUrl) {
      errors.panCardUrl = "Please upload PAN card";
    }
    if (!formData.is18Plus) {
      errors.is18Plus = "You must confirm that you are 18+ years of age";
    }
    if (!formData.hasLaptopAndInternet) {
      errors.hasLaptopAndInternet = "You must confirm you have a laptop and good internet";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setSubmitError("");
    if (formStep === 1) {
      if (validateStep1()) setFormStep(2);
    } else if (formStep === 2) {
      if (validateStep2()) setFormStep(3);
    }
  };

  const handlePrevStep = () => {
    setSubmitError("");
    setFormStep((prev) => Math.max(1, prev - 1));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (formStep === 1) {
      handleNextStep();
      return;
    }
    if (formStep === 2) {
      handleNextStep();
      return;
    }

    if (!validateStep3()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/saathi-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-white/[0.03] border ${formErrors[field] ? "border-red-500/50" : "border-white/10"
    } rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300`;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.14),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.1),transparent_40%)] pointer-events-none" />

      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 flex items-center ${isScrolled ? "h-[70px] glass" : "h-[80px]"
          }`}
      >
        <div className="page-container flex justify-between items-center w-full">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-xl md:text-2xl font-extrabold font-outfit text-white tracking-wide">
              ANSH Apps
            </span>
            <span className="text-[10px] md:text-[11px] text-gray-400 font-medium tracking-[0.22em] uppercase mt-1">
              {t.anshSaathi}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="btn btn-outline text-sm px-5 py-2.5 hidden sm:inline-flex cursor-pointer"
            >
              {t.alreadySaathi}
            </Link>
            <button
              type="button"
              onClick={() => setIsComingSoonOpen(true)}
              className="btn btn-primary text-sm px-5 py-2.5 cursor-pointer"
            >
              {t.becomeSaathi}
            </button>

            {/* Custom language selector styled to fit premium dark theme */}
            <div className="relative border-l border-white/10 pl-4 ml-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 text-gray-400 font-medium hover:text-white transition-colors duration-300 text-[13px] bg-white/5 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{lang === "en" ? "English" : "हिन्दी"}</span>
                <svg className={`w-2.5 h-2.5 transition-transform ${isLangOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl py-1 z-[60]">
                  <button
                    type="button"
                    onClick={() => {
                      setLang("en");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors cursor-pointer ${lang === "en" ? "text-primary-bright" : "text-gray-300"
                      }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang("hi");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors cursor-pointer ${lang === "hi" ? "text-primary-bright" : "text-gray-300"
                      }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer z-50"
            aria-label="Toggle Menu"
          >
            <span className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[70px] md:hidden z-40 bg-[#0a0a0c]/98 backdrop-blur-lg border-t border-white/5 flex flex-col p-6 space-y-6">
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="w-full btn btn-outline py-3.5 text-center text-sm font-semibold rounded-xl cursor-pointer"
          >
            {t.alreadySaathi}
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full btn btn-primary py-3.5 text-center text-sm font-semibold rounded-xl cursor-pointer"
          >
            {t.becomeSaathi}
          </button>

          <div className="border-t border-white/10 pt-6 flex flex-col space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {lang === "en" ? "Select Language" : "भाषा चुनें"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLang("en");
                  setIsMenuOpen(false);
                }}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-colors ${lang === "en"
                    ? "bg-primary-bright/10 border-primary-bright text-primary-bright"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang("hi");
                  setIsMenuOpen(false);
                }}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-colors ${lang === "hi"
                    ? "bg-primary-bright/10 border-primary-bright text-primary-bright"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-20 md:pb-28 relative z-10 hero-bg">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-10 lg:gap-12 xl:gap-16 items-center">
            <div className="reveal min-w-0">
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.08] mb-4">
                <span className="block">
                  {t.becomeAn} <span className="tricolor-shine-text">{t.anshSaathi}</span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-white/90 mb-6 font-outfit tracking-wide">
                {t.saathChalein}
              </p>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
                {t.heroDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-2xl">
                {t.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-300 bg-white/[0.03] border border-white/8 rounded-2xl px-4 py-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn btn-primary cursor-pointer"
                >
                  {t.becomeSaathi}
                </button>
                <button
                  type="button"
                  onClick={() => window.open(t.discussionUrl, "_blank")}
                  className="btn btn-outline cursor-pointer"
                >
                  {t.bookDiscussion}
                </button>
                <a
                  href="https://anshapps.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline border-white/10 hover:border-white/30 hover:bg-white/[0.03] cursor-pointer flex items-center justify-center font-bold"
                >
                  Visit ANSH
                </a>
              </div>

              <p className="mt-8 text-xs text-gray-500 max-w-xl leading-relaxed">
                {t.affiliateNote}
              </p>
            </div>

            <div className="reveal relative flex justify-end items-center lg:-mr-8 xl:-mr-16 2xl:-mr-24">
              <SaathiBharatNetwork lang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* What Saathi Means */}
      <section className="py-20 md:py-24 relative z-10 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(255,153,51,0.1),transparent_42%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(19,136,8,0.1),transparent_42%)] pointer-events-none" />

        <div className="page-container max-w-4xl mx-auto text-center reveal relative z-10">
          <span className="text-[#FF9933] font-semibold uppercase tracking-widest text-sm mb-4 block">
            {t.whatSaathiMeans}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight text-white">
            {t.saathiDefinitionTitle}
          </h2>

          <div
            className="mx-auto mb-8 flex h-1 w-28 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span className="flex-1 bg-[#FF9933]" />
            <span className="flex-1 bg-white/90" />
            <span className="flex-1 bg-[#138808]" />
          </div>

          <p className="text-gray-200 text-lg md:text-xl leading-relaxed mb-6">
            {t.saathiDefinitionDesc1}
          </p>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            <span className="text-white font-semibold">{t.anshSaathi}</span> {t.saathiDefinitionDesc2}
          </p>
          <p className="mt-10 text-2xl md:text-3xl font-extrabold font-outfit bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
            {t.saathChalein}
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28 relative z-10 border-t border-white/5 bg-[#0c0c0e]/40">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div className="reveal">
              <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
                {t.aboutAnshTitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                {t.aboutAnshDesc}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {t.aboutAnshSub}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t.aboutAnshFooter}
              </p>
            </div>
            <div className="reveal grid grid-cols-2 sm:grid-cols-3 gap-4">
              {t.products.map((product) => (
                <div
                  key={product}
                  className="glass-card rounded-2xl p-5 border-white/10 hover:border-primary/25 transition-colors"
                >
                  <p className="text-white font-bold">{product}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Live</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why become a Saathi */}
      <section className="py-20 md:py-28 relative z-10 bg-[#0c0c0e]/50 border-y border-white/5">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-14 reveal">
            <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
              {t.whyBecomeSaathi}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              {t.whyBecomeSaathiDesc}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal">
            {t.benefits.map((benefit) => (
              <div
                key={benefit}
                className="glass-card rounded-2xl p-6 border-white/8 flex items-start gap-3"
              >
                <span className="text-primary-bright mt-0.5">•</span>
                <p className="text-gray-300 text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission */}
      <section className="py-20 md:py-28 relative z-10">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-14 reveal">
            <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
              {t.foundingOffer}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              {t.commissionStructure}
            </h2>
            <p className="text-gray-400">{t.commissionLimit}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12 reveal">
            <div className="glass-card rounded-[28px] p-8 border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">
                {t.months1to12}
              </p>
              <p className="text-5xl font-extrabold text-white mb-2 font-outfit">40%</p>
              <p className="text-gray-400 text-sm">{t.commissionDesc1}</p>
            </div>
            <div className="glass-card rounded-[28px] p-8 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none" />
              <p className="text-xs uppercase tracking-widest text-primary-bright font-bold mb-3">
                {t.months13onwards}
              </p>
              <p className="text-5xl font-extrabold text-white mb-2 font-outfit">25%</p>
              <p className="text-gray-400 text-sm">{t.commissionDesc2}</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto glass-card rounded-[28px] p-8 md:p-10 reveal">
            <h3 className="text-xl font-bold text-white mb-6">{t.example}</h3>
            <p className="text-gray-400 mb-6">
              {t.customerPays} <span className="text-white font-semibold">₹1,000/month</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{t.months1to12}</p>
                <p className="text-2xl font-extrabold text-emerald-400">₹400/month</p>
                <p className="text-sm text-gray-500 mt-1">{t.earnsMonths1to12}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-5">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{t.months13onwards}</p>
                <p className="text-2xl font-extrabold text-primary-bright">₹250/month</p>
                <p className="text-sm text-gray-500 mt-1">{t.earnsMonths13onwards}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsibilities split */}
      <section className="py-20 md:py-28 relative z-10 bg-[#111114] border-y border-white/5">
        <div className="page-container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
              <div className="reveal text-center md:text-left">
                <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
                  {t.asAnshSaathi}
                </span>
                <h2 className="text-3xl font-extrabold mb-6">{t.whatYouDo}</h2>
                <ul className="space-y-4 inline-block text-left">
                  {t.responsibilities.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-primary-bright shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="reveal text-center md:text-left">
                <span className="text-emerald-400 font-semibold uppercase tracking-widest text-sm mb-4 block">
                  {t.whatAnshHandles}
                </span>
                <h2 className="text-3xl font-extrabold mb-6">{t.whatWeDo}</h2>
                <ul className="space-y-4 inline-block text-left">
                  {t.anshHandles.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-14 text-center text-xl md:text-2xl font-semibold text-white italic reveal">
              {t.weBuildSupport}
            </p>
          </div>
        </div>
      </section>

      {/* Who can join */}
      <section className="py-20 md:py-28 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,153,51,0.08),transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(19,136,8,0.08),transparent_45%)] pointer-events-none" />
        <div className="page-container relative z-10">
          <div className="text-center max-w-3xl mx-auto reveal">
            <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
              {t.whoCanBecomeSaathi}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
              {t.anyoneCanBecome}
            </h2>

            {/* Subtle Indian tricolor accent */}
            <div
              className="mx-auto mb-8 flex h-1 w-28 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <span className="flex-1 bg-[#FF9933]" />
              <span className="flex-1 bg-white/90" />
              <span className="flex-1 bg-[#138808]" />
            </div>

            <p className="text-white text-lg md:text-xl font-semibold mb-4">
              {t.builtForPeople}
            </p>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
              {t.noTechBackground}
            </p>
            <p className="text-base md:text-lg font-semibold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
              {t.togetherSmarterBharat}
            </p>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 md:py-28 relative z-10 border-t border-white/5 bg-[#0c0c0e]/40">
        <div className="page-container">
          <div className="text-center mb-14 reveal">
            <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
              {t.saathiJourney}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">{t.journeyDesc}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 reveal">
            {t.journey.map((item, idx) => (
              <div
                key={item.step}
                className="glass-card rounded-2xl p-6 border-white/8 relative"
              >
                <p className="text-3xl font-extrabold font-outfit gradient-text mb-3">
                  {item.step}
                </p>
                <p className="text-white font-semibold text-sm leading-snug">{item.title}</p>
                {idx < t.journey.length - 1 && (
                  <span className="hidden lg:block absolute top-1/2 -right-2 text-gray-600 text-lg" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 relative z-10">
        <div className="page-container max-w-3xl">
          <div className="text-center mb-12 reveal">
            <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
              {t.faq}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              {t.frequentlyAskedQuestions}
            </h2>
          </div>
          <div className="space-y-3 reveal">
            {t.faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="glass-card rounded-2xl border-white/8 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-white text-sm md:text-base">
                      {faq.q}
                    </span>
                    <span
                      className={`text-primary-bright text-xl leading-none transition-transform ${open ? "rotate-45" : ""
                        }`}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TrustCompliance
        label={t.trustLabel}
        title={t.trustTitle}
        tagline={t.trustTagline}
        description={t.trustDescription}
        msmeTitle={t.trustMsmeTitle}
        msmeSubtitle={t.trustMsmeSubtitle}
        udyamLabel={t.trustUdyamLabel}
        gstinLabel={t.trustGstinLabel}
      />

      {/* Application Form */}
      <section id="apply" className="py-20 md:py-28 relative z-10 bg-[#111114] border-y border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
            <div className="reveal">
              <span className="text-primary-bright font-semibold uppercase tracking-widest text-sm mb-4 block">
                {t.joinAnshSaathi}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                {t.applyFoundingSaathi}
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                {t.applyDesc}
              </p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  {t.applyCheck1}
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  {t.applyCheck2}
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  {t.applyCheck3}
                </li>
              </ul>

              {/* Bharat Bhagya Vidhata Text */}
              <div className="mt-14 p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                <h4 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-white to-emerald-400 bg-clip-text text-transparent tracking-wider uppercase mb-3">
                  Bharat Bhagya Vidhata
                </h4>
                <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed tracking-wide">
                  Let's shape the destiny of India, together.
                </p>
              </div>
            </div>

            <div className="reveal">
              <div className="glass-card p-8 md:p-10 rounded-[32px] border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />

                {!isSubmitted ? (
                  <form onSubmit={handleFormSubmit} className="space-y-5 text-left relative">
                    {/* Form Step Progress Indicator */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${formStep === 1 ? 'bg-primary border-primary text-white font-black' :
                            formStep > 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-gray-500'
                          }`}>
                          {formStep > 1 ? '✓' : '1'}
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${formStep >= 1 ? 'text-white' : 'text-gray-500'}`}>Basic Info</span>
                      </div>
                      <div className={`h-[2px] flex-1 mx-1 transition-all ${formStep > 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${formStep === 2 ? 'bg-primary border-primary text-white font-black' :
                            formStep > 2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-gray-500'
                          }`}>
                          {formStep > 2 ? '✓' : '2'}
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${formStep >= 2 ? 'text-white' : 'text-gray-500'}`}>Bank Details</span>
                      </div>
                      <div className={`h-[2px] flex-1 mx-1 transition-all ${formStep > 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${formStep === 3 ? 'bg-primary border-primary text-white font-black' : 'border-white/10 text-gray-500'
                          }`}>
                          3
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${formStep === 3 ? 'text-white' : 'text-gray-500'}`}>Documents</span>
                      </div>
                    </div>

                    {/* Step 1: Basic Info */}
                    {formStep === 1 && (
                      <div className="space-y-4">
                        <div className="max-h-[460px] overflow-y-auto pr-3.5 form-scrollbar">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formFullName}
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder={t.formFullNamePlaceholder}
                              className={inputClass("fullName")}
                            />
                            {formErrors.fullName && (
                              <p className="text-xs text-red-400">{formErrors.fullName}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formCompanyName}
                            </label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              placeholder={t.formCompanyNamePlaceholder}
                              className={inputClass("companyName")}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formEmail}
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder={t.formEmailPlaceholder}
                              className={inputClass("email")}
                            />
                            {formErrors.email && (
                              <p className="text-xs text-red-400">{formErrors.email}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formPhone}
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                +91
                              </span>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                maxLength={10}
                                placeholder={t.formPhonePlaceholder}
                                className={`${inputClass("phone")} !pl-14`}
                              />
                            </div>
                            {formErrors.phone && (
                              <p className="text-xs text-red-400">{formErrors.phone}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              Pincode *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={(e) => handlePincodeChange(e.target.value)}
                                placeholder="6-digit pincode"
                                className={inputClass("pincode")}
                              />
                              {loadingPincode && (
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                                  <div className="w-3.5 h-3.5 border border-t-transparent border-primary rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                            {formErrors.pincode && (
                              <p className="text-xs text-red-400">{formErrors.pincode}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formCity}
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder={t.formCityPlaceholder}
                              className={inputClass("city")}
                            />
                            {formErrors.city && (
                              <p className="text-xs text-red-400">{formErrors.city}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              State *
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="State"
                              className={inputClass("state")}
                            />
                            {formErrors.state && (
                              <p className="text-xs text-red-400">{formErrors.state}</p>
                            )}
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              Full Address *
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="House No, Building, Street / Area"
                              className={inputClass("address")}
                            />
                            {formErrors.address && (
                              <p className="text-xs text-red-400">{formErrors.address}</p>
                            )}
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formWebsite}
                            </label>
                            <input
                              type="text"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              placeholder={t.formWebsitePlaceholder}
                              className={inputClass("website")}
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formBusinessType}
                            </label>
                            <select
                              name="businessType"
                              value={formData.businessType}
                              onChange={handleInputChange}
                              className={`${inputClass("businessType")} appearance-none`}
                            >
                              <option value="" className="bg-[#111114]">
                                {t.formBusinessTypePlaceholder}
                              </option>
                              {t.businessTypes.map((type) => (
                                <option key={type} value={type} className="bg-[#111114]">
                                  {type}
                                </option>
                              ))}
                            </select>
                            {formErrors.businessType && (
                              <p className="text-xs text-red-400">{formErrors.businessType}</p>
                            )}
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formExperience}
                            </label>
                            <textarea
                              name="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              rows={2}
                              placeholder={t.formExperiencePlaceholder}
                              className={`${inputClass("experience")} resize-none`}
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                              {t.formWhySaathi}
                            </label>
                            <textarea
                              name="whyPartner"
                              value={formData.whyPartner}
                              onChange={handleInputChange}
                              rows={3}
                              placeholder={t.formWhySaathiPlaceholder}
                              className={`${inputClass("whyPartner")} resize-none`}
                            />
                            {formErrors.whyPartner && (
                              <p className="text-xs text-red-400">{formErrors.whyPartner}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-white/5">
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="btn btn-primary text-xs px-6 py-3 cursor-pointer"
                          >
                            Next: Bank Details →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Bank Details */}
                    {formStep === 2 && (
                      <div className="space-y-5">
                        <div className="space-y-1.5 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-gray-300 mb-2 leading-relaxed">
                          🏦 Please specify where you would like to receive your monthly recurring commission disbursements.
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Account Holder Name</label>
                            <input
                              type="text"
                              name="accountHolderName"
                              value={formData.accountHolderName}
                              onChange={handleInputChange}
                              placeholder="Name on bank account"
                              className={inputClass("accountHolderName")}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Bank Name</label>
                            <input
                              type="text"
                              name="bankName"
                              value={formData.bankName}
                              onChange={handleInputChange}
                              placeholder="e.g. HDFC Bank, ICICI Bank"
                              className={inputClass("bankName")}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Account Number</label>
                            <input
                              type="text"
                              name="accountNumber"
                              value={formData.accountNumber}
                              onChange={handleInputChange}
                              placeholder="Your bank account number"
                              className={`${inputClass("accountNumber")} font-mono`}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">IFSC Code</label>
                              <input
                                type="text"
                                name="ifsc"
                                value={formData.ifsc}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, ifsc: e.target.value.toUpperCase() }));
                                }}
                                maxLength={11}
                                placeholder="e.g. HDFC0001234"
                                className={`${inputClass("ifsc")} font-mono uppercase`}
                              />
                              {formErrors.ifsc && (
                                <p className="text-xs text-red-400">{formErrors.ifsc}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">UPI ID</label>
                              <input
                                type="text"
                                name="upiId"
                                value={formData.upiId}
                                onChange={handleInputChange}
                                placeholder="username@upi"
                                className={inputClass("upiId")}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="btn btn-outline text-xs px-5 py-3 cursor-pointer"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="btn btn-primary text-xs px-6 py-3 cursor-pointer"
                          >
                            Next: Documents →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Important Documents */}
                    {formStep === 3 && (
                      <div className="space-y-5">
                        <div className="space-y-4">
                          {/* Aadhaar Details Card */}
                          <div className="space-y-3.5 p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                            <span className="text-[10px] text-primary-bright font-bold uppercase tracking-wider block">Aadhaar Card Details</span>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Aadhaar Number *</label>
                              <input
                                type="text"
                                name="aadhaarNumber"
                                value={formData.aadhaarNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                                  setFormData(prev => ({ ...prev, aadhaarNumber: val }));
                                }}
                                placeholder="12-digit Aadhaar number"
                                className={`${inputClass("aadhaarNumber")} font-mono`}
                              />
                              {formErrors.aadhaarNumber && (
                                <p className="text-xs text-red-400">{formErrors.aadhaarNumber}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Upload Aadhaar Card *</label>
                              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                <span className="text-xs text-gray-400 truncate max-w-[180px]">
                                  {formData.aadhaarCardUrl ? "✓ Aadhaar Card Uploaded" : "No file chosen"}
                                </span>
                                <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-bright text-xs font-bold cursor-pointer transition-all">
                                  {uploadingAadhaar ? "Uploading..." : "Choose File"}
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => handleFileUpload(e, "aadhaar")}
                                    disabled={uploadingAadhaar}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              {formErrors.aadhaarCardUrl && (
                                <p className="text-xs text-red-400">{formErrors.aadhaarCardUrl}</p>
                              )}
                            </div>
                          </div>

                          {/* PAN Details Card */}
                          <div className="space-y-3.5 p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                            <span className="text-[10px] text-primary-bright font-bold uppercase tracking-wider block">PAN Card Details</span>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">PAN Number *</label>
                              <input
                                type="text"
                                name="panNumber"
                                value={formData.panNumber}
                                onChange={(e) => {
                                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                                  setFormData(prev => ({ ...prev, panNumber: val }));
                                }}
                                placeholder="10-digit PAN number"
                                className={`${inputClass("panNumber")} font-mono`}
                              />
                              {formErrors.panNumber && (
                                <p className="text-xs text-red-400">{formErrors.panNumber}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Upload PAN Card *</label>
                              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                <span className="text-xs text-gray-400 truncate max-w-[180px]">
                                  {formData.panCardUrl ? "✓ PAN Card Uploaded" : "No file chosen"}
                                </span>
                                <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-bright text-xs font-bold cursor-pointer transition-all">
                                  {uploadingPan ? "Uploading..." : "Choose File"}
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => handleFileUpload(e, "pan")}
                                    disabled={uploadingPan}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              {formErrors.panCardUrl && (
                                <p className="text-xs text-red-400">{formErrors.panCardUrl}</p>
                              )}
                            </div>
                          </div>

                          {/* Confirmations Card */}
                          <div className="space-y-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                            <span className="text-[10px] text-primary-bright font-bold uppercase tracking-wider block">Confirmations</span>
                            
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                name="is18Plus"
                                checked={formData.is18Plus}
                                onChange={handleInputChange}
                                className="w-4 h-4 mt-0.5 rounded border-white/10 bg-white/[0.03] text-primary focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all cursor-pointer"
                              />
                              <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                                I confirm that I am 18+ years of age *
                              </span>
                            </label>
                            {formErrors.is18Plus && (
                              <p className="text-xs text-red-400 pl-7">{formErrors.is18Plus}</p>
                            )}

                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                name="hasLaptopAndInternet"
                                checked={formData.hasLaptopAndInternet}
                                onChange={handleInputChange}
                                className="w-4 h-4 mt-0.5 rounded border-white/10 bg-white/[0.03] text-primary focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all cursor-pointer"
                              />
                              <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                                I confirm that I have a laptop and a good internet connection *
                              </span>
                            </label>
                            {formErrors.hasLaptopAndInternet && (
                              <p className="text-xs text-red-400 pl-7">{formErrors.hasLaptopAndInternet}</p>
                            )}
                          </div>
                        </div>

                        {submitError && (
                          <p className="text-sm text-red-400 font-medium">{submitError}</p>
                        )}

                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="btn btn-outline text-xs px-5 py-3 cursor-pointer"
                          >
                            ← Back
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmitting || uploadingAadhaar || uploadingPan}
                            className="btn btn-primary text-xs px-6 py-3 cursor-pointer font-bold relative flex items-center justify-center"
                          >
                            {isSubmitting ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Apply to Become a Saathi"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="py-10 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold text-white">
                        {t.submitSuccessTitle}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed px-2">
                        {t.submitSuccessDesc.replace("{name}", formData.fullName)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.12),transparent_55%)] pointer-events-none" />
        <div className="page-container relative z-10 text-center max-w-3xl mx-auto reveal">
          <p className="text-primary-bright font-semibold uppercase tracking-[0.22em] text-sm mb-4">
            {t.saathChalein}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            {t.readyToWalk}
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            {t.readyToWalkDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
              className="btn btn-primary cursor-pointer"
            >
              {t.becomeSaathi}
            </button>
            <button
              type="button"
              onClick={() => window.open(t.discussionUrl, "_blank")}
              className="btn btn-outline cursor-pointer"
            >
              {t.scheduleCall}
            </button>
          </div>
        </div>
      </section>

      <SiteFooter msmeHref="#trust-compliance" showRoadmap={false} />

      {/* Coming Soon Modal */}
      {isComingSoonOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsComingSoonOpen(false)}
          />
          <div className="relative glass-card rounded-[28px] border-white/10 p-8 max-w-sm w-full text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-fade-in z-10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary-bright mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">
              {lang === "hi" ? "जल्द ही आ रहा है" : "Coming Soon"}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {lang === "hi"
                ? "यह सुविधा वर्तमान में निर्माण चरण में है।"
                : "This feature is currently in the building phase."}
            </p>

            <button
              type="button"
              onClick={() => setIsComingSoonOpen(false)}
              className="w-full btn btn-primary py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {lang === "hi" ? "ठीक है" : "Close"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
