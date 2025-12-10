import apiClient from './apiClient';

// Backend types matching the API
export interface Mailbox {
  id: number;
  email: string;
  provider: 'gmail';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  lastSyncAt: string | null;
  totalEmails: number;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Email {
  id: number;
  mailboxId: number;
  gmailMessageId: string;
  gmailThreadId: string;
  subject: string | null;
  snippet: string | null;
  fromEmail: string;
  fromName: string | null;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
  taskStatus: 'none' | 'todo' | 'in_progress' | 'done';
  isPinned: boolean;
  isSnoozed: boolean;
  snoozedUntil: string | null;
  aiSummary?: string | null;
}

export interface EmailDetail extends Email {
  toEmails: string[] | null;
  ccEmails: string[] | null;
  bccEmails: string[] | null;
  bodyHtml: string | null;
  bodyText: string | null;
  labels: string[] | null;
  taskDeadline: string | null;
  attachments?: Attachment[];
  aiActionItems?: string[] | null;
  aiUrgencyScore?: number | null;
}

export interface Attachment {
  id: number;
  emailId: number;
  gmailAttachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  isInline: boolean;
  contentId: string | null;
}

export interface PaginatedEmails {
  data: Email[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    last: string;
    current: string;
    next: string | null;
    previous: string | null;
  };
}

export interface EmailQueryParams {
  page?: number;
  limit?: number;
  mailboxId?: number; // Changed from string to number
  search?: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  category?: string;
  taskStatus?: string;
  fromEmail?: string;
  label?: string;
  sortBy?: 'receivedAt' | 'subject' | 'fromEmail';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateEmailData {
  isRead?: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  taskStatus?: 'none' | 'todo' | 'in_progress' | 'done';
  taskDeadline?: string;
  snoozedUntil?: string | null;
}

export interface ConnectMailboxData {
  code: string;
  codeVerifier?: string;
}

export interface SendEmailData {
  mailboxId: number;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  inReplyTo?: string;
  threadId?: string;
}

export interface SummarizeEmailResponse {
  emailId: number;
  summary: string;
  saved: boolean;
}

export const emailApi = {
  // Mailbox operations
  getMailboxes: async (): Promise<Mailbox[]> => {
    const response = await apiClient.get<Mailbox[]>('/mailboxes');
    return response.data;
  },

  getMailbox: async (mailboxId: number): Promise<Mailbox> => {
    const response = await apiClient.get<Mailbox>(`/mailboxes/${mailboxId}`);
    return response.data;
  },

  connectGmailMailbox: async (data: ConnectMailboxData): Promise<Mailbox> => {
    const response = await apiClient.post<Mailbox>('/mailboxes/connect', data);
    return response.data;
  },

  syncMailbox: async (mailboxId: number): Promise<void> => {
    await apiClient.post(`/mailboxes/${mailboxId}/sync`);
  },

  disconnectMailbox: async (mailboxId: number): Promise<void> => {
    await apiClient.delete(`/mailboxes/${mailboxId}`);
  },

  // Email operations
  getEmails: async (params: EmailQueryParams = {}): Promise<PaginatedEmails> => {
    const response = await apiClient.get<PaginatedEmails>('/emails', { params });
    return response.data;
  },

  getEmail: async (emailId: number): Promise<EmailDetail> => {
    const response = await apiClient.get<EmailDetail>(`/emails/${emailId}`);
    return response.data;
  },

  sendEmail: async (data: SendEmailData): Promise<{ messageId: string }> => {
    const response = await apiClient.post<{ messageId: string }>('/emails/send', data);
    return response.data;
  },

  updateEmail: async (emailId: number, data: UpdateEmailData): Promise<EmailDetail> => {
    const response = await apiClient.patch<EmailDetail>(`/emails/${emailId}`, data);
    return response.data;
  },

  deleteEmail: async (emailId: number): Promise<void> => {
    await apiClient.delete(`/emails/${emailId}`);
  },

  summarizeEmail: async (emailId: number): Promise<SummarizeEmailResponse> => {
    const response = await apiClient.post<SummarizeEmailResponse>(`/emails/${emailId}/summarize`);
    return response.data;
  },

  // Attachment operations
  getAttachment: async (attachmentId: number): Promise<Blob> => {
    const response = await apiClient.get(`/attachments/${attachmentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadAttachment: async (attachmentId: number, filename: string): Promise<void> => {
    const blob = await emailApi.getAttachment(attachmentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
