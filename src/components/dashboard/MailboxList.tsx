import type { Mailbox } from '@/types/email';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Send,
  File,
  Trash2,
  Archive,
  Star,
  Folder
} from 'lucide-react';

interface MailboxListProps {
  mailboxes: Mailbox[];
  selectedMailboxId: string;
  onSelectMailbox: (id: string) => void;
}

export function MailboxList({ mailboxes, selectedMailboxId, onSelectMailbox }: MailboxListProps) {
  
  const getIcon = (type: string, iconName?: string) => {
    switch (type) {
      case 'inbox': return <Inbox className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'drafts': return <File className="h-4 w-4" />;
      case 'trash': return <Trash2 className="h-4 w-4" />;
      case 'archive': return <Archive className="h-4 w-4" />;
      case 'custom': 
        if (iconName === 'Star') return <Star className="h-4 w-4" />;
        return <Folder className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-1 py-2">
      <h2 className="px-4 py-2 text-lg font-semibold tracking-tight">
        Mailboxes
      </h2>
      <nav className="grid gap-1 px-2">
        {mailboxes.map((mailbox) => (
          <button
            key={mailbox.id}
            onClick={() => onSelectMailbox(mailbox.id)}
            className={cn(
              "flex items-center justify-between whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              selectedMailboxId === mailbox.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted hover:text-accent-foreground text-gray-600"
            )}
          >
            <div className="flex items-center gap-3">
              {getIcon(mailbox.type, mailbox.icon)}
              <span>{mailbox.name}</span>
            </div>
            {mailbox.unreadCount && mailbox.unreadCount > 0 && (
              <span className={cn(
                "ml-auto text-xs",
                selectedMailboxId === mailbox.id 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground"
              )}>
                {mailbox.unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

