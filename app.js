'use strict';
/* ============================================================
   DISASTERGUARD — INTELLIGENT DISASTER MANAGEMENT SYSTEM
   Emergency Response & Disaster Assistant
   ============================================================ */

// ===================== STATE =====================
let currentDisaster = 'flood';
let checkedSupplies = new Set();
let isTyping = false;
let map = null;
let mapLayers = { shelters: true, hospitals: true, hazards: true };
let mapMarkers = { shelters: [], hospitals: [], hazards: [] };
let userLocation = null;
let sosTimerInterval = null;
let selectedReportType = 'road';
let reportFilter = 'all';
let reportSeverityFilter = 'all';
let reportSearchTerm = '';
let communityReports = [];
let selectedRouteName = '';
let rescuedRegistry = [];
let foodRegistry = [];

// ===================== DISASTER DATA =====================
const disasterData = {
  flood:      { label:'FLOOD ALERT',      icon:'🌊', severity:'HIGH',   affected:'2,400,000', shelters:'847', teams:'120', rescued:'340', hospitals:'18', closures:'34', advisory:'Move to higher ground immediately. Avoid walking through floodwater — even 6 inches can knock you down.', shelterNearby:'12 Nearby', routeCount:'4 Open Routes', weather:{icon:'🌧️',temp:'28°C',cond:'Heavy Rain',wind:'45 km/h',humidity:'94%',visibility:'1.2 km',pressure:'985 hPa',uv:'Low'} },
  earthquake: { label:'EARTHQUAKE ALERT', icon:'🏔️', severity:'MEDIUM', affected:'1,100,000', shelters:'430', teams:'85',  rescued:'180', hospitals:'12', closures:'21', advisory:'Drop, Cover, and Hold On. Stay indoors away from windows. Watch out for aftershocks.', shelterNearby:'8 Nearby',  routeCount:'3 Open Routes', weather:{icon:'⛅',temp:'24°C',cond:'Partly Cloudy',wind:'20 km/h',humidity:'52%',visibility:'8 km',pressure:'1010 hPa',uv:'Moderate'} },
  cyclone:    { label:'CYCLONE ALERT',    icon:'🌀', severity:'HIGH',   affected:'3,200,000', shelters:'1200',teams:'200', rescued:'520', hospitals:'22', closures:'58', advisory:'Stay indoors. Board up windows. Do NOT go outside during the eye — calm is temporary.', shelterNearby:'15 Nearby', routeCount:'2 Open Routes', weather:{icon:'🌀',temp:'31°C',cond:'Cyclone Category 3',wind:'180 km/h',humidity:'98%',visibility:'0.3 km',pressure:'945 hPa',uv:'Extreme'} },
  accident:   { label:'ACCIDENT ALERT',  icon:'🚨', severity:'LOW',    affected:'340',       shelters:'12',  teams:'8',   rescued:'12',  hospitals:'5',  closures:'2',  advisory:'Call 112 immediately. Do not move injured persons unless there is fire risk. Keep area clear for responders.', shelterNearby:'3 Nearby', routeCount:'5 Open Routes', weather:{icon:'☀️',temp:'32°C',cond:'Clear',wind:'12 km/h',humidity:'45%',visibility:'12 km',pressure:'1015 hPa',uv:'High'} }
};

// ===================== SHELTER DATA =====================
const shelterData = [
  { id:1, name:'Anna University Relief Camp', status:'open',    distance:'0.8 km', address:'Sardar Patel Rd, Guindy, Chennai',          capacity:30,  current:600,  total:2000, tags:['🍽️ Food','🏥 Medical','🚿 Sanitation','💧 Water'],           phone:'044-22351000', lat:13.0119, lng:80.2352, types:['flood','cyclone'],                      hasMedical:true,  hasFood:true  },
  { id:2, name:'YMCA Ground Shelter',         status:'open',    distance:'1.4 km', address:'YMCA Rd, Nandanam, Chennai',                 capacity:55,  current:550,  total:1000, tags:['🍽️ Food','💧 Water','🛏️ Bedding'],                         phone:'044-24333999', lat:13.0181, lng:80.2410, types:['flood','cyclone','earthquake'],         hasMedical:false, hasFood:true  },
  { id:3, name:'Govt School Camp – Tambaram', status:'limited', distance:'3.2 km', address:'SH 48, Tambaram, Chennai',                    capacity:88,  current:440,  total:500,  tags:['💧 Water','🛏️ Bedding','⚡ Power'],                        phone:'044-22262100', lat:12.9249, lng:80.1000, types:['flood','earthquake','accident'],        hasMedical:false, hasFood:false },
  { id:4, name:'Red Cross Relief Centre',     status:'open',    distance:'2.1 km', address:'Poonamallee High Rd, Kilpauk, Chennai',       capacity:20,  current:600,  total:3000, tags:['🏥 Medical','🩺 First Aid','🍽️ Food','💧 Water'],          phone:'044-26425001', lat:13.0827, lng:80.2307, types:['flood','cyclone','earthquake','accident'], hasMedical:true,  hasFood:true  },
  { id:5, name:'Marina Beach Relief Zone',    status:'full',    distance:'4.5 km', address:'Beach Rd, Marina, Chennai',                   capacity:100, current:5000, total:5000, tags:['🍽️ Food','💧 Water'],                                      phone:'044-25384000', lat:13.0584, lng:80.2823, types:['flood','cyclone'],                      hasMedical:false, hasFood:true  },
  { id:6, name:'JN Stadium Camp',             status:'open',    distance:'5.8 km', address:'Jawaharlal Nehru Rd, Periamet, Chennai',       capacity:40,  current:1200, total:3000, tags:['🍽️ Food','🏥 Medical','💧 Water','⚡ Power','🛏️ Bedding'], phone:'044-28444921', lat:13.0827, lng:80.2750, types:['flood','cyclone','earthquake'],         hasMedical:true,  hasFood:true  },
];

// ===================== HOSPITALS =====================
const hospitals = [
  { name:'Govt General Hospital',  dist:'1.2 km', type:'🏥 Multi-Specialty',       phone:'04425305000', lat:13.0827, lng:80.2707 },
  { name:'Apollo Hospitals',       dist:'2.8 km', type:'🏥 Private · ICU Available',phone:'04428296000', lat:13.0067, lng:80.2206 },
  { name:'AIIMS Chennai',          dist:'4.1 km', type:'🏥 Govt · Trauma Centre',   phone:'04429922222', lat:12.9791, lng:80.0988 },
  { name:'Fortis Malar Hospital',  dist:'3.5 km', type:'🏥 Private · Emergency 24/7',phone:'04442892222',lat:13.0003, lng:80.2500 },
];

// ===================== FIRST AID =====================
const firstAidGuides = {
  flood:      ['Move to highest available floor or rooftop immediately.','Do NOT drink flood water — it is contaminated. Use bottled water only.','Turn off electricity at the main switch to prevent electrocution.','Signal for help using bright cloth or torch light from rooftop.','Watch for symptoms of leptospirosis (fever, headache) after exposure.','Treat cuts with antiseptic — floodwater carries dangerous bacteria.'],
  earthquake: ['DROP to your hands and knees immediately to avoid being knocked down.','Take COVER under a sturdy desk or table, or against an interior wall.','HOLD ON and protect your head and neck with your arms.','Stay away from windows, exterior walls, and anything that could fall.','After shaking stops, check for injuries before moving.','Do NOT use elevators. Use stairs. Check for gas leaks before switching lights.'],
  cyclone:    ['Stay indoors away from windows and glass doors at all times.','Fill bathtubs and containers with clean water before power/water fails.','Charge all devices and keep emergency radio on battery mode.','If eye of storm passes and calm arrives — DO NOT go outside. It WILL resume.','Tie down or bring in any outdoor furniture or loose objects.','Keep documents (Aadhaar, insurance) in waterproof bag.'],
  accident:   ['Call 112 (National Emergency) or 108 (Ambulance) immediately.','Do NOT move injured persons unless there is immediate danger.','Control severe bleeding by applying firm pressure with cloth for 10+ minutes.','Keep the injured person warm and calm. Talk to them continuously.','If unconscious but breathing: recovery position (on side, head tilted back).','Do NOT give food or water to seriously injured persons.']
};

