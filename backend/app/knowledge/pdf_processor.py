"""PDF processor — extracts text AND describes visuals using Vision AI."""
import fitz  # pymupdf
import os
import asyncio
from app.knowledge.vision_describer import describe_image


FILENAME_MAP = {
    "AI Upskilling workshop (1).pdf": "ai_upskilling_workshop",
    "Employment-Profile-of-English-Speakers-in-the-Province-of-Quebec.pdf": "pert_employment_english",
    "EN-The-State-of-Employment-among-English-speaking-Quebecers.pdf": "pert_state_employment",
    "IndustryWhitePaper_2025_CA_EN (2).pdf": "industry_whitepaper",
    "Nowcasting_Econ-Report-v16.pdf": "anthropic_labor_market",
    "The Change-Ready Human Thriving in the Post-Pandemic, Post-GenAI World. (1).pdf": "change_ready_human",
    "The-Effects-of-AI-on-the-Working-Lives-of-Women (2).pdf": "unesco_effects_ai_women",
    "The-French-Factor-How-language-shapes-employment-in-Quebec.pdf": "pert_french_factor",
    "WEF_Future_of_Jobs_Report_2025.pdf": "wef_future_of_jobs",
    "WEF_Putting_Skills_First_2024.pdf": "wef_putting_skills_first",
    "superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential-v4.pdf": "mckinsey_superagency",
    "superagency-what-could-possible-go-right-with-our-ai-future-9798893310139.pdf": "hoffman_superagency_book",
}

# Minimum characters to consider a page as "has enough text"
MIN_TEXT_CHARS = 100


def get_source_name(filename: str) -> str:
    return FILENAME_MAP.get(filename, filename.replace(".pdf", "").lower().replace(" ", "_"))


async def extract_page(page, page_num: int) -> dict:
    """Extract text from a page. If text is too short or page has images, use Vision AI."""
    text = page.get_text().strip()
    text = clean_text(text)
    has_images = len(page.get_images()) > 0
    needs_vision = len(text) < MIN_TEXT_CHARS or has_images # Flor :Aquí es donde decidimos usar Vision AI, no solo por la presencia de imágenes sino también por la cantidad de texto

    vision_text = ""
    if needs_vision and has_images:
        # Render page as image and send to Vision AI
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
        image_bytes = pix.tobytes("png")
        vision_text = await describe_image(image_bytes)
        await asyncio.sleep(1)  # Rate limit protection

    # Combine text + vision description
    combined = ""
    if text:
        combined += text
    if vision_text:
        if combined:
            combined += "\n\n[VISUAL DESCRIPTION]\n" + vision_text
        else:
            combined = vision_text

    return {
        "text": combined,
        "page": page_num + 1,
        "has_images": has_images,
        "used_vision": bool(vision_text),
        "char_count": len(combined),
    }


def clean_text(text: str) -> str:
    """Clean extracted text."""
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if len(line) < 5 and line.isdigit():
            continue
        if line.lower() in ("confidential", "draft", "all rights reserved"):
            continue
        cleaned.append(line)
    return "\n".join(cleaned)


def chunk_pages(pages: list[dict], chunk_size: int = 500) -> list[dict]:
    """Combine pages into chunks of approximately chunk_size tokens."""
    chunks = []
    current_text = ""
    current_start_page = 1

    for page in pages:
        current_tokens = len(current_text) // 4
        page_tokens = len(page["text"]) // 4

        if current_tokens + page_tokens > chunk_size and current_text:
            chunks.append({
                "text": current_text.strip(),
                "page": current_start_page,
            })
            current_text = page["text"]
            current_start_page = page["page"]
        else:
            current_text += "\n\n" + page["text"] if current_text else page["text"]
            if not chunks:
                current_start_page = page["page"]

    if current_text.strip():
        chunks.append({
            "text": current_text.strip(),
            "page": current_start_page,
        })

    return chunks


async def process_pdf(filepath: str) -> list[dict]:
    """Full pipeline: extract text + vision → clean → chunk."""
    filename = os.path.basename(filepath)
    source = get_source_name(filename)

    print(f"    📖 Opening {filename}...")
    doc = fitz.open(filepath)
    total_pages = len(doc)
    print(f"    📄 {total_pages} pages")

    # Extract all pages (with Vision AI for visual pages)
    pages = []
    vision_count = 0
    for page_num in range(total_pages):
        page = doc[page_num]
        result = await extract_page(page, page_num)

        if result["used_vision"]:
            vision_count += 1
            print(f"      🔍 Page {page_num + 1}: Vision AI used")

        if result["char_count"] > 50:
            pages.append(result)

    doc.close()
    print(f"    📊 {len(pages)} pages with content ({vision_count} used Vision AI)")

    # Chunk the pages
    print(f"    ✂️ Chunking...")
    chunks = chunk_pages(pages)
    print(f"    📦 {len(chunks)} chunks created")

    for chunk in chunks:
        chunk["source"] = source
        chunk["type"] = "research"

    return chunks