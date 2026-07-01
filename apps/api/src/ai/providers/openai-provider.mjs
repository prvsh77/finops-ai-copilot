import { BaseAiProvider } from "./provider-abstraction.mjs";
import { MockProvider } from "./mock-provider.mjs";

export class OpenAiProvider extends BaseAiProvider {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    super();
    this.apiKey = apiKey;
    this.fallback = new MockProvider();
  }

  async generateCompletion(messages, options = {}) {
    if (!this.apiKey) {
      return this.fallback.generateCompletion(messages, options);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || "gpt-4o",
        messages,
        temperature: options.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API failed: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
    };
  }

  async *generateStream(messages, options = {}) {
    if (!this.apiKey) {
      yield* this.fallback.generateStream(messages, options);
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || "gpt-4o",
        messages,
        temperature: options.temperature ?? 0.2,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Stream failed: ${response.statusText}`);
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
          if (!cleanLine.startsWith("data:")) continue;
          if (cleanLine.includes("[DONE]")) break;

          try {
            const parsed = JSON.parse(cleanLine.slice(5).trim());
            const text = parsed.choices[0]?.delta?.content || "";
            if (text) {
              yield { text, usage: parsed.usage || null };
            }
          } catch (e) {
            // Ignore parse errors on partial stream lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export default OpenAiProvider;
