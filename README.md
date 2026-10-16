# Adaptive Learning

This private repository contains the complete source workspace for both projects:

- `Adaptive Math/`: Adaptive Math application, API, learning content, and research evidence.
- `Adaptive English/`: Adaptive English application, content pipeline, documentation, and research evidence.
- `scripts/`, `ux-release-audit/`, and `video hướng dẫn/`: shared supporting materials where eligible for Git storage.

Local environment files, credentials, installed dependencies, generated builds, caches, backup archives, and video files are excluded from version control.

## English dictionary

`Adaptive English/data/dictionary.db.gz` is a lossless gzip copy of the local SQLite dictionary. Decompress it to `Adaptive English/data/dictionary.db` before using workflows that require that database. The uncompressed file exceeds GitHub's 100 MB file limit.
