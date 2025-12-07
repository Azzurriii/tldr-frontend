import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Trash2, 
  MoreVertical, 
  Star, 
  Clock,
  CornerUpLeft,
  Download
} from 'lucide-react';
import { ComposeEmailModal } from './ComposeEmailModal';
import apiClient from '@/services/apiClient';
import { useEmailMutations } from '@/hooks/useEmail';

interface EmailDetailProps {
  email: any; // Backend email detail type
  mailboxId: number;
  onClose?: () => void; // For mobile view
}

export function EmailDetail({ email, mailboxId, onClose }: EmailDetailProps) {
  const [composeMode, setComposeMode] = useState<'compose' | 'reply' | 'replyAll' | 'forward' | null>(null);
  const { toggleStar, markAsRead, deleteEmail } = useEmailMutations();
  
  const handleToggleStar = () => {
    if (email) {
      toggleStar.mutate({ id: email.id, isStarred: !email.isStarred });
    }
  };

  const handleDelete = () => {
    if (email && confirm('Are you sure you want to delete this email?')) {
      deleteEmail.mutate(email.id);
    }
  };
  
  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const response = await apiClient.get(`/attachments/${attachmentId}`, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      alert('Failed to download attachment. Please try again.');
    }
  };
  
  // Reset compose mode and mark as read when email changes
  useEffect(() => {
    setComposeMode(null);
    if (email && !email.isRead) {
      markAsRead.mutate({ id: email.id, isRead: true });
    }
  }, [email?.id]);
  
  console.log('EmailDetail - mailboxId:', mailboxId, 'email:', email);
  
  if (!email) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8 text-center bg-gray-50/50">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
            <CornerUpLeft className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Select an email to read</h3>
        <p className="max-w-xs">Click on an email from the list to view its contents here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Actions Header */}
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          {onClose && (
             <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
               <CornerUpLeft className="h-4 w-4" />
             </Button>
          )}
          <Button variant="ghost" size="icon" title="Reply" onClick={() => setComposeMode('reply')}>
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Reply All" onClick={() => setComposeMode('replyAll')}>
            <ReplyAll className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Forward" onClick={() => setComposeMode('forward')}>
            <Forward className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              title={email.isStarred ? "Unstar" : "Star"}
              onClick={handleToggleStar}
            >
                <Star className={cn(
                  "h-4 w-4",
                  email.isStarred ? 'text-yellow-400 fill-yellow-400' : ''
                )} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50" 
              title="Delete"
              onClick={handleDelete}
              disabled={deleteEmail.isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Email Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
           <h1 className="text-2xl font-bold leading-tight">{email.subject || '(No subject)'}</h1>
           {email.labels && email.labels.length > 0 && (
               <div className="flex gap-2">
                   {email.labels.map((label: string) => (
                       <span key={label} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{label}</span>
                   ))}
               </div>
           )}
        </div>
        
        <div className="flex items-start gap-4 mb-6">
          <Avatar>
            <AvatarImage src={undefined} />
            <AvatarFallback>{(email.fromName || email.fromEmail).charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <div className="font-semibold">{email.fromName || email.fromEmail}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(email.receivedAt).toLocaleString()}
                </div>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {`<${email.fromEmail}>`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
                To: <span className="text-gray-700">{email.toEmails && email.toEmails.length > 0 ? email.toEmails.join(', ') : 'Me'}</span>
            </div>
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Email Body */}
        <div 
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.snippet || '' }}
        />
        
        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
            <div className="mt-8 p-4 border rounded bg-gray-50">
                <p className="text-sm font-medium mb-2">
                  Attachments ({email.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                    {email.attachments.map((attachment: any) => (
                        <button
                            key={attachment.id}
                            onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                            className="group flex items-center gap-2 p-3 bg-white border rounded hover:border-blue-500 hover:shadow-sm transition-all max-w-xs cursor-pointer"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-semibold">
                                {attachment.filename.split('.').pop()?.toUpperCase() || 'FILE'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                                    {attachment.filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                    ))}
                </div>
            </div>
        )}

      </div>
      
      {/* Compose Modal - Only render when email exists */}
      {email && (
        <ComposeEmailModal
          isOpen={composeMode !== null}
          onClose={() => setComposeMode(null)}
          mode={composeMode || 'compose'}
          mailboxId={mailboxId}
          originalEmail={{
            subject: email.subject,
            fromEmail: email.fromEmail,
            fromName: email.fromName,
            toEmails: email.toEmails,
            ccEmails: email.ccEmails,
            bodyHtml: email.bodyHtml,
            bodyText: email.bodyText,
            gmailMessageId: email.gmailMessageId,
            gmailThreadId: email.gmailThreadId,
          }}
        />
      )}
    </div>
  );
}

