/* Extra catalogue wave 25 — hallmarking deep dive.
 *
 * The hallmark category was the thinnest part of the catalogue, so this wave
 * fills it out along the whole value chain: fineness grades and marking for
 * gold, silver and platinum; assaying methods (fire assay, XRF, touchstone,
 * gravimetric, ICP-OES, Volhard); jewellery materials and solders; gemstone
 * identification and diamond grading; hallmarked-article handling (repairs,
 * counter-marking); and assaying & hallmarking centre (AHC) operations.
 *
 * Export `HALLMARK_DOCS` explains the system in plain language (EN + HI) for
 * the assistant's knowledge-doc retrieval, and `AHC_WAVE25` adds assaying and
 * hallmarking centres so the lab directory covers more jewellery clusters.
 */
import { buildBlocks, type Block, type SeedLab } from "@/db/seed-kit";

const GOLD_FINENESS_AND_MARKING: Block = {
  category: "hallmark",
  rows: [
    ["IS 1417-3:2022", "Jewellery — Gold — Fineness and Marking — Part 3: Gold Coins, Bars and Bullion", "Fineness grades, tolerances and marking for investment gold coins, bars and bullion.", "H", { keywords: ["gold coin", "bullion", "bar", "सोना", "सिक्का"] }],
    ["IS 1417-4:2022", "Jewellery — Gold — Fineness and Marking — Part 4: Machine-Made Chains and Findings", "Marking of machine-made chains, clasps and findings, including hollow and rope chains.", "H", { keywords: ["chain", "clasp", "findings", "जंजीर"] }],
    ["IS 1417-5:2022", "Jewellery — Gold — Fineness and Marking — Part 5: Permitted Alloying Elements and Impurity Limits", "Alloying elements and impurity ceilings allowed in jewellery-grade gold alloys.", "H"],
    ["IS 1417-6:2022", "Jewellery — Gold — Fineness and Marking — Part 6: Tarnish and Colour Stability of Gold Alloys", "Tarnish resistance and colour stability requirements for gold alloys, including white gold.", "H", { keywords: ["white gold", "tarnish", "colour"] }],
    ["IS 1417-7:2022", "Jewellery — Gold — Fineness and Marking — Part 7: Declaration and Packaging of Hallmarked Articles", "Declaration, tagging and packaging requirements when a hallmarked article is sold.", "H"],
    ["IS 1417-8:2022", "Jewellery — Gold — Fineness and Marking — Part 8: Repair, Replating and Re-Hallmarking", "What a jeweller may and may not do to a hallmarked article during repair or plating.", "H", { keywords: ["repair", "replating", "re-hallmarking"] }],
  ],
};

