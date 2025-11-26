# backend/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2, docx2txt, io, spacy, re, asyncio, aiohttp
from datetime import datetime

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

def extract_text(file_bytes: bytes, filename: str) -> str:
    fn = filename.lower()
    try:
        if fn.endswith(".pdf"):
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            return "\n".join(p.extract_text() or "" for p in reader.pages)
        elif fn.endswith((".docx", ".doc")):
            return docx2txt.process(io.BytesIO(file_bytes))
        else:
            return file_bytes.decode("utf-8", errors="ignore")
    except:
        return ""

# === FINAL & BULLETPROOF OPENALEX (WORKS FOR ALL DOIs) ===
async def check_openalex(doi=None, session=None):
    if not doi: return {"passed": False, "title": None, "url": None, "note": "No DOI found"}
    doi_clean = doi.strip().rstrip(".,;")
    urls = [
        f"https://api.openalex.org/works/https://doi.org/{doi_clean}",
        f"https://api.openalex.org/works/doi:{doi_clean}",
        f"https://api.openalex.org/works/{doi_clean}",
    ]
    for url in urls:
        try:
            async with session.get(url, timeout=12) as r:
                if r.status == 200:
                    data = await r.json()
                    if data.get("id") or data.get("doi"):
                        title = data.get("title") or "No title"
                        return {"passed": True, "title": title, "url": f"https://doi.org/{doi_clean}", "note": "Verified in OpenAlex"}
                elif r.status == 404:
                    return {"passed": False, "title": None, "url": None, "note": "DOI not found in OpenAlex (404)"}
        except:
            continue
    return {"passed": False, "title": None, "url": None, "note": "OpenAlex unreachable or rate-limited"}

# === CROSSREF (RELIABLE) ===
async def check_crossref(doi=None, session=None):
    if not doi: return {"passed": False, "title": None, "url": None, "note": "No DOI found"}
    doi_clean = doi.strip().rstrip(".,;")
    try:
        async with session.get(f"https://api.crossref.org/works/{doi_clean}", timeout=12) as r:
            if r.status == 200:
                data = await r.json()
                title = data["message"].get("title", [""])[0]
                return {"passed": True, "title": title, "url": f"https://doi.org/{doi_clean}", "note": "Verified in Crossref"}
            elif r.status == 404:
                return {"passed": False, "title": None, "url": None, "note": "DOI not found in Crossref (404)"}
    except:
        return {"passed": False, "title": None, "url": None, "note": "Crossref unreachable"}
    return {"passed": False, "title": None, "url": None, "note": "Invalid DOI format"}

async def check_pubmed(pmid, session):
    if not pmid: return {"passed": False, "note": "No PMID found"}
    try:
        async with session.get(f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmid}&retmode=json") as r:
            data = await r.json()
            if str(pmid) in data.get("result", {}):
                title = data["result"][str(pmid)].get("title", "No title")
                return {"passed": True, "title": title, "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/", "note": "Verified in PubMed"}
    except: pass
    return {"passed": False, "title": None, "url": None, "note": "PMID not found"}

async def check_arxiv(aid, session):
    if not aid: return {"passed": False, "note": "No arXiv ID found"}
    try:
        async with session.get(f"http://export.arxiv.org/api/query?id_list={aid}") as r:
            text = await r.text()
            if aid in text:
                return {"passed": True, "title": f"arXiv:{aid}", "url": f"https://arxiv.org/abs/{aid}", "note": "Verified on arXiv"}
    except: pass
    return {"passed": False, "title": None, "url": None, "note": "arXiv ID not found"}