// ===================== SUPPLIES DATA =====================
const suppliesData = [
  { category:'Water & Food',        icon:'💧', items:[{text:'3-day water supply (3L/person/day)',priority:'critical'},{text:'Non-perishable food (canned goods)',priority:'critical'},{text:'Water purification tablets',priority:'critical'},{text:'Manual can opener',priority:'important'},{text:'Baby food / formula (if applicable)',priority:'important'}] },
  { category:'Medical Kit',         icon:'🩺', items:[{text:'First aid kit (bandages, antiseptic)',priority:'critical'},{text:'7-day supply of prescription medications',priority:'critical'},{text:'Thermometer & blood pressure cuff',priority:'important'},{text:'ORS packets for dehydration',priority:'important'},{text:'Pain relievers (Paracetamol)',priority:'important'},{text:'Antiseptic ointment & gloves',priority:'optional'}] },
  { category:'Documents & Money',   icon:'📋', items:[{text:'Aadhaar card / Passport copies',priority:'critical'},{text:'Cash in small denominations',priority:'critical'},{text:'Insurance documents',priority:'important'},{text:'Emergency contact list (printed)',priority:'critical'}] },
  { category:'Tools & Safety',      icon:'🔦', items:[{text:'Battery/hand-crank torch & batteries',priority:'critical'},{text:'Battery-powered or hand-crank radio',priority:'critical'},{text:'Whistle (to signal rescuers)',priority:'critical'},{text:'Rope (10m) and knife',priority:'important'},{text:'Dust masks (N95)',priority:'important'},{text:'Waterproof bags & plastic sheeting',priority:'important'}] },
  { category:'Clothing & Shelter',  icon:'🏕️', items:[{text:'Warm clothing & rain gear',priority:'critical'},{text:'Sturdy shoes for each person',priority:'critical'},{text:'Sleeping bags or warm blankets',priority:'important'},{text:'Work gloves for debris handling',priority:'optional'}] },
  { category:'Communication',       icon:'📱', items:[{text:'Fully charged power bank',priority:'critical'},{text:'Emergency app installed',priority:'critical'},{text:'Printed map of local area',priority:'important'},{text:'Satellite communicator (if available)',priority:'optional'}] },
];

// ===================== EVACUATION DATA =====================
const evacuationData = {
  flood: {
    label: 'Flood Mode',
    steps: [
      { icon:'📻', title:'Monitor Alerts', desc:'Turn on battery radio / TV. Listen to official evacuation orders from authorities. Do not wait until floodwater enters.' },
      { icon:'🔌', title:'Power Down', desc:'Turn off electricity at the main breaker. Disconnect gas supply. Move valuables to upper floors.' },
      { icon:'🎒', title:'Grab Go-Bag', desc:'Take pre-packed emergency bag: water, food, documents, medications, torch, phone charger. Max 5 minutes to pack.' },
      { icon:'🗺️', title:'Plan Your Route', desc:'Use NH-48 (Anna Salai) — currently safe. Avoid low-lying roads. Go to pre-identified shelter on high ground.' },
      { icon:'👨‍👩‍👧', title:'Account for Family', desc:'Take all family members. Help elderly and disabled neighbors. Leave a note with your destination.' },
      { icon:'🏠', title:'Reach Shelter', desc:'Check in at official shelter. Register your name and family. Contact family to confirm safe arrival.' },
    ],
    dos: ['Move to higher ground early','Disconnect electrical appliances','Listen to official radio updates','Carry clean drinking water','Wear sturdy waterproof footwear'],
    donts: ['Walk through moving floodwater','Drive through flooded roads','Return home until all-clear given','Touch electrical wires in floodwater','Drink floodwater under any circumstances'],
  },
  earthquake: {
    label: 'Earthquake Mode',
    steps: [
      { icon:'⬇️', title:'Drop, Cover, Hold', desc:'Immediately DROP to hands and knees. Take COVER under sturdy furniture. HOLD ON until shaking stops. Do not run outside.' },
      { icon:'🔍', title:'Check for Injuries', desc:'After shaking stops, check yourself and others for injuries. Do not move severely injured persons.' },
      { icon:'👃', title:'Check for Hazards', desc:'Look for gas leaks (smell), fires, structural damage. Exit if safe. Do NOT use matches or switches if gas is suspected.' },
      { icon:'🏃', title:'Exit Carefully', desc:'Use stairs — never elevators. Watch for falling debris, broken glass, and unstable structures.' },
      { icon:'📍', title:'Move to Open Area', desc:'Go to open ground away from buildings, power lines, and trees. Do not re-enter buildings.' },
      { icon:'📻', title:'Await Aftershock Info', desc:'Aftershocks WILL follow. Stay in open area. Monitor radio for official updates and all-clear.' },
    ],
    dos: ['Drop, Cover, Hold during shaking','Move away from buildings after','Wear sturdy shoes (glass on floor)','Check for gas leaks carefully','Use battery torch, not candles'],
    donts: ['Run outside during shaking','Use elevators','Stand near windows or shelves','Light candles if gas suspected','Re-enter buildings until cleared'],
  },
  cyclone: {
    label: 'Cyclone Mode',
    steps: [
      { icon:'📻', title:'Monitor Storm Track', desc:'Track cyclone path on official weather sites (IMD). Know your evacuation zone (A/B/C). Zone A = evacuate now.' },
      { icon:'🏠', title:'Board Up Windows', desc:'Shut and board all windows and doors. Bring in all outdoor furniture. Fill water containers — supply may be cut.' },
      { icon:'⚡', title:'Backup Power', desc:'Charge all devices. Keep power banks full. Gather candles and battery lanterns. Switch off non-essential appliances.' },
      { icon:'🎒', title:'Evacuate if Ordered', desc:'If in Zone A or near coast — LEAVE NOW. Take coastal roads before wind increases. Do not wait until storm arrives.' },
      { icon:'🏠', title:'Stay Indoors During Storm', desc:'If sheltering in place, go to interior room on ground floor. Stay away from windows. Lie on floor if roof is at risk.' },
      { icon:'⚠️', title:'Eye of Storm Warning', desc:'If calm arrives suddenly — this is the EYE. Do NOT go outside. Storm will resume in minutes with equal or greater force.' },
    ],
    dos: ['Leave coastal areas before storm','Charge all devices early','Fill water before power cuts','Stay in interior rooms','Listen to IMD forecasts'],
    donts: ['Go out during eye of storm','Shelter under trees','Go near the coast during storm','Use generator indoors','Assume storm is over when calm arrives'],
  },
  accident: {
    label: 'Accident Mode',
    steps: [
      { icon:'🚨', title:'Secure the Scene', desc:'Switch on hazard lights. Place warning triangles 50m behind vehicle. Keep bystanders at safe distance.' },
      { icon:'📞', title:'Call Emergency Services', desc:'Call 112 (National Emergency) or 108 (Ambulance). Give exact location, number of victims, and type of accident clearly.' },
      { icon:'🩺', title:'Assess Victims', desc:'Check for consciousness. Do not move victims with potential spinal injuries. Only move if there is fire or drowning risk.' },
      { icon:'🩹', title:'Control Bleeding', desc:'Apply firm, direct pressure to wounds with clean cloth. Maintain pressure for 10+ minutes. Elevate limbs if possible.' },
      { icon:'🔥', title:'Fire Prevention', desc:'Turn off ignition. Do not smoke. If fire starts — move everyone 30m away immediately. Call 101 (Fire Brigade).' },
      { icon:'📋', title:'Document & Wait', desc:'Note vehicle registration, time, witnesses. Do not move vehicles until police arrive. Cooperate with emergency services.' },
    ],
    dos: ['Call 112 immediately','Place warning triangles','Apply pressure to bleeding wounds','Keep victims warm and calm','Document the scene'],
    donts: ['Move seriously injured persons','Remove embedded objects from wounds','Give food/water to injured','Leave the scene of accident','Move vehicles before police arrive'],
  },
};

