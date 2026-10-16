export function hasPlacementInput(state: { readingAnswers?: object; listeningAnswers?: object; grammarAnswers?: object; vocabAnswers?: object; writingAnswer?: string }) {
  return [state.readingAnswers, state.listeningAnswers, state.grammarAnswers, state.vocabAnswers].some(answers => Object.values(answers || {}).some(value => typeof value === 'string' && value.trim())) || !!state.writingAnswer?.trim();
}
