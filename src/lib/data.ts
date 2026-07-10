// =============================================
// الماشي - دليل السيدة زينب بالقاهرة
// تم توليد هذا الملف تلقائياً من بيانات المستخدم
// =============================================

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  location: string;
  image: string;
  emoji: string;
  priceRange: string;
  hours: string;
  rating: number;
  phone: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
  count: number;
  image?: string;
}

export const categories: Category[] = [
  {
    "id": "gawame3",
    "image": "/places/cat-gawame3.jpg",
    "name": "سياحه",
    "color": "#2A9D8F",
    "emoji": "🕌",
    "count": 17
  },
  {
    "id": "asmak",
    "image": "/places/cat-asmak.jpg",
    "name": "الاسماك",
    "color": "#1565C0",
    "emoji": "🐟",
    "count": 3
  },
  {
    "id": "halawiyat",
    "image": "/places/cat-halawiyat.jpg",
    "name": "حلويات",
    "color": "#B8862E",
    "emoji": "🍮",
    "count": 6
  },
  {
    "id": "fool",
    "image": "/places/cat-fool.jpg",
    "name": "الفول والطعميه",
    "color": "#8D6E63",
    "emoji": "🫘",
    "count": 3
  },
  {
    "id": "qahwa",
    "image": "/places/cat-qahwa.jpg",
    "name": "القهوه",
    "color": "#5D4037",
    "emoji": "☕",
    "count": 17
  },
  {
    "id": "kabda",
    "image": "/places/cat-kabda.jpg",
    "name": "الكبده والسجق",
    "color": "#D4A03C",
    "emoji": "🥪",
    "count": 6
  },
  {
    "id": "koshari",
    "image": "/places/cat-koshari.jpg",
    "name": "الكشرى",
    "color": "#F57C00",
    "emoji": "🍛",
    "count": 3
  },
  {
    "id": "mashawat",
    "image": "/places/cat-mashawat.jpg",
    "name": "المشويات",
    "color": "#C0623B",
    "emoji": "🔥",
    "count": 9
  },
  {
    "id": "lahm",
    "image": "/places/cat-lahm.jpg",
    "name": "فواكه اللحوم",
    "color": "#E65100",
    "emoji": "🥩",
    "count": 8
  },
  {
    "id": "mustashfayat",
    "image": "/places/cat-mustashfayat.jpg",
    "name": "مستشفايات",
    "color": "#C62828",
    "emoji": "🏥",
    "count": 9
  }
];

