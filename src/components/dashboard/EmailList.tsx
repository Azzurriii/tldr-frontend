import { cn } from '@/lib/utils';
import { Search, RotateCw, CheckSquare, Trash2, MailOpen, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { List } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { useRef, useEffect } from 'react';
import { useEmailMutations } from '@/hooks/useEmail';

interface EmailListProps {
  emails: any[]; // Backend email type
  selectedEmailId: number | null;
  onSelectEmail: (id: number) => void;
  isLoading: boolean;
  isSyncing?: boolean;
  onSearch: (term: string) => void;
  onRefresh: () => void;
  page: number;
  totalEmails: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// Helper for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export function EmailList({ 
  emails, 
  selectedEmailId, 
  onSelectEmail, 
  isLoading,
  isSyncing = false,
  onSearch,
  onRefresh,
  page,
  totalEmails,
  pageSize,
  onPageChange,
}: EmailListProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleStar, markAsRead } = useEmailMutations();

  const handleToggleStar = (e: React.MouseEvent, emailId: number, isStarred: boolean) => {
    e.stopPropagation();
    toggleStar.mutate({ id: emailId, isStarred: !isStarred });
  };

  const handleToggleRead = (e: React.MouseEvent, emailId: number, isRead: boolean) => {
    e.stopPropagation();
    markAsRead.mutate({ id: emailId, isRead: !isRead });
  };

  // Scroll to selected email when it changes
  useEffect(() => {
    if (selectedEmailId && listRef.current) {
      const index = emails.findIndex(e => e.id === selectedEmailId);
      if (index !== -1) {
        listRef.current.scrollToRow(index);
      }
    }
  }, [selectedEmailId, emails]);

  const totalPages = Math.ceil(totalEmails / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalEmails);

  console.log('Rendering EmailList with emails:', emails);
  // Email row renderer for react-virtualized
  const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const email = emails[index];
    if (!email) return null;

    return (
      <div
        key={key}
        style={style}
        onClick={() => onSelectEmail(email.id)}
        className={cn(
          "flex flex-col gap-1 px-4 py-3 cursor-pointer hover:bg-accent transition-colors border-b",
          selectedEmailId === email.id ? "bg-accent" : "bg-white",
          !email.isRead && "font-semibold bg-blue-50/50"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={(e) => handleToggleStar(e, email.id, email.isStarred)}
              className="flex-shrink-0 hover:scale-110 transition-transform"
              title={email.isStarred ? "Unstar" : "Star"}
            >
              <Star className={cn(
                "h-4 w-4",
                email.isStarred ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-400"
              )} />
            </button>
            <span className="font-medium truncate">{email.fromName || email.fromEmail}</span>
          </div>
          <span className={cn(
              "text-xs whitespace-nowrap",
              !email.isRead ? "text-blue-600" : "text-muted-foreground"
          )}>
            {formatDate(email.receivedAt)}
          </span>
        </div>
        <div className="text-sm truncate">{email.subject || '(No subject)'}</div>
        <div className="text-xs text-muted-foreground truncate">
          {email.snippet}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full border-r bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search mail (press / to focus)" 
            className="pl-8" 
            onChange={(e) => onSearch(e.target.value)}
            id="email-search-input"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh (r)">
          <RotateCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
        </Button>
      </div>

      {/* Sync Status Banner */}
      {isSyncing && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-sm text-blue-700">
          <RotateCw className="h-4 w-4 animate-spin" />
          <span>Syncing emails from Gmail...</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50/50">
        <Button variant="ghost" size="sm" className="h-8">
          <CheckSquare className="mr-2 h-4 w-4" /> Select
        </Button>
        <div className="ml-auto flex gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8" title="Mark as read">
                <MailOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete (#)">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden" ref={containerRef}>
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center space-x-4">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-[250px]" />
                   <Skeleton className="h-4 w-[200px]" />
                 </div>
               </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
            <p>No emails found</p>
          </div>
        ) : (
          <List
            ref={listRef}
            height={containerRef.current?.clientHeight || 600}
            rowCount={emails.length}
            rowHeight={95}
            width={containerRef.current?.clientWidth || 350}
            rowRenderer={rowRenderer}
            overscanRowCount={5}
            scrollToIndex={selectedEmailId ? emails.findIndex(e => e.id === selectedEmailId) : undefined}
          />
        )}
      </div>
      
      {/* Pagination */}
      <div className="p-2 border-t flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50">
        <span>
          {totalEmails > 0 ? `${startIndex}-${endIndex} of ${totalEmails}` : 'No emails'}
        </span>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            title="Previous page (k)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 flex items-center">{page}/{totalPages || 1}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            title="Next page (j)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

