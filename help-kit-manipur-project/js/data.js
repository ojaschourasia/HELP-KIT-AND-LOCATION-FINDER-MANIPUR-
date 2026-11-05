const TOURIST_SPOTS = [
  { id:'kangla', name:'Kangla Fort', lat:24.8074625, lng:93.9427969, desc:'Ancient seat of the Meitei kings, with the Kangla Museum, sacred ponds and temple ruins. Entry ₹20 (Indians).', fee:'₹20 entry' },
  { id:'ima', name:'Ima Market (Women\'s Market)', lat:24.8078205, lng:93.933837, desc:'500-year-old all-women-run market — the largest of its kind in Asia. Best visited 9:30am–6pm, closed Sundays.', fee:'Free entry' },
  { id:'govindajee', name:'Govindajee Temple', lat:24.8043939, lng:93.9216927, desc:'Gold-domed Vaishnavite temple next to Kangla, famous for evening aarti. Open daily, free entry.', fee:'Free entry' },
  { id:'shaheed', name:'Shaheed Minar (BT Park)', lat:24.8070012, lng:93.9368884, desc:'Memorial park for the martyrs of the 1891 Anglo-Manipur War, right in the heart of Imphal.', fee:'Free entry' },
  { id:'cheirao', name:'Cheirao Ching Hills', lat:24.8403325, lng:93.9334407, desc:'A popular sunrise hiking spot on Imphal\'s outskirts with viewing towers over the whole valley.', fee:'Free entry' },
  { id:'sekta', name:'Sekta Living Museum', lat:24.8956264, lng:94.0381121, desc:'A protected archaeological site ~16km from Imphal showing medieval Meitei burial practices.', fee:'Free entry' },
  { id:'orchid', name:'Khonghampat Orchidarium', lat:24.8812957, lng:93.9070250, desc:'State orchid garden on NH2, home to hundreds of wild Manipuri orchid varieties.', fee:'Small entry fee' },
  { id:'andro', name:'Andro Village', lat:24.7515014, lng:94.0370256, desc:'A heritage Meitei village ~25km from Imphal known for pottery, local rice-beer and Maibi culture.', fee:'Free to explore' },
  { id:'loktak', name:'Loktak Lake / Moirang', lat:24.5593375, lng:93.8146526, desc:'The largest freshwater lake in Northeast India, famous for its floating phumdis and Sendra viewpoint.', fee:'Boat rides extra' },
  { id:'keibul', name:'Keibul Lamjao National Park', lat:24.4787980, lng:93.8395226, desc:'The world\'s only floating national park — last home of the endangered Sangai (dancing deer).', fee:'Park entry fee' },
  { id:'ina', name:'INA Memorial & War Museum', lat:24.5035, lng:93.7765, desc:'Netaji Subhash Chandra Bose raised the Indian flag here in 1944. Closed Mon & Sat.', fee:'₹10 entry' },
  { id:'nongmaiching', name:'Nongmaiching Hill', lat:24.804, lng:94.035, desc:'A sacred pilgrimage hill on the east edge of the Imphal valley with sweeping viewpoints, holy pools and a trekking trail to the summit.', fee:'Free entry' },
  { id:'khongjom', name:'Khongjom War Memorial', lat:24.6447, lng:94.0128, desc:'Memorial on Kheba Hillock, ~36km from Imphal on the Indo-Myanmar road, marking the final battle of the 1891 Anglo-Manipur War.', fee:'Free entry' },
  { id:'bishnupur', name:'Bishnupur (Vishnu Temple)', lat:24.6333, lng:93.7667, desc:'A 15th-century Vishnu temple built in a distinctive small-brick style, with Bishnupur town also known for chiselled stoneware.', fee:'Free entry' },
  { id:'singda', name:'Singda Dam', lat:24.7658, lng:93.8392, desc:'A reservoir and popular picnic spot in the Red Hill (Lokpaching) area, ~16km west of Imphal with valley viewpoints.', fee:'Free entry' },
  { id:'moreh', name:'Moreh (India–Myanmar border)', lat:24.2167, lng:94.3167, desc:'A border trade town on the Indo-Myanmar frontier, ~110km from Imphal — a full-day trip for the border market and crossing.', fee:'Free entry' },
  { id:'iiitm_city', name:'IIIT Manipur — City Campus', lat:24.8432251, lng:93.9396579, desc:'The institute\'s working 13-acre campus on NH2, Mantripukhri — classrooms, labs, admin block, right opposite the Software Technology Park.', fee:'Campus — not a public attraction' },
  { id:'iiitm_kmr', name:'IIIT Manipur — Boys Hostel (KMR)', lat:24.8232228, lng:93.9377316, desc:'KMR Boys Hostel, Thangmeiband — one of the off-campus boys\' hostel blocks, a few km south of the main city campus.', fee:'Hostel — residents only' },
  { id:'iiitm_hqhostel', name:'IIIT Manipur — Boys Hostel (near Police HQ)', lat:24.8420, lng:93.9405, desc:'Boys\' hostel block within the Mantripukhri campus area, right next to the new Manipur Police Headquarters building.', fee:'Hostel — residents only' },
  { id:'iiitm_senapati', name:'IIIT Manipur — New Campus (Senapati, under construction)', lat:25.1965470, lng:93.9969739, desc:'The institute\'s permanent 150-acre campus being built at Mayangkhang, Senapati district — still under construction, roughly 50km from Imphal.', fee:'Under construction' },
  { id:'nitm', name:'NIT Manipur', lat:24.8320247, lng:93.9126801, desc:'National Institute of Technology Manipur, Langol Road, Lamphelpat — a national-importance engineering institute.', fee:'Campus — not a public attraction' },
  { id:'mitm', name:'MIT Manipur (Manipur Institute of Technology)', lat:24.7547194, lng:93.9265327, desc:'Manipur Institute of Technology, Takyelpat — the engineering college under Manipur University.', fee:'Campus — not a public attraction' },
  { id:'airport', name:'Imphal Airport (Bir Tikendrajit Intl.)', lat:24.7647107, lng:93.8972574, desc:'Manipur\'s only airport, on NH2 about 8km from the city centre — IndiGo, Air India and Alliance Air all fly from here.', fee:'—' },
];

