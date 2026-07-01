import { BaseAiProvider } from "./provider-abstraction.mjs";
import { MockProvider } from "./mock-provider.mjs";

export class GeminiProvider extends BaseAiProvider {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    super();
    this.apiKey = apiKey;
    this.fallback = new MockProvider();
  }

  async generateCompletion(messages, options = {}) {
    if (!this.apiKey) {
      return this.fallback.generateCompletion(messages, options);
    }

    const model = options.model || "gemini-1.5-pro";
    const contents = this.formatMessages(messages);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Gemini API failed: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return {
      text,
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      },
      model,
    };
  }

  async *generateStream(messages, options = {}) {
    if (!this.apiKey) {
      yield* this.fallback.generateStream(messages, options);
      return;
    }

    const model = options.model || "gemini-1.5-pro";
    const contents = this.formatMessages(messages);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini Stream failed: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        // Gemini returns a JSON array of parts. Let's extract candidate parts from lines.
        // For simplicity under stream, let's parse raw candidate structures or stream segments.
        const matches = [...buffer.matchAll(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
        if (matches.length > 0) {
          for (const match of matches) {
            const text = JSON.parse(`"${match[1]}"`); // decodes escape characters
            yield { text, usage: null };
          }
          buffer = "";
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  formatMessages(messages) {
    return messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  }
}

export default GeminiProvider;
