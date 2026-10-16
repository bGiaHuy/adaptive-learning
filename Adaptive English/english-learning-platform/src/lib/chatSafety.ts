export interface StudyChatContext {
  active: boolean;
  prompt: string;
  answers: string[];
}

export const COACH_REPLY = "Mình có thể giúp bạn hiểu từ vựng và cấu trúc, nhưng sẽ không chọn đáp án, điền chỗ trống hay làm bài hộ. Bạn thử nêu một từ chưa hiểu hoặc hỏi quy tắc ngữ pháp muốn ôn nhé.";

export function normalizeStudyText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function matchesAssessment(message: string, prompts: string[]): boolean {
  const text = normalizeStudyText(message);
  return prompts.some((prompt) => {
    const normalized = normalizeStudyText(prompt);
    if (normalized.length < 28) return false;
    if (text.includes(normalized)) return true;
    const words = normalized.split(' ').filter(word => word.length > 2);
    const submitted = new Set(text.split(' '));
    return words.length >= 7 && words.filter(word => submitted.has(word)).length / words.length >= 0.85;
  });
}

/** Fast gate runs before either model call; copied tests stay protected even on the home page. */
export function inspectStudyMessage(message: string, context: StudyChatContext, knownPrompts: string[]): 'coach' | 'check' {
  const text = normalizeStudyText(message);
  if (matchesAssessment(message, [...knownPrompts, context.prompt])) return 'coach';
  if (/(dap an|chon (?:cau|phuong an|dap an)|dien (?:vao|cho|tu)|lam (?:ho|giup|bai nay)|giai (?:ho|giup|bai|cau)|viet (?:ho|giup|bai|essay)|tra loi (?:cau|giup|ho)|solve|give me (?:the )?answer|answer key|correct option|complete (?:the|this) sentence|rewrite (?:the|this)|check my answer|ignore (?:previous|all)|bo qua (?:quy tac|huong dan))/.test(text)) return 'coach';
  // Blanks, option lists and pasted worksheet instructions are tasks, not dictionary lookups.
  if (/_{2,}|\.{3,}|\b[A-D][.)]\s+[\s\S]+\b[A-D][.)]\s+/.test(message)
    || /\b(choose the correct|fill in the blank|which of the following|write an essay|translate (?:this|the) sentence)\b/i.test(message)) return 'coach';
  if (context.active && /^(?:a|b|c|d|1|2|3|4)\??$/i.test(message.trim())) return 'coach';
  return 'check';
}

export function revealsAnswer(reply: string, context: StudyChatContext): boolean {
  const text = normalizeStudyText(reply);
  if (/\b(?:dap an|answer|option|lua chon)\s*(?:dung\s*)?(?:la|is)?\s*[a-d]\b/.test(text)) return true;
  return context.active && context.answers.some(answer => {
    const normalized = normalizeStudyText(answer);
    return !!normalized && (text === normalized || (normalized.split(' ').length >= 5 && text.includes(normalized)));
  });
}
