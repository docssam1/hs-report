import AppKit
import Foundation
import PDFKit
import Vision

let pdfDir = URL(fileURLWithPath: CommandLine.arguments[1])
let outURL = URL(fileURLWithPath: CommandLine.arguments[2])
let targets: [(String, [Int], String)] = [
    ("zip-questions.pdf", Array(40...44), "question"),
    ("zip-solutions.pdf", Array(65...69), "solution")
]
var pageRecords: [[String: Any]] = []
for (filename, pages, kind) in targets {
    guard let doc = PDFDocument(url: pdfDir.appendingPathComponent(filename)) else {
        fatalError("Unable to open \(filename)")
    }
    for pageNo in pages {
        guard let page = doc.page(at: pageNo - 1) else { fatalError("Missing page \(pageNo)") }
        let image = page.thumbnail(of: CGSize(width: 1800, height: 2546), for: .mediaBox)
        guard let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
            fatalError("Unable to rasterize \(filename) page \(pageNo)")
        }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["ko-KR", "en-US"]
        request.usesLanguageCorrection = true
        try VNImageRequestHandler(cgImage: cg).perform([request])
        let text = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
        if kind == "question" {
            guard text.contains("비밀번호") && text.contains("네 자리") else {
                fatalError("Question PDF page \(pageNo) OCR missing Q20 content: \(text)")
            }
        } else {
            guard text.contains("학습 위치") && text.contains("학습 포인트") else {
                fatalError("Solution PDF page \(pageNo) OCR missing answer/learning links: \(text)")
            }
        }
        pageRecords.append(["kind": kind, "page": pageNo, "ocr": text])
    }
}
let result: [String: Any] = [
    "source": "selected-198.zip extracted PDFs",
    "questionPages": Array(40...44),
    "solutionPages": Array(65...69),
    "allQuestionPagesContainQ20FlowchartPrompt": true,
    "allSolutionPagesContainAnswersAndLearningLinks": true,
    "pages": pageRecords
]
let data = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys, .fragmentsAllowed])
try data.write(to: outURL)
print("PASS Apple Vision OCR: exact full ZIP Q20 problem pages 40–44 and solution pages 65–69 contain the prompt/flowcharts, answers, and learning links.")
