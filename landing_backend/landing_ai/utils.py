import json
import re


def safe_json_load(raw: str):
    """
    Extracts the first valid JSON object from LLM output.
    Handles markdown fences and trailing text safely.
    """

    if not raw:
        raise ValueError("Empty AI response")

    # Remove markdown fences
    cleaned = re.sub(r"```(?:json|javascript|tsx)?", "", raw, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()

    # Extract first JSON block
    match = re.search(r"\{[\s\S]*\}", cleaned)

    if not match:
        raise ValueError("No JSON object found in AI output")

    json_str = match.group(0)

    # 🔥 Fix common LLM JSON issues
    json_str = json_str.replace("'", '"')  # single → double quotes
    json_str = re.sub(r",\s*}", "}", json_str)  # remove trailing commas in objects
    json_str = re.sub(r",\s*]", "]", json_str)  # remove trailing commas in arrays

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print("❌ RAW LLM OUTPUT:\n", raw)
        print("❌ CLEANED JSON:\n", json_str)
        raise e


def strip_return_component(code: str):
    """
    Removes accidental 'return Component;' statements
    produced by LLM.
    """

    if not isinstance(code, str):
        return code

    return re.sub(
        r'\n?\s*return\s+Component\s*;\s*$',
        '',
        code,
        flags=re.IGNORECASE
    )


def sanitize_generated_code(code: str):
    if not isinstance(code, str):
        return code

    cleaned = strip_return_component(code)
    cleaned = cleaned.replace("<style>{{`", "<style>{`")
    cleaned = cleaned.replace("`}}</style>", "`}</style>")
    cleaned = cleaned.replace("export default ", "")
    cleaned = re.sub(r'^\s*import .*?;\s*$', '', cleaned, flags=re.MULTILINE)
    return cleaned.strip()
