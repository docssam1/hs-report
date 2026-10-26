import AppKit
import Foundation
import PDFKit
import Vision

guard CommandLine.arguments.count == 4 else {
    fatalError("usage: swift applied3-q07-zip-vision-validate.swift questions.pdf answers.pdf output-directory")
}
let questionsURL = URL(fileURLWithPath: CommandLine.arguments[1])
let answersURL = URL(fileURLWithPath: CommandLine.arguments[2])
let output = URL(fileURLWithPath: CommandLine.arguments[3], isDirectory: true)
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
guard let questions = PDFDocument(url: questionsURL), let answers = PDFDocument(url: answersURL) else {
    fatalError("Unable to open PDFs extracted from the actual ZIP")
}

func inspect(_ document: PDFDocument, kind: String) throws -> [[String: Any]] {
    var pages: [[String: Any]] = []
    for index in 0..<document.pageCount {
        guard let page = document.page(at: index) else { fatalError("Missing \(kind) page \(index + 1)") }
        let image = page.thumbnail(of: CGSize(width: 1500, height: 2120), for: .mediaBox)
        guard let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
            fatalError("Unable to rasterize \(kind) page \(index + 1)")
        }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["ko-KR", "en-US"]
        request.usesLanguageCorrection = true
        try VNImageRequestHandler(cgImage: cgImage).perform([request])
        let text = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
        let relevant = kind == "questions"
            ? text.contains("주사위")
            : text.contains("원문 7번") && text.contains("학습 위치") && text.contains("학습 포인트")
        if relevant {
            let file = output.appendingPathComponent("\(kind)-page-\(index + 1).png")
            let bitmap = NSBitmapImageRep(cgImage: cgImage)
            if let data = bitmap.representation(using: .png, properties: [:]) { try data.write(to: file) }
        }
        pages.append(["page": index + 1, "text": text])
    }
    return pages
}

let questionPages = try inspect(questions, kind: "questions")
let solutionPages = try inspect(answers, kind: "solutions")
let questionHits = questionPages.filter { (($0["text"] as? String) ?? "").contains("주사위") }
let solutionHits = solutionPages.filter {
    let text = ($0["text"] as? String) ?? ""
    return text.contains("원문 7번") && text.contains("답") && text.contains("학습 포인트")
}
let questionText = questionPages.map { ($0["text"] as? String) ?? "" }.joined(separator: "\n")
let solutionText = solutionPages.map { ($0["text"] as? String) ?? "" }.joined(separator: "\n")
let q07SolutionText = solutionHits.map { ($0["text"] as? String) ?? "" }.joined(separator: "\n")
for answer in ["21", "17", "23", "19", "18", "14", "20", "13", "11"] where !q07SolutionText.contains(answer) {
    fatalError("Solution OCR did not contain answer \(answer)")
}
guard questionHits.count >= 3 else { fatalError("Could not find all printed question pages containing the nine Q07 variants") }
guard solutionHits.count >= 3 else { fatalError("Could not find all printed solution pages with Q07 answers and learning links") }
guard questionText.contains("모두 더하면") && q07SolutionText.contains("학습 위치") && q07SolutionText.contains("학습 포인트") else {
    fatalError("Q07 solution PDF is missing learning links")
}
let result: [String: Any] = [
    "pass": true,
    "questionPageCount": questions.pageCount,
    "solutionPageCount": answers.pageCount,
    "questionPagesWithDiceText": questionHits.compactMap { $0["page"] as? Int },
    "solutionPagesWithAnswersAndLearningLinks": solutionHits.compactMap { $0["page"] as? Int },
    "nineAnswersFound": ["21", "17", "23", "19", "18", "14", "20", "13", "11"],
    "learningLocationAndPointFound": true,
    "questionOCR": questionPages,
    "solutionOCR": solutionPages,
]
let data = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
try data.write(to: output.appendingPathComponent("vision-ocr-r10.json"))
print("PASS Apple Vision on ZIP-extracted A4 PDFs: \(questionHits.count) question pages with dice problems; nine answers and learning links recognized; pages \(questions.pageCount)/\(answers.pageCount).")
