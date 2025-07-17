import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check,
  Code,
  Server,
  Cloud,
  Settings,
  Shield,
  Database,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isCode?: boolean;
}

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchModels = async () => {
    try {
      setModelsLoading(true);
      console.log('Fetching models from /api/models (proxied to localhost:8000/models)...');
      
      const response = await fetch('/api/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const models = await response.json();
      console.log('Fetched models:', models);
      
      setAvailableModels(models);
      // Set first model as default
      if (models.length > 0) {
        setSelectedModel(models[0]);
      }
      
      toast({
        title: "Success",
        description: `Loaded ${models.length} models from API`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Detailed error fetching models:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      let errorMessage = "Failed to load available models. Using default models.";
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = "CORS error: Cannot connect to localhost:8000. Please check if the server supports CORS.";
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `Server error: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback to hardcoded models if API fails
      const fallbackModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'llama-2'];
      setAvailableModels(fallbackModels);
      setSelectedModel(fallbackModels[0]);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!selectedModel) {
      toast({
        title: "No Model Selected",
        description: "Please select a model before sending a message.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      console.log('Sending question to model:', selectedModel, 'Question:', currentInput);
      
      const response = await fetch(`/api/model_response?model_name=${encodeURIComponent(selectedModel)}&question=${encodeURIComponent(currentInput)}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer || 'No response received from the model.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error calling model API:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error while processing your request: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response from the model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };



  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: Code, label: 'CI/CD Pipeline', prompt: 'Tell me about CI/CD pipeline best practices' },
    { icon: Server, label: 'Docker & Containers', prompt: 'Explain Docker containerization concepts' },
    { icon: Cloud, label: 'Cloud Architecture', prompt: 'How do I design scalable cloud architecture?' },
    { icon: Settings, label: 'Infrastructure as Code', prompt: 'What are Terraform best practices?' },
    { icon: Shield, label: 'DevSecOps', prompt: 'How do I implement security in DevOps?' },
    { icon: Database, label: 'Monitoring & Logging', prompt: 'Best practices for monitoring microservices' },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex justify-center">
              <div className={`
                w-full max-w-3xl
                ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}
              `}>
                <div className={`
                  flex gap-3 max-w-[85%]
                  ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}
                `}>
                  {/* Avatar */}
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
                    ${message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted border border-border'}
                  `}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 relative group">
                    <div className={`
                      rounded-2xl px-4 py-3 relative
                      ${message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted border border-border'}
                    `}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Copy button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-background border border-border shadow-sm"
                        onClick={() => handleCopy(message.content, message.id)}
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>

                    {/* Timestamp */}
                    <div className={`
                      text-xs text-muted-foreground mt-1 px-2
                      ${message.type === 'user' ? 'text-right' : 'text-left'}
                    `}>
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-start">
              <div className="w-full max-w-3xl">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted border border-border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Welcome to DevOps Genie! 🧞‍♂️</h2>
              <p className="text-muted-foreground">
                Select a model and ask me anything about DevOps practices, tools, or interview preparation.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Quick start topics:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => setInput(action.prompt)}
                >
                  <action.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Model Selection */}
            <div className="flex-shrink-0">
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={modelsLoading}>
                <SelectTrigger className="w-40 h-[50px] bg-background">
                  {modelsLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select model" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about DevOps practices, tools, or interview questions..."
                className="min-h-[50px] max-h-32 resize-none pr-12 bg-background"
                rows={2}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                Enter to send, Shift+Enter for new line
              </div>
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="btn-primary h-[50px] px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};