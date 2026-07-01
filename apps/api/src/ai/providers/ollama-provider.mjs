import { BaseAiProvider } from "./provider-abstraction.mjs";
import { MockProvider } from "./mock-provider.mjs";

export class OllamaProvider extends BaseAiProvider {
  constructor(endpoint = process.env.OLLAMA_ENDPOINT || "http://localhost:11434") {
    super();
    this.endpoint = endpoint;
    this.fallback = new MockProvider();
  }

  async generateCompletion(messages, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: options.model || "llama3",
          messages,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.message?.content || "",
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        model: options.model || "llama3",
      };
    } catch (err) {
      return this.fallback.generateCompletion(messages, options);
    }
  }

  async *generateStream(messages, options = {}) {
    let response;
    try {
      response = await fetch(`${this.endpoint}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: options.model || "llama3",
          messages,
          stream: true,
          options: {
            temperature: options.temperature ?? 0.2,
          },
        }),
      });

      if (!response.ok) throw new Error();
    } catch (err) {
      yield* this.fallback.generateStream(messages, options);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          try {
            const parsed = JSON.parse(cleanLine);
            const text = parsed.message?.content || "";
            if (text) {
              yield { text, usage: null };
            }
          } catch (e) {
            // Ignore parse errors on partial streams
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export default OllamaProvider;
