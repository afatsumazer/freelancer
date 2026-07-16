import { ComponentType } from "react";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
  ownerEmail?: string;
  ownerName?: string;
  visibility?: "private" | "public";
}

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Premium";
  role: "user" | "admin";
  bio: string;
  description: string;
  avatar: string; // Preset name or URL
  registeredAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // "user", "client_budi", "client_rani", "support_bot"
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  isIncoming: boolean;
}

export interface CategoryConfig {
  gradient: string;
  glow: string;
  icon: ComponentType<any>;
  desc: string;
}

export interface SocialComment {
  id: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface PostAttachment {
  id: string;
  type: "image" | "video" | "link" | "file";
  url: string;
  name?: string;
  size?: string;
}

export interface SocialPost {
  id: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[]; // array of user emails
  comments: SocialComment[];
  attachments?: PostAttachment[];
}

export interface PrivateMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar: string;
  receiverEmail: string;
  receiverName: string;
  receiverAvatar: string;
  content: string;
  createdAt: string;
  read: boolean;
}
