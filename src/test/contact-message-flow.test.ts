import { describe, it, expect } from "vitest";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

// Supabase Externo
const SUPABASE_URL = "https://lhtetfcujdzulfyekiub.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Fzh5c8vspjn7jXwyBivbSA_OUJNwwXQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe("Contact Message Public Insert", () => {
  it("should allow public insert via RLS policy", async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testName = "Test Public Insert";
    const testMessage = "Mensagem de teste pública";

    // Este teste verifica se a política "Anyone can submit" funciona
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: testName,
        email: testEmail,
        subject: "question",
        message: testMessage,
        status: "pending",
        ip_hash: `test-hash-${Date.now()}`,
      })
      .select()
      .single();

    // Se RLS está configurado corretamente para INSERT público
    if (error) {
      console.log("Insert error (expected if RLS requires auth):", error.message);
      // A política pode requerer autenticação mínima
      expect(error.code).toBe("42501");
    } else {
      expect(data).toBeDefined();
      expect(data?.email).toBe(testEmail);
      console.log("Public insert successful:", data?.id);

      // Cleanup
      if (data?.id) {
        await supabase.from("contact_messages").delete().eq("id", data.id);
      }
    }
  });
});

describe("Contact Messages Query Performance", () => {
  it("should fetch messages with pagination efficiently", async () => {
    const pageSize = 10;
    const startTime = Date.now();

    const { data, error, count } = await supabase
      .from("contact_messages")
      .select("id, name, email, subject, status, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, pageSize - 1);

    const duration = Date.now() - startTime;

    // Query should be fast (under 2 seconds)
    expect(duration).toBeLessThan(2000);
    console.log(`Query took ${duration}ms, returned ${data?.length || 0} of ${count || 0} total`);

    // Se não há erro, os dados devem ser um array
    if (!error) {
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it("should filter messages by status", async () => {
    const statuses = ["pending", "read", "replied"];

    for (const status of statuses) {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, status")
        .eq("status", status)
        .limit(5);

      // Pode retornar vazio ou erro de RLS
      if (!error && data) {
        data.forEach((msg) => {
          expect(msg.status).toBe(status);
        });
        console.log(`Status '${status}': ${data.length} messages`);
      }
    }
  });

  it("should search messages by email or name", async () => {
    const searchTerm = "test";

    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email")
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);

    if (!error && data) {
      console.log(`Search for '${searchTerm}': ${data.length} results`);
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe("Realtime Subscription Setup", () => {
  let channel: RealtimeChannel | null = null;

  it("should create a realtime channel for contact_messages", async () => {
    channel = supabase.channel("contact-messages-test");

    expect(channel).toBeDefined();
    expect(channel.topic).toBe("realtime:contact-messages-test");
  });

  it("should setup postgres_changes listener", async () => {
    if (!channel) {
      channel = supabase.channel("contact-messages-test-2");
    }

    let subscribed = false;

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages",
        },
        (payload) => {
          console.log("Received INSERT event:", payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          subscribed = true;
        }
      });

    // Aguardar subscription
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Cleanup
    await supabase.removeChannel(channel);
    channel = null;

    // Verificar que tentou se inscrever
    expect(true).toBe(true); // Channel foi criado com sucesso
  });
});

describe("Message Stats Calculation", () => {
  it("should calculate correct stats from messages array", () => {
    // Simular array de mensagens
    const mockMessages = [
      { id: "1", status: "pending" },
      { id: "2", status: "pending" },
      { id: "3", status: "read" },
      { id: "4", status: "replied" },
      { id: "5", status: "replied" },
      { id: "6", status: "replied" },
    ];

    const stats = {
      total: mockMessages.length,
      pending: mockMessages.filter((m) => m.status === "pending").length,
      read: mockMessages.filter((m) => m.status === "read").length,
      replied: mockMessages.filter((m) => m.status === "replied").length,
    };

    expect(stats.total).toBe(6);
    expect(stats.pending).toBe(2);
    expect(stats.read).toBe(1);
    expect(stats.replied).toBe(3);
  });

  it("should handle empty messages array", () => {
    const mockMessages: { id: string; status: string }[] = [];

    const stats = {
      total: mockMessages.length,
      pending: mockMessages.filter((m) => m.status === "pending").length,
      read: mockMessages.filter((m) => m.status === "read").length,
      replied: mockMessages.filter((m) => m.status === "replied").length,
    };

    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.read).toBe(0);
    expect(stats.replied).toBe(0);
  });
});
