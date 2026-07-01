export class BaseAiProvider {
  async generateCompletion(messages, options = {}) {
    throw new Error("generateCompletion not implemented");
  }

  async *generateStream(messages, options = {}) {
    throw new Error("generateStream not implemented");
  }
}