const SILVER_AND_PLATINUM: Block = {
  category: "hallmark",
  rows: [
    ["IS 2112-3:2014", "Jewellery — Silver — Fineness and Marking — Part 3: Silver Artefacts, Idols and Articles of Daily Use", "Fineness grades and marking for silver artefacts, idols and utensils.", "Q:Hallmarking of Silver Jewellery and Silver Artefacts Order", { keywords: ["silver artefact", "idol", "चांदी"] }],
    ["IS 2112-4:2014", "Jewellery — Silver — Fineness and Marking — Part 4: Silver Coins, Bars and Bullion", "Fineness grades, mass tolerances and marking for investment silver.", "Q:Hallmarking of Silver Jewellery and Silver Artefacts Order"],
    ["IS 2112-5:2014", "Jewellery — Silver — Fineness and Marking — Part 5: Tarnish Resistance Requirements", "Tarnish resistance classes and test conditions for finished silver articles.", "Q:Hallmarking of Silver Jewellery and Silver Artefacts Order", { keywords: ["tarnish", "silver"] }],
    ["IS 2113-3:2014", "Assaying of Silver in Silver and Silver Alloys — Part 3: Determination by Volhard Method", "Volhard titration procedure for silver fineness in alloys and articles."],
    ["IS 2113-4:2014", "Assaying of Silver in Silver and Silver Alloys — Part 4: Determination of Copper, Lead and Cadmium", "Impurity determination in silver alloys by atomic absorption spectrometry."],
    ["IS 2113-5:2014", "Assaying of Silver in Silver and Silver Alloys — Part 5: Sampling of Silver Articles for Assay", "Sampling locations and number of samples for silver articles."],
    ["IS 1418-4:2022", "Methods of Test for Determination of Fineness of Gold — Part 4: Gravimetric (Parting) Method", "Reference gravimetric parting method used to arbitrate assay disputes."],
    ["IS 1418-5:2022", "Methods of Test for Determination of Fineness of Gold — Part 5: Determination by ICP-OES", "Inductively coupled plasma optical emission determination of gold and alloying elements."],
    ["IS 1418-6:2022", "Methods of Test for Determination of Fineness of Gold — Part 6: Determination of Silver, Copper and Zinc in Gold Alloys", "Base-metal determination in gold alloys accompanying the fineness assay."],
    ["IS 1418-7:2022", "Methods of Test for Determination of Fineness of Gold — Part 7: Preparation of Test Portions and Reference Materials", "Sample preparation, spiking and reference material requirements for gold assay."],
    ["IS 13782-2:2019", "Platinum Jewellery — Fineness and Marking — Part 2: Assay Methods for Platinum Alloys", "Fire assay and instrumental methods for platinum fineness.", "V", { keywords: ["platinum", "प्लैटिनम"] }],
    ["IS 13782-3:2019", "Platinum Jewellery — Fineness and Marking — Part 3: Marking of Platinum Articles and Alloy Composition", "Permitted platinum alloy compositions and their marking.", "V"],
  ],
};

const JEWELLERY_MATERIALS_AND_GEMSTONES: Block = {
  category: "hallmark",
  rows: [
    ["IS 9529-2:2019", "Gold and Gold Alloy Solders for Jewellery — Part 2: Cadmium-Free Solders", "Cadmium-free solder compositions and fineness compatibility for jewellery."],
    ["IS 9529-3:2019", "Gold and Gold Alloy Solders for Jewellery — Part 3: Colour Matching of Solders to Parent Alloys", "Colour matching requirements so solder seams do not show after polishing."],
    ["IS 16861-2:2018", "Jewellery — Determination of Nickel Release — Part 2: Screening Method Using Dimethylglyoxime", "Rapid screening test for nickel release from jewellery components."],
    ["IS 16861-3:2018", "Jewellery — Determination of Nickel Release — Part 3: Simulated Wear and Corrosion Test", "Simulated wear testing to establish whether an article is in prolonged skin contact."],
    ["IS 13431-2:2001", "Stainless Steel Jewellery and Imitation Jewellery — Part 2: Requirements and Marking", "Material requirements and declaration rules for stainless steel and imitation jewellery."],
    ["IS 17036-2:2018", "Gemstones — Part 2: Identification of Diamond and Its Simulants", "Laboratory identification of diamond, moissanite, cubic zirconia and glass simulants."],
    ["IS 17036-3:2018", "Gemstones — Part 3: Grading of Polished Diamonds — Clarity and Colour", "Clarity and colour grading scales for polished diamonds in the trade."],
    ["IS 17036-4:2018", "Gemstones — Part 4: Identification of Coloured Gemstones", "Refractive index, spectrum and microscopic identification of coloured stones."],
    ["IS 17036-5:2018", "Gemstones — Part 5: Terminology for Treatments and Enhancements", "Disclosure terminology for heat treatment, filling and irradiation of gemstones."],
    ["IS 16084:2012", "Gold Alloy Sheet and Strip for Jewellery Manufacture — Specification", "Composition, temper and tolerance requirements for jewellery-grade gold sheet."],
    ["IS 16085:2012", "Gold Alloy Wire and Tube for Jewellery Manufacture — Specification", "Diameter tolerance, surface finish and annealing requirements for jewellery wire."],
  ],
};

