import json
import re
import sys

def sanitize_json_string(raw_json_string: str) -> str:
    """
    Sanitizes a raw JSON string by removing unescaped control characters
    (U+0000 to U+001F) from string literals, which commonly cause JSON parsing
    errors like "Bad control character in string literal".

    This function aims to make the JSON string parseable by addressing character-level
    validity, specifically the presence of illegal unescaped control characters.
    It does not fix structural JSON errors like missing braces, commas, or unclosed strings,
    but cleaning the input is a crucial first step.
    """
    if not isinstance(raw_json_string, str):
        raise TypeError("Input to sanitize_json_string must be a string.")

    # The JSON specification (RFC 8259) explicitly disallows unescaped control characters
    # from U+0000 through U+001F in string literals. These must be escaped (e.g., \n, \t) or removed.
    # The regex targets these characters for removal. If they are intended to be part of the data
    # they must be properly escaped by the JSON generator.
    # For the reported error "Bad control character in string literal", removal is a direct fix
    # assuming these characters are not valid parts of the generated string content.
    sanitized_string = re.sub(r'[\x00-\x1f]', '', raw_json_string)

    return sanitized_string

def parse_sanitized_json(raw_json_string: str):
    """
    Attempts to parse a JSON string after sanitizing it.
    This function should be used as a wrapper around `json.loads` for inputs
    that are prone to the 'Bad control character' error.
    """
    try:
        sanitized_str = sanitize_json_string(raw_json_string)
        return json.loads(sanitized_str)
    except json.JSONDecodeError as e:
        print(f"[Crucible] Error: Failed to parse JSON even after sanitization: {e}", file=sys.stderr)
        # Log the problematic part for further debugging if structural issues persist
        start = max(0, e.pos - 50)
        end = min(len(sanitized_str), e.pos + 50)
        print(f"[Crucible] Problematic JSON snippet (after sanitization) around position {e.pos}:", file=sys.stderr)
        print(f"[Crucible] ...{sanitized_str[start:end]}...", file=sys.stderr)
        raise # Re-raise to indicate failure
    except Exception as e:
        print(f"[Crucible] An unexpected error occurred during JSON parsing: {e}", file=sys.stderr)
        raise


# Instructions for implementation:
# The system components responsible for 'Article generation' and 'Trend analysis'
# that encounter JSON parsing errors should be updated to use this module.
# Specifically, wherever `json.loads(some_input_string)` is called, it should be changed to:
# `json_data = json_sanitizer.parse_sanitized_json(some_input_string)`
# This will preprocess the input string to remove problematic control characters
# before attempting to parse it, directly addressing the 'Bad control character in string literal' errors.
# For the 'Unterminated string' and 'Expected ',' or '}' errors, while this sanitizer
# does not directly fix structural problems, it ensures the input is clean of character-level issues.
# If these structural errors persist, the underlying JSON generation logic will require further inspection,
# potentially with additional logging of the raw, unsanitized JSON to diagnose the source of truncation
# or incorrect syntax generation.