export const places: Place[] = [
  {
    "id": "p001",
    "name": "باب زويله",
    "category": "gawame3",
    "description": "باب زويله - من أماكن سياحه في السيدة زينب",
    "address": "27V5+545، محمد علي، الدرب الأحمر، محافظة القاهرة‬ 4293001",
    "location": "27V5+545، محمد علي، الدرب الأحمر، محافظة القاهرة‬ 4293001",
    "image": "/places/p001.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p002",
    "name": "بيت الامه سعد زغلول",
    "category": "gawame3",
    "description": "بيت الامه سعد زغلول - من أماكن سياحه في السيدة زينب",
    "address": "2 سعد زغلول، الإنشا والمنيرة، قسم السيدة زينب، محافظة القاهرة‬ 4262110",
    "location": "26QP+5X قسم السيدة زينب",
    "image": "/places/p002.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p003",
    "name": "سبيل ام عباس",
    "category": "gawame3",
    "description": "سبيل ام عباس - من أماكن سياحه في السيدة زينب",
    "address": "27J2+8V4، الصليبة، الدرب الأحمر، محافظة القاهرة‬ 4290132",
    "location": "27J2+8V4",
    "image": "/places/p003.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p004",
    "name": "فم الخليخ سور مجرى العيون",
    "category": "gawame3",
    "description": "فم الخليخ سور مجرى العيون - من أماكن سياحه في السيدة زينب",
    "address": "26CJ+R4W، Magra Al Eyoon، فم الخليج ودير النحاس، قسم مصر القديمة، محافظة القاهرة‬ 4241317",
    "location": "26CJ+R4W، Magra Al Eyoon، فم الخليج ودير النحاس، قسم مصر القديمة، محافظة القاهرة‬ 4241317",
    "image": "/places/p004.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p005",
    "name": "متحف الفن الاسلامى",
    "category": "gawame3",
    "description": "متحف الفن الاسلامى - من أماكن سياحه في السيدة زينب",
    "address": "بور سعيد، غيط العدة، الدرب الأحمر، محافظة القاهرة‬ 11638",
    "location": "27V3+V3 الدرب الأحمر",
    "image": "/places/p005.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p006",
    "name": "مسجد ابن طولون",
    "category": "gawame3",
    "description": "مسجد ابن طولون - من أماكن سياحه في السيدة زينب",
    "address": "ميدان أحمد بن طولون، طولون، قسم السيدة زينب، محافظة القاهرة‬ 4261342",
    "location": "26HX+GR قسم السيدة زينب",
    "image": "/places/p006.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p007",
    "name": "مسجد الامير اغا الحين",
    "category": "gawame3",
    "description": "مسجد الامير اغا الحين - من أماكن سياحه في السيدة زينب",
    "address": "27V2+3WW، الدرب الأحمر، محافظة القاهرة‬ 4290219",
    "location": "27V3+32G الدرب الأحمر",
    "image": "/places/p007.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p008",
    "name": "مسجد الامير قيسون",
    "category": "gawame3",
    "description": "مسجد الامير قيسون - من أماكن سياحه في السيدة زينب",
    "address": "27Q3+6VQ، عطفة المحكمه، الدرب الأحمر، محافظة القاهرة‬ 4290302",
    "location": "27Q3+7P5 الدرب الأحمر",
    "image": "/places/p008.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p009",
    "name": "مسجد الجاى اليوسفى",
    "category": "gawame3",
    "description": "مسجد الجاى اليوسفى - من أماكن سياحه في السيدة زينب",
    "address": "سوق السلاح، الدرب الأحمر، محافظة القاهرة‬ 4292043",
    "location": "27M4+XR الدرب الأحمر",
    "image": "/places/p009.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p010",
    "name": "مسجد الرفاعى",
    "category": "gawame3",
    "description": "مسجد الرفاعى - من أماكن سياحه في السيدة زينب",
    "address": "27J5+Q85، درب اللبانه، الدرب الأحمر، الخليفة، محافظة القاهرة‬ 4292008",
    "location": "27J4+XXV الخليفة",
    "image": "/places/p010.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.8,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p011",
    "name": "مسجد السلطان حسن",
    "category": "gawame3",
    "description": "مسجد السلطان حسن - من أماكن سياحه في السيدة زينب",
    "address": "الدرب الأحمر، الخليفة، محافظة القاهرة‬",
    "location": "27J4+WF7",
    "image": "/places/p011.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.9,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p012",
    "name": "مسجد السيده رقيه",
    "category": "gawame3",
    "description": "مسجد السيده رقيه - من أماكن سياحه في السيدة زينب",
    "address": "16 الخليفة، الأباجية، الخليفة، محافظة القاهرة‬ 4261233",
    "location": "27G2+7H الخليفة",
    "image": "/places/p012.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 3.8,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p013",
    "name": "مسجد السيده زينب",
    "category": "gawame3",
    "description": "مسجد السيده زينب - من أماكن سياحه في السيدة زينب",
    "address": "ميدان السيدة زينب، الحنفي، قسم السيدة زينب، محافظة القاهرة‬ 11617",
    "location": "26JR+JR قسم السيدة زينب",
    "image": "/places/p013.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p014",
    "name": "مسجد السيده سكينه",
    "category": "gawame3",
    "description": "مسجد السيده سكينه - من أماكن سياحه في السيدة زينب",
    "address": "شارع الاسراف، الأباجية، الخليفة، محافظة القاهرة‬ 4251210",
    "location": "27G2+QV الخليفة",
    "image": "/places/p014.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p015",
    "name": "مسجد السيده عائشه",
    "category": "gawame3",
    "description": "مسجد السيده عائشه - من أماكن سياحه في السيدة زينب",
    "address": "الأباجية، الخليفة، محافظة القاهرة‬",
    "location": "27G4+WFX الخليفة",
    "image": "/places/p015.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p016",
    "name": "مسجد السيده نفيسه",
    "category": "gawame3",
    "description": "مسجد السيده نفيسه - من أماكن سياحه في السيدة زينب",
    "address": "27C2+XVM، الأباجية، الخليفة، محافظة القاهرة‬ 4251101",
    "location": "27C2+XVM، 4251101",
    "image": "/places/p016.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p017",
    "name": "مسجد ومقام زين العابدين",
    "category": "gawame3",
    "description": "مسجد ومقام زين العابدين - من أماكن سياحه في السيدة زينب",
    "address": "26FQ+VP2، سكة سيدي زين، زينهم، قسم السيدة زينب، محافظة القاهرة‬ 4260122",
    "location": "26GQ+38 قسم السيدة زينب",
    "image": "/places/p017.jpg",
    "emoji": "🕌",
    "priceRange": "—",
    "hours": "مفتوح يومياً",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "سياحه"
    ]
  },
  {
    "id": "p018",
    "name": "اسماك ابن حميدو",
    "category": "asmak",
    "description": "اسماك ابن حميدو - من أماكن الاسماك في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26PW+2Q قسم السيدة زينب",
    "image": "/places/p018.jpg",
    "emoji": "🐟",
    "priceRange": "$$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "الاسماك"
    ]
  },
  {
    "id": "p019",
    "name": "اسمك الاكرمين",
    "category": "asmak",
    "description": "اسمك الاكرمين - من أماكن الاسماك في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26MW+G9 قسم السيدة زينب",
    "image": "/places/p019.jpg",
    "emoji": "🐟",
    "priceRange": "$$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "الاسماك"
    ]
  },
  {
    "id": "p020",
    "name": "رنجه وفسيخ",
    "category": "asmak",
    "description": "رنجه وفسيخ - من أماكن الاسماك في السيدة زينب",
    "address": "السيدة زينب، القاهرة",
    "location": "",
    "image": "",
    "emoji": "🐟",
    "priceRange": "$$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "الاسماك"
    ]
  },
  {
    "id": "p021",
    "name": "الكرنك",
    "category": "halawiyat",
    "description": "القنبله",
    "address": "شارع محمد فريد عابدين",
    "location": "26QV+FC عابدين",
    "image": "/places/p021.jpg",
    "emoji": "🍮",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "حلويات"
    ]
  },
  {
    "id": "p022",
    "name": "الملكى",
    "category": "halawiyat",
    "description": "الملكى - من أماكن حلويات في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26MW+CF السيدة زينب، قسم السيدة زينب",
    "image": "/places/p022.jpg",
    "emoji": "🍮",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.8,
    "phone": "",
    "tags": [
      "حلويات"
    ]
  },
  {
    "id": "p023",
    "name": "حلوانى الحلميه",
    "category": "halawiyat",
    "description": "حلوانى الحلميه - من أماكن حلويات في السيدة زينب",
    "address": "سكه راتب باشا",
    "location": "27Q2+8J الدرب الأحمر",
    "image": "/places/p023.jpg",
    "emoji": "🍮",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.9,
    "phone": "",
    "tags": [
      "حلويات"
    ]
  },
  {
    "id": "p024",
    "name": "سوبيا الرحمانى",
    "category": "halawiyat",
    "description": "سوبيا الرحمانى - من أماكن حلويات في السيدة زينب",
    "address": "المبتديان",
    "location": "26MR+FM قسم السيدة زينب",
    "image": "/places/p024.jpg",
    "emoji": "🍮",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.8,
    "phone": "",
    "tags": [
      "حلويات"
    ]
  },
  {
    "id": "p025",
    "name": "سوبيا توتو",
    "category": "halawiyat",
    "description": "سوبيا توتو - من أماكن حلويات في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26MW+67 قسم السيدة زينب",
    "image": "/places/p025.jpg",
    "emoji": "🍮",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "حلويات"
    ]
  },
  {
    "id": "p026",
    "name": "عرفه الكنفانى",
    "category": "halawiyat",
    "description": "عرفه الكنفانى - من أماكن حلويات في السيدة زينب",
    "address": "ميدان السيده زينب",
    "location": "26MR+3J قسم السيدة زينب",
    "image": "/places/p026.jpg",
    "emoji": "🍮",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "حلويات"
    ]
  },
  {
    "id": "p027",
    "name": "الجحش",
    "category": "fool",
    "description": "الجحش هو المكان الذي يثبت أن البساطة هي سر النجاح، وهو \"المحطة الإجبارية\" لأي شخص يريد تذوق طعم مصر الحقيقي في لقمة فول أصيلة.",
    "address": "ميدان السيده زينب بجانب قسم السيده",
    "location": "26JV+CM قسم السيدة زينب",
    "image": "/places/p027.jpg",
    "emoji": "🫘",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "الفول والطعميه"
    ]
  },
  {
    "id": "p028",
    "name": "الكربيجى",
    "category": "fool",
    "description": "هو الأشهر عالمياً، فإن الكربيجي هو \"صاحب الدار\" اللي بيعتمد عليه أهل السيدة زينب",
    "address": "ميدان السيده زينب امام قسم السيده",
    "location": "26MV+4W قسم السيدة زينب",
    "image": "/places/p028.jpg",
    "emoji": "🫘",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "الفول والطعميه"
    ]
  },
  {
    "id": "p029",
    "name": "بشندى",
    "category": "fool",
    "description": "وبقى الوجهة الأولى للشباب والعائلات وحتى السياح العرب اللي عايزين ياكلوا أكلة شعبية \"شيك\" ومضمونة.",
    "address": "السيخ على يوسف\nاللوكيش\n26JM+JR قسم السيدة زينب",
    "location": "",
    "image": "/places/p029.jpg",
    "emoji": "🫘",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "الفول والطعميه"
    ]
  },
  {
    "id": "p030",
    "name": "زيزو كافىه",
    "category": "qahwa",
    "description": "زيزو كافىه - من أماكن القهوه في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26MR+66 قسم السيدة زينب",
    "image": "/places/p030.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p031",
    "name": "قهوه افندينا",
    "category": "qahwa",
    "description": "قهوه افندينا - من أماكن القهوه في السيدة زينب",
    "address": "338 الطوبي، رحبة عابدين، الدرب الأحمر، محافظة القاهرة‬ 4281087",
    "location": "27V2+3Q الدرب الأحمر",
    "image": "/places/p031.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p032",
    "name": "قهوه الباشا",
    "category": "qahwa",
    "description": "قهوه الباشا - من أماكن القهوه في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26PX+C7 قسم السيدة زينب",
    "image": "/places/p032.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p033",
    "name": "قهوه البيت الكبير",
    "category": "qahwa",
    "description": "قهوه البيت الكبير - من أماكن القهوه في السيدة زينب",
    "address": "شارع قدرى",
    "location": "26JW+QP قسم السيدة زينب",
    "image": "/places/p033.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p034",
    "name": "قهوه التجاريه",
    "category": "qahwa",
    "description": "قهوه التجاريه - من أماكن القهوه في السيدة زينب",
    "address": "احمد ماهر",
    "location": "27Q2+W5 الدرب الأحمر",
    "image": "/places/p034.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.8,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p035",
    "name": "قهوه الزملكويه",
    "category": "qahwa",
    "description": "قهوه الزملكويه - من أماكن القهوه في السيدة زينب",
    "address": "شارع محمد عنايت، السيدة زينب، الدرب الأحمر، محافظة القاهرة‬،، 3 عطفة أبو جبه، الدرب الأحمر، قسم السيدة زينب، محافظة القاهرة‬ 4290032",
    "location": "26MW+3M قسم السيدة زينب",
    "image": "/places/p035.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.9,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p036",
    "name": "قهوه السرايا",
    "category": "qahwa",
    "description": "قهوه السرايا - من أماكن القهوه في السيدة زينب",
    "address": "المبتديان",
    "location": "26MQ+QMV قسم السيدة زينب",
    "image": "/places/p036.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 3.8,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p037",
    "name": "قهوه السكريه 1",
    "category": "qahwa",
    "description": "قهوه السكريه 1 - من أماكن القهوه في السيدة زينب",
    "address": "احمد ماهر",
    "location": "27R2+7J قسم السيدة زينب",
    "image": "/places/p037.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p038",
    "name": "قهوه السكريه2",
    "category": "qahwa",
    "description": "قهوه السكريه2 - من أماكن القهوه في السيدة زينب",
    "address": "ميدان زين العابدين",
    "location": "26GQ+HM9 قسم السيدة زينب",
    "image": "/places/p038.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p039",
    "name": "قهوه المحروسه",
    "category": "qahwa",
    "description": "قهوه المحروسه - من أماكن القهوه في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "26QX+5M السيدة زينب، قسم السيدة زينب",
    "image": "/places/p039.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p040",
    "name": "قهوه اليل واخره",
    "category": "qahwa",
    "description": "قهوه اليل واخره - من أماكن القهوه في السيدة زينب",
    "address": "شارع السلسله ابو الريش",
    "location": "26HP+GRX قسم السيدة زينب",
    "image": "/places/p040.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p041",
    "name": "قهوه تفاحه",
    "category": "qahwa",
    "description": "قهوه تفاحه - من أماكن القهوه في السيدة زينب",
    "address": "المبتديان بجوار مستشفى المنيره",
    "location": "26MQ+Q9 قسم السيدة زينب",
    "image": "/places/p041.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p042",
    "name": "قهوه لؤلؤه الجماميز",
    "category": "qahwa",
    "description": "قهوه لؤلؤه الجماميز - من أماكن القهوه في السيدة زينب",
    "address": "درب الجماميز",
    "location": "26PX+28 قسم السيدة زينب",
    "image": "/places/p042.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p043",
    "name": "قهوه ولاد العم",
    "category": "qahwa",
    "description": "قهوه ولاد العم - من أماكن القهوه في السيدة زينب",
    "address": "شارع السلسله ابو الريش\nالوكيشن\n26HP+PR4 قسم السيدة زينب",
    "location": "",
    "image": "/places/p043.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p044",
    "name": "كافيه المندره",
    "category": "qahwa",
    "description": "كافيه المندره - من أماكن القهوه في السيدة زينب",
    "address": "شارع حلوان",
    "location": "26MP+3Q قسم السيدة زينب",
    "image": "/places/p044.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p045",
    "name": "كافيه المندره 2",
    "category": "qahwa",
    "description": "كافيه المندره 2 - من أماكن القهوه في السيدة زينب",
    "address": "شارع بور سعيد",
    "location": "27R2+GM2 الدرب الأحمر",
    "image": "/places/p045.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p046",
    "name": "كافيه لوكس",
    "category": "qahwa",
    "description": "كافيه لوكس - من أماكن القهوه في السيدة زينب",
    "address": "ميدان ابو الريش",
    "location": "26HP+CR3 قسم السيدة زينب",
    "image": "/places/p046.jpg",
    "emoji": "☕",
    "priceRange": "$",
    "hours": "يومياً 6ص - 2ص",
    "rating": 4.8,
    "phone": "",
    "tags": [
      "القهوه"
    ]
  },
  {
    "id": "p047",
    "name": "الشرقاوى",
    "category": "kabda",
    "description": "يعتبر الشرقاوي واحدًا من أشهر مطاعم الوجبات الشعبية السريعة التي تخصصت في تقديم سندوتشات",
    "address": "ميدان السيده زينب",
    "location": "26MR+2H قسم السيدة زينب",
    "image": "/places/p047.jpg",
    "emoji": "🥪",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.9,
    "phone": "",
    "tags": [
      "الكبده والسجق"
    ]
  },
  {
    "id": "p048",
    "name": "الطاهره 1",
    "category": "kabda",
    "description": "باختصار، الطاهرة هو \"الخيار الآمن\" والأصلي لو نفسك في سندوتش كبدة وسجق في السيدة زينب من غير قلق، وطعمه دايماً بيعدل المزاج.",
    "address": "ميدان السيده زينب امام قسم السيده",
    "location": "26JV+JH قسم السيدة زينب",
    "image": "/places/p048.jpg",
    "emoji": "🥪",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.8,
    "phone": "",
    "tags": [
      "الكبده والسجق"
    ]
  },
  {
    "id": "p049",
    "name": "الطاهره 2",
    "category": "kabda",
    "description": "باختصار، الطاهرة هو \"الخيار الآمن\" والأصلي لو نفسك في سندوتش كبدة وسجق في السيدة زينب من غير قلق، وطعمه دايماً بيعدل المزاج.",
    "address": "شارع السلسه ابو الريش",
    "location": "26HP+FR3 قسم السيدة زينب",
    "image": "/places/p049.jpg",
    "emoji": "🥪",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "الكبده والسجق"
    ]
  },
  {
    "id": "p050",
    "name": "بابا عبده",
    "category": "kabda",
    "description": "بابا عبده مش مجرد مطعم، ده معلم تاريخي من معالم القاهرة، وبقاله سنين طويلة هو \"الملاذ الآمن\" لكل حد عايز ياكل سندوتش كبدة وسجق ليه طعم مميز ومختلف عن أي مكان تاني",
    "address": "شارع الحوض المرصود، الدرب الأحمر، قسم السيدة زينبب",
    "location": "26JX+X5 قسم السيدة زينب",
    "image": "/places/p050.jpg",
    "emoji": "🥪",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "الكبده والسجق"
    ]
  },
  {
    "id": "p051",
    "name": "فتحى",
    "category": "kabda",
    "description": "باختصار: لو كنت تبحث عن \"أنضف وأطعم\" سندوتش مخ وكبدة بانية في وسط البلد، فمحل \"فتحي\" هو وجهتك الأكيدة.",
    "address": "شارع بور سعيد",
    "location": "26MW+VR قسم السيدة زينب",
    "image": "/places/p051.jpg",
    "emoji": "🥪",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "الكبده والسجق"
    ]
  },
  {
    "id": "p052",
    "name": "كساب",
    "category": "kabda",
    "description": "يُعد كساب من المطاعم التي ترفع شعار \"الجودة أولاً\"، وهو اسم ارتبط بالاحترافية في التعامل",
    "address": "شارع بور سعيد",
    "location": "26MW+8C الدرب الأحمر",
    "image": "/places/p052.jpg",
    "emoji": "🥪",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "الكبده والسجق"
    ]
  },
  {
    "id": "p053",
    "name": "كشرى الامبرطور",
    "category": "koshari",
    "description": "كشرى الامبرطور - من أماكن الكشرى في السيدة زينب",
    "address": "ميدان السيده",
    "location": "26MR+MJ قسم السيدة زينب",
    "image": "/places/p053.jpg",
    "emoji": "🍛",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "الكشرى"
    ]
  },
  {
    "id": "p054",
    "name": "كشرى السلطان حسن",
    "category": "koshari",
    "description": "كشرى السلطان حسن - من أماكن الكشرى في السيدة زينب",
    "address": "شارع القلعه",
    "location": "27Q3+XF الدرب الأحمر",
    "image": "/places/p054.jpg",
    "emoji": "🍛",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "الكشرى"
    ]
  },
  {
    "id": "p055",
    "name": "كشرى ستو",
    "category": "koshari",
    "description": "كشرى ستو - من أماكن الكشرى في السيدة زينب",
    "address": "المبتديان بجوار البنك الاهلى",
    "location": "26MR+MJ قسم السيدة زينب",
    "image": "/places/p055.jpg",
    "emoji": "🍛",
    "priceRange": "$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "الكشرى"
    ]
  },
  {
    "id": "p056",
    "name": "ابن حميدو",
    "category": "mashawat",
    "description": "يُعد ابن حميدو وجهة مفضلة للعائلات والأصدقاء الذين يبحثون عن وجبة مشويات متكاملة،",
    "address": "سارع السد",
    "location": "26HQ+J6 قسم السيدة زينب",
    "image": "/places/p056.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p057",
    "name": "ابو رامى",
    "category": "mashawat",
    "description": "عندما يُذكر اسم أبو رامي، يتبادر إلى الذهن فوراً رائحة الشواء التي تملأ أركان منطقة المذبح",
    "address": "المدبح امام مستشفى 57357",
    "location": "26FQ+9F قسم السيدة زينب",
    "image": "/places/p057.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p058",
    "name": "الامام",
    "category": "mashawat",
    "description": "مدرسة الشواء التقليدية: يتميز الإمام بالالتزام بالطريقة المصرية الأصيلة في الشواء",
    "address": "شارع السد",
    "location": "26HQ+QP قسم السيدة زينب",
    "image": "/places/p058.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.8,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p059",
    "name": "البيبانى",
    "category": "mashawat",
    "description": "البيبانى - من أماكن المشويات في السيدة زينب",
    "address": "البيبانى الدرب الاحمر",
    "location": "27P4+F3 الدرب الأحمر",
    "image": "/places/p059.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.9,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p060",
    "name": "الديك",
    "category": "mashawat",
    "description": "يعتبر كبابجي الديك واحداً من الأسماء اللي قدرت تحفر اسمها بحروف من ذهب في خريطة المطاعم الشعبية",
    "address": "ميدان زين العابدين",
    "location": "26GQ+QM قسم السيدة زينب",
    "image": "/places/p060.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.8,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p061",
    "name": "الرفاعى",
    "category": "mashawat",
    "description": "يعتبر كبابجي الرفاعي واحداً من أعرق وأشهر أسماء المشويات في منطقة السيدة زينب والقاهرة",
    "address": "ميدان السيده زينب",
    "location": "26MR+3W قسم السيدة زينب",
    "image": "/places/p061.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p062",
    "name": "سلامه",
    "category": "mashawat",
    "description": "مشويات سلامة هو المكان اللي تروح له لما تكون عايز \"تأنتخ\" وتستمتع بوجبة مشويات ملكية، فيها كل أصول الكرم والجودة المصرية.",
    "address": "ميدان السيده امام قسم السيده",
    "location": "26MW+62 قسم السيدة زينب",
    "image": "/places/p062.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p063",
    "name": "عوف",
    "category": "mashawat",
    "description": "عتبر كبابجي عوف واحدًا من \"عتاولة\" المشويات في القاهرة، وهو اسم ارتبط بالثقة والجودة العالية",
    "address": "ميدان زين العابدين",
    "location": "26GQ+JH قسم السيدة زينب",
    "image": "/places/p063.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p064",
    "name": "مولانا",
    "category": "mashawat",
    "description": "يعد مولانا صرحاً للمشويات يقدم تعريفاً جديداً للجودة والكرم",
    "address": "شارع السلسله ابو الريش",
    "location": "26HP+JV7، Abou Al Reesh، السيدة زينب، قسم السيدة زينب، محافظة القاهرة‬ 4262040",
    "image": "/places/p064.jpg",
    "emoji": "🔥",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "المشويات"
    ]
  },
  {
    "id": "p065",
    "name": "المدينه",
    "category": "lahm",
    "description": "المدينه - من أماكن فواكه اللحوم في السيدة زينب",
    "address": "السيدة زينب، القاهرة",
    "location": "",
    "image": "",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p066",
    "name": "حبايب السيده",
    "category": "lahm",
    "description": "يعتبر مسمط حبايب السيدة واحداً من الأسماء التي تحمل في طياتها عبق حي السيدة زينب العريق",
    "address": "اول شارع السد ميدان ابو الريش",
    "location": "26HQ+92 قسم السيدة زينب",
    "image": "/places/p066.jpg",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p067",
    "name": "عباد الرحمان",
    "category": "lahm",
    "description": "يعتبر مسمط عباد الرحمن واحداً من المحطات الهامة في رحلة البحث عن \"السمين\" المتميز",
    "address": "شارع السلخانه امام مسجد الرواس",
    "location": "26FQ+M4 قسم السيدة زينب",
    "image": "/places/p067.jpg",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p068",
    "name": "مسمط الشعب 1",
    "category": "lahm",
    "description": "يُعد مسمط الشعب صرحاً للمذاق المصري البلدي، حيث استطاع أن يجمع بين بساطة المكان وقوة الطعم.",
    "address": "El-Sheikh Reyhan, St, عابدين، محافظة القاهرة‬",
    "location": "26RV+CW عابدين",
    "image": "/places/p068.jpg",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p069",
    "name": "مسمط الشعب 2",
    "category": "lahm",
    "description": "يعتبر مسمط الشعب واحدًا من العلامات المميزة في خريطة الأكل الشعبي المصري",
    "address": "ميدان السيده زينب امام مسجد السيده",
    "location": "26JV+W86 قسم السيدة زينب",
    "image": "/places/p069.jpg",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p070",
    "name": "مطعم ابن اليل",
    "category": "lahm",
    "description": "إذا كنت تبحث عن المذاق الشعبي الأصيل وسط أجواء القاهرة التاريخية",
    "address": "السلخانه، المدبح، زينهم، قسم السيدة زينب ميدان زين العابدين",
    "location": "26GQ+8C قسم السيدة زينب",
    "image": "/places/p070.jpg",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.8,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p071",
    "name": "مطعم بجه",
    "category": "lahm",
    "description": "يعد مطعم بجة واحداً من أعمدة الأكل الشعبي في حي السيدة زينب",
    "address": "السيدة زينب، القاهرة",
    "location": "26RV+CF عابدين",
    "image": "/places/p071.jpg",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 4.9,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p072",
    "name": "مطعم بحه",
    "category": "lahm",
    "description": "يعتبر مطعم \"بحه\" من أشهر المعالم الشعبية في منطقة السيدة زينب بالقاهرة، ويشتهر بتقديم \"حلويات اللحوم\" و\"السمين\" (المشكل",
    "address": "ميدان السيدة زينب، بجوار مسجد السيدة زينب مباشرة، الناصرية، القاهرة.",
    "location": "26PV+QF قسم السيدة زينب",
    "image": "/places/p072.png",
    "emoji": "🥩",
    "priceRange": "$$",
    "hours": "يومياً 11ص - 12م",
    "rating": 3.8,
    "phone": "",
    "tags": [
      "فواكه اللحوم"
    ]
  },
  {
    "id": "p073",
    "name": "اطفال مصر",
    "category": "mustashfayat",
    "description": "اطفال مصر - من أماكن مستشفايات في السيدة زينب",
    "address": "1 Abu el reesh، ميدان، السيدة زينب، محافظة القاهرة‬ ابو الريش",
    "location": "26HP+5H السيدة زينب، قسم السيدة زينب",
    "image": "/places/p073.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 3.9,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p074",
    "name": "مستشفى 57357",
    "category": "mustashfayat",
    "description": "مستشفى 57357 - من أماكن مستشفايات في السيدة زينب",
    "address": "سكة حديد المحجر، زينهم، قسم السيدة زينب، محافظة القاهرة‬ 4260102",
    "location": "26FQ+54 قسم السيدة زينب",
    "image": "/places/p074.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.0,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p075",
    "name": "مستشفى ابو الريش اليابانى",
    "category": "mustashfayat",
    "description": "مستشفى ابو الريش اليابانى - من أماكن مستشفايات في السيدة زينب",
    "address": "العيني، قسم السيدة زينب، محافظة القاهرة‬ 4260018",
    "location": "26HM+C8 قسم السيدة زينب",
    "image": "/places/p075.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.1,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p076",
    "name": "مستشفى ابو الريش للاطفال",
    "category": "mustashfayat",
    "description": "مستشفى ابو الريش للاطفال - من أماكن مستشفايات في السيدة زينب",
    "address": "المريس، الإنشا والمنيرة، قسم السيدة زينب، محافظة القاهرة‬ 4262010",
    "location": "26HM+RV قسم السيدة زينب",
    "image": "/places/p076.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.2,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p077",
    "name": "مستشفى احمد ماهر",
    "category": "mustashfayat",
    "description": "مستشفى احمد ماهر - من أماكن مستشفايات في السيدة زينب",
    "address": "341, Port Said St., Bab El Khalq, 341 بور سعيد، Cairo, محافظة القاهرة‬",
    "location": "27Q2+WF الدرب الأحمر",
    "image": "/places/p077.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.3,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p078",
    "name": "مستشفى الحكمه",
    "category": "mustashfayat",
    "description": "مستشفى الحكمه - من أماكن مستشفايات في السيدة زينب",
    "address": "قسم السيدة زينب، 18 الرشيدي، المنيرة، قسم السيدة زينب، محافظة القاهرة‬ 11562",
    "location": "26JM+26 المنيرة، إمبابة",
    "image": "/places/p078.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.4,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p079",
    "name": "مستشفى القصر العينى",
    "category": "mustashfayat",
    "description": "مستشفى القصر العينى - من أماكن مستشفايات في السيدة زينب",
    "address": "20 الرشيدي، الإنشا والمنيرة، قسم السيدة زينب، محافظة القاهرة‬ 4262002",
    "location": "26JJ+7H قسم السيدة زينب",
    "image": "/places/p079.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.5,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p080",
    "name": "مستشفى المقطم",
    "category": "mustashfayat",
    "description": "مستشفى المقطم - من أماكن مستشفايات في السيدة زينب",
    "address": "عباس، زينهم، قسم السيدة زينب، محافظة القاهرة‬ 4260140",
    "location": "26CV+9G قسم السيدة زينب",
    "image": "/places/p080.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.6,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  },
  {
    "id": "p081",
    "name": "مستشفى المنيره",
    "category": "mustashfayat",
    "description": "مستشفى المنيره - من أماكن مستشفايات في السيدة زينب",
    "address": "محمد عز الدين، خيرت، قسم السيدة زينب، محافظة القاهرة‬ 4262130",
    "location": "26MQ+W6 قسم السيدة زينب",
    "image": "/places/p081.jpg",
    "emoji": "🏥",
    "priceRange": "—",
    "hours": "طوارئ 24 ساعة",
    "rating": 4.7,
    "phone": "",
    "tags": [
      "مستشفايات"
    ]
  }
];