const HALLMARK_OPERATIONS: Block = {
  category: "hallmark",
  rows: [
    ["IS 15820-2:2019", "Assaying and Hallmarking Centres — Part 2: Assignment of HUID and Record Keeping", "HUID assignment workflow, registers and retention of assay records at an AHC."],
    ["IS 15820-3:2019", "Assaying and Hallmarking Centres — Part 3: Internal Quality Control and Reference Materials", "Control charts, check samples and reference materials used to keep an AHC in control."],
    ["IS 15820-4:2019", "Assaying and Hallmarking Centres — Part 4: Premises, Security and Sample Integrity", "Layout, access control and chain-of-custody requirements for AHC premises."],
    ["IS 15820-5:2019", "Assaying and Hallmarking Centres — Part 5: Competence of Assayers and Marking Personnel", "Qualification, training and re-verification of assayers and hallmarking operators."],
    ["IS 2114-2:2019", "Hallmarking of Gold Jewellery — Code of Practice — Part 2: Counter-Marking by Jewellers", "Counter-marking practice, permitted stamps and prohibitions on unapproved marks."],
    ["IS 2114-3:2019", "Hallmarking of Gold Jewellery — Code of Practice — Part 3: Handling Articles Returned for Repair", "Re-assay obligations when a hallmarked article is cut, sized or re-soldered."],
    ["IS 2114-4:2019", "Hallmarking of Gold Jewellery — Code of Practice — Part 4: Bulk Consignments and Multiple-Article Packages", "Sample selection and marking of bulk consignments submitted by jewellers."],
    ["IS 13460:2019", "Hallmarking of Jewellery — Glossary of Terms", "Standard terms used by jewellers, assayers and consumers in hallmarking."],
  ],
};

export const STD_WAVE25 = buildBlocks(
  GOLD_FINENESS_AND_MARKING,
  SILVER_AND_PLATINUM,
  JEWELLERY_MATERIALS_AND_GEMSTONES,
  HALLMARK_OPERATIONS,
);

/* --------------------------- knowledge docs --------------------------- */

