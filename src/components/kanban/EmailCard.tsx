import { Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Clock,
  Star,
  Paperclip,
  Mail,
  MoreVertical,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmailMutations } from '@/hooks/useEmail';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailCardProps {
  email: any;
  index: number;
}

export function EmailCard({ email, index }: EmailCardProps) {
  const { toggleStar, markAsRead, updateEmail } = useEmailMutations();
  const navigate = useNavigate();

  const handleSnooze = (hours: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + hours);

    updateEmail.mutate(
      {
        id: email.id,
        data: { snoozedUntil: snoozeUntil.toISOString() },
      },
      {
        onSuccess: () => {
          toast.success(`Email snoozed for ${hours} hour(s)`);
        },
        onError: () => {
          toast.error('Failed to snooze email');
        },
      }
    );
  };

  const handleUnsnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    updateEmail.mutate(
      {
        id: email.id,
        data: { snoozedUntil: null },
      },
      {
        onSuccess: () => {
          toast.success('Email unsnoozed');
        },
        onError: () => {
          toast.error('Failed to unsnooze email');
        },
      }
    );
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar.mutate({ id: email.id, isStarred: !email.isStarred });
  };

  const handleCardClick = () => {
    navigate(`/inbox?emailId=${email.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Draggable draggableId={email.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            className={cn(
              'cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
              snapshot.isDragging && 'shadow-lg ring-2 ring-primary',
              !email.isRead && 'bg-blue-50/50 border-l-4 border-l-blue-500'
            )}
            onClick={handleCardClick}
          >
            <CardHeader className="p-4 pb-2">
              {/* Snooze Banner */}
              {email.isSnoozed && email.snoozedUntil && (
                <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-orange-700">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">
                      Until {new Date(email.snoozedUntil).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnsnooze}
                    className="h-5 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                  >
                    Unsnooze
                  </Button>
                </div>
              )}
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(email.fromName || email.fromEmail)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {email.fromName || email.fromEmail}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(email.receivedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleToggleStar}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        email.isStarred
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {email.isSnoozed ? (
                        <DropdownMenuItem onClick={handleUnsnooze}>
                          <Clock className="h-4 w-4 mr-2" />
                          Unsnooze
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={(e) => handleSnooze(1, e)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 1 hour
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(4, e)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 4 hours
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(24, e)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 1 day
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(72, e)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 3 days
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSnooze(168, e)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Snooze 1 week
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-2">
              {/* Subject */}
              <h4
                className={cn(
                  'font-medium text-sm line-clamp-2',
                  !email.isRead && 'font-bold'
                )}
              >
                {email.subject || '(No subject)'}
              </h4>

              {/* AI Summary or Snippet */}
              {email.aiSummary ? (
                <div className="flex items-start gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 flex-1">
                    {email.aiSummary}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {email.snippet || 'No preview available'}
                </p>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {!email.isRead && (
                  <Badge variant="secondary" className="text-xs">
                    <Mail className="h-3 w-3 mr-1" />
                    Unread
                  </Badge>
                )}
                {email.hasAttachments && (
                  <Badge variant="outline" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {email.attachments?.length || 1}
                  </Badge>
                )}
                {email.category && email.category !== 'primary' && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {email.category}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