// Campuses/hostels/airport are reference points for Explore Nearby, not sightseeing stops, so they start unchecked in the trip planner.
const NON_TOURIST_IDS = ['iiitm_city','iiitm_kmr','iiitm_hqhostel','iiitm_senapati','nitm','mitm','airport'];

const CATEGORIES = [
  { id:'hotel', label:'Hotels', icon:'🛏️' },
  { id:'hospital', label:'Hospitals', icon:'🏥' },
  { id:'police', label:'Police', icon:'🚓' },
  { id:'pharmacy', label:'Pharmacies', icon:'💊' },
  { id:'bank', label:'Banks', icon:'🏦' },
  { id:'atm', label:'ATMs', icon:'🏧' },
  { id:'cafe', label:'Cafés', icon:'☕' },
  { id:'restaurant', label:'Restaurants', icon:'🍽️' },
  { id:'washroom', label:'Washrooms', icon:'🚻' },
];

const PLACES = [
  {n:"Manipur House (Guest House)",c:"hotel",lat:24.8041812,lng:93.9181448,a:"Tera Bazaar, Sagolband, Imphal",r:4.6,rc:330,ph:"+91 85859 02424",pl:1,pid:"ChIJ24G7OgEnSTcRjzjFQz-7EIA",tag:"Budget‑friendly"},
  {n:"Hotel Orchid Imphal",c:"hotel",lat:24.8165361,lng:93.9383918,a:"Khoyathong, Thangmeiband, Imphal",r:4.4,rc:10,ph:null,pl:2,pid:"ChIJn3U9AAAnSTcRyqq6A8JywIY",tag:"Affordable"},
  {n:"Hotel Daani Continental",c:"hotel",lat:24.8226134,lng:93.939292,a:"Thangmeiband, Imphal",r:4.4,rc:360,ph:"+91 87876 34494",pl:2,pid:"ChIJg0p2SXEnSTcRxIthwahGECU",tag:"Mid‑range"},
  {n:"Hotel Imphal By The Classic",c:"hotel",lat:24.8179731,lng:93.9448267,a:"North A.O.C, Imphal",r:4.2,rc:2455,ph:"+91 88374 40054",pl:2,pid:"ChIJf58ntqcnSTcRuzUTRHBfBN4",tag:"Central location"},
  {n:"THE PADMA Hotel",c:"hotel",lat:24.80959,lng:93.9353179,a:"Thangal Bazar, Imphal",r:4.1,rc:159,ph:"+91 385 244 9700",pl:2,pid:"ChIJr1ZSvtgnSTcRUL-bT8yPmM8",tag:"Mid‑range"},
  {n:"Aurora Boutique Hotel",c:"hotel",lat:24.8058437,lng:93.9352742,a:"Polo Ground Rd, Paona Bazar, Imphal",r:4.7,rc:679,ph:"+91 70058 36160",pl:3,pid:"ChIJGcD7gYUnSTcR35x6Ti_tM9Q",tag:"Popular"},
  {n:"Eco Heritage Villas & Resort (Near Airport)",c:"hotel",lat:24.739665,lng:93.8754683,a:"Malom Tuliyaima, near airport",r:4.6,rc:157,ph:"+91 70058 18925",pl:2,pid:"ChIJw4VC5vgvSTcREsWKzfiYPXg",tag:"Homestay feel"},
  {n:"Lake View Hotel, Moirang",c:"hotel",lat:24.4978768,lng:93.7642803,a:"Tiddim Rd, opp. Moirang, Loktak area",r:4.0,rc:85,ph:"+91 84138 50665",pl:1,pid:"ChIJiU3gemo1STcRMf2N0XlL2lw",tag:"Budget · near Loktak"},
  {n:"Hotel Elegance Resort",c:"hotel",lat:24.4868808,lng:93.7570814,a:"Okshongbung Leikai, Moirang",r:4.1,rc:125,ph:"+91 89747 92955",pl:2,pid:"ChIJz0tn2FE1STcRlvSegQRoy1A",tag:"Near Loktak"},
  {n:"Laisoi Farm Floating Homestay",c:"hotel",lat:24.4989497,lng:93.8012285,a:"Laisoi Village, Moirang (on Loktak Lake)",r:4.8,rc:83,ph:"+91 69091 53441",pl:1,pid:"ChIJY1PhOVU1STcRzh1wh5Znqmc",tag:"Budget · on the lake"},
  {n:"Budha Loktak Homestays",c:"hotel",lat:24.5155095,lng:93.7943767,a:"Sendra Rd, Thanga, Loktak Lake",r:4.8,rc:79,ph:"+91 84139 50259",pl:1,pid:"ChIJVTIP6PU1STcR9zYLUNOeJLo",tag:"Budget · on the lake"},
  {n:"LOKTAK AQUAMARINE Floating Homestay & Campsite",c:"hotel",lat:24.4960768,lng:93.8004339,a:"Takmu, Loktak Lake, Moirang",r:4.5,rc:207,ph:"+91 80149 21286",pl:1,pid:"ChIJ10OB4XE1STcRFWpvlVJIxz4",tag:"Budget · on the lake"},
  {n:"Sendra Park & Resort",c:"hotel",lat:24.5152516,lng:93.7951698,a:"Sendra, Thanga, Loktak Lake",r:4.3,rc:1201,ph:"+91 81319 80420",pl:2,pid:"ChIJpSSH_K81STcRPxY0Hjan3fk",tag:"Popular · lake view"},
  {n:"Shalom Farmhouse",c:"hotel",lat:24.8429835,lng:93.9316440,a:"Raphei Colony, Mantripukhri (near Khonghampat)",r:4.3,rc:177,ph:"+91 60097 61638",pl:2,pid:"ChIJz_N2k0AnSTcRnVWHyNTTUyM",tag:"Peaceful, pool"},

  {n:"Shija Hospitals and Research Institute",c:"hospital",lat:24.8353973,lng:93.9139669,a:"Langol Housing Complex, Imphal",r:4.1,rc:1053,ph:"+91 70850 12345",pl:null,pid:"ChIJi3Hl0-UnSTcRJu0ajAYnZLw",tag:"Multi‑specialty · 24hr",web:"https://www.shijahospitals.com/"},
  {n:"Regional Institute of Medical Sciences (RIMS)",c:"hospital",lat:24.8158998,lng:93.9228051,a:"Lamphel Rd, Imphal",r:3.8,rc:366,ph:"+91 385 241 4629",pl:null,pid:"ChIJGZkxw8gnSTcR1-2hl8zpAGk",tag:"Govt. hospital · 24hr",web:"https://www.rims.edu.in/"},
  {n:"Sky Hospital & Research Centre",c:"hospital",lat:24.8130175,lng:93.9280891,a:"RIMS Rd, Uripok, Imphal",r:4.1,rc:332,ph:"+91 84159 38207",pl:null,pid:"ChIJ91E1R7YnSTcRPPw_9T5oZxQ",tag:"Cardiology · 24hr"},
  {n:"Hillside Charitable Hospital",c:"hospital",lat:24.8270875,lng:93.9333281,a:"Thangmeiband, Imphal",r:3.9,rc:85,ph:"+91 70054 46875",pl:null,pid:"ChIJV_JTub0nSTcRqZnC4AYdyDg",tag:"Affordable · charitable"},
  {n:"Asian Hospital and Research Institute",c:"hospital",lat:24.7879204,lng:93.9223049,a:"Kwakeithel Rd, Imphal",r:3.2,rc:120,ph:null,pl:null,pid:"ChIJS1jITTkmSTcRoq8skqvPqXQ",tag:"24hr"},
  {n:"Catholic Medical Centre (CMC)",c:"hospital",lat:24.8835829,lng:93.9209115,a:"Koirengei, Imphal East",r:3.8,rc:84,ph:"+91 385 242 7372",pl:null,pid:"ChIJL2pK_jvYSDcRLXPWiuDRSG4",tag:"24hr"},

  {n:"City Police Station",c:"police",lat:24.8104523,lng:93.9369592,a:"M.G. Avenue, Gandhi Ave, Thangal Bazar, Imphal",r:null,rc:null,ph:null,pl:null,pid:"ChIJ3badB7InSTcRwvBcaw-MBt8",tag:"Central Imphal · 24hr",web:"https://manipurpolice.gov.in/"},
  {n:"Manipur Police Headquarters (New) — Mantripukhri",c:"police",lat:24.8412708,lng:93.9414281,a:"Mantripukhri, Imphal (next to IIIT Manipur)",r:4.2,rc:12,ph:null,pl:null,pid:"ChIJVZxiCwAnSTcRpOKrDeW3wiI",tag:"HQ · near IIIT campus",web:"https://manipurpolice.gov.in/"},
  {n:"Manipur Police Headquarters (Old) — Babupara",c:"police",lat:24.8010453,lng:93.9417775,a:"NH-39, Babupara, Imphal",r:null,rc:null,ph:"+91 385 244 0100",pl:null,pid:"ChIJATFRjlMmSTcRysimIda23zc",tag:"HQ · central Imphal",web:"https://manipurpolice.gov.in/"},
  {n:"Lamphel Police Station",c:"police",lat:24.8198974,lng:93.9249237,a:"Lamphelpat, Imphal",r:null,rc:null,ph:"+91 385 241 4616",pl:null,pid:"ChIJNeeCpscnSTcRk-n426X4Vcs",tag:"24hr",web:"https://manipurpolice.gov.in/"},
  {n:"Kwakeithel Police Station",c:"police",lat:24.786845,lng:93.9211391,a:"Lourembam Leikai, Imphal",r:null,rc:null,ph:null,pl:null,pid:"ChIJTR1XGjwmSTcR4e6AsSm3Gis",tag:"24hr",web:"https://manipurpolice.gov.in/"},
  {n:"Women Police Station",c:"police",lat:24.8063948,lng:93.9592496,a:"Porompat DC Rd, Thawanthaba Leirak, Imphal",r:null,rc:null,ph:null,pl:null,pid:"ChIJScTUO6InSTcRwpXKkrBFLYI",tag:"Women's helpdesk",web:"https://manipurpolice.gov.in/"},
  {n:"Irilbung Police Station",c:"police",lat:24.7701789,lng:93.9649043,a:"Lrilbung Brg Rd, Kshetrigao, Imphal East",r:null,rc:null,ph:null,pl:null,pid:"ChIJSXgR7gIkSTcRZwqxpd1WJSk",tag:"24hr",web:"https://manipurpolice.gov.in/"},
  {n:"Moirang Police Station",c:"police",lat:24.4988625,lng:93.7646094,a:"Tiddim Road, Pasang Leikai, Moirang",r:null,rc:null,ph:null,pl:null,pid:"ChIJoWJbjmo1STcRBr1BTGapIOQ",tag:"Near Loktak/INA",web:"https://manipurpolice.gov.in/"},
  {n:"Loktak Police Station",c:"police",lat:24.5793339,lng:93.7430291,a:"Zero Colony, Ningthoukhong, Loktak",r:null,rc:null,ph:null,pl:null,pid:"ChIJjSDjrqzMTjcRRT9T1RT8VLE",tag:"Near Loktak Lake",web:"https://manipurpolice.gov.in/"},
  {n:"Andro Police Station",c:"police",lat:24.7011158,lng:94.0236998,a:"Angtha–Yairipok Road, Angtha, near Andro",r:null,rc:null,ph:null,pl:null,pid:"ChIJk_Bc9gMjSTcRMK_TNu97PF4",tag:"Near Andro village",web:"https://manipurpolice.gov.in/"},

  {n:"ROOTED Coffee & Eatery",c:"cafe",lat:24.8256597,lng:93.9442195,a:"Dewlahland, Imphal",r:4.5,rc:59,ph:"+91 93667 63459",pl:2,pid:"ChIJ90MIlBcnSTcR5S2aSt59Mmo",tag:"Best coffee"},
  {n:"TIMBER CAFE IMPHAL",c:"cafe",lat:24.8237013,lng:93.9441334,a:"Chingmeirong, Imphal",r:4.0,rc:431,ph:"+91 96251 05197",pl:2,pid:"ChIJ-R8MHKEnSTcRMxKcU2PfDt8",tag:"Great ambience"},
  {n:"De Avenue Cafe",c:"cafe",lat:24.806126,lng:93.9494217,a:"New Checkon Rd, Imphal",r:4.1,rc:274,ph:"+91 97740 03807",pl:2,pid:"ChIJwQlfNtUnSTcR22XLbRmUzBk",tag:"Affordable"},
  {n:"The Farm Cafe",c:"cafe",lat:24.8437921,lng:93.9316185,a:"Raphei Valley Rd, Mantripukhri",r:4.5,rc:120,ph:null,pl:2,pid:"ChIJY6SqaoUnSTcRpjSxK7M1PhQ",tag:"Peaceful, out of town"},
  {n:"Harvest Cafe x Kitchen",c:"cafe",lat:24.7753497,lng:93.9100313,a:"Sangaiprou, Imphal",r:4.3,rc:331,ph:"+91 63643 35642",pl:null,pid:"ChIJRfm7Y0YnSTcRpOwKP6MbsnY",tag:"Open-air"},
  {n:"TASTE BITE CAFE",c:"cafe",lat:24.7497138,lng:94.0396582,a:"Andro village",r:5.0,rc:2,ph:"+91 69094 58806",pl:null,pid:"ChIJtz7BmGIjSTcRZwVDcO_RFBM",tag:"Right in Andro"},
  {n:"Cornerstone Cafe Korean Kitchen",c:"cafe",lat:24.8246912,lng:93.9501194,a:"Khuman Lampak Stadium Rd, Imphal",r:4.1,rc:219,ph:"+91 93628 07930",pl:2,pid:"ChIJJ9R900omSTcRyTvgIvoAGtU",tag:"Korean food"},

  {n:"SomeWhere Cafe & Restaurant",c:"restaurant",lat:24.7905502,lng:93.954798,a:"Wangkhei, Imphal",r:4.5,rc:75,ph:null,pl:2,pid:"ChIJ0bwDBQAnSTcRcRvIyThUIZw",tag:"Family friendly"},
  {n:"Leirung Resto",c:"restaurant",lat:24.7799838,lng:93.9131578,a:"Airport Rd, opp. ISKCON temple, Imphal",r:4.7,rc:970,ph:"+91 76660 88667",pl:2,pid:"ChIJRSlMgc0nSTcRvpGZvEjFf5Y",tag:"Very popular"},
  {n:"Le Zara Imphal",c:"restaurant",lat:24.8221685,lng:93.9394891,a:"DM College Rd, Thangmeiband",r:4.0,rc:213,ph:"+91 92339 40806",pl:2,pid:"ChIJl9_SNKgnSTcRzUM_KhHeVCo",tag:"Multi‑cuisine"},
  {n:"Eden Lounge Imphal",c:"restaurant",lat:24.7941042,lng:93.9152426,a:"Sagolband, Imphal",r:4.0,rc:507,ph:"+91 70059 11756",pl:2,pid:"ChIJCXO0eqgnSTcRESLn2N00QXw",tag:"Scenic garden setting"},
  {n:"Sawadee Restaurant",c:"restaurant",lat:24.8252753,lng:93.946863,a:"Khuman Lampak, near ISBT, Imphal",r:4.2,rc:95,ph:"+91 98994 12569",pl:null,pid:"ChIJ48RZDFInSTcRphvKTjZdBDk",tag:"Thai food"},
  {n:"ROM Group 3 (ROM Hangout)",c:"restaurant",lat:24.8136155,lng:93.9265866,a:"RIMS Rd, Thangmeiband",r:4.4,rc:250,ph:"+91 97741 61660",pl:2,pid:"ChIJL3i_3DknSTcRsk9G2Mlds0U",tag:"Casual, big groups"},
  {n:"Delish",c:"restaurant",lat:24.82541,lng:93.9378137,a:"Thangmeiband, Imphal",r:4.3,rc:91,ph:null,pl:2,pid:"ChIJx-L4j48nSTcRvSWvMQtraF8",tag:"Affordable, good reviews"},
  {n:"HOTEL KANGLEIPAK Restaurant",c:"restaurant",lat:24.506352,lng:93.785687,a:"Moirang, near Loktak Lake",r:4.6,rc:22,ph:"+91 69091 51358",pl:2,pid:"ChIJ1QkbAAA1STcRIRHYltIxqHw",tag:"Fresh lake fish · near Loktak"},
  {n:"Jen Aura Restaurant",c:"restaurant",lat:24.6249853,lng:93.762370,a:"Ward No.7, Bishnupur (en route to Loktak)",r:4.7,rc:195,ph:"+91 99166 74708",pl:null,pid:"ChIJKQEsdAAzSTcRyGVHsVe7U94",tag:"Great service · near Loktak"},
  {n:"Taste of Andro",c:"restaurant",lat:24.7515014,lng:94.0370256,a:"Kharam Leikai, near Santhei Park, Andro",r:4.1,rc:47,ph:null,pl:2,pid:"ChIJEw2NjQIjSTcRYrFAyPXHOQc",tag:"Local Andro cuisine"},
  {n:"Black Bowl",c:"restaurant",lat:24.7996823,lng:93.9497228,a:"Andro Parking, Angom Colony, Imphal",r:4.7,rc:15,ph:null,pl:4,pid:"ChIJwQTJrlEnSTcRiPRf1ycXoog",tag:"Thai & Burmese"},
  {n:"Farm To Table Restaurant",c:"restaurant",lat:24.820721,lng:93.9592406,a:"Imphal–Ukhrul Rd, Khurai, Imphal",r:4.6,rc:17,ph:null,pl:2,pid:"ChIJXeiRcgAnSTcRnDq43OromxI",tag:"Organic, farm-fresh"},
  {n:"AL-Hayat Food Corner",c:"restaurant",lat:24.7152399,lng:93.9423544,a:"Indo-Myanmar Rd, Lilong, Thoubal",r:4.2,rc:1931,ph:"+91 69099 05006",pl:2,pid:"ChIJbax8u8YlSTcRySWqUHuykVY",tag:"24hr · beef specialist"},
  {n:"MANGAL MEDICAL STORE",c:"pharmacy",lat:24.8099828,lng:93.9342357,a:"Near Kasturi Bridge, Thangal Bazar",r:4.6,rc:14,ph:"+91 69096 90086",pl:null,pid:"ChIJl9j8NLInSTcRtoXyNNRywZA",tag:"Thangal Bazar",hrs:["8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–1:00 PM"]},
  {n:"Navjivan Pharmacy",c:"pharmacy",lat:24.8094642,lng:93.9343634,a:"63-A, Thangal Bazar",r:4.3,rc:19,ph:null,pl:null,pid:"ChIJo3AhS7InSTcRL201CL0cY0M",tag:"One of the oldest in Manipur",hrs:["8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–6:00 PM","8:00 AM–1:00 PM"]},
  {n:"SANJEEVANI PHARMA",c:"pharmacy",lat:24.8099746,lng:93.9342619,a:"Thangal Bazar",r:4.5,rc:11,ph:"+91 385 244 5138",pl:null,pid:"ChIJVc88y7MnSTcROi4P0YKdHwU",tag:"Thangal Bazar",hrs:null},
  {n:"Medicure Pharma",c:"pharmacy",lat:24.8098711,lng:93.9341921,a:"Kasturi Building, Nagamapal, Thangal Bazar",r:5.0,rc:7,ph:null,pl:null,pid:"ChIJAQAAQLInSTcR3TobF7fDCSQ",tag:"Early opening",hrs:["7:00 AM–7:00 PM","7:00 AM–7:00 PM","7:00 AM–7:00 PM","7:00 AM–7:00 PM","7:00 AM–7:00 PM","7:00 AM–7:00 PM","7:00 AM–12:00 PM"]},
  {n:"Khalsa Pharmacy",c:"pharmacy",lat:24.8096056,lng:93.9355624,a:"Near Canara Bank, Thangal Bazar",r:3.6,rc:5,ph:"+91 87298 65551",pl:null,pid:"ChIJszY7IbInSTcRXKMKtSDqNYc",tag:"Thangal Bazar",hrs:null},
  {n:"Mangal Pharmacy (Uripok)",c:"pharmacy",lat:24.8121205,lng:93.9243844,a:"Near Langon View, Uripok",r:5.0,rc:2,ph:"+91 96159 00712",pl:null,pid:"ChIJT1asbGInSTcRsDgh46V8EKQ",tag:"Open 24 hrs · near RIMS",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"Medleaf Pharmacy",c:"pharmacy",lat:24.8122977,lng:93.9245564,a:"RIMS Rd, Kombirei Keithel, Uripok",r:5.0,rc:1,ph:null,pl:null,pid:"ChIJi-nlYQAnSTcRy5sftmNGaKo",tag:"Open 24 hrs · near RIMS",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"Doctor Plus Pharmacy",c:"pharmacy",lat:24.7935545,lng:93.9592453,a:"Ayangpalli Rd, Wangkhei",r:5.0,rc:1,ph:"+91 87983 67442",pl:null,pid:"ChIJca2xGiknSTcRhpbUzQKUEaw",tag:"Open 24 hrs",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"Ali Pharmacy",c:"pharmacy",lat:24.8014898,lng:93.976694,a:"Meena Bazar, Idgah Rd",r:4.8,rc:4,ph:null,pl:null,pid:"ChIJI1hUMdgmSTcRsLXGlvd4b2o",tag:"Open 24 hrs",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"DEN Pharmacy",c:"pharmacy",lat:24.788365,lng:93.9227761,a:"Kwakeithel Makha, Akham Leikai",r:5.0,rc:1,ph:"+91 98629 06879",pl:null,pid:"ChIJa283PfEnSTcRM2OOi6sjpo8",tag:"Open 24 hrs",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"SBI Branch Paona Bazaar",c:"bank",lat:24.804849,lng:93.934614,a:"Paona Bazar, Imphal",r:2.5,rc:52,ph:"+91 1800 1234",hl:true,pl:null,pid:"ChIJRXPZ3bInSTcRpghQ2Sn9foo",tag:"State Bank of India",hrs:["10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","Closed"]},
  {n:"Bank of India (Paona Bazar)",c:"bank",lat:24.8056466,lng:93.9344466,a:"JMJ Shopping Complex, Paona Bazar",r:3.7,rc:33,ph:"+91 385 244 9164",pl:null,pid:"ChIJW-Zi1rInSTcRokUAAhr4cdY",tag:"Bank + ATM",hrs:["9:30 AM–5:00 PM","9:30 AM–5:00 PM","9:30 AM–5:00 PM","9:30 AM–5:00 PM","9:30 AM–5:00 PM","9:30 AM–5:00 PM","Closed"]},
  {n:"Punjab National Bank (Paona Bazar)",c:"bank",lat:24.8046866,lng:93.9346504,a:"Paona Int'l Mkt Rd, 1st Floor",r:3.4,rc:25,ph:"+91 1800 1800",hl:true,pl:null,pid:"ChIJxS65Lk0mSTcRVE8WO_2LETA",tag:"PNB",hrs:["10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","10:00 AM–4:00 PM","Closed"]},
  {n:"Central Bank of India (Paona Bazar)",c:"bank",lat:24.8028469,lng:93.9346156,a:"Paona Bazar",r:3.7,rc:22,ph:"+91 385 244 4419",pl:null,pid:"ChIJBYeCBE0mSTcR4bwpdL_97PI",tag:"Central Bank",hrs:null},
  {n:"HDFC Bank (Khwai Bazar)",c:"bank",lat:24.8082377,lng:93.9353642,a:"87/A, Khwai Bazar, Paona Bazar",r:3.1,rc:16,ph:"+91 1800 1601",hl:true,pl:null,pid:"ChIJFRcpX7InSTcRm6wxtTJlbpM",tag:"Bank + ATM",hrs:["9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","Closed"]},
  {n:"Axis Bank (Paona Bazaar)",c:"bank",lat:24.8103959,lng:93.9367266,a:"Y Building, Paona Bazar",r:4.6,rc:43,ph:"+91 1860 500 5555",hl:true,pl:null,pid:"ChIJDbtw1EwmSTcRkSio4b_OGv0",tag:"Best rated bank here",hrs:["9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","9:30 AM–3:30 PM","Closed"]},
  {n:"The Manipur Women's Co-operative Bank",c:"bank",lat:24.8048039,lng:93.9345895,a:"Paona Int'l Mkt Rd, Paona Bazar",r:3.4,rc:5,ph:"+91 385 245 1491",pl:null,pid:"ChIJLxWpI00mSTcRoLlE13V6NzQ",tag:"Women-run co-op bank",hrs:null},
  {n:"Bandhan Bank (Paona Bazar)",c:"bank",lat:24.8023007,lng:93.9349799,a:"Lok Radha Building, Paona Bazar",r:null,rc:null,ph:"+91 1800 258 8181",hl:true,pl:null,pid:"ChIJe3RY42YnSTcR2xk4gi5GOL4",tag:"Bandhan Bank",hrs:["9:30 AM–4:30 PM","9:30 AM–4:30 PM","9:30 AM–4:30 PM","9:30 AM–4:30 PM","9:30 AM–4:30 PM","9:30 AM–4:30 PM","Closed"]},
  {n:"Central Bank of India ATM (MG Ave)",c:"atm",lat:24.8107745,lng:93.9360688,a:"MG Avenue Rd, Thangal Bazar",r:2.9,rc:13,ph:"+91 1800 3030",hl:true,pl:null,pid:"ChIJ5czTHLInSTcRh0Bw3xDxraU",tag:"Some reviews say it is out of order",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"SBI ATM (Paona International Market)",c:"atm",lat:24.8004987,lng:93.9353566,a:"Paona International Market",r:5.0,rc:1,ph:"+91 1800 1234",hl:true,pl:null,pid:"ChIJLUtSwc8nSTcRZb0fp21ULVM",tag:"SBI",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"SBI E-Centre ATMs (MG Avenue)",c:"atm",lat:24.8060522,lng:93.9349793,a:"Paona Bazar",r:3.0,rc:36,ph:"+91 1800 11 2211",hl:true,pl:null,pid:"ChIJlylmyLInSTcRPeRCqeDJj88",tag:"Many machines · cash deposit · closed on holidays",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
  {n:"PNB ATM (Paona Bazar)",c:"atm",lat:24.804862,lng:93.934805,a:"Lamphelpat, Paona Bazar",r:1.8,rc:6,ph:"+91 1800 1800",hl:true,pl:null,pid:"ChIJLdsYJk0mSTcRyeqitzl8hWY",tag:"Reviews say it is often closed",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","Closed"]},
  {n:"Bank of India ATM (Governor Rd)",c:"atm",lat:24.8054587,lng:93.9351613,a:"Governor Rd, Paona Bazar",r:2.3,rc:4,ph:"+91 22 4091 9191",hl:true,pl:null,pid:"ChIJjQaBzrInSTcR3rcWqLzzMjM",tag:"Bank of India",hrs:["24 hours","24 hours","24 hours","24 hours","24 hours","24 hours","24 hours"]},
];

const ITINERARY = [
  { title:'Imphal Heritage & Culture', stops:[
      {id:'kangla', time:'9:00 AM', note:'Start with the Kangla Fort complex — hire a cycle or e-cart, allow ~1.5 hrs.'},
      {id:'govindajee', time:'11:15 AM', note:'A 10-min walk from Kangla. Catch the late-morning aarti if timed right.'},
      {id:'ima', time:'12:30 PM', note:'Lunch + shopping at the all-women Ima Market — try chak-hao kheer (black rice).'},
      {id:'shaheed', time:'4:00 PM', note:'Short, relaxed evening walk through BT Park before it gets dark.'},
    ]},
  { title:'Nature & Heritage Outskirts', stops:[
      {id:'cheirao', time:'5:30 AM', note:'Sunrise hike up Cheirao Ching — best views of the whole Imphal valley.'},
      {id:'orchid', time:'9:30 AM', note:'Cool down at the Khonghampat Orchidarium, ~30 min drive from the hills.'},
      {id:'sekta', time:'12:00 PM', note:'Sekta Living Museum — a quieter archaeological stop, ~16km from town.'},
    ]},
  { title:'Loktak Lake Day', stops:[
      {id:'ina', time:'8:30 AM', note:'Drive ~45km to Moirang; visit the INA Memorial & War Museum (closed Mon/Sat).'},
      {id:'loktak', time:'11:00 AM', note:'Head to Sendra for the iconic floating-phumdi boat ride on Loktak Lake.'},
      {id:'keibul', time:'2:30 PM', note:'Keibul Lamjao National Park — best Sangai deer sightings are early morning, but an afternoon boat ride is still worthwhile.'},
    ]},
  { title:'Andro Heritage Village', stops:[
      {id:'andro', time:'10:00 AM', note:'Explore pottery workshops, the Maibi (priestess) tradition and try local rice-beer, ~25km from Imphal.'},
      {id:'ima', time:'3:30 PM', note:'Back in Imphal — a relaxed second pass through Ima Market for souvenirs before shops close.'},
    ]},
  { title:'Leisure & Departure', stops:[
      {id:'govindajee', time:'8:00 AM', note:'One last quiet visit for morning aarti before checkout.'},
      {id:'kangla', time:'9:30 AM', note:'Any sights you missed on Day 1, plus last-minute photos.'},
    ]},
];

/* ================= BUS ROUTES (sample/indicative — not a live feed) ================= */
const BUS_ROUTES = {
  "Guwahati, Assam": [
    {op:"Manipur State Transport", type:"Non-A/C Seater", depart:"05:30", hours:14, fare:[550,650]},
    {op:"Blue Hill Travels", type:"Non-A/C Seater", depart:"15:00", hours:15, fare:[600,700]},
    {op:"Network Travels", type:"A/C Sleeper", depart:"16:30", hours:13, fare:[1200,1500]},
  ],
  "Silchar, Assam": [
    {op:"Manipur State Transport", type:"Non-A/C Seater", depart:"06:00", hours:8, fare:[350,420]},
    {op:"Pioneer Travels", type:"A/C Seater", depart:"07:00", hours:7.5, fare:[550,650]},
  ],
  "Kohima, Nagaland": [
    {op:"Manipur State Transport", type:"Non-A/C Seater", depart:"06:30", hours:6, fare:[300,380]},
    {op:"Zion Travels", type:"A/C Seater", depart:"13:00", hours:5.5, fare:[500,600]},
  ],
  "Dimapur, Nagaland": [
    {op:"Manipur State Transport", type:"Non-A/C Seater", depart:"06:00", hours:8, fare:[380,450]},
    {op:"Network Travels", type:"A/C Sleeper", depart:"20:00", hours:7, fare:[900,1100]},
  ],
  "Shillong, Meghalaya": [
    {op:"Network Travels", type:"A/C Sleeper", depart:"16:00", hours:16, fare:[1300,1600]},
  ],
  "Aizawl, Mizoram": [
    {op:"Manipur State Transport", type:"Non-A/C Seater", depart:"05:00", hours:12, fare:[600,750]},
  ],
};

/* ================= FLIGHTS (links out to real airline sites — no booking here) ================= */
const FLIGHTS = [
  {name:"IndiGo", blurb:"Frequent domestic connections in and out of Imphal.", url:"https://www.goindigo.in/"},
  {name:"Air India", blurb:"Domestic and connecting flights via major metro hubs, including Air India Express.", url:"https://www.airindia.com/"},
  {name:"Alliance Air", blurb:"Regional carrier with the most routes out of Imphal, including smaller North-East towns.", url:"https://www.allianceair.in/"},
];