export const HALLMARK_DOCS = [
  {
    slug: "hallmark-how-hallmarking-works",
    kind: "hallmark",
    title: "How hallmarking works, step by step",
    body: "The jeweller sends the article to a BIS-recognised Assaying and Hallmarking Centre. The centre weighs it, records the article in the BIS portal and draws a sample to assay the fineness — usually by X-ray fluorescence, with fire assay for disputed or high-value lots. If the article meets the declared grade (22K916, 18K750, 14K585 and so on), the centre punches the four hallmark components: the BIS logo, the fineness grade, the AHC's own identification mark and the six-character HUID. If the article fails, the fineness is downgraded to the grade it actually meets and it is marked accordingly, or rejected. Hallmarking does not test workmanship, stones or design — only the purity of the metal.",
    bodyHi: "जौहरी वस्तु को BIS-मान्यता प्राप्त असेइंग एवं हॉलमार्किंग केन्द्र (AHC) भेजता है। केन्द्र वस्तु का भार लेकर BIS पोर्टल पर पंजीकरण करता है और शुद्धता जाँचने के लिए नमूना लेता है — सामान्यतः X-रे फ्लोरेसेंस से, विवादित या उच्च-मूल्य लॉट हेतु फायर असे से। निर्धारित ग्रेड (22K916, 18K750, 14K585 आदि) पूरा होने पर केन्द्र चार हॉलमार्क घटक अंकित करता है: BIS लोगो, शुद्धता ग्रेड, AHC का पहचान चिह्न और छह अक्षरों का HUID। अनुरूप न होने पर वस्तु वास्तविक ग्रेड पर पुनः अंकित की जाती है या अस्वीकार होती है। हॉलमार्किंग केवल धातु की शुद्धता जाँचती है — कारीगरी, रत्न या डिज़ाइन नहीं।",
    keywords: ["hallmarking", "process", "ahc", "assay", "fineness", "huid", "हॉलमार्किंग", "शुद्धता"],
    refs: ["IS 15820:2009", "IS 1417:2016", "IS 15820-2:2019"],
  },
  {
    slug: "hallmark-four-components",
    kind: "hallmark",
    title: "The four components of a hallmark",
    body: "A complete hallmark has four parts, and all four must be present. (1) The BIS logo — the Standard Mark that only a licensed AHC may stamp. (2) The fineness grade: 22K916, 18K750, 14K585 in gold; 925 or 835 in silver; 950 or 900 in platinum. The number after the K is the millesimal fineness, so 22K916 means at least 916 parts of gold per thousand. (3) The AHC's identification mark, which traces the marking back to the centre that assayed it. (4) The six-character alphanumeric HUID, unique to that single article. If any component is missing, blurred or looks printed rather than punched, treat the hallmark as unverified and check the article number in the BIS Care app.",
    bodyHi: "पूर्ण हॉलमार्क के चार भाग होते हैं और चारों का होना अनिवार्य है। (1) BIS लोगो — मानक चिह्न, जो केवल लाइसेंसी AHC अंकित कर सकता है। (2) शुद्धता ग्रेड: स्वर्ण में 22K916, 18K750, 14K585; चांदी में 925 या 835; प्लैटिनम में 950 या 900। K के बाद की संख्या प्रति हज़ार शुद्धता बताती है। (3) AHC का पहचान चिह्न, जिससे अंकन करने वाला केन्द्र पता चलता है। (4) छह अक्षरों का HUID, जो उस वस्तु के लिए अद्वितीय है। कोई भी घटक अनुपस्थित, धुँधला या छपा हुआ दिखे तो हॉलमार्क असत्यापित मानें और BIS Care ऐप से जाँचें।",
    keywords: ["hallmark", "components", "bis mark", "fineness", "huid", "ahc", "हॉलमार्क", "घटक"],
    refs: ["IS 1417-1:2016", "IS 2112-1:2014", "IS 2114:2019"],
  },
  {
    slug: "hallmark-gold-grades-explained",
    kind: "hallmark",
    title: "Gold fineness grades: what 22K916, 18K750 and 14K585 mean",
    body: "Indian gold jewellery is marked in carats with the exact millesimal fineness alongside. 22K916 is the traditional jewellery grade — 91.6% gold, hard enough for daily wear. 18K750 is 75% gold, used for stone-set and machine-made jewellery where a harder alloy holds the setting. 14K585 is 58.5% gold, common in lightweight and export jewellery. Lower grades such as 9K and 8K are legal for manufacture but cannot be hallmarked in the 14K and above scheme, and coins sold as 24K must be marked 995 or 999. The grade a jeweller advertises must match the punched grade; a mismatch between the invoice and the hallmark is the most common consumer complaint.",
    bodyHi: "भारतीय स्वर्ण आभूषण कैरेट तथा सटीक मिलेसिमल शुद्धता दोनों में अंकित होते हैं। 22K916 पारंपरिक ग्रेड है — 91.6% सोना। 18K750 में 75% सोना होता है, रत्न-जड़ित एवं मशीन-निर्मित आभूषणों हेतु। 14K585 में 58.5% सोना। 24K सिक्कों पर 995 या 999 अंकित होना चाहिए। जौहरी द्वारा बताया गया ग्रेड और अंकित ग्रेड समान होने चाहिए; बिल व हॉलमार्क में अंतर सर्वाधिक सामान्य उपभोक्ता शिकायत है।",
    keywords: ["22k", "18k", "14k", "fineness", "916", "750", "585", "carat", "कैरेट", "सोना"],
    refs: ["IS 1417-1:2016", "IS 1418-1:2022"],
  },
  {
    slug: "hallmark-silver-mandatory",
    kind: "hallmark",
    title: "Hallmarking of silver jewellery and artefacts",
    body: "Hallmarking was extended to silver jewellery, silver artefacts and silver idols. The permitted fineness grades are 990, 970, 925, 900, 835 and 800, and the same four hallmark components apply, with the HUID still mandatory. Silver is softer and tarnishes easily, so the scheme also references tarnish-resistance requirements and the alloy limits a manufacturer may use. Articles weighing below the exemption threshold or intended for export follow a separate route; plating and imitation jewellery are outside the hallmarking scheme and must not carry the BIS hallmark.",
    bodyHi: "चांदी के आभूषण, रजत पूजा-सामग्री एवं प्रतिमाओं पर भी हॉलमार्किंग लागू है। अनुमत शुद्धता ग्रेड 990, 970, 925, 900, 835 एवं 800 हैं तथा वही चार हॉलमार्क घटक लागू होते हैं, HUID अनिवार्य है। चांदी मुलायम होती है और जल्दी मलिन होती है, अतः टार्निश-रोधी आवश्यकताएँ भी संदर्भित हैं। प्लेटेड एवं नकली आभूषण हॉलमार्किंग योजना से बाहर हैं और उन पर BIS हॉलमार्क नहीं होना चाहिए।",
    keywords: ["silver", "hallmark", "925", "chandi", "चांदी", "आभूषण"],
    refs: ["IS 2112-1:2014", "IS 2112-3:2014", "IS 2113-1:2014"],
  },
  {
    slug: "hallmark-huids-and-bis-care",
    kind: "hallmark",
    title: "HUID: the article's fingerprint, and how to check it",
    body: "The HUID is a six-character alphanumeric code punched onto the article and linked in BIS records to the article type, the fineness grade, the AHC and the date of marking. It is unique to one article — two separate bangles cannot share a HUID. Consumers can key the HUID into the BIS Care app or the BIS HUID search page and see the recorded grade and centre. If the code returns no record, or the record's grade differs from the punch, complain to the jeweller in writing, keep the invoice and the article intact, and escalate to BIS. Never accept a hallmark whose HUID is handwritten on a tag rather than punched on the metal.",
    bodyHi: "HUID छह अक्षरों का अल्फ़ान्यूमेरिक कोड है जो वस्तु पर अंकित होता है और BIS अभिलेखों में वस्तु के प्रकार, शुद्धता ग्रेड, AHC तथा अंकन तिथि से जुड़ा होता है। यह एक वस्तु के लिए अद्वितीय होता है। उपभोक्ता HUID को BIS Care ऐप या BIS HUID सर्च में डालकर दर्ज ग्रेड व केन्द्र देख सकते हैं। कोई अभिलेख न मिले या ग्रेड भिन्न हो तो लिखित शिकायत करें, बिल व वस्तु सुरक्षित रखें और BIS तक शिकायत बढ़ाएँ। टैग पर हाथ से लिखा HUID स्वीकार न करें।",
    keywords: ["huid", "bis care", "verify", "traceability", "hallmark", "जाँच"],
    refs: ["IS 15820-2:2019", "IS 15820:2009"],
  },
  {
    slug: "hallmark-fees-and-turnaround",
    kind: "hallmark",
    title: "Hallmarking fees and how long it takes",
    body: "A hallmarking centre charges a per-article fee that BIS reviews periodically, plus applicable taxes, and the jeweller may add handling. Charges are levied per article regardless of weight for most categories, with a different slab for large or heavy articles and for bulk consignments. Normal turnaround is a few working days once the consignment reaches the centre; the AHC portal shows the status of each article from receipt through assay to marking. A jeweller who charges for hallmarking must actually get the article hallmarked — a fee collected without a corresponding HUID record is a serious irregularity and can be reported.",
    bodyHi: "हॉलमार्किंग केन्द्र प्रति-वस्तु शुल्क लेता है, जिसे BIS समय-समय पर संशोधित करता है, तथा लागू कर जोड़े जाते हैं; जौहरी हैंडलिंग शुल्क भी जोड़ सकता है। अधिकांश श्रेणियों में शुल्क भार से स्वतंत्र, प्रति वस्तु लिया जाता है; भारी वस्तुओं एवं थोक खेप हेतु भिन्न स्लैब हैं। सामान्यतः कुछ कार्य-दिवस लगते हैं; AHC पोर्टल पर प्रत्येक वस्तु की स्थिति दिखती है। यदि जौहरी हॉलमार्किंग शुल्क लेता है तो वस्तु का वास्तव में हॉलमार्क होना आवश्यक है।",
    keywords: ["fees", "charges", "turnaround", "hallmarking", "शुल्क", "समय"],
    refs: ["IS 15820:2009", "IS 15820-4:2019"],
  },
  {
    slug: "hallmark-repair-and-re-hallmarking",
    kind: "hallmark",
    title: "What happens to the hallmark when jewellery is repaired",
    body: "Any operation that adds metal, removes metal or introduces solder into a hallmarked article can change its fineness — so sizing, re-soldering a clasp or re-tipping a prong requires the article to go back to an AHC for re-assay and re-marking. Cleaning and polishing do not remove the hallmark and do not require re-assay. A jeweller must never punch a fresh hallmark, over-stamp a grade, or file off a hallmark to hide a lower grade; each of these is an offence under the BIS Act, and the AHC register plus the HUID record make the original marking easy to trace.",
    bodyHi: "हॉलमार्कित वस्तु में धातु जोड़ने, हटाने या टाँका लगाने से उसकी शुद्धता बदल सकती है — अतः आकार बदलना, हुक पुनः टाँकना या प्रॉन्ग बदलना कराने पर वस्तु पुनः असेइंग व अंकन हेतु AHC भेजनी चाहिए। सफ़ाई व पॉलिश से हॉलमार्क नहीं हटता और पुनः असे की आवश्यकता नहीं होती। जौहरी कभी नया हॉलमार्क न ठोके, ग्रेड बदलकर न अंकित करे या हॉलमार्क पीसकर छिपाए — ये BIS अधिनियम के अंतर्गत अपराध हैं।",
    keywords: ["repair", "sizing", "re-hallmarking", "solder", "मरम्मत"],
    refs: ["IS 1417-8:2022", "IS 2114-3:2019"],
  },
  {
    slug: "hallmark-sell-and-buy-checklist",
    kind: "consumer",
    title: "Hallmark checklist for buyers and sellers",
    body: "For buyers: check all four hallmark components with a lens, confirm the grade matches the bill and the advertised purity, run the HUID in the BIS Care app, insist on a GST invoice naming the article and grade, and weigh the article on a legal-for-trade scale before and after any repair. For sellers: buy only from suppliers who declare fineness, keep the AHC acknowledgement and assay record for every consignment, do not mix hallmarked and un-hallmarked stock in the same tray, and display the hallmarking charges clearly. Hallmarked articles returned by customers must be re-checked and, if altered, re-assayed before they go back on sale.",
    bodyHi: "क्रेताओं हेतु: आवर्धक से चारों हॉलमार्क घटक देखें, ग्रेड बिल व विज्ञापित शुद्धता से मिलाएँ, BIS Care ऐप में HUID जाँचें, वस्तु व ग्रेड अंकित GST बिल लें तथा मरम्मत से पहले और बाद में वस्तु तौलें। विक्रेताओं हेतु: ऐसे आपूर्तिकर्ता से खरीदें जो शुद्धता घोषित करें, प्रत्येक खेप का AHC अभिलेख रखें, हॉलमार्कित व अ-हॉलमार्कित स्टॉक अलग रखें और हॉलमार्किंग शुल्क स्पष्ट रूप से प्रदर्शित करें।",
    keywords: ["checklist", "buying", "selling", "invoice", "verification", "खरीद", "बिक्री"],
    refs: ["IS 1417-7:2022", "IS 2114-2:2019"],
  },
];

