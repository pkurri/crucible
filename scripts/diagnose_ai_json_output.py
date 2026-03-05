#!/usr/bin/env python3
import json
import logging
import sys

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def diagnose_json_generation_failure(generation_function, *args, **kwargs):
    """
    Wraps an AI/article generation function to diagnose JSON parsing failures.
    It attempts to parse the output and logs the raw output if parsing fails.

    Args:
        generation_function (callable): The function that performs AI/article generation
                                        and is expected to return a JSON string.
        *args, **kwargs: Arguments to pass to the generation_function.

    Returns:
        dict or None: The parsed JSON object if successful, otherwise None after logging.
    """
    raw_output = None
    try:
        logging.info(f"Attempting to execute generation function: {generation_function.__name__}")
        raw_output = generation_function(*args, **kwargs)
        
        if not isinstance(raw_output, str):
            logging.error(f"Generation function did not return a string. Type: {type(raw_output)}. Raw Output: {raw_output}")
            return None

        logging.info("Attempting to parse AI generation output as JSON...")
        parsed_json = json.loads(raw_output)
        logging.info("JSON parsing successful.")
        return parsed_json
    except json.JSONDecodeError as e:
        logging.error(f"JSON parsing failed: {e}")
        logging.error(f"Problematic JSON position: {e.pos} (Line {e.lineno}, Column {e.colno})")
        logging.error(f"Raw AI/Article Generation Output (truncated to 1000 chars):\n---\n{str(raw_output)[:1000]}\n---")
        if len(raw_output) > 1000: # Log full output to a file if very long
            output_filename = f"failed_json_output_{generation_function.__name__}_{e.pos}.txt"
            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(raw_output)
            logging.error(f"Full raw output saved to: {output_filename}")
        return None
    except Exception as e:
        logging.error(f"An unexpected error occurred during generation or initial processing: {e}")
        logging.error(f"Raw output before error: {raw_output}")
        return None

# --- Example Usage (How this script would be used within your system) ---

# Placeholder for your actual AI generation function
def mock_ai_generation_success():
    return '{"title": "Success", "content": "This is a valid JSON output."}'

def mock_ai_generation_malformed_comma():
    # Simulates: Expected ',' or '}' after property value
    return '{"title": "Error Example" "content": "Missing comma here"}'

def mock_ai_generation_bad_control_char():
    # Simulates: Bad control character in string literal
    return '{"text": "This string contains a bad control character: \x01"}'

def mock_ai_generation_truncated():
    # Simulates truncation common with AI models
    return '{"data": ["item1", "item2", "item3"' # Incomplete array

def mock_scraper_output_bad_json():
    # This specific diagnostic is for AI/Article generation, but can be adapted
    # if scraping also returns expected JSON that is malformed.
    return '<html><body>Not JSON</body></html>'

if __name__ == "__main__":
    logging.info("\n--- Running Diagnostic Test: Successful JSON ---")
    diagnose_json_generation_failure(mock_ai_generation_success)

    logging.info("\n--- Running Diagnostic Test: Malformed JSON (Missing Comma) ---")
    diagnose_json_generation_failure(mock_ai_generation_malformed_comma)

    logging.info("\n--- Running Diagnostic Test: Bad Control Character in JSON ---")
    diagnose_json_generation_failure(mock_ai_generation_bad_control_char)

    logging.info("\n--- Running Diagnostic Test: Truncated JSON ---")
    diagnose_json_generation_failure(mock_ai_generation_truncated)

    logging.info("\n--- Running Diagnostic Test: Non-JSON Output (if expected) ---")
    diagnose_json_generation_failure(mock_scraper_output_bad_json)

# --- Integration Proposal ---
# To implement this, wrap your existing AI/Article generation calls:
#
# For example, replace:
#   ai_response_json = json.loads(call_your_ai_model(prompt))
# With:
#   ai_response_json = diagnose_json_generation_failure(call_your_ai_model_wrapper, prompt=prompt)
#
# Where `call_your_ai_model_wrapper` is a function that takes arguments
# and returns the raw string output from the AI model.
# The `diagnose_json_generation_failure` function will then log the raw
# output and the precise JSON error, making it much easier to debug
# why the AI is generating invalid JSON or if post-processing is needed.