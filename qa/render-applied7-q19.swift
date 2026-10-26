import AppKit
import Foundation

struct Case { let firstPunches: Int; let coloredPunches: Int }
let cases: [Case] = [Case(firstPunches:1,coloredPunches:2), Case(firstPunches:1,coloredPunches:1), Case(firstPunches:2,coloredPunches:1), Case(firstPunches:4,coloredPunches:1), Case(firstPunches:3,coloredPunches:2), Case(firstPunches:4,coloredPunches:2), Case(firstPunches:3,coloredPunches:3), Case(firstPunches:4,coloredPunches:3), Case(firstPunches:3,coloredPunches:4)]
func line(_ a: CGPoint,_ b: CGPoint,_ color:NSColor = .black,_ width:CGFloat=2) {
    color.setStroke(); let p=NSBezierPath();p.lineWidth=width;p.move(to:a);p.line(to:b);p.stroke()
}
func dashed(_ a:CGPoint,_ b:CGPoint) {
    NSColor(calibratedWhite:0.58,alpha:1).setStroke();let p=NSBezierPath();p.lineWidth=2;p.setLineDash([7,6],count:2,phase:0);p.move(to:a);p.line(to:b);p.stroke()
}
func dot(_ center:CGPoint,r:CGFloat, square:Bool) {
    NSColor(calibratedWhite:0.08,alpha:1).setFill()
    let rect=NSRect(x:center.x-r,y:center.y-r,width:r*2,height:r*2)
    if square { NSBezierPath(rect:rect).fill() } else { NSBezierPath(ovalIn:rect).fill() }
}
func arrow(_ x1:CGFloat,_ x2:CGFloat,_ y:CGFloat) {
    let c=NSColor(calibratedWhite:0.06,alpha:1);c.setFill()
    let p=NSBezierPath();p.move(to:CGPoint(x:x1,y:y));p.line(to:CGPoint(x:x2-16,y:y));p.line(to:CGPoint(x:x2-16,y:y+12));p.line(to:CGPoint(x:x2,y:y-1));p.line(to:CGPoint(x:x2-16,y:y-14));p.line(to:CGPoint(x:x2-16,y:y-7));p.line(to:CGPoint(x:x1,y:y-7));p.close();p.fill()
}
func triangle(_ cx:CGFloat,_ cy:CGFloat, folded:Bool=false) -> (CGPoint,CGPoint,CGPoint) {
    // A right-triangle sheet after the first diagonal fold.
    let a=CGPoint(x:cx-58,y:cy-65), b=CGPoint(x:cx-58,y:cy+65), c=CGPoint(x:cx+72,y:cy+65)
    NSColor(calibratedWhite:0.3,alpha:1).setStroke();let p=NSBezierPath();p.lineWidth=2;p.move(to:a);p.line(to:b);p.line(to:c);p.close();p.stroke()
    if folded {
        line(CGPoint(x:a.x-7,y:a.y+3),CGPoint(x:b.x-7,y:b.y+3),NSColor(calibratedWhite:0.62,alpha:1),1.5)
        line(CGPoint(x:b.x-7,y:b.y+3),CGPoint(x:c.x-5,y:c.y+3),NSColor(calibratedWhite:0.62,alpha:1),1.5)
    }
    return (a,b,c)
}
func write(_ out:URL,_ item:Int,_ count:Case) throws {
    let image=NSImage(size:NSSize(width:1600,height:620));image.lockFocus()
    NSColor.white.setFill();NSRect(x:0,y:0,width:1600,height:620).fill()
    let y:CGFloat=425; let centers:[CGFloat]=[150,460,770,1080,1390]
    // Square before the first diagonal fold.
    let s:CGFloat=124, x=centers[0]
    let square=NSRect(x:x-s/2,y:y-s/2,width:s,height:s)
    NSColor(calibratedWhite:0.32,alpha:1).setStroke();NSBezierPath(rect:square).stroke()
    dashed(CGPoint(x:square.minX,y:square.minY),CGPoint(x:square.maxX,y:square.maxY))
    arrow(230,292,y)
    // First folded triangle.
    _ = triangle(centers[1],y)
    // Fold arrow between first triangle and the first-punch state.
    arrow(540,602,y)
    let (a,b,c)=triangle(centers[2],y)
    // Second crease, following the diagonal indicated in the source sequence.
    dashed(CGPoint(x:a.x,y:a.y),CGPoint(x:c.x,y:c.y-8))
    // Distribute punch marks in the wide lower half, away from the crease.
    for k in 0..<count.firstPunches {
        let col=k%2, row=k/2
        dot(CGPoint(x:centers[2]-39+CGFloat(col)*22,y:y+31-CGFloat(row)*24),r:8,square:true)
    }
    arrow(850,912,y)
    _ = triangle(centers[3],y,folded:true)
    // Curved fold cue, matching the original sequence.
    NSColor(calibratedWhite:0.22,alpha:1).setStroke();let arc=NSBezierPath();arc.lineWidth=2;arc.appendArc(withCenter:CGPoint(x:centers[3]+52,y:y+32),radius:28,startAngle:150,endAngle:285,clockwise:false);arc.stroke()
    arrow(1160,1222,y)
    let (fa,fb,fc)=triangle(centers[4],y,folded:true)
    // Colored-punch marks in the folded quarter.
    let spots=[CGPoint(x:centers[4]-17,y:y+27),CGPoint(x:centers[4]+14,y:y+6),CGPoint(x:centers[4]-27,y:y-12),CGPoint(x:centers[4]+20,y:y-35)]
    for k in 0..<count.coloredPunches { dot(spots[k],r:8,square:false) }
    // Blank unfolded sheet with the two fold lines. It does not show the answer.
    let fs:CGFloat=150, bx:800, by:120
    let final=NSRect(x:bx-fs/2,y:by-fs/2,width:fs,height:fs)
    NSColor(calibratedWhite:0.25,alpha:1).setStroke();NSBezierPath(rect:final).stroke()
    dashed(CGPoint(x:final.minX,y:final.minY),CGPoint(x:final.maxX,y:final.maxY))
    dashed(CGPoint(x:final.minX,y:final.maxY),CGPoint(x:final.maxX,y:final.minY))
    image.unlockFocus()
    guard let data=image.tiffRepresentation,let rep=NSBitmapImageRep(data:data),let png=rep.representation(using:.png,properties:[:]) else { fatalError("PNG render failed") }
    try png.write(to:out)
}
let dir=URL(fileURLWithPath:CommandLine.arguments[1],isDirectory:true);try FileManager.default.createDirectory(at:dir,withIntermediateDirectories:true)
for i in 1..<cases.count { try write(dir.appendingPathComponent("q19-fold-hole-variant-\(i+1)-r30.png"),i+1,cases[i]) }
