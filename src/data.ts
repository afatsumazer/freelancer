import { MemberUser, ChatMessage, SocialPost, PrivateMessage } from "./types";

export const AVATAR_PRESETS = [
  { id: "purple-sunset", name: "Purple Sunset", classes: "bg-gradient-to-tr from-purple-600 to-pink-500" },
  { id: "ocean-breeze", name: "Ocean Breeze", classes: "bg-gradient-to-tr from-blue-600 to-teal-400" },
  { id: "forest-moss", name: "Forest Moss", classes: "bg-gradient-to-tr from-emerald-600 to-green-400" },
  { id: "amber-flame", name: "Amber Flame", classes: "bg-gradient-to-tr from-amber-500 to-rose-500" },
  { id: "cyberpunk", name: "Cyberpunk Glow", classes: "bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-600" },
  { id: "nordic-gray", name: "Nordic Obsidian", classes: "bg-gradient-to-tr from-slate-800 to-slate-900" }
];

export const INITIAL_MEMBERS: MemberUser[] = [
  {
    id: "m1",
    name: "Adek Burong",
    email: "adek.burong@gmail.com",
    plan: "Premium",
    role: "user",
    bio: "Spesialis Full-stack Developer & UI/UX enthusiast dengan kecintaan pada desain minimalis.",
    description: "Saya membantu klien merancang arsitektur web modern yang andal, berkinerja tinggi, dan responsif.",
    avatar: "cyberpunk",
    registeredAt: "14 Jul 2026, 08:30"
  },
  {
    id: "m2",
    name: "Super Administrator",
    email: "admin@freelancer.com",
    plan: "Premium",
    role: "admin",
    bio: "Manajer Hub & Administrator Utama Portal Freelancer.",
    description: "Mengawasi kualitas anggota, persetujuan upgrade workspace, dan memoderasi lalu lintas data sistem.",
    avatar: "nordic-gray",
    registeredAt: "14 Jul 2026, 01:15"
  },
  {
    id: "m3",
    name: "Clara Angelica",
    email: "clara.ang@gmail.com",
    plan: "Starter",
    role: "user",
    bio: "Desainer Grafis & Ilustrator 2D lepas untuk industri penerbitan.",
    description: "Menyediakan layanan pembuatan cover buku, ilustrasi fiksi anak, dan branding bisnis UMKM.",
    avatar: "purple-sunset",
    registeredAt: "14 Jul 2026, 09:12"
  },
  {
    id: "m4",
    name: "Budi Santoso",
    email: "budi.san@yahoo.com",
    plan: "Starter",
    role: "user",
    bio: "Konsultan Keuangan & Analis Bisnis lepas.",
    description: "Membantu UMKM merapikan laporan perpajakan, audit anggaran bulanan, dan efisiensi modal kerja.",
    avatar: "ocean-breeze",
    registeredAt: "13 Jul 2026, 17:45"
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  {
    id: "c1",
    senderId: "client_budi",
    senderName: "Budi (Klien Desain)",
    senderAvatar: "ocean-breeze",
    message: "Halo! Apakah wireframe UI untuk halaman pendaftaran sudah selesai dikerjakan?",
    timestamp: "09:40",
    isIncoming: true
  },
  {
    id: "c2",
    senderId: "user",
    senderName: "Adek Burong",
    senderAvatar: "cyberpunk",
    message: "Halo Pak Budi, sebagian besar draf utama sudah selesai. Sedang saya rapikan format ekspornya agar bisa diunduh langsung.",
    timestamp: "09:42",
    isIncoming: false
  },
  {
    id: "c3",
    senderId: "client_budi",
    senderName: "Budi (Klien Desain)",
    senderAvatar: "ocean-breeze",
    message: "Sempurna! Segera kabari saya jika filenya sudah siap diunduh dari tab Workspace ya.",
    timestamp: "09:45",
    isIncoming: true
  }
];

export const SIMULATED_RESPONSES = [
  {
    keywords: ["wireframe", "desain", "gambar", "logo"],
    senderId: "client_budi",
    senderName: "Budi (Klien Desain)",
    senderAvatar: "ocean-breeze",
    responses: [
      "Wah, hasil draf desainya kelihatan sangat bersih dan profesional! Terima kasih atas kerjasamanya.",
      "Apakah kita bisa menambahkan opsi tema gelap pada wireframe berikutnya?",
      "Terima kasih atas update-nya. Mari kita diskusikan ini di rapat peninjauan nanti sore."
    ]
  },
  {
    keywords: ["harga", "tarif", "invoice", "bayar", "biaya", "pendapatan"],
    senderId: "support_bot",
    senderName: "Portal Support Assistant 🤖",
    senderAvatar: "forest-moss",
    responses: [
      "Sistem mencatat perubahan tarif Anda. Anda dapat mengunduh ringkasan data .json sebagai backup keuangan.",
      "Pastikan tarif per jam Anda disetujui oleh klien sebelum melanjutkan pengerjaan durasi proyek.",
      "Butuh bantuan membuat draf penagihan? Unduh 'Template_Invoice_Freelance.xlsx' di menu Unduhan!"
    ]
  },
  {
    keywords: ["halo", "hi", "pagi", "siang", "sore", "tes", "test"],
    senderId: "client_rani",
    senderName: "Rani (Manajer Proyek)",
    senderAvatar: "amber-flame",
    responses: [
      "Halo! Senang bisa terhubung kembali. Bagaimana progres agenda hari ini?",
      "Hai! Ada yang bisa saya bantu terkait integrasi API klien yang sedang Anda kerjakan?",
      "Halo rekan freelancer! Jangan lupa mencatat setiap jam kerja Anda pada portal agar estimasi penghasilan tetap akurat."
    ]
  },
  {
    default: true,
    senderId: "support_bot",
    senderName: "Portal Support Assistant 🤖",
    senderAvatar: "forest-moss",
    responses: [
      "Pesan Anda telah terekam di log koordinasi workspace. Rekan klien/manajer akan merespons sebentar lagi.",
      "Hebat! Terus pertahankan komunikasi yang transparan agar reputasi profesional Anda semakin bersinar.",
      "Catatan diskusi ditambahkan. Anda dapat menyalin hasil obrolan ini untuk draf laporan proyek."
    ]
  }
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "post1",
    authorEmail: "clara.ang@gmail.com",
    authorName: "Clara Angelica",
    authorAvatar: "purple-sunset",
    content: "Baru saja menyelesaikan draf ilustrasi komik fiksi ilmiah teranyar! Suka sekali dengan palet warna retro neon cyberpunk yang saya gunakan kali ini. Bagaimana menurut teman-teman freelancer yang lain? 🎨✨",
    createdAt: "15 Jul 2026, 14:20",
    likes: ["budi.san@yahoo.com"],
    comments: [
      {
        id: "c1",
        authorEmail: "budi.san@yahoo.com",
        authorName: "Budi Santoso",
        authorAvatar: "ocean-breeze",
        content: "Kombinasi warnanya luar biasa Clara! Kelihatan sangat premium dan futuristik.",
        createdAt: "15 Jul 2026, 14:45"
      }
    ],
    attachments: [
      {
        id: "att_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
        name: "neon_cyberpunk_comic.jpg",
        size: "1.4 MB"
      }
    ]
  },
  {
    id: "post2",
    authorEmail: "budi.san@yahoo.com",
    authorName: "Budi Santoso",
    authorAvatar: "ocean-breeze",
    content: "Tips keuangan untuk freelancer: Selalu pisahkan rekening pribadi dan rekening bisnis minimal 70/30. Ini memudahkan kita saat audit pajak dan kalkulasi margin laba bersih di akhir tahun fiskal! 💸📈",
    createdAt: "15 Jul 2026, 10:15",
    likes: ["clara.ang@gmail.com", "admin@freelancer.com"],
    comments: [
      {
        id: "c2",
        authorEmail: "admin@freelancer.com",
        authorName: "Super Administrator",
        authorAvatar: "nordic-gray",
        content: "Tips yang sangat berguna Pak Budi! Sangat direkomendasikan untuk seluruh member portal.",
        createdAt: "15 Jul 2026, 11:00"
      }
    ],
    attachments: [
      {
        id: "att_2",
        type: "link",
        url: "https://finance.freelancerportal.id/guide-70-30",
        name: "Panduan Pemisahan Rekening Keuangan Freelance.pdf"
      }
    ]
  },
  {
    id: "post3",
    authorEmail: "admin@freelancer.com",
    authorName: "Super Administrator",
    authorAvatar: "nordic-gray",
    content: "Selamat datang di fitur Portal Sosial baru! Di sini Anda dapat membagikan cerita harian, portofolio kerja, saling menyukai postingan, serta mengirim pesan privat terenkripsi langsung ke sesama rekan freelancer. Mari bangun komunitas yang suportif! 🚀💼🤝",
    createdAt: "14 Jul 2026, 09:00",
    likes: ["clara.ang@gmail.com", "budi.san@yahoo.com"],
    comments: []
  }
];

export const INITIAL_PRIVATE_MESSAGES: PrivateMessage[] = [
  {
    id: "pm1",
    senderEmail: "clara.ang@gmail.com",
    senderName: "Clara Angelica",
    senderAvatar: "purple-sunset",
    receiverEmail: "adek.burong@gmail.com",
    receiverName: "Adek Burong",
    receiverAvatar: "cyberpunk",
    content: "Halo Kak Adek! Saya lihat portofolio kakak di bidang web development keren sekali. Apakah ada waktu luang minggu ini untuk kolaborasi proyek landing page klien?",
    createdAt: "16 Jul 2026, 09:15",
    read: false
  },
  {
    id: "pm2",
    senderEmail: "budi.san@yahoo.com",
    senderName: "Budi Santoso",
    senderAvatar: "ocean-breeze",
    receiverEmail: "adek.burong@gmail.com",
    receiverName: "Adek Burong",
    receiverAvatar: "cyberpunk",
    content: "Pak Adek, boleh tanya-tanya sedikit tentang cara mengintegrasikan kalkulator estimasi finansial ke dashboard? Mau saya pelajari untuk klien saya.",
    createdAt: "16 Jul 2026, 08:30",
    read: true
  }
];

