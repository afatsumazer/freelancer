import { useState, useEffect, FormEvent, useRef, ChangeEvent } from "react";
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  FileText,
  User,
  LogIn,
  UserPlus,
  Compass,
  Layers,
  Tag,
  BookOpen,
  X,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Star,
  UploadCloud,
  Download,
  LogOut,
  File,
  Menu,
  Check,
  AlertCircle,
  MessageSquare,
  Settings,
  ShieldAlert,
  Send,
  Edit2,
  Camera,
  Users,
  Search,
  UserCheck,
  Eye,
  Globe,
  Lock,
  Unlock,
  Image,
  FileSpreadsheet,
  Cloud,
  Folder,
  ExternalLink,
  Loader2,
  Heart,
  MessageCircle,
  Mail,
  Paperclip,
  Video,
  Link,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, UploadedFile, MemberUser, ChatMessage, SocialPost, PrivateMessage, SocialComment } from "./types";
import { AVATAR_PRESETS, INITIAL_MEMBERS, INITIAL_CHATS, SIMULATED_RESPONSES, INITIAL_SOCIAL_POSTS, INITIAL_PRIVATE_MESSAGES } from "./data";
import {
  initAuth,
  googleSignIn,
  logout,
  listDriveFiles,
  uploadFileToDrive,
  createDriveFolder,
  deleteDriveFile,
  createSpreadsheet,
  updateSpreadsheetValues,
  getSpreadsheetValues,
  getSpreadsheetMetadata,
  GoogleDriveFile
} from "./workspace";
import { User as FirebaseUser } from "firebase/auth";