// ===================== SAFE ROUTES DATA =====================
const safeRoutesData = {
  flood: [
    { name:'NH-48 (Anna Salai)', distance:'12 min', time:'Fastest clear route', risk:'Low', status:'Open', desc:'Primary route to the Red Cross shelter and central relief camp.' },
    { name:'Mount-Poonamallee Road', distance:'18 min', time:'Alternative route', risk:'Caution', status:'Caution', desc:'Use this if NH-48 gets congested; watch for standing water near junctions.' },
    { name:'Inner Ring Road', distance:'20 min', time:'Slow access', risk:'High', status:'Closed', desc:'Avoid during heavy rain due to waterlogging and debris.' }
  ],
  earthquake: [
    { name:'Rajiv Gandhi Salai', distance:'10 min', time:'Best emergency exit', risk:'Low', status:'Open', desc:'Wide, open route away from brittle buildings and flyovers.' },
    { name:'GST Road', distance:'16 min', time:'Secondary corridor', risk:'Caution', status:'Caution', desc:'Proceed carefully near bridge approaches and damaged roadside structures.' },
    { name:'EVR Periyar Road', distance:'22 min', time:'Avoid if possible', risk:'High', status:'Closed', desc:'Blocked by debris and unstable buildings near several intersections.' }
  ],
  cyclone: [
    { name:'Inner Ring Road', distance:'15 min', time:'Main evacuation corridor', risk:'Low', status:'Open', desc:'Protected inland route, preferred for coastal evacuation.' },
    { name:'Grand Southern Trunk', distance:'18 min', time:'Secondary route', risk:'Caution', status:'Caution', desc:'Use only if the wind is still manageable and roads are clear.' },
    { name:'Coastal Expressway', distance:'8 min', time:'Do not use', risk:'High', status:'Closed', desc:'Coastal roads are sealed and unsafe due to severe wind and flooding.' }
  ],
  accident: [
    { name:'Mount Road Bypass', distance:'8 min', time:'Best alternate route', risk:'Low', status:'Open', desc:'Fastest way around the accident zone during traffic disruption.' },
    { name:'OMR Service Road', distance:'12 min', time:'Relief route', risk:'Caution', status:'Caution', desc:'Use if the main carriageway is fully blocked; watch for congestion.' },
    { name:'NH-48 at KM 24', distance:'5 min', time:'Avoid this route', risk:'High', status:'Closed', desc:'Blocked by the active accident scene and emergency response vehicles.' }
  ]
};

// ===================== AI RESPONSES =====================
const aiResponses = {
  shelter: {
    flood:      '🏠 **Nearest Shelters for Flood Emergency:**\n\n1. **Anna University Relief Camp** (0.8 km) — Medical + Food, 30% capacity ✅\n2. **Red Cross Relief Centre** (2.1 km) — Best medical, 20% capacity ✅\n3. **JN Stadium Camp** (5.8 km) — Largest, full amenities ✅\n\n⚠️ Marina Beach shelter is FULL. Recommend **Red Cross Centre** for medical support.',
    earthquake: '🏠 **Earthquake Shelter Locations:**\n\n1. **YMCA Ground Shelter** (1.4 km) — Open, 55% capacity ✅\n2. **Red Cross Centre** (2.1 km) — Medical available ✅\n3. **JN Stadium** (5.8 km) — Well equipped ✅\n\n⚠️ Head to **YMCA Ground** — closest safe option away from structural damage.',
    cyclone:    '🌀 **Cyclone Shelters (Reinforced Structures):**\n\n1. **Anna University Camp** (0.8 km) — Reinforced concrete ✅\n2. **Red Cross Centre** (2.1 km) — Ground floor available ✅\n3. **JN Stadium** (5.8 km) — Large concrete structure ✅\n\n🚨 Leave NOW before winds pick up. Take essentials only.',
    accident:   '🚨 **Accident — Nearest Medical Facilities:**\n\n1. **Govt General Hospital** — 1.2 km, 24/7 Emergency ✅\n2. **Apollo Hospitals** — 2.8 km, ICU Available ✅\n3. **AIIMS Trauma Centre** — 4.1 km ✅\n\nDo NOT move injured persons. Call 112 NOW.',
  },
  routes: {
    flood:      '🗺️ **Safe Routes — Flood:**\n\n✅ **NH-48 (Anna Salai)** — Clear, use this primary route\n✅ **Mount-Poonamallee Rd** — Open and clear\n⚠️ **Inner Ring Road** — Minor waterlogging, SUVs only\n❌ **OMR** — BLOCKED, 2ft floodwater\n\n📍 Best: Take NH-48 → Mount Poonamallee to Red Cross Centre.',
    earthquake: '🗺️ **Safe Routes — Earthquake:**\n\n✅ **Rajiv Gandhi Salai** — Verified safe\n✅ **GST Road** — Clear evacuation route\n⚠️ **NH-48** — Flyover cracks, proceed carefully\n❌ **EVR Periyar Rd** — Building collapse BLOCKED\n\n🚶 Walk if possible, avoid elevated roads and bridges.',
    cyclone:    '🗺️ **Routes — Cyclone:**\n\n❌ ALL COASTAL ROUTES — CLOSED\n✅ **Inner Ring Road** — Protected inland route\n✅ **Grand Southern Trunk** — Main evacuation corridor\n⚠️ **Poonamallee High Rd** — Tree clearance in progress\n\n🌀 Move inland IMMEDIATELY.',
    accident:   '🗺️ **Traffic — Accident Area:**\n\n❌ **NH-48 at KM 24** — BLOCKED by accident\n✅ **Mount Rd Bypass** — Best alternate route\n✅ **OMR Service Rd** — Clear\n⚠️ **Kathipara Interchange** — Heavy congestion',
  },
  medical: {
    flood:      '🏥 **Flood Medical Help:**\n\n📞 Emergency: **108** (Ambulance) | **1078** (NDRF)\n\n🏥 Nearest: Govt General Hospital — 1.2 km\n\n⚠️ Flood health risks:\n• Leptospirosis from contaminated water\n• Skin infections from exposure\n• Respiratory issues from mold\n\n⚕️ Clean cuts immediately with antiseptic. Seek tetanus shot within 24 hours.',
    earthquake: '🏥 **Earthquake Medical Help:**\n\n🏥 **AIIMS Trauma Centre** — 4.1 km\n🏥 **Apollo** — 2.8 km (ICU available)\n\n⚕️ First aid:\n• Control bleeding with direct pressure\n• Immobilize fractures — don\'t try to set bones\n• Treat for shock — warm and horizontal\n\n📞 Call 108 for ambulance. Don\'t move spinal injuries.',
    cyclone:    '🏥 **Cyclone Medical Help:**\n\nPost-cyclone injuries:\n• Debris cuts and puncture wounds\n• Head trauma\n• Electrocution from downed lines\n\n🏥 Red Cross Centre has first aid station\n🏥 Apollo Hospitals — 2.8 km\n\n⚠️ Wait for all-clear. Downed power lines are the #1 post-cyclone killer.',
    accident:   '🚑 **CALL NOW: 112 or 108**\n\nWhile waiting:\n1. Don\'t move injured (spinal risk)\n2. Stop bleeding — firm pressure 10+ min\n3. Keep airways clear\n4. Cover with blanket, keep warm\n5. Talk to them — keep them awake\n\n🏥 Trauma: AIIMS Chennai (4.1 km) or Apollo (2.8 km)',
  },
  supplies: {
    flood:      '📦 **Flood Essentials:**\n\n1. 💧 Water: 3L/person/day (3-day min)\n2. 🧴 Water purification tablets\n3. 🪢 Rope (10m) for evacuation\n4. 🎒 Waterproof bags for documents\n5. 💊 ORS packets for dehydration\n\n⚠️ Pack in waterproof containers. Check the Supplies Checklist below!',
    earthquake: '📦 **Earthquake Essentials:**\n\n1. 🔦 Torch & extra batteries\n2. 🩹 First aid kit\n3. 😷 Dust masks (N95) — collapse creates toxic dust\n4. 🥊 Work gloves for moving rubble\n5. 🛑 Whistle — to signal if trapped\n\n📦 Keep 72-hour go-bag ready. Check checklist!',
    cyclone:    '📦 **Cyclone Supplies:**\n\n1. 💧 Fill all water containers NOW\n2. 🍱 3 days non-perishable food\n3. 📻 Battery radio for emergency broadcasts\n4. 🕯️ Candles + matches\n5. 🔋 Multiple charged power banks\n\n🌀 Pre-position ALL supplies before storm arrives.',
    accident:   '📦 **Accident Scene Supplies:**\n\n1. 🩹 First aid kit\n2. 🔺 Reflective warning triangles\n3. 🧯 Fire extinguisher\n4. 🛖 Thermal blanket for shock\n5. 📱 Charged mobile phone\n\n🚗 Every vehicle should carry a basic emergency kit!',
  },
  evacuation: {
    flood:      '🚶 **Flood Evacuation Steps:**\n\n1. Monitor alerts on battery radio\n2. Turn off electricity at main breaker\n3. Grab emergency go-bag (5 min pack)\n4. Take NH-48 — safest route\n5. Account for all family members\n6. Check in at nearest shelter\n\n⚠️ Leave EARLY — don\'t wait for water to enter your home.',
    earthquake: '🚶 **Earthquake Evacuation:**\n\n1. DROP-COVER-HOLD during shaking\n2. Check for injuries after shaking stops\n3. Check for gas leaks carefully\n4. Exit using stairs only\n5. Move to open area away from buildings\n6. Await aftershock information\n\n⚠️ Aftershocks WILL come — stay in open areas.',
    cyclone:    '🌀 **Cyclone Evacuation:**\n\n1. Track storm path on IMD website\n2. Board all windows and doors\n3. Fill water containers\n4. Leave coastal areas IMMEDIATELY if Zone A\n5. Stay indoors during storm\n6. DO NOT exit during eye of storm\n\n⚠️ The calm eye is temporary — storm WILL resume!',
    accident:   '🚨 **Accident Response:**\n\n1. Secure scene with hazard lights + triangles\n2. Call 112 with exact location\n3. Assess victims without moving them\n4. Control bleeding with pressure\n5. Prevent fire — turn off ignition\n6. Document scene and await police\n\n📞 Stay on line with 112 operator.',
  },
  general: [
    'I\'m here to help! Can you tell me more about your situation? Ask me about:\n• 🏠 Finding a shelter\n• 🗺️ Safe routes\n• 🏥 Medical help\n• 📦 Emergency supplies\n• 🚶 Evacuation steps',
    'Stay calm — help is available. **Immediate steps:**\n• If in danger: Call **112** NOW\n• Find nearest shelter on the map above\n• Share your location with family\n• Check the emergency supplies checklist\n\nWhat do you need help with specifically?',
    'I understand this is stressful. Here\'s what matters most right now:\n\n🛡️ **Safety first:** Get to high ground or shelter\n📞 **Emergency line:** 112 (National)\n🚑 **Ambulance:** 108\n🛡️ **NDRF:** 1078\n\nI\'m here 24/7. What can I help you with?',
  ]
};

