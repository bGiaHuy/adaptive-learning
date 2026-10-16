import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { gunzipSync } from 'node:zlib';

export const dictionaryAttribution = {
  name: 'minhqnd/dictionary',
  url: 'https://github.com/minhqnd/dictionary',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
};
export type DictionarySense = { id: number; definition: string; definitionLang: string; partOfSpeech: string; example: string; source: string };
export type DictionaryEntry = { id: number; word: string; language: 'en'; pronunciations: { ipa: string; region: string }[]; senses: DictionarySense[]; attribution: typeof dictionaryAttribution };
type ReadDatabase = { prepare(sql: string): { all(...args: (string | number)[]): any[]; get(...args: (string | number)[]): any } };
let database: ReadDatabase | undefined;
function db(): ReadDatabase {
  if (!database) {
    let location = process.env.DICTIONARY_DB_PATH || path.resolve(process.cwd(), '../data/dictionary.db');
    if (!process.env.DICTIONARY_DB_PATH && process.env.VERCEL === '1') {
      // A bundled read-only dictionary is shared educational content, not the user database.
      const archive = path.join(process.cwd(), 'data/dictionary.db.gz');
      const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'adaptive-dictionary-'));
      location = path.join(scratch, 'dictionary.db');
      try {
        fs.writeFileSync(location, gunzipSync(fs.readFileSync(archive)));
      } catch (error) {
        if (fs.existsSync(location)) fs.unlinkSync(location);
        fs.rmdirSync(scratch);
        throw error;
      }
    }
    if (!fs.existsSync(location)) throw new Error('Chưa tìm thấy kho từ điển trên máy chủ.');
    // Node 24 built-in SQLite: shared dictionary is opened strictly read-only.
    const { DatabaseSync } = require('node:sqlite');
    database = new DatabaseSync(location, { readOnly: true }) as ReadDatabase;
  }
  return database;
}
export function normalizeDictionaryQuery(value: string) { return value.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' '); }
function entry(row: { id: number; word: string }): DictionaryEntry {
  const senses = db().prepare(`SELECT wd.id, d.definition, d.definition_lang AS definitionLang, d.pos AS partOfSpeech, wd.example, s.name AS source
    FROM word_definitions wd JOIN definitions d ON d.id = wd.definition_id LEFT JOIN sources s ON s.id = wd.source_id
    WHERE wd.word_id = ? ORDER BY CASE WHEN d.definition_lang = 'vi' THEN 0 ELSE 1 END, wd.id`).all(row.id)
    .map(s => ({ ...s, definitionLang: s.definitionLang || 'unknown', partOfSpeech: s.partOfSpeech || '', example: s.example || '', source: s.source || dictionaryAttribution.name }));
  return { id: row.id, word: row.word, language: 'en', pronunciations: db().prepare('SELECT ipa, region FROM pronunciations WHERE word_id = ? ORDER BY id').all(row.id).map(p => ({ ipa: p.ipa, region: p.region || '' })), senses, attribution: dictionaryAttribution };
}
export function lookupDictionary(query: string): DictionaryEntry | null {
  const clean = normalizeDictionaryQuery(query);
  if (!clean || clean.length > 100) return null;
  const row = db().prepare("SELECT id, word FROM words WHERE word = ? COLLATE NOCASE AND lang_code = 'en' LIMIT 1").get(clean);
  return row ? entry(row) : null;
}
export function getDictionarySense(id: number): { entry: DictionaryEntry; sense: DictionarySense } | null {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const row = db().prepare("SELECT w.id, w.word FROM words w JOIN word_definitions wd ON wd.word_id = w.id WHERE wd.id = ? AND w.lang_code = 'en'").get(id);
  if (!row) return null;
  const result = entry(row);
  const sense = result.senses.find(s => s.id === id);
  return sense ? { entry: result, sense } : null;
}
export function suggestDictionary(query: string) {
  const clean = normalizeDictionaryQuery(query);
  if (clean.length < 2 || clean.length > 100) return [];
  const escaped = clean.replace(/[\\%_]/g, char => `\\${char}`);
  return db().prepare("SELECT id, word FROM words WHERE lang_code = 'en' AND word LIKE ? ESCAPE '\\' ORDER BY length(word), word LIMIT 8").all(`${escaped}%`) as { id: number; word: string }[];
}
let stats: { englishWords: number; vietnameseWords: number; vietnameseSenses: number } | undefined;
export function recommendDictionary(excluded: string[], limit: number) {
  const rows = db().prepare(`SELECT w.id, w.word FROM words w
    WHERE w.lang_code = 'en' AND length(w.word) BETWEEN 3 AND 12
    AND w.word NOT GLOB '*[^a-z]*'
    AND w.word NOT IN (SELECT value FROM json_each(?))
    AND EXISTS (SELECT 1 FROM word_definitions wd JOIN definitions d ON d.id = wd.definition_id WHERE wd.word_id = w.id AND d.definition_lang = 'vi')
    ORDER BY length(w.word), w.word LIMIT ?`).all(JSON.stringify(excluded), limit);
  return rows.map(row => { const result = entry(row); return { entry: result, sense: result.senses.find(s => s.definitionLang === 'vi')! }; });
}
export function dictionaryStats() {
  if (!stats) {
    const coverage = db().prepare("SELECT count(*) AS senses, count(distinct w.id) AS words FROM words w JOIN word_definitions wd ON wd.word_id = w.id JOIN definitions d ON d.id = wd.definition_id WHERE w.lang_code = 'en' AND d.definition_lang = 'vi'").get();
    stats = { englishWords: db().prepare("SELECT count(*) AS n FROM words WHERE lang_code = 'en'").get().n, vietnameseWords: coverage.words, vietnameseSenses: coverage.senses };
  }
  return stats;
}
