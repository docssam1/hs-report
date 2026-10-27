"""Verify that a downloaded practice ZIP keeps fractions in HTML and PDF."""

from pathlib import Path
from subprocess import run
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
ZIP = ROOT / ".private-work/math-markup-review/applied1-q15-3-mathml.zip"

with ZipFile(ZIP) as archive:
    question_html = archive.read("문제.html").decode("utf-8")
    assert question_html.count("<math ") == 51
    assert 'class="frac"' not in question_html
    assert 'math{color:inherit' in question_html
    question_pdf = archive.read("문제.pdf")
    assert len(question_pdf) > 10_000

with TemporaryDirectory() as directory:
    pdf = Path(directory) / "questions.pdf"
    output = Path(directory) / "page"
    pdf.write_bytes(question_pdf)
    run(["pdftoppm", "-f", "1", "-l", "1", "-scale-to", "1200", "-png", "-singlefile", str(pdf), str(output)], check=True)
    page = Image.open(str(output) + ".png").convert("L")
    assert page.size == (849, 1200)
    # The first fraction in the first question must have ink above and below its bar.
    numerator = sum(pixel < 170 for pixel in page.crop((68, 272, 82, 284)).get_flattened_data())
    denominator = sum(pixel < 170 for pixel in page.crop((68, 286, 82, 300)).get_flattened_data())
    assert numerator >= 5 and denominator >= 5, (numerator, denominator)

print("PASS: ZIP HTML uses native MathML; ZIP PDF visibly prints numerator and denominator")