const chatSuggestions = {
  flood:      ['🏠 Find nearest shelter','🗺️ Which roads are safe?','🏥 Need medical help','📦 What supplies do I need?','🚶 Evacuation steps','🚨 How to signal for rescue?'],
  earthquake: ['🏠 Nearest shelter','🗺️ Safe roads near me','🏥 Injury first aid','📦 Emergency supplies list','⚠️ What to do in aftershock?','🚶 Evacuation guide'],
  cyclone:    ['🏠 Cyclone shelter locations','🗺️ Safest route inland','🏥 Medical help nearby','📦 Cyclone prep checklist','🌀 Evacuation steps','⚠️ Eye of storm warning'],
  accident:   ['🚑 Call ambulance now','🏥 Nearest trauma centre','🩺 First aid for injuries','🗺️ Route to hospital','📦 Car emergency kit','🚶 Accident scene safety']
};

// ===================== INCIDENT FEED =====================
const incidentFeeds = {
  flood:      [{time:'2 min ago',text:'Rescue boats dispatched to T. Nagar — 40 families trapped on rooftops.',sev:'critical'},{time:'8 min ago',text:'NDRF team arrived at Guindy — 6 rescue operations ongoing.',sev:'high'},{time:'15 min ago',text:'3 new relief camps opened in Anna Nagar — capacity 2000 each.',sev:'medium'},{time:'22 min ago',text:'NH-48 flyover waterlogging cleared by drainage teams.',sev:'low'},{time:'30 min ago',text:'Medical teams deployed to Saidapet and KK Nagar relief camps.',sev:'medium'}],
  earthquake: [{time:'5 min ago',text:'Aftershock M3.2 recorded 4km from epicentre — people advised to stay outside.',sev:'high'},{time:'12 min ago',text:'Structural engineers assessing Kathipara flyover for safety.',sev:'high'},{time:'20 min ago',text:'Gas leak contained in Ashok Nagar — area evacuated safely.',sev:'critical'},{time:'35 min ago',text:'100 NDRF personnel deployed for search & rescue.',sev:'medium'}],
  cyclone:    [{time:'1 min ago',text:'Cyclone Biparjoy eye expected to make landfall in 3 hours.',sev:'critical'},{time:'7 min ago',text:'All coastal roads sealed — checkpoints established.',sev:'high'},{time:'18 min ago',text:'Last train from coastal zones departed — no more transport.',sev:'high'},{time:'25 min ago',text:'Power shutdown initiated for coastal districts to prevent hazards.',sev:'medium'}],
  accident:   [{time:'3 min ago',text:'Multi-vehicle pileup on NH-48 — emergency services on scene.',sev:'critical'},{time:'10 min ago',text:'3 ambulances deployed — 2 critical patients being transported.',sev:'high'},{time:'18 min ago',text:'Traffic police directing vehicles via Mount Rd bypass.',sev:'medium'},{time:'30 min ago',text:'NDRF rope rescue team standing by at accident site.',sev:'low'}]
};

// ===================== RESPONSE BARS =====================
const responseBars = {
  flood:      [{label:'Search & Rescue',pct:78,color:'#ff3b30'},{label:'Medical Aid',pct:92,color:'#30d158'},{label:'Shelter Setup',pct:65,color:'#0a84ff'},{label:'Food Distribution',pct:84,color:'#ff9500'},{label:'Road Clearance',pct:45,color:'#bf5af2'}],
  earthquake: [{label:'Search & Rescue',pct:88,color:'#ff3b30'},{label:'Medical Aid',pct:70,color:'#30d158'},{label:'Shelter Setup',pct:55,color:'#0a84ff'},{label:'Debris Removal',pct:40,color:'#ff9500'},{label:'Gas Line Safety',pct:95,color:'#bf5af2'}],
  cyclone:    [{label:'Evacuation',pct:95,color:'#ff3b30'},{label:'Shelter Readiness',pct:88,color:'#30d158'},{label:'Coast Guard',pct:72,color:'#0a84ff'},{label:'Supply Pre-positioning',pct:68,color:'#ff9500'},{label:'Power Shutdown',pct:100,color:'#bf5af2'}],
  accident:   [{label:'First Response',pct:90,color:'#ff3b30'},{label:'Medical Aid',pct:82,color:'#30d158'},{label:'Traffic Control',pct:75,color:'#0a84ff'},{label:'Fire Prevention',pct:60,color:'#ff9500'},{label:'Scene Documentation',pct:50,color:'#bf5af2'}]
};

// ===================== COMMUNITY REPORT SEED DATA =====================
const seedReports = [
  { type:'road', location:'NH-48 near Guindy', severity:'high', desc:'Large section flooded — water level around 2 feet. Cars stalled. Do not attempt.', time:'4 min ago', upvotes:24 },
  { type:'flood', location:'T. Nagar, Chennai', severity:'critical', desc:'Ground floor completely submerged. People trapped on second floor. Boats urgently needed.', time:'11 min ago', upvotes:47 },
  { type:'shelter', location:'Anna University Camp', severity:'low', desc:'Shelter is clean and well-organized. Food distribution happening every 4 hours. Enough space available.', time:'18 min ago', upvotes:33 },
  { type:'medical', location:'Kodambakkam', severity:'medium', desc:'Mobile medical van set up near bus depot. Free checkups. No doctors for serious injuries though.', time:'25 min ago', upvotes:15 },
  { type:'rescue', location:'Velachery Lake Road', severity:'critical', desc:'6 elderly residents trapped on roof. Water level rising. Need immediate rescue boat.', time:'32 min ago', upvotes:61 },
];

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initParticles();
  initShelters();
  initHospitals();
  initFirstAid('flood');
  initSupplies();
  initChatSuggestions();
  initScrollEffects();
  initDashboard();
  initEvacuation();
  initCommunityReports();
  initReportTypeButtons();
  initLeafletMap();
  initSpecialSections();
  selectDisaster('flood');
});