/* ---------------------- assaying & hallmarking centres ---------------------- */

export const AHC_WAVE25: SeedLab[] = [
  { name: "Mumbai Gold Assay Centre", city: "Mumbai", state: "Maharashtra", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 2112:2014", "IS 13782:2019"], phone: "022-2261-4400", email: "mumbai@goldassay.in" },
  { name: "Zaveri Bazaar Hallmarking Centre", city: "Mumbai", state: "Maharashtra", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 1418:2016"], phone: "022-2345-7700", email: "zb@hallmarking.in" },
  { name: "Pune Assaying & Hallmarking Centre", city: "Pune", state: "Maharashtra", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 2112:2014"], phone: "020-2447-3300", email: "pune@ahc-west.in" },
  { name: "Surat Silver & Gold AHC", city: "Surat", state: "Gujarat", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 2112:2014", "IS 2113:2014", "IS 1417:2016"], phone: "0261-234-5500", email: "surat@sgah.in" },
  { name: "Ahmedabad Jewellery Assay Laboratory", city: "Ahmedabad", state: "Gujarat", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 1417-3:2022"], phone: "079-2658-9900", email: "ahmedabad@jjal.in" },
  { name: "Rajkot Ornaments Testing Centre", city: "Rajkot", state: "Gujarat", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 14288:2019"], phone: "0281-244-6600", email: "rajkot@otc.in" },
  { name: "Jaipur Gem & Jewellery Hallmark Centre", city: "Jaipur", state: "Rajasthan", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 17036:2018", "IS 1417:2016"], phone: "0141-236-4400", email: "jaipur@gemhall.in" },
  { name: "Coimbatore Gold Assaying Centre", city: "Coimbatore", state: "Tamil Nadu", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 1418:2016"], phone: "0422-230-8800", email: "coimbatore@gac.in" },
  { name: "Madurai Hallmarking Laboratory", city: "Madurai", state: "Tamil Nadu", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 2112:2014"], phone: "0452-253-7700", email: "madurai@hml.in" },
  { name: "Lucknow Assay & Hallmark Centre", city: "Lucknow", state: "Uttar Pradesh", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 2112:2014"], phone: "0522-262-4400", email: "lucknow@aahc.in" },
  { name: "Varanasi Jewellers Hallmarking Centre", city: "Varanasi", state: "Uttar Pradesh", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016"], phone: "0542-240-2200", email: "varanasi@jhc.in" },
  { name: "Patna Precious Metal AHC", city: "Patna", state: "Bihar", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 2112:2014"], phone: "0612-222-3300", email: "patna@pmah.in" },
  { name: "Bhopal Hallmarking Centre", city: "Bhopal", state: "Madhya Pradesh", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016"], phone: "0755-255-6600", email: "bhopal@hlc.in" },
  { name: "Nagpur Gold Testing Centre", city: "Nagpur", state: "Maharashtra", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 1418-2:2022"], phone: "0712-244-9900", email: "nagpur@gtc.in" },
  { name: "Kochi Jewellery Assaying Centre", city: "Kochi", state: "Kerala", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 2112:2014"], phone: "0484-236-5500", email: "kochi@jac.in" },
  { name: "Thrissur Hallmarking Laboratory", city: "Thrissur", state: "Kerala", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016"], phone: "0487-242-3300", email: "thrissur@hl.in" },
  { name: "Chandigarh Assay Centre", city: "Chandigarh", state: "Chandigarh", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 13782:2019"], phone: "0172-270-4400", email: "chandigarh@ac.in" },
  { name: "Ludhiana Jewellery Hallmark Centre", city: "Ludhiana", state: "Punjab", kind: "AHC", capabilities: ["hallmark"], standards: ["IS 1417:2016", "IS 9529:2019"], phone: "0161-240-5600", email: "ludhiana@jhc.in" },
];
