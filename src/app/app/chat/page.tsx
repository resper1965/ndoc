'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card, CardContent } from '@/components/card';
import { MessageCircle, Send, Loader2, FileText, Sparkles } from 'lucide-react';
import { showError } from '@/lib/toast';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentId: string;
    documentTitle: string;
    documentPath: string;
    chunkIndex: number;
    similarity: number;
  }>;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou seu assistente de documentação. Faça perguntas sobre os documentos disponíveis e eu responderei com base no conteúdo deles.',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          generateAnswer: true,
          maxContextChunks: 5,
          minSimilarity: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pergunta');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Não foi possível gerar uma resposta.',
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showError(error instanceof Error ? error.message : 'Erro ao processar pergunta');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          Chat com Documentos
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Faça perguntas sobre seus documentos e receba respostas baseadas no conteúdo deles
        </p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-250px)] min-h-[600px]">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {message.role === 'assistant' && (
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-700">
                          <p className="text-xs font-semibold mb-2 opacity-75">
                            Fontes ({message.sources.length}):
                          </p>
                          <div className="space-y-1">
                            {message.sources.map((source, index) => (
                              <Link
                                key={index}
                                href={`/docs/${source.documentPath}`}
                                className="flex items-center gap-2 text-xs opacity-90 hover:opacity-100 transition-opacity"
                              >
                                <FileText className="h-3 w-3" />
                                <span className="truncate">{source.documentTitle}</span>
                                <span className="text-xs opacity-75">
                                  ({(source.similarity * 100).toFixed(0)}%)
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-75 mt-2">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Processando...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Área de Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