// ===================== CLOCK =====================
function initClock() {
  const el = document.getElementById('liveClock');
  function tick() { el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false }); }
  tick();
  setInterval(tick, 1000);
}

// ===================== PARTICLES =====================
function initParticles() {
  const c = document.getElementById('heroParticles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${4+Math.random()*8}s;animation-delay:${Math.random()*6}s;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;background:${Math.random()>.5?'#ff3b30':'#ff9500'};`;
    c.appendChild(p);
  }
}

// ===================== DISASTER SELECTOR =====================
function selectDisaster(type) {
  currentDisaster = type;
  document.querySelectorAll('.disaster-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + type).classList.add('active');

  const d = disasterData[type];
  document.getElementById('dspIcon').textContent = d.icon;
  document.getElementById('dspTitle').textContent = d.label;
  const sev = document.getElementById('dspSeverity');
  sev.textContent = d.severity + ' SEVERITY';
  sev.className = 'dsp-severity severity-' + d.severity.toLowerCase();
  document.getElementById('dspAffected').textContent = d.affected;
  document.getElementById('dspShelters').textContent = d.shelters;
  document.getElementById('dspTeams').textContent = d.teams;
  document.getElementById('dspAdvisory').textContent = d.advisory;
  document.getElementById('shelterCount').textContent = d.shelterNearby;
  document.getElementById('routeCount').textContent = d.routeCount;
  const adt = document.getElementById('activeDisasterText');
  if (adt) adt.textContent = d.label;

  // Sync tabs
  showFirstAid(type);
  document.querySelectorAll('.fa-tab').forEach(t => t.classList.remove('active'));
  const faTab = document.getElementById('fa-' + type);
  if (faTab) faTab.classList.add('active');

  // Update dashboard, evacuation
  updateDashboard(type);
  updateEvacuation(type);
  initShelters();
  initChatSuggestions();

  // Update evacuation badge
  const eb = document.getElementById('evacBadge');
  if (eb) eb.textContent = disasterData[type].label;

  renderSafeRoutes();
}

// ===================== SPECIAL SECTIONS =====================
function initSpecialSections() {
  renderSafeRoutes();
  renderRescuedList();
  renderFoodRegistrations();
}

function renderSafeRoutes() {
  const routes = safeRoutesData[currentDisaster] || safeRoutesData.flood;
  const summaryEl = document.getElementById('safeRoutesSummary');
  const listEl = document.getElementById('safeRouteList');
  const badgeEl = document.getElementById('activeRouteBadge');
  if (!summaryEl || !listEl) return;

  const activeRoute = routes.find(r => r.name === selectedRouteName) || routes[0];
  selectedRouteName = activeRoute.name;

  summaryEl.innerHTML = `
    <strong>${activeRoute.name}</strong>
    <div>${activeRoute.desc}</div>
    <div style="margin-top:8px;color:var(--text-muted)">Best option for ${disasterData[currentDisaster].label.toLowerCase()} response · ${activeRoute.time}</div>
  `;

  if (badgeEl) badgeEl.textContent = activeRoute.status;

  listEl.innerHTML = routes.map(route => `
    <div class="route-card ${route.name === activeRoute.name ? 'active' : ''}">
      <div class="route-card-header">
        <div>
          <div class="route-name">${route.name}</div>
          <div class="route-distance">${route.distance}</div>
        </div>
        <span class="route-status ${route.status.toLowerCase()}">${route.status}</span>
      </div>
      <div class="route-desc">${route.desc}</div>
      <div class="route-meta">
        <span>⏱️ ${route.time}</span>
        <span>⚠️ ${route.risk}</span>
      </div>
      <button class="route-action" onclick="selectRoute('${route.name.replace(/'/g, "\\'")}' )">${route.name === activeRoute.name ? 'Selected' : 'Use this route'}</button>
    </div>
  `).join('');
}

function selectRoute(name) {
  selectedRouteName = name;
  renderSafeRoutes();
}

function registerRescued(event) {
  event.preventDefault();
  const form = document.getElementById('rescuedForm');
  const data = {
    name: form.name.value.trim(),
    age: form.age.value.trim(),
    location: form.location.value.trim(),
    condition: form.condition.value,
    notes: form.notes.value.trim(),
    time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  };

  if (!data.name || !data.location) return;

  rescuedRegistry.unshift(data);
  form.reset();
  renderRescuedList();
}

function renderRescuedList() {
  const listEl = document.getElementById('rescuedList');
  const summaryEl = document.getElementById('rescuedSummary');
  if (!listEl) return;

  if (summaryEl) summaryEl.textContent = `${rescuedRegistry.length} ${rescuedRegistry.length === 1 ? 'entry' : 'entries'} logged`;

  if (!rescuedRegistry.length) {
    listEl.innerHTML = '<div class="empty-state">No rescued people have been registered yet.</div>';
    return;
  }

  listEl.innerHTML = rescuedRegistry.map(item => `
    <div class="result-card">
      <strong>${item.name} · ${item.age} yrs</strong>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Status:</strong> ${item.condition}</p>
      <p>${item.notes || 'No extra notes provided.'}</p>
      <p style="margin-top:6px;color:var(--text-muted)">${item.time}</p>
    </div>
  `).join('');
}

function registerFood(event) {
  event.preventDefault();
  const form = document.getElementById('foodForm');
  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    area: form.area.value.trim(),
    items: form.items.value.trim(),
    quantity: form.quantity.value.trim(),
    status: form.status.value,
    notes: form.notes.value.trim(),
    time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  };

  if (!data.name || !data.phone || !data.area || !data.items || !data.quantity) return;

  foodRegistry.unshift(data);
  form.reset();
  renderFoodRegistrations();
}

function renderFoodRegistrations() {
  const listEl = document.getElementById('foodList');
  const summaryEl = document.getElementById('foodSummary');
  if (!listEl) return;

  const totalQty = foodRegistry.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (summaryEl) summaryEl.textContent = `${foodRegistry.length} entries · ${totalQty} packs`;

  if (!foodRegistry.length) {
    listEl.innerHTML = '<div class="empty-state">No food support registrations yet.</div>';
    return;
  }

  listEl.innerHTML = foodRegistry.map(item => `
    <div class="result-card animate-in">
      <strong>${item.area}</strong>
      <p><strong>Contact:</strong> ${item.name} (${item.phone})</p>
      <p><strong>Items:</strong> ${item.items}</p>
      <p><strong>Quantity:</strong> ${item.quantity} packs</p>
      <p><strong>Status:</strong> ${item.status}</p>
      <p>${item.notes || 'No delivery notes added.'}</p>
      <p style="margin-top:6px;color:var(--text-muted)">${item.time}</p>
    </div>
  `).join('');
}

// ===================== DASHBOARD =====================
function initDashboard() {
  updateDashboard('flood');
}

