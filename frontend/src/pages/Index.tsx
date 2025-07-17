import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ChatHistory } from '@/components/ChatHistory';
import { ChatInterface } from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string>('1');

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    // In a real app, this would create a new chat session
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // In a real app, this would load the selected chat history
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Toggle Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm border border-border shadow-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Chat History Sidebar */}
        <div className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}>
          <ChatHistory
            isOpen={isSidebarOpen}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            currentChatId={currentChatId}
          />
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ChatInterface className="flex-1" />
        </div>
      </div>
    </div>
  );
};

export default Index;
