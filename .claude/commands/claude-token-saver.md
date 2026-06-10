# Claude Token Saver

## Description
Advanced token optimization system for Claude Code. This skill enforces strict token-saving protocols to maximize context window efficiency and reduce latency.

## Usage
Automatically invoked when large files are accessed or complex tasks are initiated. Can be manually triggered with `@skill claude-token-saver`.

## Token-Saving Protocols

### 1. Smart File Discovery
- Use `grep_search` to find relevant lines instead of reading entire files.
- Use `list_dir` to understand structure before deep diving into files.
- Priority lookup order: `metadata.json` → `README.md` → `INDEX.md` → Implementation files.

### 2. Reading Constraints
- **Line Limit**: Default to 150-200 lines for initial file reads unless a specific range is targeted.
- **Incremental Read**: Read the middle or end of a file only after identifying relevant sections via `grep_search`.
- **Media Optimization**: Avoid `view_file` on binary/large assets unless testing visual results.

### 3. Redundancy Prevention
- **Context Awareness**: Do not re-read files already present in the conversation history unless they have changed.
- **Combined Invocations**: Use `multi_replace_file_content` for non-contiguous edits to avoid multiple file-rewrite tokens.
- **Efficient Searching**: Combine multiple regex patterns in `grep_search` to reduce tool roundtrips.

### 4. Output Compression
- **Concise Summaries**: Provide executive-level summaries of changes rather than line-by-line descriptions.
- **Artifact Reuse**: Update existing artifacts instead of creating new ones for iterative tasks.

## Examples

### Efficient Search
Instead of reading 10 files to find a constant:
`grep_search(Query="MAX_RETRY_COUNT", SearchPath="./src")`

### Targeted Edit
Instead of replacing the whole file:
`replace_file_content(TargetFile="config.ts", StartLine=45, EndLine=46, TargetContent="10", ReplacementContent="20")`

## Integration
Add `claude-token-saver` to your `tengu_amber_lattice` settings in `~/.claude.json` for global activation.