// Visual category images/gradients
const CATEGORY_IMAGES = {
  "Development": {
    gradient: "from-blue-500/15 to-indigo-500/5 text-blue-600 border-blue-200/50",
    glow: "rgba(59, 130, 246, 0.15)",
    icon: Compass,
    desc: "Coding & Integrasi"
  },
  "Desain": {
    gradient: "from-purple-500/15 to-pink-500/5 text-purple-600 border-purple-200/50",
    glow: "rgba(168, 85, 247, 0.15)",
    icon: Layers,
    desc: "Wireframe & Branding"
  },
  "Finansial": {
    gradient: "from-emerald-500/15 to-teal-500/5 text-emerald-600 border-emerald-200/50",
    glow: "rgba(16, 185, 129, 0.15)",
    icon: Tag,
    desc: "Invoice & Budget"
  },
  "Rapat": {
    gradient: "from-amber-500/15 to-orange-500/5 text-amber-600 border-amber-200/50",
    glow: "rgba(245, 158, 11, 0.15)",
    icon: BookOpen,
    desc: "Agenda & Klien"
  }
};

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("freelancer_logged_in") === "true";
  });
  
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("freelancer_user_email") || "adek.burong@gmail.com";
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("freelancer_user_name") || "Adek Burong";
  });

  // Membership states to make Premium vs Starter dynamic
  const [membershipPlan, setMembershipPlan] = useState<"Starter" | "Premium">(() => {
    return (localStorage.getItem("freelancer_plan") as "Starter" | "Premium") || "Premium";
  });

  const [registerPlan, setRegisterPlan] = useState<"Starter" | "Premium">("Premium");

  // Custom profile fields
  const [userBio, setUserBio] = useState<string>(() => {
    return localStorage.getItem("freelancer_user_bio") || "Spesialis Full-stack Developer & UI/UX enthusiast dengan kecintaan pada desain minimalis.";
  });

  const [userDescription, setUserDescription] = useState<string>(() => {
    return localStorage.getItem("freelancer_user_description") || "Saya membantu startup dan korporasi merancang sistem web modern berskala global.";
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem("freelancer_user_avatar") || "cyberpunk";
  });

  // Registered members (Admin feature)
  const [users, setUsers] = useState<MemberUser[]>(() => {
    const saved = localStorage.getItem("freelancer_users_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  // Active view tab inside dashboard ('workspace' or 'chat' or 'social' or 'admin' or 'google')
  const [activeDashboardTab, setActiveDashboardTab] = useState<"workspace" | "chat" | "social" | "admin" | "google">("workspace");

  // Simple Social Media & Private Messaging states
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem("freelancer_social_posts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SOCIAL_POSTS;
      }
    }
    return INITIAL_SOCIAL_POSTS;
  });

  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(() => {
    const saved = localStorage.getItem("freelancer_private_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRIVATE_MESSAGES;
      }
    }
    return INITIAL_PRIVATE_MESSAGES;
  });

  // Save social states on change
  useEffect(() => {
    localStorage.setItem("freelancer_social_posts", JSON.stringify(socialPosts));
  }, [socialPosts]);

  useEffect(() => {
    localStorage.setItem("freelancer_private_messages", JSON.stringify(privateMessages));
  }, [privateMessages]);

  const [socialSubTab, setSocialSubTab] = useState<"feed" | "messages" | "my-profile" | "user-profile">("feed");
  const [selectedProfileEmail, setSelectedProfileEmail] = useState<string | null>(null);
  
  // Dynamic Profile Tabs state
  const [openProfileTabs, setOpenProfileTabs] = useState<string[]>(() => {
    const saved = localStorage.getItem("freelancer_open_profile_tabs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("freelancer_open_profile_tabs", JSON.stringify(openProfileTabs));
  }, [openProfileTabs]);

  const handleOpenProfileTab = (email: string) => {
    if (!openProfileTabs.includes(email)) {
      setOpenProfileTabs(prev => [...prev, email]);
    }
    setActiveDashboardTab(`profile-${email}`);
  };

  const handleCloseProfileTab = (email: string) => {
    setOpenProfileTabs(prev => {
      const updated = prev.filter(e => e !== email);
      if (activeDashboardTab === `profile-${email}`) {
        setActiveDashboardTab("social");
      }
      return updated;
    });
  };

  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalBudget, setProposalBudget] = useState("");
  const [proposalDetails, setProposalDetails] = useState("");
  const [proposalDeliveryTime, setProposalDeliveryTime] = useState("3");
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Post Attachments states
  const [pendingPostAttachments, setPendingPostAttachments] = useState<any[]>([]);
  const [attachmentLinkModalOpen, setAttachmentLinkModalOpen] = useState(false);
  const [attachmentLinkUrl, setAttachmentLinkUrl] = useState("");
  const [attachmentLinkName, setAttachmentLinkName] = useState("");
  const [attachmentVideoModalOpen, setAttachmentVideoModalOpen] = useState(false);
  const [attachmentVideoUrl, setAttachmentVideoUrl] = useState("");
  
  // Messaging inputs
  const [activeMessageUserEmail, setActiveMessageUserEmail] = useState<string>("");
  const [newPrivateMsgContent, setNewPrivateMsgContent] = useState("");

  // Google G-Suite OAuth and Workspace integration states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [googleFiles, setGoogleFiles] = useState<GoogleDriveFile[]>([]);
  const [gdriveSearch, setGdriveSearch] = useState<string>("");
  const [gdriveFolderName, setGdriveFolderName] = useState<string>("");
  const [driveUploadFile, setDriveUploadFile] = useState<File | null>(null);
  
  // Google Sheets read & write states
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>("");
  const [selectedSheetRange, setSelectedSheetRange] = useState<string>("Sheet1!A1:D20");
  const [sheetValuesData, setSheetValuesData] = useState<string[][]>([]);
  const [gsuiteNotification, setGsuiteNotification] = useState<string>("");
  const [gsuiteError, setGsuiteError] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastCreatedFileLink, setLastCreatedFileLink] = useState<string>("");
  const [lastCreatedFileName, setLastCreatedFileName] = useState<string>("");

  // Chat interactive message history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("freelancer_chats_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CHATS;
      }
    }
    return INITIAL_CHATS;
  });

  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Search keyword for members in Admin panel
  const [memberSearch, setMemberSearch] = useState("");

  // Edit Bio/Description/Avatar state indicators
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempAvatar, setTempAvatar] = useState("");
  const [tempName, setTempName] = useState("");

  // Task & estimator states
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("freelancer_tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: "1", title: "Merancang wireframe UI utama", completed: false, category: "Desain" },
      { id: "2", title: "Menghubungkan integrasi API klien", completed: true, category: "Development" },
      { id: "3", title: "Menyusun laporan keuangan kuartalan", completed: false, category: "Finansial" }
    ];
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Development");
  const [activeTab, setActiveTab] = useState<string>("Semua");
  
  // Rate Estimator State
  const [hourlyRate, setHourlyRate] = useState<number>(() => {
    const saved = localStorage.getItem("freelancer_rate");
    return saved ? Number(saved) : 50;
  });
  const [projectHours, setProjectHours] = useState<number>(() => {
    const saved = localStorage.getItem("freelancer_hours");
    return saved ? Number(saved) : 25;
  });

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem("freelancer_files");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { 
        id: "f1", 
        name: "Project_Proposal_v2.pdf", 
        size: "1.2 MB", 
        type: "application/pdf", 
        uploadedAt: "14 Jul 2026, 09:12",
        ownerEmail: "adek.burong@gmail.com",
        ownerName: "Adek Burong",
        visibility: "private"
      },
      { 
        id: "f2", 
        name: "Logo_Draft_Transparent.png", 
        size: "450 KB", 
        type: "image/png", 
        uploadedAt: "14 Jul 2026, 09:35",
        ownerEmail: "budi.klien@gmail.com",
        ownerName: "Budi (Klien)",
        visibility: "public",
        dataUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
      }
    ];
  });

  // Preview and file filter states
  const [previewImageFile, setPreviewImageFile] = useState<UploadedFile | null>(null);
  const [fileFilterTab, setFileFilterTab] = useState<"semua" | "saya" | "publik">("semua");
  const [fileSearchQuery, setFileSearchQuery] = useState("");

  // UI state managers
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form input login/register states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    localStorage.setItem("freelancer_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("freelancer_rate", hourlyRate.toString());
  }, [hourlyRate]);

  useEffect(() => {
    localStorage.setItem("freelancer_hours", projectHours.toString());
  }, [projectHours]);

  useEffect(() => {
    localStorage.setItem("freelancer_files", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  useEffect(() => {
    localStorage.setItem("freelancer_plan", membershipPlan);
  }, [membershipPlan]);

  useEffect(() => {
    localStorage.setItem("freelancer_user_bio", userBio);
  }, [userBio]);

  useEffect(() => {
    localStorage.setItem("freelancer_user_description", userDescription);
  }, [userDescription]);

  useEffect(() => {
    localStorage.setItem("freelancer_user_avatar", userAvatar);
  }, [userAvatar]);

  useEffect(() => {
    localStorage.setItem("freelancer_users_list", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("freelancer_chats_list", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Initialize Google / Firebase Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setFirebaseUser(user);
        setGoogleAccessToken(token);
        // Automatically fetch files if token is available
        fetchDriveFiles(token);
      },
      () => {
        setFirebaseUser(null);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper to fetch Google Drive files list
  const fetchDriveFiles = async (token: string, search = "") => {
    setIsGoogleLoading(true);
    setGsuiteError("");
    try {
      const files = await listDriveFiles(token, search);
      setGoogleFiles(files);
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal mengambil berkas Google Drive.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Trigger Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      const res = await googleSignIn();
      if (res) {
        setFirebaseUser(res.user);
        setGoogleAccessToken(res.accessToken);
        setGsuiteNotification("Berhasil masuk dan terhubung dengan Google G-Suite!");
        fetchDriveFiles(res.accessToken);

        // Auto sign in user to the app
        const finalEmail = res.user.email?.toLowerCase() || "";
        let finalName = res.user.displayName || "Google User";
        let planToUse: "Starter" | "Premium" = "Premium";
        let bioToUse = "Spesialis Full-stack Developer & UI/UX enthusiast dengan kecintaan pada desain minimalis.";
        let descToUse = "Saya membantu startup dan korporasi merancang sistem web modern berskala global.";
        let avatarToUse = "cyberpunk";
        let roleToUse: "user" | "admin" = finalEmail === "admin@freelancer.com" ? "admin" : "user";

        // Check if user already exists in local list
        const existingUser = users.find(u => u.email === finalEmail);
        if (existingUser) {
          finalName = existingUser.name;
          planToUse = existingUser.plan;
          bioToUse = existingUser.bio;
          descToUse = existingUser.description;
          avatarToUse = existingUser.avatar;
          roleToUse = existingUser.role;
        } else {
          // Add new user from Google details
          const newUser: MemberUser = {
            id: Date.now().toString(),
            name: finalName,
            email: finalEmail,
            plan: planToUse,
            role: roleToUse,
            bio: bioToUse,
            description: descToUse,
            avatar: avatarToUse,
            registeredAt: new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          };
          setUsers(prev => [...prev, newUser]);
        }

        setIsLoggedIn(true);
        setUserName(finalName);
        setUserEmail(finalEmail);
        setMembershipPlan(planToUse);
        setUserBio(bioToUse);
        setUserDescription(descToUse);
        setUserAvatar(avatarToUse);

        localStorage.setItem("freelancer_logged_in", "true");
        localStorage.setItem("freelancer_user_email", finalEmail);
        localStorage.setItem("freelancer_user_name", finalName);
        localStorage.setItem("freelancer_plan", planToUse);
        localStorage.setItem("freelancer_user_bio", bioToUse);
        localStorage.setItem("freelancer_user_description", descToUse);
        localStorage.setItem("freelancer_user_avatar", avatarToUse);

        if (roleToUse === "admin") {
          setActiveDashboardTab("admin");
        } else {
          setActiveDashboardTab("workspace");
        }

        setActiveModal(null);
      }
    } catch (err: any) {
      console.error("Google Auth Error Detail:", err);
      let friendlyError = err.message || "Gagal masuk ke Google.";
      const errStr = (err.code || "") + " " + (err.message || "") + " " + err.toString();
      if (errStr.toLowerCase().includes("unauthorized-domain") || errStr.toLowerCase().includes("auth/unauthorized-domain")) {
        friendlyError = `Domain '${window.location.hostname}' belum terdaftar di Authorized Domains di Firebase Console. Silakan buka Firebase Console -> Authentication -> Settings -> Authorized Domains, lalu tambahkan '${window.location.hostname}' agar Google Sign-In dapat berfungsi di domain ini.`;
      } else if (errStr.toLowerCase().includes("popup-closed-by-user") || errStr.toLowerCase().includes("auth/popup-closed-by-user")) {
        friendlyError = "Proses masuk dibatalkan karena jendela popup Google ditutup sebelum selesai.";
      } else if (errStr.toLowerCase().includes("popup-blocked") || errStr.toLowerCase().includes("auth/popup-blocked")) {
        friendlyError = "Jendela popup diblokir oleh browser Anda. Silakan izinkan popup untuk situs ini lalu coba lagi.";
      }
      setGsuiteError(friendlyError);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Google Sign-Out
  const handleGoogleSignOut = async () => {
    setIsGoogleLoading(true);
    try {
      await logout();
      setFirebaseUser(null);
      setGoogleAccessToken(null);
      setGoogleFiles([]);
      setSheetValuesData([]);
      setGsuiteNotification("Berhasil keluar dari akun Google.");
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal keluar.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Create folder in Drive
  const handleCreateFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (!googleAccessToken || !gdriveFolderName.trim()) return;
    setIsGoogleLoading(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      const newFolder = await createDriveFolder(googleAccessToken, gdriveFolderName.trim());
      setGsuiteNotification(`Folder "${newFolder.name}" berhasil dibuat di Google Drive!`);
      setGdriveFolderName("");
      fetchDriveFiles(googleAccessToken);
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal membuat folder.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Delete Drive File (Requires User Confirmation as per Guidelines)
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!googleAccessToken) return;
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus berkas "${fileName}" dari Google Drive Anda? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!isConfirmed) return;

    setIsGoogleLoading(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      await deleteDriveFile(googleAccessToken, fileId);
      setGsuiteNotification(`Berkas "${fileName}" telah berhasil dihapus dari Google Drive.`);
      fetchDriveFiles(googleAccessToken);
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal menghapus berkas.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Upload file to Drive
  const handleUploadToDrive = async (fileToUpload: File) => {
    if (!googleAccessToken) return;
    setIsGoogleLoading(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      const uploaded = await uploadFileToDrive(
        googleAccessToken,
        fileToUpload.name,
        fileToUpload,
        fileToUpload.type
      );
      if (uploaded.webViewLink) {
        setLastCreatedFileLink(uploaded.webViewLink);
        setLastCreatedFileName(uploaded.name);
      }
      setGsuiteNotification(`Berkas "${uploaded.name}" berhasil diunggah langsung ke Google Drive!`);
      setDriveUploadFile(null);
      fetchDriveFiles(googleAccessToken);
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal mengunggah berkas ke Google Drive.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Export Tasks to Google Sheets
  const handleExportTasks = async () => {
    if (!googleAccessToken) return;
    setIsExporting(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      // 1. Create a brand new spreadsheet
      const title = `Daftar Tugas Freelance - ${new Date().toLocaleDateString("id-ID")}`;
      const sheet = await createSpreadsheet(googleAccessToken, title);
      const spreadsheetId = sheet.spreadsheetId;

      // 2. Prepare structured data rows
      const rows = [
        ["ID Tugas", "Nama Tugas / Rencana Kerja", "Kategori", "Status"],
        ...tasks.map(t => [
          t.id,
          t.title,
          t.category,
          t.completed ? "Selesai ✅" : "Belum Selesai ⏳"
        ])
      ];

      // 3. Write values to range
      await updateSpreadsheetValues(googleAccessToken, spreadsheetId, "Sheet1!A1:D100", rows);

      const link = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      setLastCreatedFileLink(link);
      setLastCreatedFileName(title);

      setGsuiteNotification(`Berhasil mengekspor ${tasks.length} tugas ke spreadsheet baru: "${title}"!`);
      setSelectedSpreadsheetId(spreadsheetId);
      setSelectedSheetRange("Sheet1!A1:D20");
      // Automatically load the exported values
      setSheetValuesData(rows);
      fetchDriveFiles(googleAccessToken);
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal mengekspor tugas ke Google Sheets.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export Project Rates Estimation to Google Sheets
  const handleExportEstimate = async () => {
    if (!googleAccessToken) return;
    setIsExporting(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      const title = `Kalkulator & Estimasi Proyek - ${new Date().toLocaleDateString("id-ID")}`;
      const sheet = await createSpreadsheet(googleAccessToken, title);
      const spreadsheetId = sheet.spreadsheetId;

      const totalValue = hourlyRate * projectHours;
      const rows = [
        ["Parameter Estimasi Keuangan Freelance", "Nilai"],
        ["Nama Freelancer", userName],
        ["Email Freelancer", userEmail],
        ["Tarif Per Jam (Hourly Rate)", `IDR ${hourlyRate.toLocaleString("id-ID")}`],
        ["Estimasi Durasi Kerja (Hours)", `${projectHours} Jam`],
        ["Total Estimasi Pendapatan", `IDR ${totalValue.toLocaleString("id-ID")}`],
        ["Tanggal Pembuatan Laporan", new Date().toLocaleString("id-ID")]
      ];

      await updateSpreadsheetValues(googleAccessToken, spreadsheetId, "Sheet1!A1:B10", rows);

      const link = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      setLastCreatedFileLink(link);
      setLastCreatedFileName(title);

      setGsuiteNotification(`Berhasil mengekspor estimasi finansial ke spreadsheet baru: "${title}"!`);
      setSelectedSpreadsheetId(spreadsheetId);
      setSelectedSheetRange("Sheet1!A1:B10");
      setSheetValuesData(rows);
      fetchDriveFiles(googleAccessToken);
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal mengekspor estimasi finansial ke Google Sheets.");
    } finally {
      setIsExporting(false);
    }
  };

  // Read data from custom Spreadsheet Id
  const handleReadSheet = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!googleAccessToken || !selectedSpreadsheetId.trim()) return;
    setIsGoogleLoading(true);
    setGsuiteError("");
    setGsuiteNotification("");
    try {
      const data = await getSpreadsheetValues(
        googleAccessToken,
        selectedSpreadsheetId.trim(),
        selectedSheetRange
      );
      setSheetValuesData(data);
      if (data.length === 0) {
        setGsuiteNotification("Spreadsheet terbaca tetapi tidak berisi baris data apa pun.");
      } else {
        setGsuiteNotification(`Berhasil memuat ${data.length} baris data spreadsheet!`);
      }
    } catch (err: any) {
      setGsuiteError(err.message || "Gagal membaca spreadsheet. Pastikan ID dan Range benar.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      category: newTaskCategory
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setActiveTab("Semua");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const finalEmail = loginEmail.trim().toLowerCase() || "adek.burong@gmail.com";
    let finalName = loginName.trim() || "Adek Burong";
    let planToUse: "Starter" | "Premium" = "Premium";
    let bioToUse = "Spesialis Full-stack Developer & UI/UX enthusiast dengan kecintaan pada desain minimalis.";
    let descToUse = "Saya membantu startup dan korporasi merancang sistem web modern berskala global.";
    let avatarToUse = "cyberpunk";
    let roleToUse: "user" | "admin" = finalEmail === "admin@freelancer.com" ? "admin" : "user";

    // Try finding the user first
    const existingUser = users.find(u => u.email === finalEmail);
    if (existingUser) {
      finalName = existingUser.name;
      planToUse = existingUser.plan;
      bioToUse = existingUser.bio;
      descToUse = existingUser.description;
      avatarToUse = existingUser.avatar;
      roleToUse = existingUser.role;
    } else {
      // If register or not found, register new
      if (activeModal === "register") {
        planToUse = registerPlan;
      } else {
        planToUse = "Starter";
      }
      
      const newUser: MemberUser = {
        id: Date.now().toString(),
        name: finalName,
        email: finalEmail,
        plan: planToUse,
        role: roleToUse,
        bio: bioToUse,
        description: descToUse,
        avatar: avatarToUse,
        registeredAt: new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      setUsers(prev => [...prev, newUser]);
    }

    setIsLoggedIn(true);
    setUserName(finalName);
    setUserEmail(finalEmail);
    setMembershipPlan(planToUse);
    setUserBio(bioToUse);
    setUserDescription(descToUse);
    setUserAvatar(avatarToUse);
    
    localStorage.setItem("freelancer_logged_in", "true");
    localStorage.setItem("freelancer_user_email", finalEmail);
    localStorage.setItem("freelancer_user_name", finalName);
    localStorage.setItem("freelancer_plan", planToUse);
    localStorage.setItem("freelancer_user_bio", bioToUse);
    localStorage.setItem("freelancer_user_description", descToUse);
    localStorage.setItem("freelancer_user_avatar", avatarToUse);

    // If admin logged in, auto switch to admin view tab
    if (roleToUse === "admin") {
      setActiveDashboardTab("admin");
    } else {
      setActiveDashboardTab("workspace");
    }

    setActiveModal(null);
    setLoginEmail("");
    setLoginName("");
    setLoginPassword("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("freelancer_logged_in", "false");
    setActiveDashboardTab("workspace");
  };

  const startEditingProfile = () => {
    setTempName(userName);
    setTempBio(userBio);
    setTempDescription(userDescription);
    setTempAvatar(userAvatar);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const updatedName = tempName.trim() || userName;
    const updatedBio = tempBio.trim() || userBio;
    const updatedDesc = tempDescription.trim() || userDescription;
    const updatedAvatar = tempAvatar || userAvatar;

    setUserName(updatedName);
    setUserBio(updatedBio);
    setUserDescription(updatedDesc);
    setUserAvatar(updatedAvatar);

    // Update in users array
    setUsers(prev => prev.map(u => u.email === userEmail ? {
      ...u,
      name: updatedName,
      bio: updatedBio,
      description: updatedDesc,
      avatar: updatedAvatar
    } : u));

    // Update in social posts and comments
    setSocialPosts(prev => prev.map(post => {
      let postUpdated = false;
      let newPost = { ...post };
      if (post.authorEmail === userEmail) {
        newPost.authorName = updatedName;
        newPost.authorAvatar = updatedAvatar;
        postUpdated = true;
      }
      const commentsUpdated = post.comments?.some(c => c.authorEmail === userEmail);
      if (commentsUpdated) {
        newPost.comments = post.comments.map(c => c.authorEmail === userEmail ? {
          ...c,
          authorName: updatedName,
          authorAvatar: updatedAvatar
        } : c);
        postUpdated = true;
      }
      return postUpdated ? newPost : post;
    }));

    // Update in private messages
    setPrivateMessages(prev => prev.map(msg => {
      let updated = false;
      let newMsg = { ...msg };
      if (msg.senderEmail === userEmail) {
        newMsg.senderName = updatedName;
        newMsg.senderAvatar = updatedAvatar;
        updated = true;
      }
      if (msg.receiverEmail === userEmail) {
        newMsg.receiverName = updatedName;
        newMsg.receiverAvatar = updatedAvatar;
        updated = true;
      }
      return updated ? newMsg : msg;
    }));

    localStorage.setItem("freelancer_user_name", updatedName);
    localStorage.setItem("freelancer_user_bio", updatedBio);
    localStorage.setItem("freelancer_user_description", updatedDesc);
    localStorage.setItem("freelancer_user_avatar", updatedAvatar);

    setIsEditingProfile(false);
    setActiveModal(null);
    setUploadSuccessMsg("Profil Anda berhasil diperbarui!");
    setTimeout(() => setUploadSuccessMsg(""), 4000);
  };

  const handleFileAttachmentChange = (e: ChangeEvent<HTMLInputElement>, type: "image" | "video" | "file") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        
        let sizeStr = "0 KB";
        if (file.size > 1024 * 1024) {
          sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        } else if (file.size > 1024) {
          sizeStr = (file.size / 1024).toFixed(0) + " KB";
        } else {
          sizeStr = file.size + " Bytes";
        }
        
        const newAttachment = {
          id: "att_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          type,
          url: dataUrl,
          name: file.name,
          size: sizeStr
        };
        
        setPendingPostAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = "";
  };

  const handleAddLinkAttachment = (e: FormEvent) => {
    e.preventDefault();
    if (!attachmentLinkUrl.trim()) return;
    
    let formattedUrl = attachmentLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    const newAttachment = {
      id: "att_" + Date.now(),
      type: "link" as const,
      url: formattedUrl,
      name: attachmentLinkName.trim() || formattedUrl.replace(/^https?:\/\/(www\.)?/, "")
    };
    
    setPendingPostAttachments(prev => [...prev, newAttachment]);
    setAttachmentLinkUrl("");
    setAttachmentLinkName("");
    setAttachmentLinkModalOpen(false);
  };

  const handleAddVideoUrlAttachment = (e: FormEvent) => {
    e.preventDefault();
    if (!attachmentVideoUrl.trim()) return;
    
    let formattedUrl = attachmentVideoUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    const newAttachment = {
      id: "att_" + Date.now(),
      type: "video" as const,
      url: formattedUrl,
      name: "Video Tautan Komunitas"
    };
    
    setPendingPostAttachments(prev => [...prev, newAttachment]);
    setAttachmentVideoUrl("");
    setAttachmentVideoModalOpen(false);
  };

  const handleRemovePendingAttachment = (id: string) => {
    setPendingPostAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && pendingPostAttachments.length === 0) return;

    const newPost: SocialPost = {
      id: "post_" + Date.now(),
      authorEmail: userEmail,
      authorName: userName,
      authorAvatar: userAvatar,
      content: newPostContent.trim(),
      createdAt: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      likes: [],
      comments: [],
      attachments: pendingPostAttachments.length > 0 ? pendingPostAttachments : undefined
    };

    setSocialPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    setPendingPostAttachments([]);
    setUploadSuccessMsg("Berhasil membagikan postingan baru ke feed!");
    setTimeout(() => setUploadSuccessMsg(""), 3000);
  };

  const handleLikePost = (postId: string) => {
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const alreadyLiked = post.likes.includes(userEmail);
        const newLikes = alreadyLiked 
          ? post.likes.filter(email => email !== userEmail)
          : [...post.likes, userEmail];
        return { ...post, likes: newLikes };
      }
      return post;
    }));
  };

  const renderPostAttachments = (attachments?: any[]) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="grid grid-cols-1 gap-3 pt-2">
        {attachments.map((att) => {
          if (att.type === "image") {
            return (
              <div key={att.id} className="relative rounded-2xl overflow-hidden border border-slate-100 group/img max-h-[350px] bg-slate-50">
                <img 
                  src={att.url} 
                  alt={att.name || "Gambar Postingan"} 
                  className="w-full h-auto max-h-[350px] object-cover rounded-2xl transition-all duration-300 group-hover/img:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity p-3 flex items-end">
                  <span className="text-[10px] text-white font-bold truncate">{att.name || "Gambar"} ({att.size || "Selesai"})</span>
                </div>
              </div>
            );
          } else if (att.type === "video") {
            const isYoutube = att.url.includes("youtube.com") || att.url.includes("youtu.be");
            if (isYoutube) {
              let embedUrl = att.url;
              if (att.url.includes("v=")) {
                const videoId = att.url.split("v=")[1]?.split("&")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
              } else if (att.url.includes("youtu.be/")) {
                const videoId = att.url.split("youtu.be/")[1]?.split("?")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
              }
              return (
                <div key={att.id} className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 shadow-2xs">
                  <iframe 
                    src={embedUrl} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              );
            }
            return (
              <div key={att.id} className="rounded-2xl overflow-hidden border border-slate-100 shadow-2xs bg-black">
                <video 
                  src={att.url} 
                  controls 
                  className="w-full max-h-[350px] object-contain rounded-2xl"
                />
              </div>
            );
          } else if (att.type === "link") {
            return (
              <a 
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 bg-slate-50/70 hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all group/link"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover/link:bg-indigo-600 group-hover/link:text-white transition-colors shadow-2xs">
                  <Link className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 truncate leading-snug group-hover/link:text-indigo-600 transition-colors">
                    {att.name || att.url}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono font-bold flex items-center gap-1">
                    <span>{att.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}</span>
                    <span>•</span>
                    <span className="text-indigo-500 hover:underline">Kunjungi situs</span>
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover/link:text-indigo-600 shrink-0" />
              </a>
            );
          } else {
            return (
              <div 
                key={att.id}
                className="flex items-center justify-between gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                      {att.name || "Berkas Unduhan"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold font-mono uppercase">
                      {att.size || "Berkas"} • Dokumen
                    </p>
                  </div>
                </div>
                <a
                  href={att.url}
                  download={att.name || "download"}
                  className="h-8.5 px-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[11px] font-black cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh</span>
                </a>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const handleCommentPost = (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const newComment: SocialComment = {
      id: "comment_" + Date.now(),
      authorEmail: userEmail,
      authorName: userName,
      authorAvatar: userAvatar,
      content: commentText,
      createdAt: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus postingan ini?")) return;
    setSocialPosts(prev => prev.filter(post => post.id !== postId));
    setUploadSuccessMsg("Postingan berhasil dihapus.");
    setTimeout(() => setUploadSuccessMsg(""), 3000);
  };

  const handleSendPrivateMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newPrivateMsgContent.trim() || !activeMessageUserEmail) return;

    const targetUser = users.find(u => u.email === activeMessageUserEmail);
    if (!targetUser) return;

    const newMsg: PrivateMessage = {
      id: "pm_" + Date.now(),
      senderEmail: userEmail,
      senderName: userName,
      senderAvatar: userAvatar,
      receiverEmail: activeMessageUserEmail,
      receiverName: targetUser.name,
      receiverAvatar: targetUser.avatar,
      content: newPrivateMsgContent.trim(),
      createdAt: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      read: false
    };

    setPrivateMessages(prev => [...prev, newMsg]);
    setNewPrivateMsgContent("");
  };

  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: "user",
      senderName: userName,
      senderAvatar: userAvatar,
      message: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isIncoming: false
    };

    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.trim().toLowerCase();
    setChatInput("");
    setIsTyping(true);

    // Simulate automatic response based on message content
    setTimeout(() => {
      setIsTyping(false);
      
      // Match keywords
      let matched = SIMULATED_RESPONSES.find(res => 
        !res.default && res.keywords.some(kw => currentInput.includes(kw))
      );

      if (!matched) {
        matched = SIMULATED_RESPONSES.find(res => res.default)!;
      }

      // Pick a random response from matched
      const randomIndex = Math.floor(Math.random() * matched.responses.length);
      const responseText = matched.responses[randomIndex];

      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: matched.senderId,
        senderName: matched.senderName,
        senderAvatar: matched.senderAvatar,
        message: responseText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isIncoming: true
      };

      setChatMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  const deleteMember = (id: string, email: string) => {
    if (email === "admin@freelancer.com") {
      alert("Anda tidak bisa menghapus administrator utama!");
      return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
      if (email === userEmail) {
        handleLogout();
      }
    }
  };

  const toggleMemberPlan = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextPlan = u.plan === "Premium" ? "Starter" : "Premium";
        
        // If this is the active logged in user, sync their active plan!
        if (u.email === userEmail) {
          setMembershipPlan(nextPlan);
        }

        return { ...u, plan: nextPlan };
      }
      return u;
    }));
  };

  const resetAll = () => {
    if (window.confirm("Apakah Anda yakin ingin mengatur ulang data lembar kerja?")) {
      setTasks([]);
      setHourlyRate(50);
      setProjectHours(10);
      setUploadedFiles([]);
      setActiveTab("Semua");
    }
  };

  // Handle uploading files via drag or select
  const handleFileUpload = (files: FileList | null) => {
    if (membershipPlan === "Starter") {
      setUploadSuccessMsg("Gagal: Fitur unggah berkas dinonaktifkan pada Starter Plan! Silakan tingkatkan paket Anda.");
      setTimeout(() => setUploadSuccessMsg(""), 5000);
      return;
    }
    if (!files || files.length === 0) return;

    const promises = Array.from(files).map((f, i) => {
      return new Promise<UploadedFile>((resolve) => {
        const sizeStr = f.size > 1024 * 1024 
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(0)} KB`;

        const newUpload: UploadedFile = {
          id: (Date.now() + i).toString(),
          name: f.name,
          size: sizeStr,
          type: f.type || "application/octet-stream",
          uploadedAt: new Date().toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          ownerEmail: userEmail,
          ownerName: userName,
          visibility: "private" // default to private as requested
        };

        if (f.type && f.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newUpload.dataUrl = e.target?.result as string;
            resolve(newUpload);
          };
          reader.onerror = () => {
            resolve(newUpload);
          };
          reader.readAsDataURL(f);
        } else {
          resolve(newUpload);
        }
      });
    });

    Promise.all(promises).then((newFiles) => {
      setUploadedFiles(prev => [...newFiles, ...prev]);
      setUploadSuccessMsg(`Berhasil mengunggah ${newFiles.length} berkas! Status default: Privat 🔒`);
      setTimeout(() => setUploadSuccessMsg(""), 4000);
    });
  };

  // Simulated and real download triggers
  const triggerDownload = (file: UploadedFile) => {
    if (file.dataUrl) {
      // Download actual image/data URL
      const a = document.createElement("a");
      a.href = file.dataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate simulated dynamic download of any workspace file
      const content = `Simulasi unduh untuk file: ${file.name}\nUkuran: ${file.size}\nDiunggah pada: ${file.uploadedAt}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Export actual task list data as downloadable JSON
  const downloadWorkspaceJSON = () => {
    if (membershipPlan === "Starter") {
      setUploadSuccessMsg("Gagal: Unduh data JSON dinonaktifkan pada Starter Plan! Silakan tingkatkan paket Anda.");
      setTimeout(() => setUploadSuccessMsg(""), 5000);
      return;
    }
    const dataObj = {
      user: { name: userName, email: userEmail },
      workspace: {
        tarifPerJam: hourlyRate,
        durasiEstimasiJam: projectHours,
        totalEstimasiPendapatan: hourlyRate * projectHours,
        totalTugas: tasks.length,
        tugasSelesai: tasks.filter(t => t.completed).length,
      },
      tasks: tasks
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Workspace_Freelancer_${userName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const removeFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file && file.ownerEmail && file.ownerEmail !== userEmail) {
      alert("Anda hanya diperbolehkan menghapus file unggahan Anda sendiri!");
      return;
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setUploadSuccessMsg("Berkas berhasil dihapus dari workspace.");
    setTimeout(() => setUploadSuccessMsg(""), 3000);
  };

  const toggleFileVisibility = (id: string) => {
    setUploadedFiles(prev => prev.map(f => {
      if (f.id === id) {
        if (f.ownerEmail && f.ownerEmail !== userEmail) {
          alert("Anda hanya bisa mengubah izin berkas yang Anda unggah sendiri!");
          return f;
        }
        const nextVis = f.visibility === "public" ? "private" : "public";
        setUploadSuccessMsg(`Berkas "${f.name}" sekarang diset sebagai ${nextVis === "public" ? "Publik 🌐" : "Privat 🔒"}`);
        setTimeout(() => setUploadSuccessMsg(""), 4000);
        return { ...f, visibility: nextVis };
      }
      return f;
    }));
  };

  const totalValue = hourlyRate * projectHours;
  const filteredTasks = tasks.filter(t => activeTab === "Semua" || t.category === activeTab);
  const completedCount = filteredTasks.filter(t => t.completed).length;

  // Filter and search uploadedFiles based on ownership, visibility, tabs, and search query
  const filteredFilesList = uploadedFiles.filter(file => {
    const isOwner = file.ownerEmail === userEmail;
    const isSystem = !file.ownerEmail; // default system files visible to all
    const isPublic = file.visibility === "public";
    
    // Safety check: a user can only see their own files, system files, or public files
    if (!isOwner && !isSystem && !isPublic) return false;

    // Filter by selected tab
    if (fileFilterTab === "saya" && !isOwner) return false;
    if (fileFilterTab === "publik" && !isPublic) return false;

    // Filter by search query
    if (fileSearchQuery) {
      const q = fileSearchQuery.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchOwner = file.ownerName?.toLowerCase().includes(q) || false;
      return matchName || matchOwner;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      
      {/* Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 py-3.5 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 6 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("Semua")}
              className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100 cursor-pointer"
            >
              <Briefcase className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-tight flex items-center gap-1.5">
                Freelancer Portal
                {isLoggedIn && (
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all ${
                    membershipPlan === "Premium" 
                      ? "bg-indigo-50 text-indigo-700 border-indigo-100/50" 
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {membershipPlan === "Premium" ? "Pro Workspace" : "Starter Workspace"}
                  </span>
                )}
              </h1>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                {isLoggedIn ? `Halo, ${userName}` : "Enterprise Hub"}
              </span>
            </div>
          </div>
          
          {/* Menu Navigation Buttons */}
          <nav className="flex items-center gap-1.5 md:gap-3">
            {isLoggedIn ? (
              <>
                {/* Logged in Navigation indicators & Log Out */}
                <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Laman Aktif: Dashboard {userName.split(" ")[0]}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#fef2f2" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 border border-rose-200/50 rounded-xl cursor-pointer bg-white transition-all shadow-sm"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </motion.button>
              </>
            ) : (
              <>
                {/* Logged out landing page menus */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("features")}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer hidden sm:inline-block"
                >
                  Fitur Portal
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("pricing")}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer hidden sm:inline-block"
                >
                  Harga & Plan
                </motion.button>

                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("login")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 border border-indigo-200/80 rounded-xl cursor-pointer bg-white transition-all shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Masuk
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("register")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Daftar
                </motion.button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Welcome banner (changes dynamically depending on Login Status) */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-transparent pt-8 pb-4 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          {isLoggedIn ? (
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full text-xs font-semibold border border-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Selamat Datang Kembali di Dashboard Pribadi Anda
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Laman Kerja Akun: <span className="text-indigo-600 underline decoration-indigo-400 decoration-wavy underline-offset-4">{userName}</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                Kelola file proposal, unduh invoice langsung, estimasi penghasilan proyek, dan sesuaikan daftar kerja real-time Anda di bawah ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold border border-amber-100"
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                Mode Pengunjung Statis (Masuk untuk Membuka Dashboard User)
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Kelola Proyek Freelance Lebih Rapi
              </h2>
              <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
                Gunakan tombol <strong>Masuk</strong> atau <strong>Daftar</strong> di navigasi atas untuk mensimulasikan login pengguna dan mengakses Laman Dashboard dengan fitur unggah & unduh file workspace!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Interactive Grid */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Dynamic Success Alert */}
        <AnimatePresence>
          {uploadSuccessMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm overflow-hidden"
            >
              <div className="p-1.5 bg-emerald-500 text-white rounded-lg shrink-0">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-emerald-950">{uploadSuccessMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoggedIn ? (
          /* ====================================================================
             LOGGED-IN DASHBOARD (Laman User + Upload/Download Features)
             ==================================================================== */
          <div className="space-y-8">

            {/* Dashboard Sub-navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 p-2.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDashboardTab("workspace")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === "workspace"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Ruang Kerja Workspace
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDashboardTab("chat")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    activeDashboardTab === "chat"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Klien Chat & Kolaborasi
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    New
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDashboardTab("social")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    activeDashboardTab === "social"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Medsos & Pesan Privat
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    Hub
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDashboardTab("admin")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === "admin"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Halaman Admin Member
                  {users.find(u => u.email === userEmail)?.role === "admin" && (
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      MGR
                    </span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDashboardTab("google")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative shrink-0 ${
                    activeDashboardTab === "google"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Cloud className="h-4 w-4" />
                  Integrasi Google G-Suite
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    Drive & Sheets
                  </span>
                </motion.button>

                {/* Dynamic Profile Tabs */}
                {openProfileTabs.map(email => {
                  const profileUser = users.find(u => u.email === email);
                  if (!profileUser) return null;
                  const avatarPreset = AVATAR_PRESETS.find(p => p.id === profileUser.avatar);
                  const isSelected = activeDashboardTab === `profile-${email}`;
                  
                  return (
                    <motion.div
                      key={email}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100"
                          : "bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100 text-slate-700 hover:text-indigo-600"
                      }`}
                    >
                      <button
                        onClick={() => setActiveDashboardTab(`profile-${email}`)}
                        className="flex items-center gap-2 cursor-pointer outline-none"
                      >
                        <div className={`h-5 w-5 rounded-md ${avatarPreset?.classes || "bg-indigo-600"} flex items-center justify-center text-white text-[9px] font-black uppercase shrink-0`}>
                          {profileUser.name ? profileUser.name.charAt(0) : "U"}
                        </div>
                        <span className="max-w-[120px] truncate">{profileUser.name}</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseProfileTab(email);
                        }}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "hover:bg-indigo-700 text-white/80 hover:text-white"
                            : "hover:bg-slate-200/60 text-slate-400 hover:text-slate-600"
                        }`}
                        title="Tutup Tab"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Status Info */}
              <div className="hidden md:flex items-center gap-3 pr-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-600">Sesi Aktif: {users.length} Member Terdaftar</span>
                </div>
              </div>
            </div>
            
            {activeDashboardTab === "workspace" && (
              <div className="space-y-8">
                
                {/* Laman User Profile Cards & Key Metrics Header Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Profile Card & Avatar */}
              {(() => {
                const avatarObj = AVATAR_PRESETS.find(p => p.id === userAvatar) || AVATAR_PRESETS[0];
                return (
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className={`md:col-span-4 bg-gradient-to-tr ${
                      membershipPlan === "Premium" 
                        ? "from-slate-900 via-slate-800 to-indigo-950" 
                        : "from-slate-800 via-slate-700 to-slate-900"
                    } text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className={`h-14 w-14 ${avatarObj.classes} rounded-2xl border-2 border-white/20 flex items-center justify-center text-white font-extrabold text-xl shadow-md uppercase shrink-0`}>
                            {userName ? userName.charAt(0) : "U"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-base tracking-tight truncate">{userName}</h3>
                            <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                              membershipPlan === "Premium" ? "text-amber-300 bg-amber-500/15 border border-amber-500/20" : "text-slate-300 bg-slate-700/40 border border-slate-600/30"
                            }`}>
                              {membershipPlan === "Premium" ? "Elite Pro Member" : "Starter Member"}
                            </span>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[140px]">{userEmail}</p>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setTempName(userName);
                            setTempBio(userBio);
                            setTempDescription(userDescription);
                            setTempAvatar(userAvatar);
                            setActiveModal("edit-profile");
                          }}
                          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit Profil"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>

                      {/* Bio & Deskripsi display */}
                      <div className="mt-4 space-y-1.5 bg-black/15 p-3 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Bio & Deskripsi</span>
                        <p className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-relaxed">"{userBio}"</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-normal">{userDescription}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Metrik Level</span>
                          {membershipPlan === "Premium" ? (
                            <span className="text-xs font-black text-amber-400 flex items-center gap-1 mt-0.5">
                              <Star className="h-3.5 w-3.5 fill-amber-400" /> Professional Elite
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                              <Star className="h-3.5 w-3.5 text-slate-400" /> Basic User
                            </span>
                          )}
                        </div>
                        
                        {/* Action button to switch plans */}
                        {membershipPlan === "Starter" ? (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setMembershipPlan("Premium");
                              // Update also in user list
                              setUsers(prev => prev.map(u => u.email === userEmail ? { ...u, plan: "Premium" } : u));
                              setUploadSuccessMsg("Selamat! Akun Anda telah ditingkatkan ke Elite Pro!");
                              setTimeout(() => setUploadSuccessMsg(""), 4000);
                            }}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl font-bold text-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3 fill-slate-950" />
                            Upgrade ke Pro
                          </motion.button>
                        ) : (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setMembershipPlan("Starter");
                              // Update also in user list
                              setUsers(prev => prev.map(u => u.email === userEmail ? { ...u, plan: "Starter" } : u));
                              setUploadSuccessMsg("Akun diturunkan ke paket Starter.");
                              setTimeout(() => setUploadSuccessMsg(""), 4000);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-medium text-[9px] cursor-pointer"
                          >
                            Downgrade
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Total Balance Card */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Estimasi Keuangan Aktif</span>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">${totalValue.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Dihitung dari {projectHours} jam pengerjaan estimasi dikalikan tarif ${hourlyRate}/jam.</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Format Laporan</span>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={downloadWorkspaceJSON}
                    className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                      membershipPlan === "Starter"
                        ? "text-slate-400 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                        : "text-indigo-600 hover:text-indigo-800 bg-indigo-50"
                    }`}
                  >
                    {membershipPlan === "Starter" ? (
                      <>
                        <Shield className="h-3 w-3" />
                        Unlock Elite Pro
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        Unduh Data (.json)
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Workspace Task Progress Card */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Progres Agenda Kerja</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900">{tasks.filter(t => t.completed).length}</p>
                    <span className="text-xs font-semibold text-slate-400">dari {tasks.length} agenda selesai</span>
                  </div>
                  
                  {/* Custom progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Status Ruang Kerja</span>
                  <span className="text-indigo-600 font-bold">Optimis & Aktif</span>
                </div>
              </motion.div>

            </div>

            {/* TWO-COLUMN GRID: FILE MANAGER (UPLOAD & DOWNLOAD) & TASK SCHEDULER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT SIDE: FILE MANAGEMENT CENTER (UPLOAD AND DOWNLOAD FEATURES) */}
              <section className="lg:col-span-6 space-y-6">
                
                {/* 1. INTERACTIVE UPLOAD CONTAINER */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <UploadCloud className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">Unggah File Workspace</h3>
                      <p className="text-[10px] text-slate-400">Unggah draf kontrak, desain, atau ringkasan pekerjaan Anda.</p>
                    </div>
                  </div>

                   {/* Drag and Drop Zone with Lock style for Starter plan */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); if (membershipPlan !== "Starter") setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
                    onClick={() => {
                      if (membershipPlan === "Starter") {
                        setUploadSuccessMsg("Gagal: Unggah berkas hanya diizinkan untuk Elite Pro! Silakan tingkatkan paket Anda.");
                        setTimeout(() => setUploadSuccessMsg(""), 5000);
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-250 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden ${
                      membershipPlan === "Starter"
                        ? "border-slate-200 bg-slate-50/40 cursor-not-allowed opacity-85"
                        : dragOver 
                          ? "border-indigo-600 bg-indigo-50/40 text-indigo-700" 
                          : "border-slate-200 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50"
                    }`}
                  >
                    <input 
                      type="file" 
                      multiple
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden" 
                      disabled={membershipPlan === "Starter"}
                    />
                    
                    <div className={`p-3 rounded-full shadow-sm transition-all ${membershipPlan === "Starter" ? "bg-slate-100 text-slate-400" : "bg-white text-indigo-600"}`}>
                      {membershipPlan === "Starter" ? (
                        <Shield className="h-6 w-6" />
                      ) : (
                        <UploadCloud className="h-6 w-6 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="space-y-1 relative z-10">
                      {membershipPlan === "Starter" ? (
                        <>
                          <p className="text-xs font-extrabold text-slate-600">Unggah Berkas Terkunci 🔒</p>
                          <p className="text-[10px] text-slate-400">Tingkatkan akun Anda ke <span className="font-extrabold text-indigo-600">Elite Pro</span> untuk mengunggah proposal & lampiran</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-slate-700">Tarik & lepas file di sini, atau klik untuk memilih</p>
                          <p className="text-[10px] text-slate-400">Mendukung file PDF, PNG, JPG, DOCX, XLSX (Maks. 10 MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC DOWNLOAD CENTER (LIST OF FILES TO DOWNLOAD) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Download className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800">Pusat Berkas Bersama</h3>
                        <p className="text-[10px] text-slate-400">Atur izin privat/publik & lihat pratinjau instan gambar.</p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      {filteredFilesList.length} Berkas
                    </span>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-3 pt-1">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={fileSearchQuery}
                        onChange={(e) => setFileSearchQuery(e.target.value)}
                        placeholder="Cari berkas berdasarkan nama atau pengunggah..."
                        className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-8 py-2 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-600"
                      />
                      {fileSearchQuery && (
                        <button
                          onClick={() => setFileSearchQuery("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-slate-100/70 p-1 rounded-xl text-[10px] font-bold text-slate-600">
                      <button
                        onClick={() => setFileFilterTab("semua")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          fileFilterTab === "semua"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "hover:text-slate-900"
                        }`}
                      >
                        Semua Berkas
                      </button>
                      <button
                        onClick={() => setFileFilterTab("saya")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          fileFilterTab === "saya"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <Lock className="h-2.5 w-2.5" />
                        Milik Saya
                      </button>
                      <button
                        onClick={() => setFileFilterTab("publik")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          fileFilterTab === "publik"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <Globe className="h-2.5 w-2.5" />
                        Publik
                      </button>
                    </div>
                  </div>

                  {/* List of downloadable files */}
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {filteredFilesList.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-1.5">
                        <File className="h-7 w-7 mx-auto stroke-1 text-slate-300" />
                        <p className="text-xs font-semibold">Tidak ada berkas yang ditemukan.</p>
                        <p className="text-[10px] text-slate-400">Coba ubah kata kunci atau tab filter.</p>
                      </div>
                    ) : (
                      filteredFilesList.map((file) => {
                        const isOwner = file.ownerEmail === userEmail;
                        const isImage = file.type.startsWith("image/") || file.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
                        
                        return (
                          <motion.div 
                            key={file.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 transition-all shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-2.5 rounded-lg shrink-0 ${
                                  isImage 
                                    ? "bg-teal-50 text-teal-600" 
                                    : file.type.includes("pdf") 
                                      ? "bg-rose-50 text-rose-600" 
                                      : "bg-indigo-50 text-indigo-600"
                                }`}>
                                  {isImage ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]" title={file.name}>
                                    {file.name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] text-slate-400 font-semibold">{file.size}</span>
                                    <span className="text-[9px] text-slate-300">•</span>
                                    <span className="text-[9px] text-slate-400 font-mono">{file.uploadedAt}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Owner and Permission badging */}
                              <div className="flex flex-col items-end gap-1 text-[9px] font-bold">
                                {isOwner ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                    Milik Anda
                                  </span>
                                ) : file.ownerEmail ? (
                                  <button
                                    onClick={() => handleOpenProfileTab(file.ownerEmail!)}
                                    className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded-md border border-indigo-100/50 hover:border-indigo-200 transition-all truncate max-w-[80px] cursor-pointer text-right outline-none"
                                    title={`Lihat profil ${file.ownerName}`}
                                  >
                                    Oleh: {file.ownerName || "Sistem"}
                                  </button>
                                ) : (
                                  <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100/50 truncate max-w-[80px]">
                                    Oleh: {file.ownerName || "Sistem"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions and Visibility controllers */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/60 mt-1 gap-2">
                              {/* Visibility Controls for current user */}
                              <div className="flex items-center">
                                {isOwner ? (
                                  <button
                                    onClick={() => toggleFileVisibility(file.id)}
                                    className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg transition-all border cursor-pointer ${
                                      file.visibility === "public"
                                        ? "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100/50"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/50"
                                    }`}
                                    title="Klik untuk mengubah akses izin"
                                  >
                                    {file.visibility === "public" ? (
                                      <>
                                        <Globe className="h-3 w-3" />
                                        <span>Publik (Dibagikan)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="h-3 w-3" />
                                        <span>Privat (Pribadi)</span>
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                                    <Globe className="h-2.5 w-2.5 text-slate-400" />
                                    <span>Publik</span>
                                  </span>
                                )}
                              </div>

                              {/* Download & Preview Actions */}
                              <div className="flex items-center gap-1">
                                {isImage && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPreviewImageFile(file)}
                                    className="flex items-center gap-1 text-[9px] font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 rounded-lg transition-all border border-teal-100 cursor-pointer"
                                    title="Lihat Pratinjau Gambar"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>Pratinjau</span>
                                  </motion.button>
                                )}

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => triggerDownload(file)}
                                  className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
                                  title="Unduh File"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </motion.button>

                                {isOwner && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeFile(file.id)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                                    title="Hapus File"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Pre-configured Templates ready to be downloaded */}
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Dokumen Template Instan (Unduhan Sekali Klik)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => triggerDownload({ id: "t1", name: "Template_Invoice_Freelance.xlsx", size: "120 KB", type: "excel", uploadedAt: "" })}
                        className="p-2 border border-slate-200/80 bg-white hover:bg-indigo-50/30 hover:border-indigo-200 rounded-xl text-left text-[11px] font-bold text-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <span>Invoice_Freelance.xlsx</span>
                        <Download className="h-3.5 w-3.5 text-indigo-600 shrink-0 ml-1" />
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => triggerDownload({ id: "t2", name: "Surat_Kontrak_Kerja_Klien.pdf", size: "310 KB", type: "pdf", uploadedAt: "" })}
                        className="p-2 border border-slate-200/80 bg-white hover:bg-indigo-50/30 hover:border-indigo-200 rounded-xl text-left text-[11px] font-bold text-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <span>Kontrak_Kerja_Klien.pdf</span>
                        <Download className="h-3.5 w-3.5 text-indigo-600 shrink-0 ml-1" />
                      </motion.button>
                    </div>
                  </div>
                </div>

              </section>

              {/* RIGHT SIDE: CORE FREELANCE WORKSPACE PANELS */}
              <section className="lg:col-span-6 space-y-6">
                
                {/* Visual Category Grid */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Saring Kategori Berkas & Agenda
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(CATEGORY_IMAGES).map(([name, config]) => {
                      const IconComp = config.icon;
                      const isSelected = activeTab === name;

                      return (
                        <div
                          key={name}
                          onClick={() => setActiveTab(name)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all relative select-none flex items-center gap-3 ${
                            isSelected 
                              ? "bg-indigo-50/40 border-indigo-400 shadow-sm" 
                              : "bg-slate-50/30 hover:bg-slate-50 border-slate-200/60"
                          }`}
                        >
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient} border flex items-center justify-center shrink-0`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold leading-none ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                              {name === "Development" ? "Dev" : name}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-0.5 inline-block">{config.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimate sliders & rates */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Parameter Tarif Proyek</h3>
                    <button onClick={resetAll} className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold transition-all cursor-pointer">Reset</button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Tarif Per Jam (USD)</span>
                        <span className="text-indigo-600 font-bold">${hourlyRate}/jam</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="200" 
                        step="5"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Estimasi Durasi Kerja</span>
                        <span className="text-indigo-600 font-bold">{projectHours} Jam</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="160" 
                        value={projectHours}
                        onChange={(e) => setProjectHours(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Task Agenda with Form */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                      Agenda Aktif ({activeTab})
                    </h2>
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      Selesai {completedCount} / {filteredTasks.length}
                    </span>
                  </div>

                  {/* Add Task Form */}
                  <form onSubmit={addTask} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder={`Tambah agenda baru...`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />

                    <select 
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="text-xs border border-slate-200 rounded-xl px-1.5 py-2 bg-slate-50/50 outline-none text-slate-600 font-bold cursor-pointer"
                    >
                      <option value="Development">Dev</option>
                      <option value="Desain">Desain</option>
                      <option value="Finansial">Finansial</option>
                      <option value="Rapat">Rapat</option>
                    </select>

                    <button 
                      type="submit"
                      className="bg-indigo-600 text-white rounded-xl px-3 py-2 hover:bg-indigo-700 font-bold text-xs"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>

                  {/* Tasks items list */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        Agenda bersih di kategori ini.
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button 
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                                task.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 hover:border-indigo-500 bg-white"
                              }`}
                            >
                              {task.completed && <span>✓</span>}
                            </button>
                            <p className={`font-bold truncate ${task.completed ? "line-through opacity-60 text-slate-400" : "text-slate-800"}`}>
                              {task.title}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </section>

            </div>

          </div>
        )}

        {/* Live Chat & Collaboration Tab */}
        {activeDashboardTab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden min-h-[550px]"
          >
            {/* Chat Sidebar Contacts */}
            <div className="md:col-span-4 border-r border-slate-100 p-5 bg-slate-50/40 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Ruang Kolaborasi Klien</h3>
                  <p className="text-[10px] text-slate-400">Hubungi langsung klien & tim bantuan portal Anda.</p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-white border border-indigo-100 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-xl flex items-center justify-center text-white font-extrabold text-xs">B</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Budi (Klien Desain)</p>
                        <p className="text-[10px] text-indigo-600 font-medium truncate">Aktif koordinasi</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>

                  <div className="p-3 hover:bg-slate-100/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xs">R</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">Rani (Manajer Proyek)</p>
                        <p className="text-[10px] text-slate-400 truncate">Kemarin • Offline</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  </div>

                  <div className="p-3 hover:bg-slate-100/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-xl flex items-center justify-center text-white font-extrabold text-xs">🤖</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">Portal Support Bot</p>
                        <p className="text-[10px] text-slate-400 truncate">Bantuan otomatis 24/7</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Fitur Enkripsi Workspace</span>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">Diskusi dienkripsi secara lokal di penyimpanan web browser Anda.</p>
              </div>
            </div>

            {/* Chat Panel Thread */}
            <div className="md:col-span-8 flex flex-col justify-between h-[550px] bg-slate-50/15">
              
              {/* Chat Panel Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs md:text-sm text-slate-800">Thread Obrolan Terpadu</h4>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Simulasi Live Chat Klien (Kirim pesan untuk memicu balasan)
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat obrolan?")) {
                      setChatMessages(INITIAL_CHATS);
                    }
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  Reset Chat
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px]">
                 {chatMessages.map((msg) => {
                   const avatarPresetObj = AVATAR_PRESETS.find(p => p.id === msg.senderAvatar);
                   const isUser = msg.senderId === "user";
                   const matchingUser = isUser 
                     ? users.find(u => u.email === userEmail) 
                     : users.find(u => u.name === msg.senderName || u.id === msg.senderId);

                   const handleClickProfile = () => {
                     if (matchingUser) {
                       handleOpenProfileTab(matchingUser.email);
                     }
                   };

                   return (
                     <div 
                       key={msg.id}
                       className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                     >
                       {/* Avatar representation */}
                       {matchingUser ? (
                         <button
                           onClick={handleClickProfile}
                           className="h-8 w-8 rounded-lg cursor-pointer hover:scale-105 transition-all outline-none"
                           title={`Lihat profil ${msg.senderName}`}
                         >
                           <div className={`h-full w-full rounded-lg ${avatarPresetObj ? avatarPresetObj.classes : "bg-indigo-600"} text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm uppercase`}>
                             {msg.senderName.charAt(0)}
                           </div>
                         </button>
                       ) : (
                         <div className={`h-8 w-8 rounded-lg ${avatarPresetObj ? avatarPresetObj.classes : "bg-indigo-600"} text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm uppercase`}>
                           {msg.senderName.charAt(0)}
                         </div>
                       )}

                       <div>
                         <div className="flex items-baseline gap-2 mb-0.5">
                           {matchingUser ? (
                             <button
                               onClick={handleClickProfile}
                               className="text-[10px] font-extrabold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer text-left transition-colors outline-none"
                               title={`Lihat profil ${msg.senderName}`}
                             >
                               {msg.senderName}
                             </button>
                           ) : (
                             <span className="text-[10px] font-extrabold text-slate-700">{msg.senderName}</span>
                           )}
                           <span className="text-[8px] font-medium text-slate-400">{msg.timestamp}</span>
                         </div>
                         <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                           isUser 
                             ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100" 
                             : "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm"
                         }`}>
                           {msg.message}
                         </div>
                       </div>
                     </div>
                   );
                 })}

                {/* Typing status indicator */}
                {isTyping && (
                  <div className="flex gap-3 mr-auto max-w-[85%]">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      💬
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-500">Klien sedang mengetik...</span>
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none mt-1 flex items-center gap-1.5 w-16 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input 
                  type="text"
                  placeholder="Tulis pesan Anda ke klien (contoh: 'kapan rapat?', 'sudah selesai', 'tarif')"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-indigo-600 text-white rounded-xl px-4 py-3 hover:bg-indigo-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-100 shrink-0"
                >
                  <span>Kirim</span>
                  <Send className="h-3.5 w-3.5" />
                </motion.button>
              </form>

            </div>
          </motion.div>
        )}

        {/* Admin Membership Panel Tab */}
        {activeDashboardTab === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Admin stat counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Pengguna Terdaftar</span>
                <p className="text-2xl font-black text-slate-800">{users.length} Anggota</p>
                <p className="text-[10px] text-slate-400 font-medium">Semua member lokal terdaftar di browser.</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Elite Pro Plan</span>
                <p className="text-2xl font-black text-indigo-700">{users.filter(u => u.plan === "Premium").length} Anggota</p>
                <p className="text-[10px] text-slate-400 font-medium">Akses penuh fitur ekspor & unggah file.</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Starter Plan (Gratis)</span>
                <p className="text-2xl font-black text-slate-600">{users.filter(u => u.plan === "Starter").length} Anggota</p>
                <p className="text-[10px] text-slate-400 font-medium">Paket dasar dengan fitur workspace terbatas.</p>
              </div>
            </div>

            {/* Members list management table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    Direktori Keanggotaan Portal
                  </h3>
                  <p className="text-[10px] text-slate-400">Upgrade ke Premium atau hapus keanggotaan freelancer secara instan.</p>
                </div>

                {/* Actions and search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="text-xs border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 bg-slate-50/50 focus:bg-white outline-none w-full sm:w-48 focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                    <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const name = prompt("Masukkan nama lengkap member:");
                      if (!name) return;
                      const email = prompt("Masukkan alamat email:");
                      if (!email) return;
                      
                      const newUser: MemberUser = {
                        id: "m_sim_" + Date.now(),
                        name: name,
                        email: email.toLowerCase().trim(),
                        plan: "Starter",
                        role: "user",
                        bio: "Spesialis lepas baru.",
                        description: "Didaftarkan melalui konsol administrator.",
                        avatar: "purple-sunset",
                        registeredAt: new Date().toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      };
                      setUsers(prev => [...prev, newUser]);
                      setUploadSuccessMsg(`Simulasi member ${name} berhasil didaftarkan!`);
                      setTimeout(() => setUploadSuccessMsg(""), 4000);
                    }}
                    className="bg-indigo-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl hover:bg-indigo-700 cursor-pointer transition-all shrink-0 shadow-md shadow-indigo-100 flex items-center gap-1.5"
                  >
                    <span>+ Simulasi Member</span>
                  </motion.button>
                </div>
              </div>

              {/* Desktop view Table / Mobile view Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Nama & Kredensial</th>
                      <th className="py-3 px-4">Paket Status</th>
                      <th className="py-3 px-4">Keterangan Bio</th>
                      <th className="py-3 px-4">Tanggal Daftar</th>
                      <th className="py-3 px-4 text-right">Tindakan Administrator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users
                      .filter(u => 
                        u.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                        u.email.toLowerCase().includes(memberSearch.toLowerCase())
                      )
                      .map((member) => {
                        const presetObj = AVATAR_PRESETS.find(p => p.id === member.avatar) || AVATAR_PRESETS[0];
                        return (
                          <motion.tr 
                            key={member.id}
                            layout
                            className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-600"
                          >
                             <td className="py-3.5 px-4">
                               <button
                                 onClick={() => handleOpenProfileTab(member.email)}
                                 className="flex items-center gap-3 text-left cursor-pointer group outline-none"
                                 title={`Lihat profil ${member.name}`}
                               >
                                 <div className={`h-8 w-8 rounded-lg ${presetObj.classes} text-white font-extrabold text-[10px] flex items-center justify-center uppercase shrink-0 group-hover:scale-105 transition-all shadow-2xs`}>
                                   {member.name.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-slate-800 font-extrabold truncate flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                                     {member.name}
                                     {member.role === "admin" && (
                                       <span className="text-[8px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded">
                                         ADMIN
                                       </span>
                                     )}
                                   </p>
                                   <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">@{member.email.split("@")[0]}</p>
                                 </div>
                               </button>
                             </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                                member.plan === "Premium" 
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-100/50" 
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {member.plan === "Premium" ? "Premium Elite" : "Starter Free"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-[200px] truncate text-[11px] text-slate-400" title={member.bio}>
                              {member.bio}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                              {member.registeredAt}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleMemberPlan(member.id)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                                    member.plan === "Premium"
                                      ? "text-slate-600 bg-slate-100 hover:bg-slate-200"
                                      : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                  }`}
                                >
                                  {member.plan === "Premium" ? "Downgrade" : "Upgrade Member"}
                                </button>

                                <button
                                  onClick={() => deleteMember(member.id, member.email)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Anggota"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Google G-Suite Integration Tab */}
        {activeDashboardTab === "google" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
            id="google-integration-tab"
          >
            {/* Header / Intro Card */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 inline-block">
                    Koneksi G-Suite Aktif
                  </span>
                  <h2 className="text-2xl font-black tracking-tight font-sans">
                    Integrasi Google Workspace (Drive & Sheets)
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hubungkan akun Google Anda untuk mensinkronisasi dokumen penawaran, mengunggah file portofolio secara otomatis ke Google Drive, mengekspor rincian agenda kerja, atau menghasilkan kalkulasi finansial di Google Sheets.
                  </p>
                </div>
                
                {/* Auth Trigger Button */}
                <div>
                  {!googleAccessToken ? (
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all border border-slate-200 cursor-pointer w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-600" />
                      ) : (
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <g transform="matrix(1, 0, 0, 1, 0, 0)">
                            <path d="M21.35,11.1H12v2.7h5.38C16.88,16.3,14.8,17.7,12,17.7c-3.15,0-5.8-2.14-6.75-5c-0.24-0.73-0.38-1.5-0.38-2.3s0.14-1.57,0.38-2.3c0.95-2.86,3.6-5,6.75-5c1.7,0,3.23,0.62,4.43,1.64l3.32-3.32C17.55,1.75,14.97,1,12,1C6.48,1,2,5.48,2,11s4.48,10,10,10c5.76,0,9.75-4.05,9.75-9.9C21.75,11.52,21.5,11.1,21.35,11.1z" fill="#4285F4" />
                          </g>
                        </svg>
                      )}
                      <span>Sambungkan Akun Google</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-100">{firebaseUser?.displayName || "Google User"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{firebaseUser?.email}</p>
                      </div>
                      {firebaseUser?.photoURL ? (
                        <img 
                          src={firebaseUser.photoURL} 
                          alt="Avatar" 
                          className="h-10 w-10 rounded-xl border border-slate-600 shadow-sm" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold border border-slate-600 shadow-sm">
                          {firebaseUser?.displayName?.charAt(0) || "G"}
                        </div>
                      )}
                      <button 
                        onClick={handleGoogleSignOut}
                        title="Keluar dari Akun Google"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/40 rounded-xl transition-all cursor-pointer border border-slate-700"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications / Error Displays */}
            {(gsuiteNotification || gsuiteError) && (
              <div className="space-y-3">
                {gsuiteNotification && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl text-xs font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      <span>{gsuiteNotification}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lastCreatedFileLink && (
                        <a 
                          href={lastCreatedFileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm font-black whitespace-nowrap"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Buka Berkas</span>
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          setGsuiteNotification("");
                          setLastCreatedFileLink("");
                          setLastCreatedFileName("");
                        }} 
                        className="text-emerald-400 hover:text-emerald-700 cursor-pointer p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
                {gsuiteError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl text-xs font-bold"
                  >
                    <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                    <span>{gsuiteError}</span>
                    <button onClick={() => setGsuiteError("")} className="ml-auto text-rose-400 hover:text-rose-700 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {!googleAccessToken ? (
              /* PROMO & HOW-TO CARD WHEN NOT CONNECTED */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl inline-block">
                      <Cloud className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">1. Akses Fleksibel Cloud</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Unggah portofolio penawaran langsung ke Google Drive agar dapat diakses klien kapan pun dari perangkat mana pun.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full self-center">Mendukung unggahan berkas otomatis</span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl inline-block">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">2. Laporan Google Sheets</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ekspor estimasi finansial, target per jam, dan total harga kontrak langsung ke file spreadsheet rapi.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full self-center">Ekspor sekali klik ke gDrive</span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl inline-block">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">3. Sinkron Agenda Kerja</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ekspor status penyelesaian agenda kerja dari Freelancer Portal langsung ke Google Spreadsheet klien Anda.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full self-center">Sinkronisasi real-time & transparan</span>
                </div>
              </div>
            ) : (
              /* CONNECTED WORKSPACE GSUITE VIEWS */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: DRIVE MANAGER */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Create Folder & Upload Files Area */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Folder className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800">Kontrol Google Drive</h3>
                        <p className="text-[10px] text-slate-400">Kelola folder baru atau unggah berkas dari perangkat Anda.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Create Folder Form */}
                      <form onSubmit={handleCreateFolder} className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Buat Folder Baru</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Nama folder (misal: 'Desain Logo')" 
                            value={gdriveFolderName}
                            onChange={(e) => setGdriveFolderName(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700"
                          />
                          <button 
                            type="submit"
                            disabled={isGoogleLoading || !gdriveFolderName.trim()}
                            className="absolute right-1.5 top-1.5 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer disabled:opacity-45"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal">Folder akan ditambahkan langsung ke akar folder Google Drive Anda.</p>
                      </form>

                      {/* File Upload Form */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Unggah Berkas Langsung</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            id="drive-file-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadToDrive(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label 
                            htmlFor="drive-file-input"
                            className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 p-2.5 rounded-xl text-center cursor-pointer transition-all bg-slate-50 hover:bg-white flex items-center justify-center gap-2"
                          >
                            <UploadCloud className="h-4 w-4 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">Pilih Berkas Komputer</span>
                          </label>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal">Unggah dokumen proposal, gambar aset, atau file ZIP ke Google Drive.</p>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive Files List Browser */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Cloud className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800">Daftar Berkas Google Drive</h3>
                          <p className="text-[10px] text-slate-400">Berkas terbaru di Google Drive Anda.</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => fetchDriveFiles(googleAccessToken)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer"
                        disabled={isGoogleLoading}
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                        <span>Segarkan</span>
                      </button>
                    </div>

                    {/* Search Bar for Drive */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Cari file di Google Drive..." 
                        value={gdriveSearch}
                        onChange={(e) => {
                          setGdriveSearch(e.target.value);
                          fetchDriveFiles(googleAccessToken, e.target.value);
                        }}
                        className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-600"
                      />
                    </div>

                    {/* Files Loop */}
                    {isGoogleLoading && googleFiles.length === 0 ? (
                      <div className="text-center py-12 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">Mengakses cloud storage...</p>
                      </div>
                    ) : googleFiles.length === 0 ? (
                      <div className="text-center py-12 space-y-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500 font-bold">Tidak ada berkas yang ditemukan</p>
                        <p className="text-[10px] text-slate-400">Gunakan kolom pencarian atau buat berkas baru di Google Drive.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {googleFiles.map((file) => {
                          const isSheet = file.mimeType === "application/vnd.google-apps.spreadsheet" || file.mimeType.includes("sheet");
                          const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                          
                          return (
                            <div 
                              key={file.id} 
                              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 bg-white hover:bg-indigo-50/10 transition-all gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                  isFolder ? "bg-amber-50 text-amber-600" :
                                  isSheet ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                                }`}>
                                  {isFolder ? <Folder className="h-4 w-4" /> : 
                                   isSheet ? <FileSpreadsheet className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-medium">
                                    {isFolder ? "Folder Penyimpanan" : isSheet ? "Google Spreadsheet" : "Dokumen Berkas"}
                                    {file.createdTime && ` • ${new Date(file.createdTime).toLocaleDateString("id-ID")}`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isSheet && (
                                  <button
                                    onClick={() => {
                                      setSelectedSpreadsheetId(file.id);
                                      setGsuiteNotification(`ID spreadsheet "${file.name}" terpilih! Klik "Baca Spreadsheet" untuk melihat isinya.`);
                                      // Scroll smoothly to Sheet reader
                                      document.getElementById("google-sheet-toolkit")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    title="Pilih untuk dibaca di spreadsheet reader"
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-100"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                
                                {file.webViewLink && (
                                  <a 
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Buka di Tab Baru"
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-100"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}

                                <button
                                  onClick={() => handleDeleteFile(file.id, file.name)}
                                  title="Hapus file"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: SHEETS TOOLKIT */}
                <div id="google-sheet-toolkit" className="lg:col-span-5 space-y-8">
                  
                  {/* Google Sheets Actions */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileSpreadsheet className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800">Alat Google Sheets</h3>
                        <p className="text-[10px] text-slate-400">Ekspor rincian dashboard finansial & tugas Anda.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Export button 1 */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700">Ekspor Agenda Tugas</p>
                          <p className="text-[10px] text-slate-400">Tulis semua agenda tasks aktif saat ini ke spreadsheet.</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleExportTasks}
                          disabled={isExporting || tasks.length === 0}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isExporting ? "Mengekspor..." : "Ekspor Tugas"}
                        </motion.button>
                      </div>

                      {/* Export button 2 */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700">Ekspor Estimasi Finansial</p>
                          <p className="text-[10px] text-slate-400">Kalkulasi total tarif per jam & jam kerja proyek Anda.</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleExportEstimate}
                          disabled={isExporting}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isExporting ? "Mengekspor..." : "Ekspor Estimasi"}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Spreadsheet Interactive Reader */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Eye className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800">Pembaca Google Spreadsheet</h3>
                        <p className="text-[10px] text-slate-400">Render sel & baris data sheet terpilih secara langsung.</p>
                      </div>
                    </div>

                    <form onSubmit={handleReadSheet} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">ID Google Spreadsheet</label>
                        <input 
                          type="text" 
                          placeholder="Masukkan ID Google Spreadsheet" 
                          value={selectedSpreadsheetId}
                          onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Range Sel (A1 Notation)</label>
                        <input 
                          type="text" 
                          placeholder="misal: 'Sheet1!A1:D20'" 
                          value={selectedSheetRange}
                          onChange={(e) => setSelectedSheetRange(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-600"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isGoogleLoading || !selectedSpreadsheetId.trim()}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        <span>Baca Spreadsheet</span>
                      </motion.button>
                    </form>

                    {/* Table Preview Cells */}
                    {sheetValuesData.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hasil Preview Sel</h4>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[220px] overflow-auto">
                          <table className="w-full text-[11px] text-left border-collapse bg-slate-50/50">
                            <thead>
                              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-extrabold">
                                {sheetValuesData[0].map((cell, idx) => (
                                  <th key={idx} className="p-2 text-center truncate">{cell}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sheetValuesData.slice(1).map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-100 hover:bg-white/50 text-slate-600 font-medium">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2 truncate">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Social Hub Tab */}
        {activeDashboardTab === "social" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="social-hub-tab"
          >
            {/* Social Header Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60 inline-block">
                    Portal Hub Sosial & Kolaborasi
                  </span>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">Portal Medsos & Pesan Privat</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Bagikan cerita kerja Anda, berikan apresiasi suka (like), berdiskusi di kolom komentar, dan kirim pesan pribadi terenkripsi langsung ke rekan freelancer lainnya di seluruh Indonesia.
                  </p>
                </div>

                {/* Sub Tab Buttons */}
                <div className="flex bg-black/25 p-1 rounded-2xl border border-white/5 shrink-0 flex-wrap gap-1">
                  <button
                    onClick={() => {
                      setSocialSubTab("feed");
                      setSelectedProfileEmail(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      socialSubTab === "feed"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Feed Komunitas
                  </button>
                  <button
                    onClick={() => {
                      setSocialSubTab("messages");
                      setSelectedProfileEmail(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      socialSubTab === "messages"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Pesan Privat
                    {privateMessages.filter(m => m.receiverEmail === userEmail && !m.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 w-2 h-2 rounded-full animate-bounce" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSocialSubTab("my-profile");
                      setSelectedProfileEmail(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      socialSubTab === "my-profile"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Profil Saya
                  </button>
                  {socialSubTab === "user-profile" && selectedProfileEmail && (
                    <button
                      onClick={() => setSocialSubTab("user-profile")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-indigo-600 text-white shadow-md"
                    >
                      <User className="h-3.5 w-3.5" />
                      Profil @{selectedProfileEmail.split("@")[0]}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sub Tab Contents */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Main Interactive Interface */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. COMMUNITY FEED TAB */}
                {socialSubTab === "feed" && (
                  <div className="space-y-6">
                    {/* Create New Post Form */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 shrink-0 rounded-xl ${
                          AVATAR_PRESETS.find(p => p.id === userAvatar)?.classes || "bg-indigo-600"
                        } flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-sm`}>
                          {userName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">{userName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Membagikan postingan sebagai @{userEmail.split("@")[0]}</p>
                        </div>
                      </div>

                      <form onSubmit={handleCreatePost} className="space-y-4">
                        <textarea
                          placeholder="Apa tantangan atau pencapaian freelance Anda hari ini? Ceritakan ke rekan-rekan..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          maxLength={500}
                          rows={3}
                          className="w-full text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50/80 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700 leading-relaxed resize-none"
                        />

                        {/* Inline Form for Adding a Tautan (Link) */}
                        <AnimatePresence>
                          {attachmentLinkModalOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-blue-100/50 pb-1.5">
                                <span className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-1.5">
                                  <Link className="h-3.5 w-3.5" />
                                  <span>Sisipkan Tautan Web</span>
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setAttachmentLinkModalOpen(false)} 
                                  className="text-blue-400 hover:text-blue-600 p-0.5 rounded cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <input
                                  type="text"
                                  placeholder="Nama Tautan (misal: Portfolio Website)"
                                  value={attachmentLinkName}
                                  onChange={(e) => setAttachmentLinkName(e.target.value)}
                                  className="bg-white border border-blue-200/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-700"
                                />
                                <input
                                  type="text"
                                  placeholder="URL Tautan (misal: https://example.com)"
                                  value={attachmentLinkUrl}
                                  onChange={(e) => setAttachmentLinkUrl(e.target.value)}
                                  className="bg-white border border-blue-200/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-700"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAttachmentLinkModalOpen(false)}
                                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer transition-colors"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddLinkAttachment}
                                  disabled={!attachmentLinkUrl.trim()}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  Tambahkan Tautan
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Inline Form for Adding a Video URL */}
                        <AnimatePresence>
                          {attachmentVideoModalOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden bg-violet-50/50 border border-violet-100 rounded-2xl p-3.5 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-violet-100/50 pb-1.5">
                                <span className="text-[10px] font-black uppercase text-violet-700 flex items-center gap-1.5">
                                  <Video className="h-3.5 w-3.5" />
                                  <span>Sisipkan Video (Tautan / File Lokal)</span>
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setAttachmentVideoModalOpen(false)} 
                                  className="text-violet-400 hover:text-violet-600 p-0.5 rounded cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                  {/* File Upload Option */}
                                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-violet-200 bg-white hover:bg-violet-50/20 rounded-xl cursor-pointer text-center group transition-colors">
                                    <Video className="h-5 w-5 text-violet-400 group-hover:text-violet-600 mb-1" />
                                    <span className="text-[10px] font-black text-slate-700">Unggah File Video Lokal</span>
                                    <span className="text-[8px] text-slate-400 font-bold mt-0.5">MP4, WebM, dll.</span>
                                    <input 
                                      type="file" 
                                      accept="video/*" 
                                      onChange={(e) => {
                                        handleFileAttachmentChange(e, "video");
                                        setAttachmentVideoModalOpen(false);
                                      }} 
                                      className="hidden" 
                                    />
                                  </label>
                                  
                                  {/* URL Input Option */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Atau tempel Tautan Video (YouTube, dsb):</span>
                                    <input
                                      type="text"
                                      placeholder="https://www.youtube.com/watch?v=..."
                                      value={attachmentVideoUrl}
                                      onChange={(e) => setAttachmentVideoUrl(e.target.value)}
                                      className="w-full bg-white border border-violet-200/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/20 text-xs font-medium text-slate-700"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAttachmentVideoModalOpen(false)}
                                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer transition-colors"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddVideoUrlAttachment}
                                  disabled={!attachmentVideoUrl.trim()}
                                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  Tambahkan Tautan Video
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Pending Attachments Preview List */}
                        {pendingPostAttachments.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            {pendingPostAttachments.map((att) => {
                              let icon = <Paperclip className="h-4 w-4 text-slate-500" />;
                              let badgeColor = "bg-slate-100 text-slate-600 border border-slate-200/50";
                              
                              if (att.type === "image") {
                                icon = <Image className="h-4 w-4 text-rose-500" />;
                                badgeColor = "bg-rose-50 text-rose-600 border border-rose-100";
                                return (
                                  <div key={att.id} className="relative group rounded-xl overflow-hidden h-16 w-20 border border-slate-200 bg-slate-100 shrink-0">
                                    <img src={att.url} className="h-full w-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePendingAttachment(att.id)}
                                      className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white rounded-full p-0.5 cursor-pointer transition-colors shadow-xs"
                                      title="Hapus"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              } else if (att.type === "video") {
                                icon = <Video className="h-4 w-4 text-violet-500" />;
                                badgeColor = "bg-violet-50 text-violet-600 border border-violet-100";
                              } else if (att.type === "link") {
                                icon = <Link className="h-4 w-4 text-blue-500" />;
                                badgeColor = "bg-blue-50 text-blue-600 border border-blue-100";
                              } else if (att.type === "file") {
                                icon = <FileText className="h-4 w-4 text-emerald-500" />;
                                badgeColor = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                              }

                              return (
                                <div key={att.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 ${badgeColor}`}>
                                  {icon}
                                  <span className="max-w-[120px] truncate">{att.name}</span>
                                  {att.size && <span className="text-[9px] opacity-75 font-mono">({att.size})</span>}
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePendingAttachment(att.id)}
                                    className="hover:text-rose-600 text-slate-400 p-0.5 rounded transition-colors ml-1 cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Actions Toolbar & Submit */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          {/* Media Insertion Buttons Group */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 mr-1.5 hidden xs:inline">Sisipkan:</span>
                            
                            {/* Image Button */}
                            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[11px] font-black border border-slate-200/60 hover:border-rose-200 transition-all cursor-pointer shadow-3xs">
                              <Image className="h-3.5 w-3.5" />
                              <span>Gambar</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => handleFileAttachmentChange(e, "image")} 
                                className="hidden" 
                              />
                            </label>

                            {/* Video Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setAttachmentVideoModalOpen(true);
                                setAttachmentLinkModalOpen(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-600 text-[11px] font-black border border-slate-200/60 hover:border-violet-200 transition-all cursor-pointer shadow-3xs"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Video</span>
                            </button>

                            {/* Link Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setAttachmentLinkModalOpen(true);
                                setAttachmentVideoModalOpen(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-[11px] font-black border border-slate-200/60 hover:border-blue-200 transition-all cursor-pointer shadow-3xs"
                            >
                              <Link className="h-3.5 w-3.5" />
                              <span>Tautan</span>
                            </button>

                            {/* Document/File Button */}
                            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-[11px] font-black border border-slate-200/60 hover:border-emerald-200 transition-all cursor-pointer shadow-3xs">
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>Berkas</span>
                              <input 
                                type="file" 
                                onChange={(e) => handleFileAttachmentChange(e, "file")} 
                                className="hidden" 
                              />
                            </label>
                          </div>

                          {/* Characters counter and Submit Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold">{500 - newPostContent.length} karakter</span>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              disabled={!newPostContent.trim() && pendingPostAttachments.length === 0}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-100"
                            >
                              <Send className="h-3 w-3" />
                              <span>Bagikan Post</span>
                            </motion.button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Feed Posts List */}
                    <div className="space-y-4">
                      {socialPosts.length === 0 ? (
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-2">
                          <Globe className="h-10 w-10 text-slate-300 mx-auto" />
                          <p className="text-xs text-slate-600 font-bold">Belum ada postingan komunitas</p>
                          <p className="text-[10px] text-slate-400">Jadilah yang pertama membagikan cerita kerja Anda!</p>
                        </div>
                      ) : (
                        socialPosts.map((post) => {
                          const hasLiked = post.likes?.includes(userEmail);
                          const avatarPreset = AVATAR_PRESETS.find(p => p.id === post.authorAvatar);
                          
                          return (
                            <motion.div
                              layout
                              key={post.id}
                              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4"
                            >
                              {/* Post Header */}
                              <div className="flex items-start justify-between">
                                <div 
                                  onClick={() => handleOpenProfileTab(post.authorEmail)}
                                  className="flex items-center gap-3 cursor-pointer group"
                                  title={`Lihat profil ${post.authorName}`}
                                >
                                  <div className={`h-10 w-10 shrink-0 rounded-xl ${
                                    avatarPreset?.classes || "bg-slate-600"
                                  } flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-sm group-hover:scale-105 transition-all`}>
                                    {post.authorName ? post.authorName.charAt(0) : "U"}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 group-hover:text-indigo-600 transition-all">
                                      <span>{post.authorName}</span>
                                      {post.authorEmail === userEmail ? (
                                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">Saya</span>
                                      ) : (
                                        <span className="text-[9px] font-bold text-slate-400">@{post.authorEmail?.split("@")[0]}</span>
                                      )}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Lihat profil • {post.createdAt}</p>
                                  </div>
                                </div>

                                {post.authorEmail === userEmail && (
                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Postingan"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Post Content */}
                              <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>

                              {renderPostAttachments(post.attachments)}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-slate-500 text-xs font-bold">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    hasLiked ? "text-rose-600" : "hover:text-rose-600 text-slate-500"
                                  }`}
                                >
                                  <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-600 stroke-rose-600 animate-pulse" : ""}`} />
                                  <span>{post.likes?.length || 0} Suka</span>
                                </button>

                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{post.comments?.length || 0} Komentar</span>
                                </div>
                              </div>

                              {/* Comments Section */}
                              <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
                                {/* Comment list */}
                                {post.comments && post.comments.length > 0 && (
                                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                                    {post.comments.map((comment) => {
                                      const commAvatar = AVATAR_PRESETS.find(p => p.id === comment.authorAvatar);
                                      return (
                                        <div key={comment.id} className="flex gap-2.5 items-start text-xs text-slate-600">
                                          <div 
                                            onClick={() => handleOpenProfileTab(comment.authorEmail)}
                                            className={`h-6 w-6 shrink-0 rounded-md ${
                                              commAvatar?.classes || "bg-slate-600"
                                            } flex items-center justify-center text-white font-extrabold text-[9px] uppercase shadow-sm cursor-pointer hover:scale-105 transition-all`}
                                            title={`Lihat profil ${comment.authorName}`}
                                          >
                                            {comment.authorName ? comment.authorName.charAt(0) : "U"}
                                          </div>
                                          <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex-1 shadow-2xs min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-0.5">
                                              <span 
                                                onClick={() => handleOpenProfileTab(comment.authorEmail)}
                                                className="font-extrabold text-slate-800 text-[10px] cursor-pointer hover:text-indigo-600 hover:underline transition-colors"
                                                title={`Lihat profil ${comment.authorName}`}
                                              >
                                                {comment.authorName} <span className="text-[8px] text-slate-400 font-bold ml-1">@{comment.authorEmail.split("@")[0]}</span>
                                              </span>
                                              <span className="text-[8px] text-slate-400">{comment.createdAt}</span>
                                            </div>
                                            <p className="text-[10.5px] font-medium text-slate-600 leading-relaxed">{comment.content}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Comment Write Input */}
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                  <input
                                    type="text"
                                    placeholder="Tulis balasan atau komentar..."
                                    value={commentInputs[post.id] || ""}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCommentPost(post.id);
                                      }
                                    }}
                                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-600"
                                  />
                                  <button
                                    onClick={() => handleCommentPost(post.id)}
                                    disabled={!(commentInputs[post.id] || "").trim()}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    Kirim
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* USER PROFILE TAB */}
                {socialSubTab === "user-profile" && selectedProfileEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Back Button */}
                    <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                      <button
                        onClick={() => {
                          setSocialSubTab("feed");
                          setSelectedProfileEmail(null);
                        }}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Feed Komunitas</span>
                      </button>
                      
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-lg">
                        Melihat Profil Publik
                      </span>
                    </div>

                    {/* Render Selected User */}
                    {(() => {
                      const selectedUser = users.find(u => u.email === selectedProfileEmail);
                      if (!selectedUser) {
                        return (
                          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center text-slate-400 text-xs">
                            Pengguna ini tidak ditemukan di sistem.
                          </div>
                        );
                      }

                      const selectedUserAvatarPreset = AVATAR_PRESETS.find(p => p.id === selectedUser.avatar);
                      const userPosts = socialPosts.filter(p => p.authorEmail === selectedUser.email);
                      const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

                      return (
                        <div className="space-y-6">
                          {/* Profile Main Card */}
                          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                              <div className={`h-20 w-20 rounded-2xl ${
                                selectedUserAvatarPreset?.classes || "bg-indigo-600"
                              } flex items-center justify-center text-white font-extrabold text-3xl uppercase shadow-md shrink-0`}>
                                {selectedUser.name?.charAt(0)}
                              </div>
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <h4 className="text-base font-black text-slate-800 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                  <span>{selectedUser.name}</span>
                                  <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                    {selectedUser.plan === "Premium" ? "Premium Pro" : "Starter"}
                                  </span>
                                </h4>
                                <p className="text-[10px] text-slate-400 font-mono font-bold">@{selectedUser.email.split("@")[0]}</p>
                                <p className="text-xs text-slate-500 font-medium leading-normal italic">"{selectedUser.bio || 'Halo! Saya freelancer profesional.'}"</p>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setSocialSubTab("messages");
                                  setActiveMessageUserEmail(selectedUser.email);
                                }}
                                className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5 transition-all shadow-md shrink-0"
                              >
                                <Mail className="h-4 w-4" />
                                <span>Kirim Pesan</span>
                              </button>
                            </div>

                            {/* Portfolio & Description */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Portofolio & Deskripsi Layanan</span>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedUser.description || 'Pengguna belum menambahkan deskripsi detail tentang keahliannya.'}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-base font-black text-slate-800 block">{userPosts.length}</span>
                                <span className="text-[9px] text-slate-400 font-bold block">Postingan Komunitas</span>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-base font-black text-slate-800 block">{totalLikesReceived}</span>
                                <span className="text-[9px] text-slate-400 font-bold block">Suka Diterima</span>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-black text-slate-800 block truncate mt-1">
                                  {selectedUser.registeredAt?.split(",")[0] || "15 Jul 2026"}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold block">Member Sejak</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Message Sender */}
                          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex items-center gap-2 text-indigo-400 relative z-10">
                              <Mail className="h-4 w-4" />
                              <h5 className="text-xs font-black uppercase tracking-wider">Kirim Pesan Cepat ke {selectedUser.name}</h5>
                            </div>
                            
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!newPrivateMsgContent.trim()) return;
                                const newMsg: PrivateMessage = {
                                  id: "pm_" + Date.now(),
                                  senderEmail: userEmail,
                                  senderName: userName,
                                  senderAvatar: userAvatar,
                                  receiverEmail: selectedUser.email,
                                  receiverName: selectedUser.name,
                                  receiverAvatar: selectedUser.avatar,
                                  content: newPrivateMsgContent.trim(),
                                  createdAt: new Date().toLocaleString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  }),
                                  read: false
                                };
                                setPrivateMessages(prev => [...prev, newMsg]);
                                setNewPrivateMsgContent("");
                                setSocialSubTab("messages");
                                setActiveMessageUserEmail(selectedUser.email);
                              }} 
                              className="flex gap-2 relative z-10"
                            >
                              <input
                                type="text"
                                placeholder={`Tulis pesan atau penawaran kerja sama untuk @${selectedUser.email.split("@")[0]}...`}
                                value={newPrivateMsgContent}
                                onChange={(e) => setNewPrivateMsgContent(e.target.value)}
                                className="flex-1 text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium placeholder-slate-500"
                              />
                              <button
                                type="submit"
                                disabled={!newPrivateMsgContent.trim()}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-800/50"
                              >
                                <Send className="h-3 w-3" />
                                <span>Kirim</span>
                              </button>
                            </form>
                          </div>

                          {/* List of user's posts */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                              Postingan yang Dibagikan @{selectedUser.email.split("@")[0]}
                            </h4>
                            {userPosts.length === 0 ? (
                              <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center text-slate-400 text-xs shadow-xs">
                                Pengguna ini belum membagikan postingan apa pun di feed komunitas.
                              </div>
                            ) : (
                              userPosts.map((post) => {
                                const hasLiked = post.likes?.includes(userEmail);
                                return (
                                  <motion.div
                                    layout
                                    key={post.id}
                                    className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4"
                                  >
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                                      <span>{post.createdAt}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    
                                    {renderPostAttachments(post.attachments)}
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-slate-500 text-xs font-bold">
                                      <button
                                        onClick={() => handleLikePost(post.id)}
                                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                                          hasLiked ? "text-rose-600" : "hover:text-rose-600 text-slate-500"
                                        }`}
                                      >
                                        <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-600 stroke-rose-600 animate-pulse" : ""}`} />
                                        <span>{post.likes?.length || 0} Suka</span>
                                      </button>

                                      <div className="flex items-center gap-1.5 text-slate-500">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{post.comments?.length || 0} Komentar</span>
                                      </div>
                                    </div>

                                    {/* Comments list inside specific user post */}
                                    <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
                                      {post.comments && post.comments.length > 0 && (
                                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                                          {post.comments.map((comment) => {
                                            const commAvatar = AVATAR_PRESETS.find(p => p.id === comment.authorAvatar);
                                            return (
                                              <div key={comment.id} className="flex gap-2.5 items-start text-xs text-slate-600">
                                                <button
                                                  onClick={() => handleOpenProfileTab(comment.authorEmail)}
                                                  className="h-6 w-6 shrink-0 rounded-md cursor-pointer hover:scale-105 transition-all outline-none"
                                                  title={`Lihat profil ${comment.authorName}`}
                                                >
                                                  <div className={`h-full w-full rounded-md ${
                                                    commAvatar?.classes || "bg-slate-600"
                                                  } flex items-center justify-center text-white font-extrabold text-[9px] uppercase shadow-sm`}>
                                                    {comment.authorName ? comment.authorName.charAt(0) : "U"}
                                                  </div>
                                                </button>
                                                <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex-1 shadow-2xs min-w-0">
                                                  <div className="flex justify-between items-start gap-2 mb-0.5">
                                                    <button
                                                      onClick={() => handleOpenProfileTab(comment.authorEmail)}
                                                      className="font-extrabold text-slate-800 text-[10px] hover:text-indigo-600 hover:underline transition-colors text-left cursor-pointer outline-none"
                                                      title={`Lihat profil ${comment.authorName}`}
                                                    >
                                                      {comment.authorName}
                                                    </button>
                                                    <span className="text-[8px] text-slate-400">{comment.createdAt}</span>
                                                  </div>
                                                  <p className="text-[10.5px] font-medium text-slate-600 leading-relaxed">{comment.content}</p>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Write comment input */}
                                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        <input
                                          type="text"
                                          placeholder="Tulis balasan atau komentar..."
                                          value={commentInputs[post.id] || ""}
                                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleCommentPost(post.id);
                                            }
                                          }}
                                          className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-600"
                                        />
                                        <button
                                          onClick={() => handleCommentPost(post.id)}
                                          disabled={!(commentInputs[post.id] || "").trim()}
                                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                          Kirim
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* 2. PRIVATE MESSAGES TAB */}
                {socialSubTab === "messages" && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-6">
                    
                    {/* Header info */}
                    <div className="border-b border-slate-100 pb-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Kotak Masuk Pesan Privat</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Klik tombol "Pesan" pada Direktori Anggota di sebelah kanan untuk bertukar pesan pribadi.</p>
                    </div>

                    <div className="flex flex-col justify-between space-y-4 min-h-[400px]">
                      {activeMessageUserEmail ? (
                        <>
                          {/* Target User Status Header */}
                          {(() => {
                            const target = users.find(u => u.email === activeMessageUserEmail);
                            const targetPreset = AVATAR_PRESETS.find(p => p.id === target?.avatar);
                            return (
                              <div className="flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl">
                                <button
                                  onClick={() => handleOpenProfileTab(activeMessageUserEmail)}
                                  className="flex items-center gap-3 text-left cursor-pointer group outline-none min-w-0 flex-1"
                                  title={`Lihat profil ${target?.name}`}
                                >
                                  <div className={`h-9 w-9 rounded-xl ${targetPreset?.classes || "bg-indigo-600"} flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-sm group-hover:scale-105 transition-all`}>
                                    {target?.name ? target.name.charAt(0) : "U"}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{target?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">@{target?.email?.split("@")[0]}</p>
                                  </div>
                                </button>
                                <button 
                                  onClick={() => setActiveMessageUserEmail("")} 
                                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-100"
                                >
                                  Tutup Obrolan
                                </button>
                              </div>
                            );
                          })()}

                          {/* Chat history list */}
                          <div className="flex-1 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl min-h-[250px] max-h-[350px] overflow-y-auto space-y-3">
                            {(() => {
                              const activeMessages = privateMessages.filter(
                                msg => (msg.senderEmail === userEmail && msg.receiverEmail === activeMessageUserEmail) ||
                                       (msg.senderEmail === activeMessageUserEmail && msg.receiverEmail === userEmail)
                              );

                              // Mark as read
                              const unreadMsgs = privateMessages.filter(m => m.senderEmail === activeMessageUserEmail && m.receiverEmail === userEmail && !m.read);
                              if (unreadMsgs.length > 0) {
                                setTimeout(() => {
                                  setPrivateMessages(prev => prev.map(m => {
                                    if (m.senderEmail === activeMessageUserEmail && m.receiverEmail === userEmail && !m.read) {
                                      return { ...m, read: true };
                                    }
                                    return m;
                                  }));
                                }, 500);
                              }

                              if (activeMessages.length === 0) {
                                  return (
                                    <div className="text-center py-16 space-y-1">
                                      <Mail className="h-7 w-7 text-indigo-400/50 mx-auto" />
                                      <p className="text-xs text-slate-500 font-bold">Mulai Percakapan Baru</p>
                                      <p className="text-[10px] text-slate-400">Kirim pesan pertama Anda dengan sopan.</p>
                                    </div>
                                  );
                              }

                              return activeMessages.map((msg) => {
                                const isMyMessage = msg.senderEmail === userEmail;
                                return (
                                  <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"} gap-2`}>
                                    {!isMyMessage && (
                                      <button
                                        onClick={() => handleOpenProfileTab(msg.senderEmail)}
                                        className="h-6 w-6 rounded-md cursor-pointer hover:scale-105 transition-all outline-none shrink-0"
                                        title={`Lihat profil ${msg.senderName}`}
                                      >
                                        <div className={`h-full w-full rounded-md ${AVATAR_PRESETS.find(p => p.id === msg.senderAvatar)?.classes || "bg-slate-600"} flex items-center justify-center text-white font-black text-[9px] uppercase`}>
                                          {msg.senderName?.charAt(0)}
                                        </div>
                                      </button>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-2xs text-xs font-medium ${
                                      isMyMessage 
                                        ? "bg-indigo-600 text-white rounded-tr-none" 
                                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                                    }`}>
                                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                      <span className={`text-[8px] font-bold mt-1 block text-right ${isMyMessage ? "text-indigo-200" : "text-slate-400"}`}>
                                        {msg.createdAt} {isMyMessage && (msg.read ? "• Dibaca" : "• Terkirim")}
                                      </span>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>

                          {/* Write PM Input form */}
                          <form onSubmit={handleSendPrivateMessage} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tulis pesan pribadi terenkripsi..."
                              value={newPrivateMsgContent}
                              onChange={(e) => setNewPrivateMsgContent(e.target.value)}
                              className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700"
                            />
                            <button
                              type="submit"
                              disabled={!newPrivateMsgContent.trim()}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                            >
                              <Send className="h-3 w-3" />
                              <span>Kirim</span>
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="text-center py-24 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-2 w-full">
                          <Mail className="h-10 w-10 text-slate-300 mx-auto animate-bounce" />
                          <p className="text-xs text-slate-600 font-bold">Tidak ada obrolan aktif terpilih</p>
                          <p className="text-[10px] text-slate-400">Silakan pilih rekan freelancer di panel sebelah kanan untuk memulai obrolan private!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. MY PROFILE VIEW */}
                {socialSubTab === "my-profile" && (
                  <div className="space-y-6">
                    {/* Visual Card */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        <div className={`h-20 w-20 rounded-2xl ${
                          AVATAR_PRESETS.find(p => p.id === userAvatar)?.classes || "bg-indigo-600"
                        } flex items-center justify-center text-white font-extrabold text-3xl uppercase shadow-md shrink-0`}>
                          {userName.charAt(0)}
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="text-base font-black text-slate-800">{userName}</h4>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                              {membershipPlan === "Premium" ? "Premium Pro" : "Starter"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 font-mono">@{userEmail.split("@")[0]}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-normal italic">"{userBio}"</p>
                        </div>
                        <button
                          onClick={startEditingProfile}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span>Ubah Profil</span>
                        </button>
                      </div>

                      {/* Detail Deskripsi */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Tentang Saya</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{userDescription}</p>
                      </div>

                      {/* Simple Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-base font-black text-slate-800">{socialPosts.filter(p => p.authorEmail === userEmail).length}</span>
                          <span className="text-[9px] text-slate-400 font-bold block">Postingan Anda</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-base font-black text-slate-800">
                            {socialPosts.filter(p => p.authorEmail === userEmail).reduce((acc, p) => acc + (p.likes?.length || 0), 0)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold block">Suka Diterima</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-base font-black text-slate-800">
                            {privateMessages.filter(m => m.senderEmail === userEmail || m.receiverEmail === userEmail).length}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold block">Pesan Terkirim</span>
                        </div>
                      </div>
                    </div>

                    {/* My own posts history */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Histori Postingan Anda</h4>
                      {socialPosts.filter(p => p.authorEmail === userEmail).length === 0 ? (
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-400 text-xs">
                          Belum ada postingan yang Anda bagikan.
                        </div>
                      ) : (
                        socialPosts.filter(p => p.authorEmail === userEmail).map((post) => {
                          const hasLiked = post.likes?.includes(userEmail);
                          return (
                            <div key={post.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] text-slate-400 font-bold">{post.createdAt}</span>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
                                >
                                  Hapus Post
                                </button>
                              </div>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">{post.content}</p>
                              {renderPostAttachments(post.attachments)}
                              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50">
                                <span>{post.likes?.length || 0} Suka</span>
                                <span>{post.comments?.length || 0} Komentar</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Member Directory & Inbox Quick Panel */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Member Directory */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Direktori Anggota Portal</h4>
                      <p className="text-[9px] text-slate-400 font-bold">Terhubung langsung dengan sesama freelancer</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black">{users.length} Orang</span>
                  </div>

                  {/* Search Bar for Alias */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau @alias..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700 bg-slate-50/50"
                    />
                  </div>

                  {/* List of other users to connect with */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(() => {
                      const filtered = users.filter((member) => {
                        const query = memberSearchQuery.toLowerCase().trim();
                        if (!query) return true;
                        const handle = `@${member.email.split("@")[0]}`.toLowerCase();
                        return (
                          member.name.toLowerCase().includes(query) ||
                          member.email.toLowerCase().includes(query) ||
                          handle.includes(query)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-6 text-[11px] text-slate-400 font-medium">
                            Anggota tidak ditemukan.
                          </div>
                        );
                      }

                      return filtered.map((member) => {
                        const isMe = member.email === userEmail;
                        const hasUnread = privateMessages.some(m => m.senderEmail === member.email && m.receiverEmail === userEmail && !m.read);
                        const memberAvatarPreset = AVATAR_PRESETS.find(p => p.id === member.avatar);
                        
                        return (
                          <div 
                            key={member.id}
                            onClick={() => handleOpenProfileTab(member.email)}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              socialSubTab === "user-profile" && selectedProfileEmail === member.email
                                ? "bg-indigo-50 border-indigo-300 shadow-xs scale-[1.01]"
                                : isMe && socialSubTab === "my-profile"
                                ? "bg-indigo-50/70 border-indigo-200"
                                : activeMessageUserEmail === member.email 
                                ? "bg-slate-50 border-indigo-100" 
                                : isMe 
                                ? "bg-slate-50/50 border-slate-100 opacity-80"
                                : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10"
                            }`}
                            title={`Lihat profil ${member.name}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <div className={`h-8.5 w-8.5 rounded-xl ${memberAvatarPreset?.classes || "bg-slate-600"} flex items-center justify-center text-white font-extrabold text-xs uppercase shadow-sm`}>
                                  {member.name ? member.name.charAt(0) : "U"}
                                </div>
                                {hasUnread && (
                                  <span className="absolute -top-1 -right-1 bg-rose-500 w-2 h-2 rounded-full border border-white" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                                  <span className="truncate">{member.name}</span>
                                  {isMe ? (
                                    <span className="text-[7px] bg-slate-200 text-slate-500 px-1 py-0.2 rounded font-mono">Saya</span>
                                  ) : (
                                    <span className="text-[8px] text-indigo-500 font-mono font-bold shrink-0">@{member.email.split("@")[0]}</span>
                                  )}
                                </h5>
                                <p className="text-[9px] text-slate-400 font-medium truncate max-w-[110px]">{member.bio || "Rekan Freelancer"}</p>
                              </div>
                            </div>

                            {!isMe && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSocialSubTab("messages");
                                  setActiveMessageUserEmail(member.email);
                                }}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black transition-all shrink-0 cursor-pointer flex items-center gap-1"
                                title={`Kirim Pesan ke ${member.name}`}
                              >
                                <Mail className="h-3 w-3" />
                                <span>Pesan</span>
                              </button>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Quick Community Guidelines */}
                <div className="bg-indigo-950 text-indigo-200 rounded-3xl p-5 border border-slate-800/80 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Shield className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Etika Berkomunitas</span>
                  </div>
                  <ul className="text-[10px] space-y-1.5 leading-relaxed text-indigo-300 font-medium">
                    <li className="flex gap-1.5">
                      <span>•</span>
                      <span>Hormati hak cipta portofolio & kekayaan intelektual milik sesama freelancer.</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span>•</span>
                      <span>Gunakan fitur pesan privat untuk diskusi kolaboratif yang profesional.</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span>•</span>
                      <span>Dilarang menyebarkan berita palsu atau spam iklan tidak relevan.</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* Dynamic Profile Tabs */}
        {activeDashboardTab.startsWith("profile-") && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 animate-fade-in"
            id="profile-tab-view"
          >
            {(() => {
              const email = activeDashboardTab.replace("profile-", "");
              let selectedUser = users.find(u => u.email === email);
              if (!selectedUser) {
                if (email === userEmail) {
                  selectedUser = {
                    id: "me",
                    name: userName,
                    email: userEmail,
                    plan: membershipPlan,
                    role: userEmail === "adek.burong@gmail.com" ? "admin" : "member",
                    bio: userBio,
                    description: userDescription,
                    avatar: userAvatar,
                    registeredAt: "Baru Saja"
                  };
                } else {
                  // Synthesize from forum/chat activities if any
                  const matchingPost = socialPosts.find(p => p.authorEmail === email);
                  const matchingComment = socialPosts.flatMap(p => p.comments || []).find(c => c.authorEmail === email);
                  const matchingPM = privateMessages.find(m => m.senderEmail === email || m.receiverEmail === email);
                  
                  const foundName = matchingPost?.authorName || 
                                    matchingComment?.authorName || 
                                    (matchingPM?.senderEmail === email ? matchingPM.senderName : (matchingPM?.receiverEmail === email ? matchingPM.receiverName : "")) ||
                                    email.split("@")[0];
                                    
                  const foundAvatar = matchingPost?.authorAvatar || 
                                      matchingComment?.authorAvatar || 
                                      (matchingPM?.senderEmail === email ? matchingPM.senderAvatar : (matchingPM?.receiverEmail === email ? matchingPM.receiverAvatar : "cypher")) ||
                                      "cypher";
                  
                  selectedUser = {
                    id: `synth-${email}`,
                    name: foundName,
                    email: email,
                    plan: "Starter",
                    role: "member",
                    bio: "Rekan Freelancer yang baru bergabung di komunitas.",
                    description: "Pengguna ini aktif berinteraksi di forum sosial dan obrolan.",
                    avatar: foundAvatar,
                    registeredAt: "Pengguna Baru"
                  };
                }
              }

              const isMe = selectedUser.email === userEmail;
              
              // Helper to generate bespoke projects based on freelancer profile details
              const getFreelancerCategoryAndProjects = (userObj: any) => {
                const bio = (userObj.bio || "").toLowerCase();
                const desc = (userObj.description || "").toLowerCase();
                
                let category = "Generalist & Specialist";
                let projects = [
                  {
                    title: "Sistem Otomasi Operasional Bisnis",
                    desc: "Sistem integrasi alur kerja internal untuk menghemat biaya operasional.",
                    tags: ["Business", "Automation"],
                    rating: 5.0,
                    client: "Bapak Ahmad (Operational Director)",
                    feedback: "Solusi luar biasa yang memotong waktu pengerjaan admin kami hingga 60%!",
                    tech: ["Airtable", "Zapier", "No-Code", "Dashboard"],
                    color: "from-blue-500 to-indigo-600"
                  },
                  {
                    title: "Desain UI/UX Landing Page Bisnis",
                    desc: "Desain layout beresolusi tinggi dengan riset audiens mendalam untuk konversi penjualan.",
                    tags: ["UI/UX Design", "Figma"],
                    rating: 4.9,
                    client: "Siti Rahma (E-commerce Manager)",
                    feedback: "Tampilan visualnya sangat segar, modern, dan disukai pelanggan baru kami.",
                    tech: ["Figma", "Design System", "Prototyping"],
                    color: "from-purple-500 to-pink-600"
                  },
                  {
                    title: "Artikel SEO & Copywriting Kampanye Produk",
                    desc: "Penulisan salinan iklan dan artikel teroptimasi mesin pencari untuk menaikkan traffic organik.",
                    tags: ["Copywriting", "SEO"],
                    rating: 5.0,
                    client: "Hendra (Agensi Kreatif)",
                    feedback: "Artikel yang ditulis berhasil nangkring di halaman pertama Google dalam 2 minggu.",
                    tech: ["Copywriting", "SEO", "Google Analytics"],
                    color: "from-teal-500 to-emerald-600"
                  }
                ];

                if (bio.includes("dev") || bio.includes("code") || bio.includes("programmer") || bio.includes("tech") || bio.includes("web") ||
                    desc.includes("dev") || desc.includes("code") || desc.includes("programmer") || desc.includes("tech") || desc.includes("web") ||
                    userObj.email === "adek.burong@gmail.com") {
                  category = "Full-Stack Web Developer & Engineer";
                  projects = [
                    {
                      title: "E-Commerce Web App with Live Payments",
                      desc: "Aplikasi toko online tangguh dengan integrasi payment gateway dan panel admin real-time.",
                      tags: ["Fullstack Dev", "E-Commerce"],
                      rating: 5.0,
                      client: "Hendra (CEO TokoLokal)",
                      feedback: "Sangat responsif dan aman! Penjualan online kami naik pesat sejak ganti platform.",
                      tech: ["React.js", "TailwindCSS", "Node.js", "PostgreSQL"],
                      color: "from-indigo-600 to-blue-500"
                    },
                    {
                      title: "Custom SaaS Dashboard & Analytics Suite",
                      desc: "Dashboard monitoring metrik bisnis dengan grafik performa interaktif d3/recharts.",
                      tags: ["SaaS", "Dashboard"],
                      rating: 4.9,
                      client: "Jessica (Product Owner)",
                      feedback: "Visualisasi datanya sangat intuitif, mempercepat keputusan strategis bisnis.",
                      tech: ["TypeScript", "Recharts", "Vite", "REST API"],
                      color: "from-cyan-500 to-indigo-500"
                    },
                    {
                      title: "Database Optimization & Back-End Security",
                      desc: "Optimasi query database lambat dan penerapan sistem keamanan token JWT terenkripsi.",
                      tags: ["Back-End", "Security"],
                      rating: 5.0,
                      client: "Budi (CTO FinTech Startup)",
                      feedback: "Masalah bottleneck database kami teratasi sepenuhnya, server jauh lebih stabil.",
                      tech: ["Node.js", "Express", "Docker", "Redis"],
                      color: "from-slate-800 to-indigo-950"
                    }
                  ];
                } else if (bio.includes("design") || bio.includes("art") || bio.includes("visual") || bio.includes("figma") || bio.includes("logo") ||
                           desc.includes("design") || desc.includes("art") || desc.includes("visual") || desc.includes("figma") || desc.includes("logo")) {
                  category = "Senior UI/UX & Brand Identity Designer";
                  projects = [
                    {
                      title: "Visual Brand Rebranding & Identity System",
                      desc: "Perancangan ulang logo, pedoman warna, tipografi, dan aset visual pemasaran digital.",
                      tags: ["Branding", "Identity"],
                      rating: 5.0,
                      client: "Rani (Co-Founder HijabStyle)",
                      feedback: "Brand identity baru kami terasa sangat elegan dan memiliki nilai jual yang tinggi.",
                      tech: ["Adobe Illustrator", "Figma", "Creative Suite"],
                      color: "from-rose-500 to-orange-500"
                    },
                    {
                      title: "SaaS Application High-Fidelity UI Kit",
                      desc: "UI Kit lengkap dengan ratusan komponen responsif, varian state, dan prototype interaktif.",
                      tags: ["UI Kit", "Figma"],
                      rating: 4.9,
                      client: "Aris (Software Architect)",
                      feedback: "Struktur figma file sangat rapi dan terdokumentasi, memudahkan handoff ke developer.",
                      tech: ["Figma", "Design Tokens", "Autolayout"],
                      color: "from-violet-600 to-pink-500"
                    },
                    {
                      title: "Mobile App Wireframing & User Research",
                      desc: "Riset perilaku pengguna dan perancangan wireframe hitam-putih sebelum tahap produksi visual.",
                      tags: ["UX Research", "Wireframes"],
                      rating: 5.0,
                      client: "Sania (Founder SehatYuk)",
                      feedback: "Proses riset sangat mendalam, memvalidasi banyak hipotesis aplikasi kesehatan kami.",
                      tech: ["FigJam", "Miro", "User Persona", "Wireframing"],
                      color: "from-emerald-500 to-teal-600"
                    }
                  ];
                } else if (bio.includes("write") || bio.includes("copy") || bio.includes("seo") || bio.includes("konten") || bio.includes("artikel") ||
                           desc.includes("write") || desc.includes("copy") || desc.includes("seo") || desc.includes("konten") || desc.includes("artikel")) {
                  category = "Creative Copywriter & Professional SEO Strategist";
                  projects = [
                    {
                      title: "SaaS Landing Page Sales Copywriting",
                      desc: "Penulisan teks landing page persuasif yang berfokus meningkatkan tingkat pendaftaran uji coba.",
                      tags: ["Copywriting", "Conversion"],
                      rating: 5.0,
                      client: "Doni (Growth Marketer)",
                      feedback: "Conversion rate landing page kami melonjak 35% setelah menerapkan copywriting baru ini.",
                      tech: ["SEO Copy", "A/B Testing", "Psychology Trigger"],
                      color: "from-amber-500 to-rose-600"
                    },
                    {
                      title: "Ultimate Guide Book for Digital Freelancing",
                      desc: "Penyusunan e-book edukatif setebal 120 halaman sebagai magnet prospek pemasaran online.",
                      tags: ["E-Book", "Content Marketing"],
                      rating: 4.9,
                      client: "Rudi (Founder BisnisDigital)",
                      feedback: "Ebook ini berhasil mendatangkan lebih dari 5.000 subscriber baru dalam sebulan.",
                      tech: ["Content Writing", "PDF Design", "Research"],
                      color: "from-emerald-600 to-blue-600"
                    },
                    {
                      title: "Organic SEO Blog Strategy & Article Series",
                      desc: "Riset kata kunci kompetitif dan penulisan 15 seri artikel SEO berkualitas tinggi secara berkala.",
                      tags: ["SEO Strategy", "Blogs"],
                      rating: 5.0,
                      client: "Yudha (SEO Lead)",
                      feedback: "Beberapa artikel utama kami sukses menduduki peringkat teratas pencarian Google.",
                      tech: ["Keyword Research", "SEO Writing", "Search Console"],
                      color: "from-teal-600 to-indigo-600"
                    }
                  ];
                }

                return { category, projects };
              };

              const getFreelancerServices = (catName: string) => {
                if (catName.includes("Web Developer")) {
                  return [
                    {
                      title: "Paket Kilat Landing Page",
                      price: "Rp 2.500.000",
                      delivery: "3 Hari Kerja",
                      revisions: "3x Revisi",
                      features: ["1 Halaman Responsif", "Desain Modern Tailwind", "Integrasi Form Kontak", "Optimasi Kecepatan Google PageSpeed", "Kode Sumber Lengkap"]
                    },
                    {
                      title: "Aplikasi Full-Stack Custom",
                      price: "Rp 7.500.000",
                      delivery: "14 Hari Kerja",
                      revisions: "Unlimited",
                      features: ["Desain UI/UX Unik", "Backend API Server", "Integrasi Database & Autentikasi", "Sistem Admin Panel", "Dokumentasi & Setup Server"]
                    },
                    {
                      title: "Optimasi & Perbaikan Server",
                      price: "Rp 1.500.000",
                      delivery: "1 Hari Kerja",
                      revisions: "2x Revisi",
                      features: ["Audit Performa Database", "Perbaikan Bug Keamanan", "Sertifikasi SSL & Setup Nginx", "Migrasi Data Aman", "1 Bulan Dukungan Teknis"]
                    }
                  ];
                } else if (catName.includes("Designer")) {
                  return [
                    {
                      title: "Desain Identitas Visual Brand",
                      price: "Rp 1.800.000",
                      delivery: "4 Hari Kerja",
                      revisions: "4x Revisi",
                      features: ["3 Pilihan Desain Logo", "Panduan Warna & Tipografi", "Desain Kartu Nama & Kop Surat", "File Master EPS / AI / Figma", "Hak Milik Komersial Penuh"]
                    },
                    {
                      title: "UI/UX High Fidelity Figma Kit",
                      price: "Rp 4.500.000",
                      delivery: "10 Hari Kerja",
                      revisions: "5x Revisi",
                      features: ["Hingga 8 Desain Layar Utama", "Design System & Komponen Figma", "Prototype Interaktif Berjalan", "Riset Pengguna & Wireframing", "Handoff File Siap Coding"]
                    },
                    {
                      title: "Desain Konten Media Sosial",
                      price: "Rp 850.000",
                      delivery: "2 Hari Kerja",
                      revisions: "3x Revisi",
                      features: ["6 Desain Postingan Instagram", "Format Feed / Story / Carousel", "Template Edit Mandiri di Canva/Figma", "Riset Topik Konten Populer", "Aset Icon Kustom Premium"]
                    }
                  ];
                } else if (catName.includes("Copywriter")) {
                  return [
                    {
                      title: "Landing Page Copywriting",
                      price: "Rp 1.200.000",
                      delivery: "2 Hari Kerja",
                      revisions: "3x Revisi",
                      features: ["Teks Headline Persuasif", "Formulasi Formula AIDA", "Penulisan Call-to-Action Efektif", "Riset Audiens Kompetitor", "100% Bebas Plagiarisme"]
                    },
                    {
                      title: "Seri Artikel SEO Bulanan",
                      price: "Rp 2.800.000",
                      delivery: "10 Hari Kerja",
                      revisions: "Unlimited",
                      features: ["8 Artikel SEO @1000 Kata", "Riset Kata Kunci Kompetisi Rendah", "Optimasi Tag Header & Meta", "Gambar Pendukung Bebas Lisensi", "Laporan Skor On-Page"]
                    },
                    {
                      title: "Penulisan Buku Panduan (E-Book)",
                      price: "Rp 3.500.000",
                      delivery: "7 Hari Kerja",
                      revisions: "4x Revisi",
                      features: ["Buku Panduan Komprehensif (30 Hal)", "Outline & Kerangka Materi Jelas", "Desain Cover Ebook Kreatif", "Format PDF & EPub", "Riset Topik Industri Terkait"]
                    }
                  ];
                } else {
                  return [
                    {
                      title: "Paket Solusi Strategis",
                      price: "Rp 2.000.000",
                      delivery: "5 Hari Kerja",
                      revisions: "3x Revisi",
                      features: ["Analisis Kebutuhan Bisnis", "Riset Pasar & Solusi Masalah", "Perencanaan Alur Kerja Sistem", "Pendampingan Implementasi", "Laporan Evaluasi Tertulis"]
                    },
                    {
                      title: "Layanan Dukungan Operasional",
                      price: "Rp 4.000.000",
                      delivery: "10 Hari Kerja",
                      revisions: "5x Revisi",
                      features: ["Manajemen Proyek Berkelanjutan", "Integrasi Alat Kolaborasi (Slack/Trello)", "Dukungan Teknis Harian", "Pemantauan Progress Kerja", "Sesi Konsultasi Mingguan (1 Jam)"]
                    },
                    {
                      title: "Audit Alur Kerja Internal",
                      price: "Rp 1.000.000",
                      delivery: "2 Hari Kerja",
                      revisions: "2x Revisi",
                      features: ["Review SOP & Alur Kerja Saat Ini", "Identifikasi Bottleneck Efisiensi", "Rekomendasi Otomasi Alat", "Desain Ulang Diagram Alur", "Sesi Presentasi Hasil Audit"]
                    }
                  ];
                }
              };

              const selectedUserAvatarPreset = AVATAR_PRESETS.find(p => p.id === (isMe ? userAvatar : selectedUser.avatar));
              const { category, projects } = getFreelancerCategoryAndProjects(selectedUser);
              const services = getFreelancerServices(category);
              
              const userPosts = socialPosts.filter(p => p.authorEmail === selectedUser.email);
              const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
              
              const userAlias = selectedUser.email.split("@")[0];
              const profileShareUrl = `https://portalfreelance.id/@${userAlias}`;

              // Handle copy profile link
              const handleCopyProfileLink = () => {
                navigator.clipboard.writeText(profileShareUrl);
                setCopiedEmail(selectedUser.email);
                setTimeout(() => setCopiedEmail(null), 2000);
              };

              // Handle submission of official work proposal message
              const handleSendWorkProposal = (e: FormEvent) => {
                e.preventDefault();
                if (!proposalTitle.trim() || !proposalDetails.trim()) return;
                
                const formattedContent = `📢 **PROPOSAL PENAWARAN KERJA RESMI** 📢\n\n🔹 **Nama Proyek:** ${proposalTitle.trim()}\n🔹 **Estimasi Anggaran:** Rp ${Number(proposalBudget).toLocaleString("id-ID") || proposalBudget}\n🔹 **Est. Waktu Pengerjaan:** ${proposalDeliveryTime} Hari Kerja\n\n📌 **Rincian Pekerjaan & Persyaratan:**\n${proposalDetails.trim()}\n\n*Proposal ini dikirim secara instan melalui Landing Page Portofolio Mandiri Anda.*`;
                
                const newMsg: PrivateMessage = {
                  id: "proposal_" + Date.now(),
                  senderEmail: userEmail,
                  senderName: userName,
                  senderAvatar: userAvatar,
                  receiverEmail: selectedUser.email,
                  receiverName: selectedUser.name,
                  receiverAvatar: selectedUser.avatar,
                  content: formattedContent,
                  createdAt: new Date().toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }),
                  read: false
                };

                setPrivateMessages(prev => [...prev, newMsg]);
                
                // Reset proposal form
                setProposalTitle("");
                setProposalBudget("");
                setProposalDetails("");
                setProposalDeliveryTime("3");
                
                // Show success feedback
                setProposalSuccess(true);
                setTimeout(() => setProposalSuccess(false), 5000);
              };

              // Set banner colors based on profile category
              let bannerGradient = "from-slate-800 via-slate-950 to-slate-900";
              let badgeColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
              if (category.includes("Web Developer")) {
                bannerGradient = "from-indigo-900 via-slate-900 to-blue-900";
                badgeColor = "bg-blue-50 text-blue-600 border-blue-100";
              } else if (category.includes("Designer")) {
                bannerGradient = "from-purple-900 via-slate-900 to-rose-900";
                badgeColor = "bg-pink-50 text-pink-600 border-pink-100";
              } else if (category.includes("Copywriter")) {
                bannerGradient = "from-teal-900 via-slate-900 to-emerald-900";
                badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
              }

              return (
                <div className="space-y-6">
                  
                  {/* Standing Landing Header Panel */}
                  <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-indigo-600 text-white p-2 rounded-xl">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Landing Page Portofolio Mandiri</h3>
                          <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">AKTIF & PUBLIK 🌐</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold font-mono">u/{userAlias}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCloseProfileTab(selectedUser.email)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Kembali ke Portal</span>
                    </button>
                  </div>

                  {/* stand-alone profile landing page container */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: HERO, ABOUT, SERVICES, PORTFOLIO */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Premium Hero and Header Cover */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm relative">
                        {/* COVER HEADER WITH UNIQUE DESIGN PATTERNS */}
                        <div className={`h-44 md:h-52 bg-gradient-to-r ${bannerGradient} relative flex items-center justify-between p-6 overflow-hidden`}>
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                          <div className="absolute -left-20 -top-20 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                          <div className="absolute right-10 bottom-0 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
                          
                          {/* FLOATING DESIGN GRAPHICS AND CREDENTIALS */}
                          <div className="relative z-10 space-y-1 text-left hidden sm:block">
                            <span className="text-[9px] bg-white/10 text-white font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs">
                              Freelancer Terverifikasi
                            </span>
                            <p className="text-[10px] text-slate-300 font-medium">Platform ID: {selectedUser.id}</p>
                          </div>
                        </div>

                        {/* PROFILE HEADER MAIN CONTENT */}
                        <div className="px-6 pb-6 pt-16 relative">
                          {/* FLOATING AVATAR BOX WITH STATUS RING */}
                          <div className="absolute -top-16 left-6">
                            <div className="relative">
                              <div className={`h-28 w-28 rounded-2xl ${
                                selectedUserAvatarPreset?.classes || "bg-indigo-600"
                              } flex items-center justify-center text-white font-extrabold text-4xl uppercase shadow-md border-4 border-white`}>
                                {selectedUser.name?.charAt(0)}
                              </div>
                              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />
                                READY FOR HIRE
                              </span>
                            </div>
                          </div>

                          {/* USER INFO */}
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-1 text-left">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
                                  <span>{selectedUser.name}</span>
                                  <CheckCircle2 className="h-5 w-5 text-indigo-500 fill-indigo-100" title="Akun Terverifikasi Resmi" />
                                </h2>
                                
                                <p className="text-xs font-black text-indigo-600 font-mono tracking-wide">{category}</p>
                                <p className="text-xs text-slate-500 font-medium leading-normal italic">"{selectedUser.bio || 'Membangun karya berkualitas dengan dedikasi tinggi.'}"</p>
                              </div>

                              <div className="flex flex-wrap gap-2 shrink-0">
                                {isMe ? (
                                  <button
                                    onClick={() => {
                                      startEditingProfile();
                                      setActiveModal("edit-profile");
                                    }}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs border border-slate-200"
                                  >
                                    <Settings className="h-4 w-4" />
                                    <span>Ubah Landing Page</span>
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setActiveDashboardTab("social");
                                        setSocialSubTab("messages");
                                        setActiveMessageUserEmail(selectedUser.email);
                                      }}
                                      className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
                                    >
                                      <Mail className="h-4 w-4" />
                                      <span>Kirim Pesan</span>
                                    </button>
                                    <a
                                      href="#hire-proposal-form"
                                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100"
                                    >
                                      <Zap className="h-4 w-4" />
                                      <span>Sewa Jasa</span>
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* CORE META BADGES */}
                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-slate-400 text-[11px] font-bold">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                Tanggapan Cepat: &lt; 2 Jam
                              </span>
                              <span className="text-slate-200">•</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                {projects.length}+ Proyek Selesai
                              </span>
                              <span className="text-slate-200">•</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                                5.0 Rating Rata-Rata
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Standalone URL Indicator with copy feature */}
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Bagikan Tautan Landing Page</span>
                          <span className="text-xs font-bold text-slate-600 font-mono select-all bg-white px-2 py-1 rounded border border-slate-200/50 block sm:inline-block">
                            {profileShareUrl}
                          </span>
                        </div>
                        <button
                          onClick={handleCopyProfileLink}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Link className="h-3.5 w-3.5" />
                          <span>{copiedEmail === selectedUser.email ? "Tautan Tersalin! 📋" : "Salin Tautan"}</span>
                        </button>
                      </div>

                      {/* TENTANG FREELANCER DETAIL */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full" />
                          Tentang Saya & Portofolio Profesional
                        </h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                          {selectedUser.description || "Halo, saya adalah freelancer berdedikasi tinggi yang fokus memberikan solusi terbaik untuk klien. Saya memiliki keahlian mendalam di bidang spesialisasi saya dan selalu mengedepankan kualitas pengerjaan, komunikasi responsif, serta waktu penyelesaian proyek yang tepat waktu."}
                        </p>
                        
                        {/* TAG SKILLS CLOUD */}
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">Keahlian & Tag Populer</span>
                          <div className="flex flex-wrap gap-1.5">
                            {projects.flatMap(p => p.tech).map((techName, i) => (
                              <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/40">
                                {techName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* DAFTAR JASA & PAKET UNGGULAN MENU */}
                      <div className="space-y-4 text-left">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full" />
                            Daftar Jasa & Paket Layanan Unggulan
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold">Pilih salah satu paket layanan unggulan di bawah untuk memulai penawaran kerja sama</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {services.map((svc, idx) => (
                            <div 
                              key={idx}
                              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4"
                            >
                              <div className="space-y-2">
                                <h5 className="text-xs font-black text-slate-800 line-clamp-1">{svc.title}</h5>
                                <div className="text-slate-800 font-black text-sm text-indigo-600">{svc.price}</div>
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  Pengerjaan: {svc.delivery}
                                </p>
                              </div>

                              <ul className="text-[9.5px] text-slate-500 space-y-1.5 py-3 border-t border-b border-slate-50 font-medium">
                                {svc.features.map((feat, i) => (
                                  <li key={i} className="flex gap-1">
                                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>

                              <a
                                href="#hire-proposal-form"
                                onClick={() => {
                                  setProposalTitle(`Pemesanan Jasa: ${svc.title}`);
                                  setProposalDetails(`Halo @${userAlias}, saya tertarik memesan layanan "${svc.title}" Anda dengan rincian anggaran ${svc.price}.\n\nBerikut kebutuhan proyek kami:\n1. ...`);
                                }}
                                className="w-full text-center py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer block"
                              >
                                Pilih Paket Jasa
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PORTFOLIO SHOWCASE GALLERY */}
                      <div className="space-y-4 text-left">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full" />
                            Galeri Portofolio & Proyek Sukses
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold">Koleksi studi kasus nyata dan bukti penyelesaian proyek oleh freelancer ini</p>
                        </div>

                        <div className="space-y-4">
                          {projects.map((proj, idx) => (
                            <div 
                              key={idx}
                              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-12 hover:border-slate-300 transition-all"
                            >
                              {/* THUMBNAIL GRAPHIC WITH GRADIENTS */}
                              <div className={`md:col-span-4 bg-gradient-to-tr ${proj.color} p-5 flex flex-col justify-between text-white relative min-h-[140px]`}>
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                                <div className="flex justify-between items-start">
                                  <span className="bg-white/10 text-white border border-white/20 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-xs">
                                    Studi Kasus #{idx + 1}
                                  </span>
                                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                                </div>
                                <div className="relative z-10 space-y-1 text-left">
                                  <div className="text-xs font-black leading-tight drop-shadow-sm">{proj.title}</div>
                                  <p className="text-[8px] text-white/80 font-mono">Completed Job</p>
                                </div>
                              </div>

                              {/* CONTENT DETAILS */}
                              <div className="md:col-span-8 p-5 space-y-3 flex flex-col justify-between text-left">
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {proj.tags.map((tag, i) => (
                                      <span key={i} className="text-[8px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                        {tag}
                                      </span>
                                    ))}
                                    <span className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5 ml-auto">
                                      {proj.rating.toFixed(1)} ★
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 font-semibold leading-snug">{proj.desc}</p>
                                </div>

                                {/* TESTIMONY OF PROJECT */}
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] space-y-1">
                                  <p className="text-slate-600 font-medium italic">"{proj.feedback}"</p>
                                  <p className="text-slate-400 text-[8px] font-black">— {proj.client}</p>
                                </div>

                                {/* TOOLS LIST */}
                                <div className="flex flex-wrap items-center gap-1 text-[8.5px] font-bold text-slate-400">
                                  <span>Tools:</span>
                                  {proj.tech.map((tech, i) => (
                                    <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FORUM ACTIVITY STREAM OF FREELANCER */}
                      <div className="space-y-4 text-left">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Aktivitas Forum Terbaru</h4>
                        {userPosts.length === 0 ? (
                          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-400 text-xs">
                            Pengguna ini belum membagikan postingan apa pun di feed komunitas.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userPosts.map((post) => {
                              const hasLiked = post.likes?.includes(userEmail);
                              return (
                                <div key={post.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs space-y-2">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-slate-400 font-bold">{post.createdAt}</span>
                                    {isMe && (
                                      <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                                      >
                                        Hapus Post
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{post.content}</p>
                                  {renderPostAttachments(post.attachments)}
                                  <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold pt-2 border-t border-slate-50">
                                    <span>{post.likes?.length || 0} Suka</span>
                                    <span>{post.comments?.length || 0} Komentar</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* RIGHT COLUMN: TRUST GRAPHICS & DYNAMIC HIRE CONTRACT BUILDER */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* STATS AND CONFIDENCE METRIC */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Kredibilitas & Keaktifan</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold">Total Post Forum</span>
                            <span className="text-sm font-black text-slate-800">{userPosts.length}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold">Apresiasi Suka</span>
                            <span className="text-sm font-black text-slate-800">{totalLikesReceived} Suka</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold">Status Membership</span>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                              {selectedUser.plan === "Premium" ? "Premium Pro" : "Starter"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold">Member Sejak</span>
                            <span className="text-xs font-mono font-bold text-slate-600">{selectedUser.registeredAt?.split(",")[0] || "15 Jul 2026"}</span>
                          </div>
                        </div>

                        {/* VERIFIED BRANDING SHIELD */}
                        <div className="bg-indigo-950 text-indigo-200 rounded-2xl p-4 border border-slate-800 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <Shield className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Metode Jaminan Jasa</span>
                          </div>
                          <p className="text-[9px] text-indigo-300 leading-normal font-medium">
                            Setiap proposal penawaran kerja yang disepakati melalui formulir resmi dilindungi oleh ketentuan anti-penipuan di Portal Freelance Indonesia.
                          </p>
                        </div>
                      </div>

                      {/* INTERACTIVE CONTRACT OFFER / HIRE PROPOSAL BUILDER */}
                      <div 
                        id="hire-proposal-form" 
                        className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden text-left"
                      >
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="space-y-1 relative z-10">
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <Zap className="h-4 w-4" />
                            <h5 className="text-xs font-black uppercase tracking-wider">Ajukan Penawaran Kerja Resmi</h5>
                          </div>
                          <p className="text-[10px] text-slate-400">Kirim proposal proyek terstruktur langsung ke kotak pesan @{userAlias}</p>
                        </div>

                        {proposalSuccess && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-3.5 rounded-2xl text-xs space-y-2 relative z-10"
                          >
                            <p className="font-extrabold flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              Proposal Sukses Dikirim!
                            </p>
                            <p className="text-[10px] text-emerald-400 font-medium">
                              Proposal kerja sama Anda telah sukses dikirim ke pesan pribadi @{userAlias}. Buka kotak pesan pribadi Anda untuk melacak penawaran ini.
                            </p>
                            <button
                              onClick={() => {
                                setActiveDashboardTab("social");
                                setSocialSubTab("messages");
                                setActiveMessageUserEmail(selectedUser.email);
                              }}
                              className="w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer block mt-1"
                            >
                              Buka Percakapan Pesan
                            </button>
                          </motion.div>
                        )}

                        {isMe ? (
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed space-y-2 relative z-10">
                            <p className="font-extrabold text-slate-300">💡 Ini Adalah Pratinjau Halaman Anda</p>
                            <p className="text-[10px]">
                              Pengguna lain yang mengunjungi landing page ini dapat melihat form penawaran di atas untuk mengirim proyek kepada Anda secara resmi. Pastikan deskripsi dan daftar jasa Anda tetap diperbarui!
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleSendWorkProposal} className="space-y-3 relative z-10">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nama Proyek / Pekerjaan</label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: Pembuatan Website Toko Roti"
                                value={proposalTitle}
                                onChange={(e) => setProposalTitle(e.target.value)}
                                className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium placeholder-slate-600"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Anggaran (IDR)</label>
                                <input
                                  type="number"
                                  required
                                  placeholder="Contoh: 3000000"
                                  value={proposalBudget}
                                  onChange={(e) => setProposalBudget(e.target.value)}
                                  className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium placeholder-slate-600"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Est. Waktu (Hari)</label>
                                <select
                                  value={proposalDeliveryTime}
                                  onChange={(e) => setProposalDeliveryTime(e.target.value)}
                                  className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold"
                                >
                                  <option value="1">1 Hari Kerja</option>
                                  <option value="3">3 Hari Kerja</option>
                                  <option value="7">7 Hari Kerja</option>
                                  <option value="14">14 Hari Kerja</option>
                                  <option value="30">30 Hari Kerja</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Detail Pekerjaan & Kebutuhan</label>
                              <textarea
                                required
                                rows={3}
                                placeholder="Tuliskan deskripsi ringkas tentang apa yang perlu dikerjakan oleh freelancer..."
                                value={proposalDetails}
                                onChange={(e) => setProposalDetails(e.target.value)}
                                className="w-full text-xs border border-slate-800 bg-slate-950 text-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium placeholder-slate-600 resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={!proposalTitle.trim() || !proposalDetails.trim() || !proposalBudget}
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-800/50"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Kirim Proposal Resmi</span>
                            </button>
                          </form>
                        )}
                      </div>

                      {/* FEATURED TRUSTED TESTIMONIALS */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <h4 className="text-xs font-black uppercase tracking-wider">Ulasan & Testimoni</h4>
                        </div>
                        <div className="space-y-3 text-[10.5px]">
                          <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex text-amber-400 font-bold">★★★★★</div>
                            <p className="text-slate-600 font-medium italic">"Komunikasi sangat lancar dan mengerti kebutuhan bisnis kami dengan baik. Hasil pengerjaan melampaui ekspektasi."</p>
                            <p className="text-slate-400 text-[8.5px] font-black">— Rina Wijaya (Marketing Lead)</p>
                          </div>
                          <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex text-amber-400 font-bold">★★★★★</div>
                            <p className="text-slate-600 font-medium italic">"Sangat profesional dan pengerjaan tepat waktu! Hasil kerja sangat rapi dan mudah dimodifikasi kembali."</p>
                            <p className="text-slate-400 text-[8.5px] font-black">— Budi Santoso (CEO TechCorp)</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

      </div>
    ) : (
          /* ====================================================================
             LOGGED-OUT VISITOR SCREEN (LANDING LAYOUT WITH DYNAMIC CATEGORY MENU)
             ==================================================================== */
          <div className="space-y-8">
            
            {/* Visual Interactive Category Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                    Saring Berdasarkan Kategori Utama
                  </h3>
                  <p className="text-xs text-slate-400">Pilih salah satu menu visual di bawah untuk memfilter agenda kerja Anda.</p>
                </div>
                
                {activeTab !== "Semua" && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setActiveTab("Semua")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                  >
                    Reset Filter (Semua)
                  </motion.button>
                )}
              </div>

              {/* Visual Interactive Category Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(CATEGORY_IMAGES).map(([name, config]) => {
                  const IconComp = config.icon;
                  const isSelected = activeTab === name;

                  return (
                    <motion.div
                      key={name}
                      whileHover={{ 
                        y: -5, 
                        boxShadow: `0 12px 20px -8px ${config.glow}`,
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab(name)}
                      className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden select-none flex flex-col items-center text-center gap-3.5 ${
                        isSelected 
                          ? "bg-white border-indigo-500 ring-2 ring-indigo-500/10 shadow-md" 
                          : "bg-white hover:bg-slate-50/50 border-slate-200/80 shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/40 to-transparent pointer-events-none" />
                      )}

                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} border flex items-center justify-center shadow-inner relative z-10 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                        <IconComp className="h-6 w-6 stroke-[2]" />
                      </div>

                      <div className="space-y-1 relative z-10">
                        <p className={`text-xs font-black tracking-wide ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                          {name === "Development" ? "Dev & Code" : name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold leading-none">{config.desc}</p>
                      </div>

                      {isSelected && (
                        <motion.div 
                          layoutId="activeIndicatorBar"
                          className="absolute bottom-0 left-4 right-4 h-1 bg-indigo-600 rounded-t-full"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Main Page Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left panel - Project Value Estimator */}
              <section className="lg:col-span-5 space-y-6">
                
                {/* Estimator Card */}
                <motion.div 
                  whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.05)" }}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-6 transition-shadow duration-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <h2 className="font-bold text-slate-800 text-sm">Estimator Nilai Proyek</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Tarif Per Jam (USD)</span>
                        <span className="text-indigo-600 font-bold">${hourlyRate}/jam</span>
                      </div>
                      <motion.input 
                        whileHover={{ scaleY: 1.2 }}
                        type="range" 
                        min="10" 
                        max="200" 
                        step="5"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer transition-all duration-150"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Estimasi Durasi Kerja</span>
                        <span className="text-indigo-600 font-bold">{projectHours} Jam</span>
                      </div>
                      <motion.input 
                        whileHover={{ scaleY: 1.2 }}
                        type="range" 
                        min="1" 
                        max="160" 
                        value={projectHours}
                        onChange={(e) => setProjectHours(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer transition-all duration-150"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pendapatan</span>
                      <motion.span 
                        key={totalValue}
                        initial={{ scale: 1.15, color: "#4f46e5" }}
                        animate={{ scale: 1, color: "#0f172a" }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="text-2xl font-extrabold tracking-tight block"
                      >
                        ${totalValue.toLocaleString()}
                      </motion.span>
                    </div>
                    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg cursor-default select-none">
                      Kalkulasi Instan
                    </div>
                  </div>
                </motion.div>

                {/* Locked Premium Notice */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-400" />
                    <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">Dashboard User Dikunci</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Masuk ke akun Anda sekarang untuk membuka fitur <strong>Unggah Lampiran</strong> dan <strong>Unduh Dokumen Klien</strong> di dalam Laman Dashboard terproteksi Anda.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModal("login")}
                    className="w-full bg-indigo-600 text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    Buka Dashboard Sekarang
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </motion.div>

              </section>

              {/* Right panel - Dynamic Task Manager */}
              <section className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                    <h2 className="font-bold text-slate-800 text-sm">
                      Agenda Fokus: <span className="text-indigo-600">{activeTab}</span>
                    </h2>
                  </div>
                  
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                    Selesai {completedCount} / {filteredTasks.length}
                  </span>
                </div>

                {/* Add Task Form */}
                <form onSubmit={addTask} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder={`Tambah agenda baru untuk ${activeTab === "Semua" ? "Development" : activeTab}...`}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  />

                  <select 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-600 font-medium cursor-pointer"
                  >
                    <option value="Development">Dev</option>
                    <option value="Desain">Desain</option>
                    <option value="Finansial">Finansial</option>
                    <option value="Rapat">Rapat</option>
                  </select>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-indigo-600 text-white rounded-xl px-3.5 py-2.5 hover:bg-indigo-700 font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-100"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </form>

                {/* Task list with animation */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredTasks.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20"
                      >
                        <CheckCircle2 className="h-8 w-8 mx-auto stroke-1 text-indigo-500" />
                        <p className="text-xs font-semibold text-slate-500">Tidak ada agenda fokus di kategori ini!</p>
                      </motion.div>
                    ) : (
                      filteredTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -20 }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          whileHover={{ scale: 1.01, x: 2 }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            task.completed 
                              ? "bg-slate-50/70 border-slate-100 text-slate-400" 
                              : "bg-white border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <motion.button 
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                task.completed 
                                  ? "bg-indigo-600 border-indigo-600 text-white" 
                                  : "border-slate-300 hover:border-indigo-500 bg-white"
                              }`}
                            >
                              {task.completed && <span className="text-[10px] font-black">✓</span>}
                            </motion.button>

                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${task.completed ? "line-through opacity-70" : ""}`}>
                                {task.title}
                              </p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                task.category === "Development" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/20" :
                                task.category === "Desain" ? "bg-purple-50 text-purple-700 border border-purple-200/20" :
                                task.category === "Finansial" ? "bg-rose-50 text-rose-700 border border-rose-200/20" :
                                "bg-blue-50 text-blue-700 border border-blue-200/20"
                              }`}>
                                {task.category}
                              </span>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-2"
                            title="Hapus Agenda"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

              </section>

            </div>

          </div>
        )}

      </main>

      {/* Floating Modals for Login, Register, Features, and Pricing */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-200 shadow-2xl relative z-10 space-y-6"
            >
              
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Login Modal */}
              {activeModal === "login" && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Masuk Laman User</h3>
                    <p className="text-xs text-slate-500">Akses file upload, unduh, dan data dashboard Anda</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        placeholder="Adek Burong"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Workspace</label>
                      <input 
                        type="email" 
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="adek.burong@gmail.com"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kata Sandi</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Masuk & Buka Dashboard
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atau masuk dengan</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      ) : (
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                      )}
                      <span>Masuk Otomatis dengan Google</span>
                    </motion.button>

                    {gsuiteError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{gsuiteError}</span>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Register Modal */}
              {activeModal === "register" && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Daftar Akun Baru</h3>
                    <p className="text-xs text-slate-500">Dapatkan akses premium workspace instan</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required 
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        placeholder="Nama Anda"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Baru</label>
                      <input 
                        type="email" 
                        required 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kata Sandi</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Minimum 8 karakter"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Paket Akun</label>
                      <select 
                        value={registerPlan}
                        onChange={(e) => setRegisterPlan(e.target.value as "Starter" | "Premium")}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="Premium">Elite Pro Plan ($19/bln - Uji Coba Gratis)</option>
                        <option value="Starter">Starter Plan (Gratis / Terbatas)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Buat Akun & Masuk
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atau daftar dengan</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      ) : (
                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                      )}
                      <span>Daftar Otomatis dengan Google</span>
                    </motion.button>

                    {gsuiteError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{gsuiteError}</span>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Features Modal */}
              {activeModal === "features" && (
                <div className="space-y-5">
                  <div className="space-y-1 text-center">
                    <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Keunggulan Utama</h3>
                    <p className="text-xs text-slate-500">Segala kemudahan dalam satu platform workspace</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-all">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <UploadCloud className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Manajemen Berkas Instan</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Unggah proposal desain, laporan kerja, dan simpan di lokal storage aman.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-all">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Unduh Data Terstruktur</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Ekspor daftar tugas harian Anda langsung menjadi berkas JSON sekali klik.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-all">
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Laman User Terlindungi</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Amankan semua tarif proyek harian Anda di bawah akun workspace kredensial.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Modal */}
              {activeModal === "pricing" && (
                <div className="space-y-5">
                  <div className="space-y-1 text-center">
                    <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Star className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Rencana Harga</h3>
                    <p className="text-xs text-slate-500">Skema pengerjaan pas untuk para profesional</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50 text-center">
                      <h4 className="text-xs font-bold text-slate-700">Starter Plan</h4>
                      <p className="text-lg font-black text-slate-900">$0 <span className="text-[9px] text-slate-400 font-normal">/bln</span></p>
                      <p className="text-[9px] text-slate-500 leading-tight">Penyimpanan lokal, 4 kategori visual</p>
                    </div>

                    <div className="border border-indigo-200 rounded-2xl p-4 space-y-2 bg-indigo-50/20 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">POPULER</div>
                      <h4 className="text-xs font-bold text-indigo-950">Elite Pro</h4>
                      <p className="text-lg font-black text-indigo-950">$19 <span className="text-[9px] text-indigo-400 font-normal">/bln</span></p>
                      <p className="text-[9px] text-indigo-600 leading-tight">Unggah file maks 10MB, export JSON harian</p>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center">Mode simulasi login kami mengizinkan Anda mencoba fitur Elite Pro secara gratis.</p>
                </div>
              )}

              {/* Edit Profile Modal */}
              {activeModal === "edit-profile" && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Settings className="h-5 w-5 animate-spin-slow" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Perbarui Profil Freelancer</h3>
                    <p className="text-xs text-slate-500">Sesuaikan data bio, deskripsi & pilih visual kartu</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Nama Lengkap Anda"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bio Singkat</label>
                      <input 
                        type="text" 
                        required 
                        value={tempBio}
                        onChange={(e) => setTempBio(e.target.value)}
                        placeholder="Bio singkat Anda..."
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deskripsi Kerja</label>
                      <textarea 
                        required 
                        rows={2}
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        placeholder="Deskripsi pengerjaan proyek harian Anda..."
                        className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Tema Kartu Profil (Avatar)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setTempAvatar(preset.id)}
                            className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                              tempAvatar === preset.id
                                ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/10"
                                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                            }`}
                          >
                            <div className={`h-8 w-8 rounded-lg ${preset.classes} flex items-center justify-center text-white text-[10px] font-extrabold uppercase shadow-sm`}>
                              {(tempName || userName || "U").charAt(0)}
                            </div>
                            <span className="text-[9px] font-black text-slate-600 capitalize">
                              {preset.id.replace("-", " ")}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Batal
                      </button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Simpan Profil
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Image Preview Modal */}
      <AnimatePresence>
        {previewImageFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImageFile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                    <Image className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-800 truncate" title={previewImageFile.name}>
                      Pratinjau: {previewImageFile.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Oleh:{" "}
                      {previewImageFile.ownerEmail ? (
                        <button
                          onClick={() => {
                            handleOpenProfileTab(previewImageFile.ownerEmail!);
                            setPreviewImageFile(null);
                          }}
                          className="text-indigo-600 hover:underline hover:text-indigo-700 font-bold cursor-pointer"
                          title={`Lihat profil ${previewImageFile.ownerName}`}
                        >
                          {previewImageFile.ownerName}
                        </button>
                      ) : (
                        <span>{previewImageFile.ownerName || "Sistem"}</span>
                      )}{" "}
                      • {previewImageFile.size} • {previewImageFile.visibility === "public" ? "Publik 🌐" : "Privat 🔒"}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setPreviewImageFile(null)}
                  className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Image Box */}
              <div className="flex-1 bg-slate-950/5 p-8 flex items-center justify-center overflow-auto min-h-[250px] max-h-[500px]">
                {previewImageFile.dataUrl ? (
                  <img 
                    src={previewImageFile.dataUrl} 
                    alt={previewImageFile.name} 
                    className="max-w-full max-h-[400px] object-contain rounded-xl shadow-md border border-slate-100/50 select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Gagal memuat pratinjau</p>
                      <p className="text-[10px] text-slate-400">Berkas ini tidak memiliki data visual yang valid.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[10px] text-slate-400 font-semibold text-center sm:text-left">
                  Tipe File: <span className="font-mono">{previewImageFile.type}</span> • Diunggah: {previewImageFile.uploadedAt}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPreviewImageFile(null)}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => triggerDownload(previewImageFile)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh Berkas
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/75 py-5 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <p>© 2026 Freelancer Portal Enterprise Hub. Semua Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <a onClick={() => setActiveModal("features")} className="hover:text-slate-700 cursor-pointer">Keunggulan</a>
            <a onClick={() => setActiveModal("pricing")} className="hover:text-slate-700 cursor-pointer">Harga</a>
            <a onClick={resetAll} className="hover:text-rose-600 cursor-pointer">Atur Ulang</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
