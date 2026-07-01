import { BaseAiProvider } from "./provider-abstraction.mjs";

export class MockProvider extends BaseAiProvider {
  async generateCompletion(messages, options = {}) {
    const text = this.getMockResponse(messages);
    return {
      text,
      usage: {
        prompt_tokens: messages.reduce((acc, m) => acc + (m.content || "").length / 4, 0) | 0,
        completion_tokens: text.length / 4 | 0,
        total_tokens: (messages.reduce((acc, m) => acc + (m.content || "").length / 4, 0) + text.length / 4) | 0,
      },
      model: options.model || "mock-gpt-4",
    };
  }

  async *generateStream(messages, options = {}) {
    const text = this.getMockResponse(messages);
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      yield {
        text: words[i] + (i === words.length - 1 ? "" : " "),
        usage: i === words.length - 1 ? {
          prompt_tokens: messages.reduce((acc, m) => acc + (m.content || "").length / 4, 0) | 0,
          completion_tokens: text.length / 4 | 0,
          total_tokens: (messages.reduce((acc, m) => acc + (m.content || "").length / 4, 0) + text.length / 4) | 0,
        } : null,
      };
      // Brief pause to simulate network streaming latency
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }

  getMockResponse(messages) {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const prompt = lastMessage.toLowerCase();

    if (prompt.includes("duplicate") || prompt.includes("fraud")) {
      return "AI analysis shows a critical risk alert. I detected a potential duplicate payment of INR 345,000 to Accenture Services. The transaction references match exactly and were posted within 7 days. I recommend placing a hold on this payout.";
    }
    if (prompt.includes("cash") || prompt.includes("runway") || prompt.includes("forecast")) {
      return "Based on your connected accounts (HDFC, ICICI, Axis, SBI), your total cash equivalent is INR 50.8 Cr. AI models forecast a stable cash runway of 18 months, with a projected 15% optimization opportunity in operating costs.";
    }
    if (prompt.includes("compliance") || prompt.includes("tax")) {
      return "Compliance Review: 2 items require immediate attention. (1) GST filing evidence is overdue for Tech Synapse Pro Ltd. (2) Dual approvals are missing for vendor bank detail adjustments.";
    }

    return "Hello! I am your FinOps AI Copilot. I am connected to your transactions, invoices, bank accounts, and compliance evidence logs. How can I help you analyze your corporate spend or optimize cash flows today?";
  }
}

export default MockProvider;
