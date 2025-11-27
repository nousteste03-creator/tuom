// hooks/usePilaChat.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  PilaMessage,
  getPilaMessages,
  savePilaMessage,
  requestPilaResponse,
  createLocalMessage,
} from "@/services/pila";

type UsePilaChatState = {
  messages: PilaMessage[];
  loading: boolean;
  sending: boolean;
  error: any;
  sendMessage: (text: string) => Promise<void>;
  session: Session | null;
};

export function usePilaChat(): UsePilaChatState {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<PilaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<any>(null);

  // ============================================================
  // 1. CARREGA SESSÃO ATUAL
  // ============================================================
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setError(error);
      } else {
        setSession(session);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================
  // 2. CARREGA HISTÓRICO DA PILA
  // ============================================================
  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      try {
        setLoading(true);
        const data = await getPilaMessages(session.user.id);

        if (!cancelled) {
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  // ============================================================
  // 3. ENVIAR MENSAGEM PARA A PILA (IA)
  // ============================================================
  const sendMessage = useCallback(
    async (text: string) => {
      if (!session?.user || !text.trim() || sending) return;

      const userId = session.user.id;
      const content = text.trim();

      // Adiciona mensagem local do usuário (otimista)
      const localUserMsg = createLocalMessage({
        role: "user",
        content,
        userId,
      });

      setMessages((prev) => [...prev, localUserMsg]);
      setSending(true);

      try {
        // Persiste mensagem do usuário
        const savedUserMsg = await savePilaMessage({
          userId,
          role: "user",
          content,
        });

        // Últimas 10 mensagens para contexto
        const lastMessages = [...messages, savedUserMsg]
          .slice(-10)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        // Chama IA
        const replyText = await requestPilaResponse({
          session,
          messages: lastMessages,
        });

        // Mensagem da IA (otimista)
        const localAssistant = createLocalMessage({
          role: "assistant",
          content: replyText,
          userId,
        });

        setMessages((prev) => [...prev, localAssistant]);

        // Persiste resposta da IA
        await savePilaMessage({
          userId,
          role: "assistant",
          content: replyText,
        });
      } catch (err) {
        console.error("Erro na IA da Pila:", err);
        setError(err);
      } finally {
        setSending(false);
      }
    },
    [session, sending, messages]
  );

  // ============================================================
  // 4. RETORNO DO HOOK
  // ============================================================
  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    session,
  };
}
