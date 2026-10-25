import Foundation
import Vision

let imageURL = URL(fileURLWithPath: CommandLine.arguments[1])
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["ko-KR", "en-US"]
request.usesLanguageCorrection = false
try VNImageRequestHandler(url: imageURL).perform([request])
for observation in request.results ?? [] {
    guard let text = observation.topCandidates(1).first?.string else { continue }
    print(text)
}
