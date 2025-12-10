import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi, type EmailQueryParams, type UpdateEmailData } from '@/services/emailApi';

export const useMailboxes = () => {
  const query = useQuery({
    queryKey: ['mailboxes'],
    queryFn: emailApi.getMailboxes,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchInterval: (query) => {
      // Poll every 3 seconds if any mailbox is syncing
      const mailboxes = query.state.data as any[] | undefined;
      const isSyncing = mailboxes?.some(m => 
        m.syncStatus === 'syncing' || m.syncStatus === 'pending'
      );
      return isSyncing ? 3000 : false;
    },
  });
  return query; // This includes data, isLoading, refetch, etc.
};

export const useEmails = (params: EmailQueryParams = {}) => {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: () => emailApi.getEmails(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

export const useEmail = (id: number | null) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailApi.getEmail(id!),
    enabled: !!id, // Only fetch if id is present
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};

export const useEmailMutations = () => {
  const queryClient = useQueryClient();

  const updateEmail = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmailData }) =>
      emailApi.updateEmail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const toggleStar = useMutation({
    mutationFn: ({ id, isStarred }: { id: number; isStarred: boolean }) =>
      emailApi.updateEmail(id, { isStarred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) => 
      emailApi.updateEmail(id, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] }); // Unread count might change
    },
  });

  const deleteEmail = useMutation({
    mutationFn: (id: number) => emailApi.deleteEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const syncMailbox = useMutation({
    mutationFn: (mailboxId: number) => emailApi.syncMailbox(mailboxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  const connectMailbox = useMutation({
    mutationFn: (data: { code: string; codeVerifier?: string }) => 
      emailApi.connectGmailMailbox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const sendEmail = useMutation({
    mutationFn: (data: {
      mailboxId: number;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      bodyHtml?: string;
      inReplyTo?: string;
      threadId?: string;
    }) => emailApi.sendEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  const summarizeEmail = useMutation({
    mutationFn: (emailId: number) => emailApi.summarizeEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
  });

  return {
    updateEmail,
    toggleStar,
    markAsRead,
    deleteEmail,
    syncMailbox,
    connectMailbox,
    sendEmail,
    summarizeEmail,
  };
};

