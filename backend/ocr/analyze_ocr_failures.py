import re
from collections import Counter, defaultdict

LOG_FILE = "ocr_service.log"

# Regex to match OCR and PARSE failure log lines
FAILURE_REGEX = re.compile(r"(OCR FAILURE|PARSE FAILURE): filename=(.*?)(, image_size=\(.*?\), format=.*?)?, error=(.*)")

def main():
    error_counter = Counter()
    file_errors = defaultdict(list)
    image_info_counter = Counter()

    with open(LOG_FILE, "r") as f:
        for line in f:
            match = FAILURE_REGEX.search(line)
            if match:
                failure_type = match.group(1)
                filename = match.group(2)
                image_info = match.group(3) or ""
                error = match.group(4)

                error_key = f"{failure_type}: {error.split(':')[0]}"
                error_counter[error_key] += 1
                file_errors[error_key].append((filename, image_info.strip()))
                if image_info:
                    image_info_counter[image_info.strip()] += 1

    print("\n=== OCR/Parse Failure Summary ===\n")
    for error_key, count in error_counter.most_common():
        print(f"{error_key}: {count} failures")
        for filename, image_info in file_errors[error_key][:5]:
            print(f"  - {filename} {image_info}")
        if len(file_errors[error_key]) > 5:
            print(f"  ...and {len(file_errors[error_key]) - 5} more")
        print()

    print("\n=== Most Common Image Info for Failures ===\n")
    for image_info, count in image_info_counter.most_common(10):
        print(f"{image_info}: {count} failures")

if __name__ == "__main__":
    main() 