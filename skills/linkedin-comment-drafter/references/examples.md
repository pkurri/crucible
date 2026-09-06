# Examples — LinkedIn Comment Drafter

## Example invocation

> User: "Comment on this:
> `https://www.linkedin.com/posts/{author-handle}_activity-{id}`"
>
> Skill: parses the URL, fetches the post, detects a closing question ("Seen
> this in your market?"), and drafts 3 variants.
>
> Skill returns: T2 Answer-the-Closing-Question variant as primary pick, with T1
> Missing-Piece as backup, reaction `INTEREST`, one-line rationale, and approval
> prompt.