export function getPlacesByCategory(categoryId: string): Place[] {
  return places.filter((p) => p.category === categoryId);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function searchPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return places.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getPlaceById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

// ===== Aliases للتوافق مع المكونات =====
export const PLACES = places;
export const CATEGORIES = categories;

// ===== Mood Discovery =====
export interface Mood {
  id: string;
  label: string;
  emoji: string;
  categories: string[];
}

export const MOODS: Mood[] = [
  { id: 'hungry', label: 'جعان', emoji: '😋', categories: ['mashawat', 'koshari', 'fool', 'lahm'] },
  { id: 'coffee', label: 'قهوة', emoji: '☕', categories: ['qahwa'] },
  { id: 'sweets', label: 'حلويات', emoji: '🍮', categories: ['halawiyat'] },
  { id: 'fish', label: 'أسماك', emoji: '🐟', categories: ['asmak'] },
  { id: 'tour', label: 'سياحة', emoji: '🕌', categories: ['gawame3'] },
  { id: 'liver', label: 'كبدة', emoji: '🥪', categories: ['kabda'] },
];

// ===== Badges =====
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export const BADGES: Badge[] = [
  { id: 'b1', name: 'مستكشف مبتدئ', description: 'زرت 5 أماكن', icon: '🥉', requirement: 'visit_5' },
  { id: 'b2', name: 'مستكشف محترف', description: 'زرت 15 مكان', icon: '🥈', requirement: 'visit_15' },
  { id: 'b3', name: 'خبير السيدة', description: 'زرت 30 مكان', icon: '🥇', requirement: 'visit_30' },
  { id: 'b4', name: 'محب المشويات', description: 'زرت 5 مطاعم مشويات', icon: '🔥', requirement: 'mashawat_5' },
  { id: 'b5', name: 'شربان القهوة', description: 'زرت 5 قهوات', icon: '☕', requirement: 'qahwa_5' },
  { id: 'b6', name: 'محب الحلويات', description: 'زرت 3 محلات حلويات', icon: '🍮', requirement: 'halawiyat_3' },
  { id: 'b7', name: 'خطة محترف', description: 'أنشأت 3 خطط يومية', icon: '📋', requirement: 'plans_3' },
  { id: 'b8', name: 'ناقد نشيط', description: 'كتبت 10 تقييمات', icon: '⭐', requirement: 'reviews_10' },
];