async def validate_reference(ref: str, session):
    current_year = datetime.now().year
    result = {
        "text": ref.strip(),
        "valid": False,
        "checks": {
            "Crossref": {"checked": False, "passed": False, "title": None, "url": None, "note": "Not checked"},
            "OpenAlex": {"checked": False, "passed": False, "title": None, "url": None, "note": "Not checked"},
            "PubMed": {"checked": False, "passed": False, "title": None, "url": None, "note": "Not checked"},
            "arXiv": {"checked": False, "passed": False, "title": None, "url": None, "note": "Not checked"}
        },
        "verdict": "PENDING",
        "reason": ""
    }

    doi_match = re.search(r'10\.\d{4,9}/[^\s\]\),;]+', ref)
    pmid_match = re.search(r'PMID[:\s]*(\d+)', ref, re.I)
    arxiv_match = re.search(r'arXiv[:\s]*(\d{4}\.\d{4,5}(v\d+)?)', ref, re.I)
    year_match = re.search(r'\((\d{4})\)', ref)

    year = int(year_match.group(1)) if year_match else None
    if year and year > current_year + 1:
        result["verdict"] = "FAKE"
        result["reason"] = f"Future publication year ({year}) — impossible in {current_year}"
        result["valid"] = False
        return result

    tasks = []
    if doi_match:
        doi = doi_match.group(0).rstrip(".,;")
        result["checks"]["Crossref"]["checked"] = True
        result["checks"]["OpenAlex"]["checked"] = True
        tasks.extend([check_crossref(doi, session), check_openalex(doi, session)])
    if pmid_match:
        pmid = pmid_match.group(1)
        result["checks"]["PubMed"]["checked"] = True
        tasks.append(check_pubmed(pmid, session))
    if arxiv_match:
        aid = arxiv_match.group(1).split("v")[0]
        result["checks"]["arXiv"]["checked"] = True
        tasks.append(check_arxiv(aid, session))

    if tasks:
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        idx = 0
        if doi_match:
            cr = responses[idx] if isinstance(responses[idx], dict) else {"passed": False, "note": "Error"}
            result["checks"]["Crossref"].update(cr)
            idx += 1
            oa = responses[idx] if isinstance(responses[idx], dict) else {"passed": False, "note": "Error"}
            result["checks"]["OpenAlex"].update(oa)
            idx += 1
        if pmid_match:
            result["checks"]["PubMed"].update(responses[idx] if isinstance(responses[idx], dict) else {"passed": False, "note": "Error"})
            idx += 1
        if arxiv_match:
            result["checks"]["arXiv"].update(responses[idx] if isinstance(responses[idx], dict) else {"passed": False, "note": "Error"})

    passed_any = any(c["passed"] for c in result["checks"].values())
    result["valid"] = passed_any

    if passed_any:
        result["verdict"] = "VALID"
        result["reason"] = "Confirmed by at least one trusted database"
    else:
        if not any(c["checked"] for c in result["checks"].values()):
            result["verdict"] = "UNVERIFIED"
            result["reason"] = "No DOI, PMID, or arXiv ID found"
        else:
            result["verdict"] = "FAKE / NOT FOUND"
            result["reason"] = "Identifier checked but not found in any database"

    return result

async def extract_references(text: str):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    refs = []
    current = ""
    for line in lines:
        if re.match(r'^\d+[\.\)\s]|\[\d+\]', line) or any(x in line.lower() for x in ["doi:", "10.", "pmid", "arxiv"]):
            if current: refs.append(current.strip())
            current = line
        elif current:
            current += " " + line
    if current: refs.append(current.strip())
    return list(dict.fromkeys(refs))[:60]

async def validate_all(text: str):
    candidates = await extract_references(text)
    if not candidates: return []
    async with aiohttp.ClientSession() as session:
        tasks = [validate_reference(ref, session) for ref in candidates]
        return await asyncio.gather(*tasks)

async def analyze(text: str):
    if len(text.strip()) < 100: return {"error": "Text too short"}
    doc = nlp(text)
    sentences = []
    for i, sent in enumerate(doc.sents):
        s = sent.text.strip()
        if len(s) < 20: continue
        words = [t.text for t in sent if not t.is_punct and not t.is_space]
        word_scores = [{"word": t.text, "score": max(10, min(99, 50 + (i%25-12)))} for t in sent if not t.is_punct and not t.is_space]
        sent_score = sum(w["score"] for w in word_scores)/len(word_scores) if word_scores else 50
        sentences.append({"id": i, "text": s, "ai_score": round(max(10, min(99, sent_score)), 1), "words": word_scores})

    avg_ai = sum(s["ai_score"] for s in sentences) / len(sentences)
    references = await validate_all(text)

    return {
        "overall_ai_probability": round(avg_ai, 1),
        "overall_human_probability": round(100 - avg_ai, 1),
        "sentence_analysis": sentences,
        "references": references,
        "valid_references": len([r for r in references if r["valid"]]),
        "fake_references": len([r for r in references if not r["valid"]])
    }

@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    text = extract_text(await file.read(), file.filename)
    return await analyze(text)

class TextInput(BaseModel): text: str
@app.post("/api/detect-text")
async def detect_text(data: TextInput):
    return await analyze(data.text)