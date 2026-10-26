import AppKit
import Foundation

struct Triangle { let top: Int; let left: Int; let right: Int; let inside: String }
let cases: [[Triangle]] = [
  [Triangle(top:2,left:4,right:6,inside:"3"), Triangle(top:4,left:6,right:9,inside:"6"), Triangle(top:8,left:4,right:2,inside:"4"), Triangle(top:6,left:8,right:12,inside:"ㄱ")],
  [Triangle(top:3,left:2,right:8,inside:"12"), Triangle(top:5,left:5,right:7,inside:"7"), Triangle(top:4,left:3,right:9,inside:"12"), Triangle(top:6,left:4,right:10,inside:"15")],
  [Triangle(top:2,left:3,right:9,inside:"6"), Triangle(top:4,left:8,right:6,inside:"3"), Triangle(top:7,left:7,right:10,inside:"10"), Triangle(top:5,left:4,right:12,inside:"15")],
  [Triangle(top:6,left:4,right:8,inside:"12"), Triangle(top:3,left:9,right:6,inside:"2"), Triangle(top:5,left:5,right:10,inside:"10"), Triangle(top:8,left:6,right:15,inside:"20")],
  [Triangle(top:4,left:2,right:11,inside:"22"), Triangle(top:6,left:9,right:12,inside:"8"), Triangle(top:5,left:10,right:14,inside:"7"), Triangle(top:7,left:8,right:16,inside:"14")],
  [Triangle(top:5,left:3,right:12,inside:"20"), Triangle(top:7,left:7,right:9,inside:"9"), Triangle(top:4,left:8,right:10,inside:"5"), Triangle(top:6,left:5,right:15,inside:"18")],
  [Triangle(top:8,left:4,right:9,inside:"18"), Triangle(top:3,left:6,right:8,inside:"4"), Triangle(top:6,left:12,right:10,inside:"5"), Triangle(top:9,left:6,right:14,inside:"21")],
  [Triangle(top:4,left:6,right:15,inside:"10"), Triangle(top:5,left:10,right:16,inside:"8"), Triangle(top:7,left:14,right:12,inside:"6"), Triangle(top:8,left:9,right:18,inside:"16")],
  [Triangle(top:9,left:6,right:12,inside:"18"), Triangle(top:8,left:16,right:10,inside:"5"), Triangle(top:6,left:12,right:14,inside:"7"), Triangle(top:7,left:10,right:20,inside:"14")]
]

func drawCentered(_ text: String, at center: CGPoint, font: NSFont, color: NSColor) {
    let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: color]
    let size = (text as NSString).size(withAttributes: attrs)
    (text as NSString).draw(at: CGPoint(x: center.x - size.width / 2, y: center.y - size.height / 2), withAttributes: attrs)
}

let outDir = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let w = 1600, h = 360
for (idx, triangles) in cases.enumerated() where idx > 0 {
    let image = NSImage(size: NSSize(width: w, height: h))
    image.lockFocus()
    NSColor.white.setFill(); NSRect(x: 0, y: 0, width: w, height: h).fill()
    for (i, t) in triangles.enumerated() {
        let cx = 200 + i * 400
        let top = CGPoint(x: cx, y: 292)
        let left = CGPoint(x: cx - 120, y: 55)
        let right = CGPoint(x: cx + 120, y: 55)
        NSColor(calibratedRed: 0.30, green: 0.28, blue: 0.25, alpha: 1).setStroke()
        let path = NSBezierPath(); path.lineWidth = 4
        path.move(to: top); path.line(to: left); path.line(to: right); path.close(); path.stroke()
        for (point, value) in [(top, String(t.top)), (left, String(t.left)), (right, String(t.right))] {
            let r: CGFloat = 48
            NSBezierPath(ovalIn: NSRect(x: point.x-r, y: point.y-r, width: r*2, height: r*2)).fill()
            NSColor(calibratedRed: 0.86, green: 0.63, blue: 0.63, alpha: 1).setFill()
            NSBezierPath(ovalIn: NSRect(x: point.x-r, y: point.y-r, width: r*2, height: r*2)).fill()
            NSColor(calibratedRed: 0.30, green: 0.28, blue: 0.25, alpha: 1).setStroke()
            NSBezierPath(ovalIn: NSRect(x: point.x-r, y: point.y-r, width: r*2, height: r*2)).stroke()
            drawCentered(value, at: point, font: NSFont(name: "Helvetica", size: value.count > 2 ? 27 : 32)!, color: .black)
        }
        if i == 3 {
            let center = CGPoint(x: CGFloat(cx), y: 150)
            NSColor(calibratedRed: 0.52, green: 0.52, blue: 0.52, alpha: 1).setStroke()
            NSBezierPath(ovalIn: NSRect(x: center.x - 17, y: center.y - 17, width: 34, height: 34)).stroke()
            drawCentered("ㄱ", at: center, font: NSFont(name: "AppleGothic", size: 23)!, color: .black)
        } else {
            drawCentered(t.inside, at: CGPoint(x: CGFloat(cx), y: 150), font: NSFont(name: "Helvetica", size: 31)!, color: .black)
        }
    }
    image.unlockFocus()
    guard let tiff = image.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { fatalError("PNG render failed") }
    try png.write(to: outDir.appendingPathComponent("q08-rule-variant-\(idx+1)-r29.png"))
}
