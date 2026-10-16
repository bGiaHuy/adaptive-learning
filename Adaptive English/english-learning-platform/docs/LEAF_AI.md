# Leaf AI

Leaf AI uses the configured MWAPI text model. Credentials remain in `.env.local` on the server.

## Retrieval

`leafKnowledge.ts` builds a persistent index in `LeafKnowledgeChunk` from the application's vocabulary, Unit 2 dictionary entries, and general grammar notes. Exercise prompts, answer keys and grading explanations are excluded. It also retrieves vocabulary saved by the authenticated user, without adding personal vocabulary to the shared index.

`leafRetrieval.ts` ranks chunks with BM25, Vietnamese normalization and English grammar query expansions. Up to four relevant chunks are passed to the generator. This is lexical RAG; it does not call an embedding API or use a vector database. Citations are limited to actual retrieved IDs selected by the model, and show in the chat interface.

## Conversation memory

`LeafChatMessage` and `LeafMemory` store turns and structured preferences by authenticated user ID AND `conversationId`. The browser creates a fresh UUID on mount/reload, on route navigation, and when “Chat mới” is clicked. It does not save the conversation ID to browser storage. Minimizing the chat or changing its sidebar mode keeps the current conversation.

The model receives at most six recent user turns (1,200 characters each), 12 structured preferences, and four relevant earlier snippets (800 characters each) from the SAME conversation. Candidate retrieval is bounded to 80 turns. Old conversations and legacy account-wide preferences are excluded from every context query. Starting a new chat resets the visible conversation and its active memory; previous records remain stored but are never retrieved into the new chat. “Xóa cuộc chat này” deletes only the selected conversation's messages and preferences, without deleting other conversations or another account's data.

The browser cannot select another user's memory or inject conversation history: the server resolves identity through the application's existing auth helper and ignores client-provided history and user IDs.

## Learning integrity

The existing input gate, generation policy and independent output audit still apply. Retrieval and memory are untrusted reference data. They cannot authorize solving a task. Rejected assessment requests are stored for conversation continuity but excluded from archive retrieval and preference extraction. The generator does not receive the protected answer key; only the output reviewer can compare a draft to it. Source IDs and links are validated against retrieved documents.

## Setup and checks

After schema changes, run `npx prisma db push` and `npx prisma generate` with the development server stopped. The new tables are additive to the existing SQLite database.

Run `npx tsc --noEmit` and `node --test tests/leaf-retrieval.test.cjs tests/study-chat.test.cjs tests/mwapi.test.cjs`. Live checks cover continuity within a conversation, isolation after new chat/navigation/reload, RAG citations, assessment refusal and sidebar layout. GET and POST require a valid `conversationId`; client-provided history and user IDs are ignored.
