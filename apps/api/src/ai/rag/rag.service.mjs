import { documentRepository } from "./document.repository.mjs";

class RagService {
  constructor(repo = documentRepository) {
    this.repo = repo;
  }

  async addDocument(organizationId, title, content, sourceUrl = "") {
    // 1. Chunk document
    const chunks = this.chunkText(content, 500);

    const docRecord = {
      id: `doc_${crypto.randomUUID()}`,
      organization_id: organizationId,
      title,
      content,
      source_url: sourceUrl,
      chunks: chunks.map((c, i) => ({
        id: `${i}`,
        text: c,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    return this.repo.insert(docRecord);
  }

  chunkText(text, size) {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let current = "";

    for (const p of paragraphs) {
      if ((current + p).length > size) {
        if (current) chunks.push(current.trim());
        current = p;
      } else {
        current += "\n\n" + p;
      }
    }
    if (current) chunks.push(current.trim());
    return chunks;
  }

  async search(organizationId, query, limit = 3) {
    const docs = await this.repo.listByOrg(organizationId);
    if (!docs.length) return [];

    const queryWords = query.toLowerCase().split(/\W+/).filter(Boolean);
    const results = [];

    for (const doc of docs) {
      for (const chunk of doc.chunks || []) {
        const chunkWords = chunk.text.toLowerCase().split(/\W+/).filter(Boolean);
        
        // TF score
        let matchesCount = 0;
        for (const qw of queryWords) {
          if (chunkWords.includes(qw)) matchesCount++;
        }

        // Jaccard similarity score
        const intersection = new Set(queryWords.filter(w => chunkWords.includes(w)));
        const union = new Set([...queryWords, ...chunkWords]);
        const jaccard = union.size ? intersection.size / union.size : 0;

        const score = (matchesCount * 1.5) + (jaccard * 10);

        if (score > 0) {
          results.push({
            score,
            text: chunk.text,
            title: doc.title,
            source_url: doc.source_url,
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async buildContext(organizationId, query) {
    const hits = await this.search(organizationId, query);
    if (!hits.length) {
      return { contextText: "", citations: [] };
    }

    const contextText = hits.map((hit, idx) => `[Source ${idx + 1}: ${hit.title}]\n${hit.text}`).join("\n\n");
    const citations = hits.map((hit, idx) => ({
      index: idx + 1,
      title: hit.title,
      source_url: hit.source_url,
    }));

    return { contextText, citations };
  }
}

export const ragService = new RagService();
export default ragService;
