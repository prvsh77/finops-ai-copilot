import { MockProvider } from "../providers/mock-provider.mjs";
import { OpenAiProvider } from "../providers/openai-provider.mjs";
import { GeminiProvider } from "../providers/gemini-provider.mjs";
import { OllamaProvider } from "../providers/ollama-provider.mjs";

class AiGateway {
  constructor() {
    this.providers = {
      MOCK: new MockProvider(),
      OPENAI: new OpenAiProvider(),
      GEMINI: new GeminiProvider(),
      OLLAMA: new OllamaProvider(),
    };
    this.metrics = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      latencySum: 0,
      errors: 0,
      modelStats: {},
    };
  }

  getProvider() {
    const selected = (process.env.AI_PROVIDER || "MOCK").toUpperCase();
    return this.providers[selected] || this.providers.MOCK;
  }

  async generateCompletion(messages, options = {}) {
    this.metrics.totalRequests++;
    const provider = this.getProvider();
    const start = Date.now();
    try {
      const result = await provider.generateCompletion(messages, options);
      const latency = Date.now() - start;

      // Track metrics
      const tokens = result.usage?.total_tokens || 0;
      this.metrics.totalTokens += tokens;
      this.metrics.latencySum += latency;

      const model = result.model || "unknown";
      if (!this.metrics.modelStats[model]) {
        this.metrics.modelStats[model] = { requests: 0, tokens: 0 };
      }
      this.metrics.modelStats[model].requests++;
      this.metrics.modelStats[model].tokens += tokens;

      // Estimate cost: e.g., $15 per 1M tokens on average
      const cost = (tokens / 1000000) * 15.0;
      this.metrics.totalCost += cost;

      return { ...result, latency };
    } catch (err) {
      this.metrics.errors++;
      throw err;
    }
  }

  async *generateStream(messages, options = {}) {
    this.metrics.totalRequests++;
    const provider = this.getProvider();
    const start = Date.now();
    try {
      const stream = provider.generateStream(messages, options);
      for await (const chunk of stream) {
        yield chunk;
      }
      const latency = Date.now() - start;
      this.metrics.latencySum += latency;
    } catch (err) {
      this.metrics.errors++;
      throw err;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageLatencyMs: this.metrics.totalRequests ? (this.metrics.latencySum / this.metrics.totalRequests) | 0 : 0,
    };
  }
}

export const aiGateway = new AiGateway();
export default aiGateway;
