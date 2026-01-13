
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { GoogleGenAI, Content, FunctionDeclaration, Tool, FunctionResponsePart, GenerateContentResponse } from '@google/genai';
import { ChatMessage, Order, User } from '../types';
import { SendIcon, XMarkIcon } from './icons';

interface ChatbotProps {
  onClose: () => void;
  systemInstruction: string;
  onNavigateToProduct: (productId: string) => void;
  tools: Tool[];
  orders: Order[];
  pendingProfit: number;
  currentUser: User | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, systemInstruction, onNavigateToProduct, tools, orders, pendingProfit, currentUser }) => {
  const getGreeting = () => {
    const userName = currentUser?.name ? ` ${currentUser.name.split(' ')[0]}` : '';
    return `مرحبا تاجرنا${userName}، شلون أقدر أساعدك اليوم؟`;
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: getGreeting() }
  ]);
  const [history, setHistory] = useState<Content[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    const userContent: Content = { role: 'user', parts: [{ text: input }] };
    const currentHistory = [...history, userContent];
    setInput('');
    setIsLoading(true);

    try {
      // FIX: Create a new GoogleGenAI instance for each API call to ensure the latest API key is used.
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: currentHistory,
        // FIX: The `tools` parameter must be inside the `config` object.
        config: { systemInstruction: systemInstruction, tools: tools },
      });

      const modelResponseContent = response.candidates?.[0]?.content;
      if (!modelResponseContent) throw new Error("No content in response");

      const historyAfterModelResponse = [...currentHistory, modelResponseContent];
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const toolResponseParts: FunctionResponsePart[] = [];

        for (const fc of functionCalls) {
            let result: any;
            if (fc.name === 'findOrder') {
                const { orderId, customerName, customerPhone } = fc.args as { orderId?: string, customerName?: string, customerPhone?: string }; // FIX: Add type assertions
                const foundOrder = orders.find(o => 
                    // FIX: Add type assertions to safely handle function call arguments, which are of type `unknown`.
                    (orderId && o.id.toLowerCase().includes(orderId.toLowerCase())) ||
                    (customerName && o.customer.name.toLowerCase().includes(customerName.toLowerCase())) ||
                    (customerPhone && o.customer.phone.includes(customerPhone))
                );
                
                if(foundOrder) {
                    const statusMap: Record<Order['status'], string> = {
                        under_implementation: 'قيد المراجعة',
                        shipped: 'قيد التوصيل',
                        completed: 'تم التسليم للزبون',
                        cancelled: 'ملغي',
                        rejected: 'مرفوض/راجع',
                        prepared: 'تم التجهيز',
                        postponed: 'مؤجل',
                        partially_delivered: 'واصل جزئي'
                    };
                    result = `تم العثور على الطلب. رقم الطلب: ${foundOrder.id}, حالة الطلب الحالية: ${statusMap[foundOrder.status]}.`;
                } else {
                    result = "عذراً، لم أتمكن من العثور على طلب يطابق المعلومات التي قدمتها. يرجى التأكد من المعلومات والمحاولة مرة أخرى.";
                }
                 // FIX: Corrected the structure for a function response part. The error likely stemmed from sending this part with an incorrect role.
                 toolResponseParts.push({ functionResponse: { name: 'findOrder', response: { result } } });
            } else if (fc.name === 'getPendingProfit') {
                result = { profit: pendingProfit };
                // FIX: Corrected the structure for a function response part. The error likely stemmed from sending this part with an incorrect role.
                toolResponseParts.push({ functionResponse: { name: 'getPendingProfit', response: { profit: pendingProfit } } });
            }
        }
        
        // FIX: The role for a tool response must be 'tool', not 'user'. This is likely the cause of the TypeScript errors.
        const toolResponseContent: Content = { role: 'tool', parts: toolResponseParts };
        const historyWithToolResponse = [...historyAfterModelResponse, toolResponseContent];

        // FIX: Create a new GoogleGenAI instance for each API call to ensure the latest API key is used.
        const finalAi = new GoogleGenAI({apiKey: process.env.API_KEY});
        const finalResult = await finalAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: historyWithToolResponse,
            // FIX: The `tools` parameter must be inside the `config` object.
            config: { systemInstruction: systemInstruction, tools: tools },
        });

        const finalModelMessage: ChatMessage = { role: 'model', text: finalResult.text };
        setMessages(prev => [...prev, finalModelMessage]);
        setHistory([...historyWithToolResponse, finalResult.candidates![0].content]);

      } else {
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
        setHistory(historyAfterModelResponse);
      }

    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: 'عذراً، أواجه مشكلة في الاتصال. يرجى المحاولة مرة أخرى.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    const combinedRegex = /(\[PRODUCT_LINK:([^:]+):([^\]]+)\])|(\[([^\]]+)\]\((https?:\/\/[^)]+)\))/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Product Link
      if (match[1]) {
        const productId = match[2];
        const productName = match[3];
        parts.push(
          <button
            key={`${productId}-${match.index}`}
            onClick={() => onNavigateToProduct(productId)}
            className="bg-primary-light text-primary font-bold py-1 px-3 rounded-lg underline hover:bg-primary/20 transition-colors"
          >
            {productName}
          </button>
        );
      } 
      // Markdown Link (e.g., for Instagram)
      else if (match[4]) {
        const linkText = match[5];
        const linkUrl = match[6];
        parts.push(
          <a
            key={`${linkUrl}-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-bold underline hover:text-blue-800"
          >
            {linkText}
          </a>
        );
      }
      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts.map((part, i) => <Fragment key={i}>{part}</Fragment>) : text;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto h-[85vh] flex flex-col animate-slide-up">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2" aria-label="إغلاق المحادثة"><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
          <h2 className="text-lg font-bold">الدعم الفني</h2>
          <div className="w-10"></div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
                style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
              >
                {msg.role === 'model' ? renderMessageText(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="flex-shrink-0 p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-400"
              aria-label="إرسال"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </footer>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