function updateDashboard(type) {
  const d = disasterData[type];

  // Metric cards
  const vals = [
    { id:'dashM1', val: d.affected },
    { id:'dashM2', val: d.shelters },
    { id:'dashM3', val: d.teams },
    { id:'dashM4', val: d.rescued },
    { id:'dashM5', val: d.hospitals },
    { id:'dashM6', val: d.closures },
  ];
  vals.forEach(v => {
    const el = document.getElementById(v.id);
    if (el) animateCounter(el, v.val);
  });

  // Response bars
  const bars = responseBars[type] || responseBars.flood;
  document.getElementById('responseBars').innerHTML = bars.map(b => `
    <div class="response-bar-item">
      <div class="rb-header"><span class="rb-label">${b.label}</span><span class="rb-val" style="color:${b.color}">${b.pct}%</span></div>
      <div class="rb-track"><div class="rb-fill" style="width:0%;background:${b.color}" data-target="${b.pct}"></div></div>
    </div>
  `).join('');
  setTimeout(() => {
    document.querySelectorAll('.rb-fill').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 300);

  // Incident feed
  const incidents = incidentFeeds[type] || incidentFeeds.flood;
  const sevColors = { critical: '#ff3b30', high: '#ff9500', medium: '#0a84ff', low: '#30d158' };
  document.getElementById('incidentFeed').innerHTML = incidents.map(i => `
    <div class="incident-item">
      <div class="incident-dot" style="background:${sevColors[i.sev]}"></div>
      <div>
        <div class="incident-text">${i.text}</div>
        <div class="incident-time">${i.time}</div>
      </div>
    </div>
  `).join('');

  // Weather
  const w = d.weather;
  document.getElementById('weatherPanel').innerHTML = `
    <div class="weather-main">
      <div class="weather-icon">${w.icon}</div>
      <div>
        <div class="weather-temp">${w.temp}</div>
        <div class="weather-condition">${w.cond}</div>
      </div>
    </div>
    <div class="weather-stats">
      <div class="weather-stat"><div class="ws-label">Wind Speed</div><div class="ws-val">${w.wind}</div></div>
      <div class="weather-stat"><div class="ws-label">Humidity</div><div class="ws-val">${w.humidity}</div></div>
      <div class="weather-stat"><div class="ws-label">Visibility</div><div class="ws-val">${w.visibility}</div></div>
      <div class="weather-stat"><div class="ws-label">Pressure</div><div class="ws-val">${w.pressure}</div></div>
    </div>
  `;
}

function animateCounter(el, rawVal) {
  const numStr = rawVal.toString().replace(/,/g, '');
  const num = parseInt(numStr);
  if (isNaN(num)) { el.textContent = rawVal; return; }
  const formatted = rawVal;
  let start = 0;
  const duration = 1000;
  const step = Math.ceil(num / (duration / 16));
  const interval = setInterval(() => {
    start = Math.min(start + step, num);
    el.textContent = start.toLocaleString('en-IN');
    if (start >= num) { el.textContent = formatted; clearInterval(interval); }
  }, 16);
}

// ===================== SHELTERS =====================
function initShelters(filter = 'all') {
  const grid = document.getElementById('shelterGrid');
  let filtered = shelterData.filter(s => {
    if (currentDisaster !== 'accident' && !s.types.includes(currentDisaster)) return false;
    if (filter === 'open') return s.status === 'open';
    if (filter === 'medical') return s.hasMedical;
    if (filter === 'food') return s.hasFood;
    if (filter === 'available') return s.status !== 'full';
    return true;
  });
  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">No shelters match this filter.</div>`;
    return;
  }
  filtered.forEach((s, i) => {
    const pct = Math.round((s.current / s.total) * 100);
    const fillClass = pct < 50 ? 'low' : pct < 80 ? 'medium' : 'high';
    const card = document.createElement('div');
    card.className = `shelter-card${s.status === 'full' ? ' full' : ''} animate-in`;
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = `
      <div class="shelter-card-header">
        <div class="shelter-name">${s.name}</div>
        <div class="shelter-status status-${s.status}">${s.status.toUpperCase()}</div>
      </div>
      <div class="shelter-info">📍 ${s.address}<br/>📏 ${s.distance} · 📞 ${s.phone}</div>
      <div class="shelter-meta">${s.tags.map(t=>`<span class="shelter-tag">${t}</span>`).join('')}</div>
      <div class="shelter-capacity">
        <div class="capacity-bar"><div class="capacity-fill ${fillClass}" style="width:${pct}%"></div></div>
        <div class="capacity-text">${pct}% full (${s.current.toLocaleString()}/${s.total.toLocaleString()})</div>
      </div>
      <div class="shelter-actions">
        <a class="btn-directions" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank">🗺️ Get Directions</a>
        <button class="btn-details" onclick="showShelterDetail(${s.id})">Details</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterShelters(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  initShelters(filter);
}

function showShelterDetail(id) {
  const s = shelterData.find(x => x.id === id);
  if (!s) return;
  const pct = Math.round((s.current / s.total) * 100);
  const statusColor = s.status === 'open' ? 'var(--green)' : s.status === 'limited' ? 'var(--amber)' : 'var(--red)';
  document.getElementById('shelterModalContent').innerHTML = `
    <h2 style="font-size:20px;font-weight:800;margin-bottom:6px">${s.name}</h2>
    <div style="color:var(--text-secondary);font-size:13px;margin-bottom:18px">📍 ${s.address}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Status</div><div style="font-size:18px;font-weight:700;color:${statusColor};margin-top:4px">${s.status.toUpperCase()}</div></div>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Distance</div><div style="font-size:18px;font-weight:700;margin-top:4px">${s.distance}</div></div>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Occupancy</div><div style="font-size:18px;font-weight:700;margin-top:4px">${pct}%</div></div>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Contact</div><div style="font-size:15px;font-weight:700;margin-top:4px">${s.phone}</div></div>
    </div>
    <div style="margin-bottom:16px"><div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)">AMENITIES</div><div style="display:flex;flex-wrap:wrap;gap:6px">${s.tags.map(t=>`<span class="shelter-tag">${t}</span>`).join('')}</div></div>
    <a class="btn-directions" style="display:block;text-align:center;padding:12px" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank">🗺️ Open in Google Maps</a>
  `;
  document.getElementById('shelterModal').style.display = 'flex';
}

// ===================== LEAFLET MAP =====================
function initLeafletMap() {
  if (!window.L) return;
  map = L.map('leafletMap', {
    center: [13.0827, 80.2707],
    zoom: 12,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  renderMapMarkers();
}

function renderMapMarkers() {
  if (!map) return;

  // Clear existing
  Object.values(mapMarkers).forEach(arr => arr.forEach(m => m.remove()));
  mapMarkers = { shelters: [], hospitals: [], hazards: [] };

  // Shelter markers
  if (mapLayers.shelters) {
    shelterData.forEach(s => {
      const color = s.status === 'open' ? '#30d158' : s.status === 'limited' ? '#ff9500' : '#ff3b30';
      const icon = L.divIcon({
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}88"></div>`,
        iconSize: [18, 18], iconAnchor: [9, 9], className: ''
      });
      const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
      marker.bindPopup(`<div class="map-popup"><h4>${s.name}</h4><p>📍 ${s.address}</p><p>📏 ${s.distance} away</p><p>📞 ${s.phone}</p><span class="popup-status" style="background:${color}22;color:${color};border:1px solid ${color}44">${s.status.toUpperCase()}</span></div>`);
      mapMarkers.shelters.push(marker);
    });
  }

  // Hospital markers
  if (mapLayers.hospitals) {
    hospitals.forEach(h => {
      const icon = L.divIcon({
        html: `<div style="background:#0a84ff;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px #0a84ff88;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:bold">H</div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: ''
      });
      const marker = L.marker([h.lat, h.lng], { icon }).addTo(map);
      marker.bindPopup(`<div class="map-popup"><h4>🏥 ${h.name}</h4><p>${h.type}</p><p>📏 ${h.dist}</p><p>📞 ${h.phone}</p></div>`);
      mapMarkers.hospitals.push(marker);
    });
  }

  // Hazard zones
  if (mapLayers.hazards) {
    const hazards = [
      { lat: 13.0584, lng: 80.2823, label: '🌊 Flood Zone', radius: 600 },
      { lat: 13.0200, lng: 80.2100, label: '⚠️ Blocked Road', radius: 200 },
      { lat: 13.0700, lng: 80.2600, label: '⚠️ Hazard Area', radius: 350 },
    ];
    hazards.forEach(h => {
      const circle = L.circle([h.lat, h.lng], {
        color: '#bf5af2', fillColor: '#bf5af2', fillOpacity: 0.15, weight: 2, radius: h.radius
      }).addTo(map);
      circle.bindPopup(`<div class="map-popup"><h4>${h.label}</h4><p>Avoid this area until cleared.</p></div>`);
      mapMarkers.hazards.push(circle);
    });
  }
}

function toggleMapLayer(layer, btn) {
  mapLayers[layer] = !mapLayers[layer];
  btn.classList.toggle('active', mapLayers[layer]);
  renderMapMarkers();
}

function centerMyLocation() {
  if (userLocation) {
    map.setView([userLocation.lat, userLocation.lng], 14);
  } else {
    getUserLocation(true);
  }
}

// ===================== GEOLOCATION =====================
function getUserLocation(forMap = false) {
  const result = document.getElementById('locationResult');
  if (navigator.geolocation) {
    if (result) { result.style.display = 'block'; result.textContent = '⏳ Detecting location...'; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const locStr = `📍 ${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E`;
        if (result) result.textContent = locStr + ' — Location shared with emergency services';
        if (map && forMap) {
          map.setView([userLocation.lat, userLocation.lng], 14);
          const youIcon = L.divIcon({
            html: `<div style="background:#0a84ff;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #0a84ff"></div>`,
            iconSize: [16, 16], iconAnchor: [8, 8], className: ''
          });
          L.marker([userLocation.lat, userLocation.lng], { icon: youIcon }).addTo(map)
            .bindPopup('<div class="map-popup"><h4>📍 You are here</h4></div>').openPopup();
        }
      },
      () => {
        if (result) result.textContent = '📍 Location: Chennai, Tamil Nadu (approximate)';
      }
    );
  } else {
    if (result) result.textContent = 'Geolocation not supported. Using default: Chennai.';
  }
}

// ===================== HOSPITALS =====================
function initHospitals() {
  document.getElementById('hospitalList').innerHTML = hospitals.map(h => `
    <div class="hospital-item">
      <div>
        <div class="hospital-name">${h.name}</div>
        <div class="hospital-dist">${h.dist}</div>
        <div class="hospital-type">${h.type}</div>
      </div>
      <button class="hospital-call-btn" onclick="callNumber('${h.phone}')">📞 Call</button>
    </div>
  `).join('');
}

// ===================== FIRST AID =====================
function initFirstAid(type) { showFirstAid(type); }
function showFirstAid(type) {
  document.querySelectorAll('.fa-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('fa-' + type);
  if (tab) tab.classList.add('active');
  const steps = firstAidGuides[type] || firstAidGuides.flood;
  document.getElementById('firstAidContent').innerHTML = steps.map((s, i) => `
    <div class="firstaid-step">
      <div class="fa-step-num">${i+1}</div>
      <div class="fa-step-text">${s}</div>
    </div>
  `).join('');
}

// ===================== SUPPLIES =====================
function initSupplies() {
  document.getElementById('suppliesGrid').innerHTML = suppliesData.map((cat, ci) => `
    <div class="supply-category animate-in" style="animation-delay:${ci*.08}s">
      <div class="supply-cat-header">
        <div class="supply-cat-icon">${cat.icon}</div>
        <div class="supply-cat-name">${cat.category}</div>
        <div class="supply-cat-count" id="catCount-${ci}">0/${cat.items.length}</div>
      </div>
      ${cat.items.map((item, ii) => {
        const key = `${ci}-${ii}`;
        return `
          <div class="supply-item" role="button" tabindex="0" aria-pressed="false" onclick="toggleSupply('${key}',${ci},${cat.items.length})" onkeydown="handleSupplyKeydown(event, '${key}', ${ci}, ${cat.items.length})" id="supply-item-${key}">
            <div class="supply-checkbox" id="chk-${key}"></div>
            <div class="supply-item-text" id="txt-${key}">${item.text}</div>
            <div class="supply-priority priority-${item.priority}">${item.priority}</div>
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
  updateProgress();
}

function toggleSupply(key, catIdx, catTotal) {
  const chk = document.getElementById(`chk-${key}`);
  const txt = document.getElementById(`txt-${key}`);
  const itemEl = document.getElementById(`supply-item-${key}`);
  if (checkedSupplies.has(key)) {
    checkedSupplies.delete(key);
    chk.classList.remove('checked');
    txt.classList.remove('checked');
    if (itemEl) itemEl.setAttribute('aria-pressed', 'false');
  } else {
    checkedSupplies.add(key);
    chk.classList.add('checked');
    txt.classList.add('checked');
    if (itemEl) itemEl.setAttribute('aria-pressed', 'true');
  }
  let catChecked = 0;
  suppliesData[catIdx].items.forEach((_, ii) => { if (checkedSupplies.has(`${catIdx}-${ii}`)) catChecked++; });
  const countEl = document.getElementById(`catCount-${catIdx}`);
  if (countEl) countEl.textContent = `${catChecked}/${catTotal}`;
  updateProgress();
}

function handleSupplyKeydown(event, key, catIdx, catTotal) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleSupply(key, catIdx, catTotal);
  }
}

function updateProgress() {
  const total = suppliesData.reduce((s, cat) => s + cat.items.length, 0);
  const pct = Math.round((checkedSupplies.size / total) * 100);
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
}

function printChecklist() { window.print(); }

// ===================== EVACUATION =====================
function initEvacuation() { updateEvacuation('flood'); }

function updateEvacuation(type) {
  const d = evacuationData[type] || evacuationData.flood;
  document.getElementById('evacSteps').innerHTML = d.steps.map((s, i) => `
    <div class="evac-step">
      <div class="evac-step-left">
        <div class="evac-num">${i+1}</div>
        <div class="evac-line"></div>
      </div>
      <div class="evac-step-content">
        <span class="evac-step-icon">${s.icon}</span>
        <div class="evac-step-title">${s.title}</div>
        <div class="evac-step-desc">${s.desc}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('dosList').innerHTML = d.dos.map(i => `<li>${i}</li>`).join('');
  document.getElementById('dontsList').innerHTML = d.donts.map(i => `<li>${i}</li>`).join('');
}

// ===================== COMMUNITY REPORTS =====================
function initCommunityReports() {
  communityReports = [...seedReports];
  renderReports();
  renderReportStats();
}

function getFilteredReports() {
  return communityReports.filter(r => {
    if (reportFilter !== 'all' && r.type !== reportFilter) return false;
    if (reportSeverityFilter !== 'all' && r.severity !== reportSeverityFilter) return false;
    if (reportSearchTerm) {
      const lower = reportSearchTerm.toLowerCase();
      const combined = `${r.location} ${r.desc} ${r.type} ${r.severity}`.toLowerCase();
      if (!combined.includes(lower)) return false;
    }
    return true;
  });
}

function renderReports() {
  const reports = getFilteredReports();
  const sevClass = { low:'report-sev-low', medium:'report-sev-medium', high:'report-sev-high', critical:'report-sev-critical' };
  const typeIcon = { road:'🛣️', flood:'🌊', shelter:'🏠', medical:'🏥', rescue:'🚁' };
  if (!reports.length) {
    document.getElementById('reportFeed').innerHTML = `<div class="report-empty">No reports match the current filters. Try adjusting the search or filter options.</div>`;
    return;
  }
  document.getElementById('reportFeed').innerHTML = reports.map((r, i) => `
    <div class="report-card animate-in" style="animation-delay:${i*.06}s">
      <div class="report-card-header">
        <div class="report-type-badge ${sevClass[r.severity]}">${typeIcon[r.type]} ${r.type.toUpperCase()}</div>
        <div class="report-location">📍 ${r.location}</div>
        <div class="report-time">${r.time}</div>
      </div>
      <div class="report-desc">${r.desc}</div>
      <div class="report-votes">
        <button class="vote-btn" onclick="upvoteReport(${communityReports.indexOf(r)})">👍 ${r.upvotes}</button>
        <button class="vote-btn" onclick="">💬 Comment</button>
        <button class="vote-btn" onclick="">🔗 Share</button>
      </div>
    </div>
  `).join('');
}

function setReportFilter(filter, btn) {
  reportFilter = filter;
  document.querySelectorAll('.report-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderReports();
}

function setSeverityFilter(value) {
  reportSeverityFilter = value;
  renderReports();
}

function updateReportSearch() {
  const input = document.getElementById('reportSearch');
  reportSearchTerm = input ? input.value.trim() : '';
  renderReports();
}

function clearReportSearch() {
  const input = document.getElementById('reportSearch');
  if (input) input.value = '';
  reportSearchTerm = '';
  renderReports();
}

function renderReportStats() {
  const total = communityReports.length;
  const critical = communityReports.filter(r => r.severity === 'critical').length;
  const high = communityReports.filter(r => r.severity === 'high').length;
  document.getElementById('rspStats').innerHTML = `
    <div class="rsp-stat-item"><span class="rsp-stat-label">Total Reports</span><span class="rsp-stat-val" style="color:var(--blue)">${total}</span></div>
    <div class="rsp-stat-item"><span class="rsp-stat-label">Critical</span><span class="rsp-stat-val" style="color:var(--red)">${critical}</span></div>
    <div class="rsp-stat-item"><span class="rsp-stat-label">High Priority</span><span class="rsp-stat-val" style="color:var(--amber)">${high}</span></div>
    <div class="rsp-stat-item"><span class="rsp-stat-label">Verified</span><span class="rsp-stat-val" style="color:var(--green)">${Math.round(total*.6)}</span></div>
  `;
  const zones = [['T. Nagar', 8], ['Guindy', 6], ['Velachery', 5], ['Kodambakkam', 4], ['Marina', 3]];
  document.getElementById('activeZones').innerHTML = zones.map(([name, count]) => `
    <div class="zone-item"><span class="zone-name">📍 ${name}</span><span class="zone-count">${count} reports</span></div>
  `).join('');
}

function upvoteReport(i) {
  communityReports[i].upvotes++;
  renderReports();
}

function openReportModal() {
  document.getElementById('reportModal').style.display = 'flex';
}

function submitReport() {
  const type = selectedReportType;
  const location = document.getElementById('reportLocation').value.trim();
  const severity = document.getElementById('reportSeverity').value;
  const desc = document.getElementById('reportDesc').value.trim();
  if (!location || !desc) {
    alert('Please fill in location and description.');
    return;
  }
  communityReports.unshift({ type, location, severity, desc, time: 'Just now', upvotes: 0 });
  document.getElementById('reportLocation').value = '';
  document.getElementById('reportDesc').value = '';
  closeModal('reportModal');
  renderReports();
  renderReportStats();
}

function markAllSupplies() {
  suppliesData.forEach((cat, ci) => {
    cat.items.forEach((_, ii) => checkedSupplies.add(`${ci}-${ii}`));
  });
  initSupplies();
}

function clearAllSupplies() {
  checkedSupplies.clear();
  initSupplies();
}

function initReportTypeButtons() {
  document.querySelectorAll('.rtype-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rtype-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedReportType = btn.dataset.type;
    });
  });
}

// ===================== AI CHAT =====================
function initChatSuggestions() {
  const sugs = chatSuggestions[currentDisaster] || chatSuggestions.flood;
  document.getElementById('chatSuggestions').innerHTML = sugs.map(s =>
    `<button class="suggestion-chip" onclick="sendSuggestion('${s.replace(/'/g,"\\'")}' )">${s}</button>`
  ).join('');
}

function sendSuggestion(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function handleChatKeydown(e) { if (e.key === 'Enter') sendMessage(); }

function sendMessage() {
  if (isTyping) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendMessage('user', text);
  const lower = text.toLowerCase();
  let response = '';
  if (lower.includes('shelter') || lower.includes('camp') || lower.includes('stay') || lower.includes('where'))
    response = aiResponses.shelter[currentDisaster];
  else if (lower.includes('road') || lower.includes('route') || lower.includes('drive') || lower.includes('travel'))
    response = aiResponses.routes[currentDisaster];
  else if (lower.includes('medical') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('injur') || lower.includes('bleed') || lower.includes('ambulance'))
    response = aiResponses.medical[currentDisaster];
  else if (lower.includes('suppli') || lower.includes('pack') || lower.includes('checklist') || lower.includes('need') || lower.includes('bring'))
    response = aiResponses.supplies[currentDisaster];
  else if (lower.includes('evacuat') || lower.includes('step') || lower.includes('procedure') || lower.includes('guide'))
    response = aiResponses.evacuation[currentDisaster];
  else if (lower.includes('sos') || lower.includes('help') || lower.includes('rescue') || lower.includes('trap') || lower.includes('stuck'))
    response = `🆘 **EMERGENCY RESCUE MODE ACTIVATED**\n\n**Call NOW:**\n• **112** — National Emergency\n• **1078** — NDRF Helpline\n• **108** — Ambulance\n\n**While waiting:**\n• Signal with torch/bright cloth from rooftop\n• Stay in place — rescuers are en route\n• Make noise every 3 minutes\n\nPress the **SOS button** at the top to broadcast your location.`;
  else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    response = `Hello! I'm DisasterGuard — here to help you 24/7 during the **${disasterData[currentDisaster].label}**.\n\nAsk me about shelters, safe routes, medical help, supplies, or evacuation steps. Stay safe! 🛡️`;
  else if (lower.includes('thank'))
    response = `You're welcome! Stay safe and follow official advisories. Remember:\n• Emergency: **112**\n• Ambulance: **108**\n• NDRF: **1078**\n\n🛡️ I'm here 24/7. Don't hesitate to ask anything.`;
  else
    response = aiResponses.general[Math.floor(Math.random() * aiResponses.general.length)];
  showTyping(response);
}

function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');
  const now = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const div = document.createElement('div');
  div.className = `chat-message ${role === 'user' ? 'user-message' : 'ai-message'} animate-in`;
  div.innerHTML = `
    <div class="${role === 'user' ? 'user-avatar' : 'ai-avatar'}">${role === 'user' ? '👤' : '🤖'}</div>
    <div class="message-bubble">
      <div class="message-text">${formatMsg(text)}</div>
      <div class="message-time">${now} · ${role === 'user' ? 'You' : 'DisasterGuard'}</div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function formatMsg(text) {
  return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>');
}

function showTyping(response) {
  isTyping = true;
  const container = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message ai-message';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `<div class="ai-avatar">🤖</div><div class="message-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  setTimeout(() => {
    typingDiv.remove();
    appendMessage('ai', response);
    isTyping = false;
  }, 900 + Math.random() * 700);
}

// ===================== SOS =====================
function triggerSOS() {
  document.getElementById('sosModal').style.display = 'flex';
  let count = 10;
  document.getElementById('sosTimer').textContent = count;
  if (sosTimerInterval) clearInterval(sosTimerInterval);
  sosTimerInterval = setInterval(() => {
    count--;
    const el = document.getElementById('sosTimer');
    if (el) el.textContent = count;
    if (count <= 0) {
      clearInterval(sosTimerInterval);
      const cd = document.getElementById('sosCountdown');
      if (cd) cd.textContent = '🔴 SOS signal transmitted — rescue team alerted!';
    }
  }, 1000);
  if (navigator.geolocation) navigator.geolocation.getCurrentPosition(() => {}, () => {});
}

function closeSOS() {
  if (sosTimerInterval) clearInterval(sosTimerInterval);
  document.getElementById('sosModal').style.display = 'none';
}

// ===================== UTILS =====================
function callNumber(num) { window.location.href = `tel:${num.replace(/\D/g,'')}` ;}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleMobileNav() {
  const navLinks = document.getElementById('navLinks');
  const backdrop = document.getElementById('navBackdrop');
  const isOpen = navLinks.classList.toggle('open');
  backdrop.style.display = isOpen ? 'block' : 'none';
  document.body.classList.toggle('menu-open', isOpen);
  document.querySelector('.nav-toggle').setAttribute('aria-expanded', isOpen);
}

function closeMobileNav() {
  const navLinks = document.getElementById('navLinks');
  const backdrop = document.getElementById('navBackdrop');
  navLinks.classList.remove('open');
  backdrop.style.display = 'none';
  document.body.classList.remove('menu-open');
  document.querySelector('.nav-toggle').setAttribute('aria-expanded', false);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMobileNav();
  }
}

// Close modals on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.style.display = 'none';
});

// ===================== SCROLL EFFECTS =====================
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// ===================== LIVE DATA SIMULATION =====================
setInterval(() => {
  const metricIds = ['dashM1','dashM2','dashM4'];
  metricIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = parseInt(el.textContent.replace(/,/g,''));
    if (isNaN(cur)) return;
    const delta = Math.floor(Math.random() * 5) - 1;
    el.textContent = (cur + delta).toLocaleString('en-IN');
  });
}, 8000);
