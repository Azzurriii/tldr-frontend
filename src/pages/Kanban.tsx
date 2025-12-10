import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useMailboxes, useEmails, useEmailMutations } from '@/hooks/useEmail';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const TOP_EMAILS_TO_SUMMARIZE = 5; // Summarize top 5 emails automatically

export function Kanban() {
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null);
  const [hasSummarized, setHasSummarized] = useState(false);
  const [summarizingCount, setSummarizingCount] = useState(0);

  // Fetch mailboxes
  const { data: mailboxes = [], isLoading: isLoadingMailboxes } = useMailboxes();
  
  // Get summarize mutation
  const { summarizeEmail } = useEmailMutations();

  // Set first mailbox as selected when mailboxes load
  useEffect(() => {
    if (mailboxes.length > 0 && selectedMailboxId === null) {
      setSelectedMailboxId(mailboxes[0].id);
    }
  }, [mailboxes, selectedMailboxId]);

  // Fetch all emails for the selected mailbox
  const { data: emailData, isLoading: isLoadingEmails } = useEmails({
    mailboxId: selectedMailboxId ?? undefined,
    limit: 50, // Get all emails
  });

  const emails = emailData?.data || [];
  const currentMailbox = mailboxes.find(m => m.id === selectedMailboxId);

  // Auto-summarize top emails when entering Kanban view
  useEffect(() => {
    if (!hasSummarized && emails.length > 0 && !isLoadingEmails) {
      const emailsWithoutSummary = emails
        .filter(email => !email.aiSummary && !email.snoozedUntil)
        .slice(0, TOP_EMAILS_TO_SUMMARIZE);

      if (emailsWithoutSummary.length > 0) {
        setHasSummarized(true);
        setSummarizingCount(emailsWithoutSummary.length);
        
        toast.info(`Generating AI summaries for ${emailsWithoutSummary.length} emails...`);

        // Summarize emails one by one to avoid overwhelming the API
        emailsWithoutSummary.forEach((email, index) => {
          setTimeout(() => {
            summarizeEmail.mutate(email.id, {
              onSuccess: () => {
                console.log(`Summary generated for email ${email.id}`);
                setSummarizingCount(prev => Math.max(0, prev - 1));
              },
              onError: (error) => {
                console.error(`Failed to summarize email ${email.id}:`, error);
                setSummarizingCount(prev => Math.max(0, prev - 1));
              },
            });
          }, index * 1000); // Stagger by 1 second each
        });
      }
    }
  }, [emails, hasSummarized, isLoadingEmails, summarizeEmail]);

  if (isLoadingMailboxes) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Email Kanban</h1>
              <p className="text-muted-foreground">
                Manage your emails with a visual workflow
              </p>
              {currentMailbox && (
                <p className="text-sm text-muted-foreground mt-2">
                  Mailbox: <span className="font-medium">{currentMailbox.email}</span>
                </p>
              )}
            </div>
            {summarizingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                <span className="text-sm text-purple-900 font-medium">
                  Generating {summarizingCount} {summarizingCount === 1 ? 'summary' : 'summaries'}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        {isLoadingEmails ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <KanbanBoard emails={emails} mailboxId={selectedMailboxId} />
        )}
      </div>
    </div>
  );
}
