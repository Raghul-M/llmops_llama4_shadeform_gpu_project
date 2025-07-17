import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Star,
  Archive,
  MessageSquare,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  isStarred: boolean;
  messageCount: number;
}

interface ChatHistoryProps {
  isOpen: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
}

export const ChatHistory = ({ isOpen, onNewChat, onSelectChat, currentChatId }: ChatHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'CI/CD Pipeline Best Practices',
      timestamp: new Date('2024-01-16T10:30:00'),
      preview: 'How to set up a robust CI/CD pipeline for microservices...',
      isStarred: true,
      messageCount: 12
    },
    {
      id: '2',
      title: 'Docker Container Optimization',
      timestamp: new Date('2024-01-15T14:20:00'),
      preview: 'What are the best practices for optimizing Docker containers...',
      isStarred: false,
      messageCount: 8
    },
    {
      id: '3',
      title: 'Kubernetes Troubleshooting',
      timestamp: new Date('2024-01-14T09:15:00'),
      preview: 'How to debug pod failures in Kubernetes...',
      isStarred: false,
      messageCount: 15
    },
    {
      id: '4',
      title: 'AWS Infrastructure Interview',
      timestamp: new Date('2024-01-13T16:45:00'),
      preview: 'Common AWS infrastructure interview questions...',
      isStarred: true,
      messageCount: 20
    }
  ]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSessions = {
    today: filteredSessions.filter(session => isToday(session.timestamp)),
    yesterday: filteredSessions.filter(session => isYesterday(session.timestamp)),
    lastWeek: filteredSessions.filter(session => isLastWeek(session.timestamp)),
    older: filteredSessions.filter(session => !isToday(session.timestamp) && !isYesterday(session.timestamp) && !isLastWeek(session.timestamp))
  };

  function isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isYesterday(date: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  function isLastWeek(date: Date) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date > weekAgo && date < yesterday;
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  const SessionGroup = ({ title, sessions }: { title: string; sessions: ChatSession[] }) => {
    if (sessions.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`
                group relative flex items-start p-3 rounded-lg cursor-pointer transition-smooth
                hover:bg-muted/50 ${currentChatId === session.id ? 'bg-muted border border-border' : ''}
              `}
              onClick={() => onSelectChat(session.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium truncate pr-2 flex items-center gap-2">
                    {session.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
                    <span className="truncate">{session.title}</span>
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        {session.isStarred ? 'Unstar' : 'Star'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-2">
                  {session.preview}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTime(session.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {session.messageCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar-bg w-80 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewChat}
          className="w-full btn-primary mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <>
            <SessionGroup title="Today" sessions={groupedSessions.today} />
            <SessionGroup title="Yesterday" sessions={groupedSessions.yesterday} />
            <SessionGroup title="Last 7 days" sessions={groupedSessions.lastWeek} />
            <SessionGroup title="Older" sessions={groupedSessions.older} />
          </>
        )}
      </div>
    </div>
  );
};