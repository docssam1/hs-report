import AppKit
import Foundation
import PDFKit
import Vision

let args = CommandLine.arguments
guard args.count == 4 else { fatalError("usage: swift validator questions.pdf solutions.pdf output.json") }
let questionURL = URL(fileURLWithPath: args[1])
let solutionURL = URL(fileURLWithPath: args[2])
let outputURL = URL(fileURLWithPath: args[3])
let questionPDF = PDFDocument(url: questionURL)!
let solutionPDF = PDFDocument(url: solutionURL)!

func recognize(_ page: PDFPage, pageNo: Int) throws -> String {
    let image = page.thumbnail(of: CGSize(width: 1800, height: 2546), for: .mediaBox)
    guard let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fatalError("Unable to rasterize page \(pageNo)")
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["ko-KR", "en-US"]
    request.usesLanguageCorrection = true
    try VNImageRequestHandler(cgImage: cg).perform([request])
    return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}

var pages: [[String: Any]] = []
for pageNo in 5...7 {
    guard let page = questionPDF.page(at: pageNo - 1) else { fatalError("Missing question page \(pageNo)") }
    pages.append(["kind": "question", "page": pageNo, "ocr": try recognize(page, pageNo: pageNo)])
}
for pageNo in 6...11 {
    guard let page = solutionPDF.page(at: pageNo - 1) else { fatalError("Missing solution page \(pageNo)") }
    pages.append(["kind": "solution", "page": pageNo, "ocr": try recognize(page, pageNo: pageNo)])
}
let questionOCR = pages.filter { ($0["kind"] as? String) == "question" }.compactMap { $0["ocr"] as? String }.joined(separator: "\n")
let solutionOCR = pages.filter { ($0["kind"] as? String) == "solution" }.compactMap { $0["ocr"] as? String }.joined(separator: "\n")
let compactLetters = questionOCR.uppercased().filter { $0.isASCII && $0.isLetter }
let equations = ["DEAAAECCB", "BDADBCECD", "ECBCDBAAC", "BDEDBCACC", "BCDDEEAEB", "CBABBDEDD", "ADEDABCBB", "BACBEEDEB", "DBCAACECB"]
let answers = ["86091", "69150", "01549", "09152", "09381", "65910", "91052", "29801", "56190"]
for equation in equations where !compactLetters.contains(equation) { fatalError("Question PDF OCR missing Q03 equation \(equation)") }
for answer in answers where !solutionOCR.contains(answer) { fatalError("Solution PDF OCR missing Q03 answer \(answer)") }
guard solutionOCR.contains("학습 위치") && solutionOCR.contains("학습 포인트") else {
    fatalError("Solution PDF OCR missing linked learning location or point")
}
let result: [String: Any] = [
    "source": "135-item downloaded ZIP",
    "questionPages": Array(5...7),
    "solutionPages": Array(6...11),
    "allNineQuestionEquationsVisible": true,
    "allNineAnswersAndLearningLinksVisible": true,
    "pages": pages
]
let json = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
try json.write(to: outputURL)
print("PASS Apple Vision OCR: all nine Q03 equations appear on downloaded ZIP pages 5–7, and all nine answers plus learning links appear on solution pages 6–11.")
