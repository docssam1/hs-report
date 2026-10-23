import Foundation
import AppKit
import AVFoundation
import CoreText
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let W = 1280, H = 720, fps: Int32 = 24
let length = 26.0
let root = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let cs = CGColorSpaceCreateDeviceRGB()
func color(_ r:Double,_ g:Double,_ b:Double,_ a:Double = 1) -> CGColor { CGColor(colorSpace:cs,components:[r,g,b,a])! }
func clamp(_ x:Double) -> Double { max(0,min(1,x)) }
func ease(_ x:Double) -> Double { let t=clamp(x);return t*t*(3-2*t) }
func envelope(_ t:Double,_ start:Double,_ end:Double) -> Double { ease((t-start)/0.45)*ease((end-t)/0.40) }
func line(_ c:CGContext,_ a:CGPoint,_ b:CGPoint,_ rgba:CGColor,_ width:Double=1) { c.setStrokeColor(rgba);c.setLineWidth(width);c.move(to:a);c.addLine(to:b);c.strokePath() }
func text(_ c:CGContext,_ value:String,_ size:Double,_ y:Double,_ rgba:CGColor,_ maxWidth:Double=310,_ bold:Bool=true) {
    var font = CTFontCreateWithName((bold ? "AppleSDGothicNeo-Bold" : "AppleSDGothicNeo-Regular") as CFString,size,nil)
    var attrs:[NSAttributedString.Key:Any] = [.font:font,.foregroundColor:rgba]
    var item = CTLineCreateWithAttributedString(NSAttributedString(string:value,attributes:attrs))
    let width = CTLineGetTypographicBounds(item,nil,nil,nil)
    if width > maxWidth { font=CTFontCreateCopyWithAttributes(font,size*maxWidth/width,nil,nil);attrs[.font]=font;item=CTLineCreateWithAttributedString(NSAttributedString(string:value,attributes:attrs)) }
    let measured=CTLineGetTypographicBounds(item,nil,nil,nil)
    c.textMatrix = .identity
    c.textPosition=CGPoint(x:(Double(W)-measured)/2,y:Double(H)-y-(CTFontGetAscent(font)-CTFontGetDescent(font))/2)
    CTLineDraw(item,c)
}
func save(_ image:CGImage,_ name:String) { let u=root.appendingPathComponent(name);let dst=CGImageDestinationCreateWithURL(u as CFURL,UTType.png.identifier as CFString,1,nil)!;CGImageDestinationAddImage(dst,image,nil);CGImageDestinationFinalize(dst) }
func draw(_ c:CGContext,_ t:Double) {
    let finish=ease((t-14.75)/0.8)
    let dark=[0.025,0.043,0.082], bright=[0.965,0.975,0.99]
    let bg=(0..<3).map{dark[$0]*(1-finish)+bright[$0]*finish}
    c.setFillColor(color(bg[0],bg[1],bg[2]));c.fill(CGRect(x:0,y:0,width:W,height:H))
    let ink=finish > 0.5 ? color(0.095,0.135,0.19) : color(0.97,0.98,1)
    let theme=color(0.14,0.34,0.77)
    // A moving construction grid evokes the work already done, with no test data.
    let gridAlpha=(0.06+0.035*sin(t*0.7))*(1-0.7*finish)
    for i in -12...12 {
        let x=Double(W)/2+Double(i)*80
        line(c,CGPoint(x:Double(W)/2+Double(i)*18,y:Double(H)*0.46),CGPoint(x:x,y:-30),color(0.36,0.53,0.82,gridAlpha))
    }
    for i in 0...12 {
        let v=(Double(i)+t*0.45).truncatingRemainder(dividingBy:13)/13
        let y=Double(H)*0.46-pow(v,2)*Double(H)*0.52
        line(c,CGPoint(x:0,y:y),CGPoint(x:Double(W),y:y),color(0.36,0.53,0.82,gridAlpha))
    }
    // Four precise shapes converge toward the center across the sequence.
    let converge=ease(t/15)
    for j in 0..<4 {
        let phase=Double(j)*Double.pi/2+t*0.13
        let radius=410-75*converge, cx=Double(W)/2+cos(phase)*radius, cy=Double(H)/2+sin(phase)*190
        c.saveGState();c.translateBy(x:cx,y:cy);c.rotate(by:t*0.06+Double(j)*0.3)
        c.setStrokeColor(color(0.24,0.43,0.76,0.12*(1-finish)));c.setLineWidth(1)
        let rect=CGRect(x:-44,y:-44,width:88,height:88)
        if j%2 == 0 {c.stroke(rect)} else {c.strokeEllipse(in:rect)}
        c.restoreGState()
    }
    // Corner marks keep the composition centered and safe for portrait cropping.
    let cornerAlpha=0.16*(1-finish)
    for x in [Double(W)/2-215,Double(W)/2+215] {
        let sign=x<Double(W)/2 ? 1.0 : -1.0
        line(c,CGPoint(x:x,y:145),CGPoint(x:x+sign*22,y:145),color(0.45,0.62,0.9,cornerAlpha))
        line(c,CGPoint(x:x,y:575),CGPoint(x:x+sign*22,y:575),color(0.45,0.62,0.9,cornerAlpha))
    }
    if t<14.75 {text(c,"G·FIELD",20,94,color(0.70,0.78,0.91,0.72),310,false)}
    var a=envelope(t,0.25,3.55)
    if a>0 { c.saveGState();c.setAlpha(a);text(c,"틀려도,",78,330,ink);text(c,"다시 생각했던 시간.",25,414,color(0.66,0.74,0.87),310,false);c.restoreGState() }
    a=envelope(t,3.55,7.1)
    if a>0 { c.saveGState();c.setAlpha(a);let dy=(1-ease((t-3.55)/1.3))*15;text(c,"멈추지 않고",52,296+dy,ink);text(c,"끝까지 풀었던 너.",47,374+dy,ink);c.restoreGState() }
    a=envelope(t,7.1,10.95)
    if a>0 { c.saveGState();c.setAlpha(a);text(c,"그 시간이,",60,292,ink);text(c,"너의 힘이 됐다.",50,374,ink);let progress=ease((t-7.3)/2);c.setFillColor(theme);c.fill(CGRect(x:Double(W)/2-75,y:265,width:150*progress,height:3));c.restoreGState() }
    a=envelope(t,10.95,14.95)
    if a>0 { c.saveGState();c.setAlpha(a);text(c,"이제,",33,233,color(0.63,0.74,0.93),310,false);text(c,"네 생각을",65,318,ink);text(c,"보여줄 차례.",58,402,ink);c.restoreGState() }
    a=envelope(t,15.0,19.8)
    if a>0 {c.saveGState();c.setAlpha(a);text(c,"G·FIELD",36,180,theme);text(c,"분명 노력한 너희들,",39,298,ink);text(c,"좋은 결과가",51,369,ink);text(c,"있을 거야.",51,440,ink);c.restoreGState()}
    a=envelope(t,19.8,23.1)
    if a>0 {c.saveGState();c.setAlpha(a);text(c,"G·FIELD",36,180,theme);text(c,"부모님,",55,330,ink);text(c,"고생하셨습니다.",49,408,ink);c.restoreGState()}
    a=ease((t-23.1)/0.4)
    if a>0 {c.saveGState();c.setAlpha(a);text(c,"G·FIELD",42,201,theme);text(c,"자, 얘들아",56,332,ink);text(c,"시작해 볼까?",54,410,ink);c.restoreGState()}
    // A brief cut flash is kept subtle; no strobe or rapid full-screen flashing.
    for beat in [3.55,7.1,10.95] {let p=max(0,1-abs(t-beat)/0.13)*0.045;c.setFillColor(color(0.55,0.7,1,p));c.fill(CGRect(x:0,y:0,width:W,height:H))}
}

@main struct MakeIntro {
    static func main() async throws {
        if CommandLine.arguments.count>2 && CommandLine.arguments[2]=="verify" {
            let u=root.appendingPathComponent("intro-trailer-v2.mp4"),asset=AVURLAsset(url:u)
            let duration=try await asset.load(.duration),videos=try await asset.loadTracks(withMediaType:.video),audios=try await asset.loadTracks(withMediaType:.audio)
            let size=try await videos[0].load(.naturalSize),rate=try await videos[0].load(.nominalFrameRate)
            let reader=try AVAssetReader(asset:asset),output=AVAssetReaderTrackOutput(track:videos[0],outputSettings:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32BGRA])
            reader.add(output);reader.startReading();var count=0,last = -1.0
            while let sample=output.copyNextSampleBuffer() {let now=CMSampleBufferGetPresentationTimeStamp(sample).seconds;guard now>last else {throw NSError(domain:"timestamps",code:2)};last=now;count+=1}
            guard reader.status == .completed && count==Int(length*Double(fps)) && audios.count==1 else {throw NSError(domain:"decode",code:3)}
            let gen=AVAssetImageGenerator(asset:asset);gen.appliesPreferredTrackTransform=true;gen.requestedTimeToleranceBefore = .zero;gen.requestedTimeToleranceAfter = .zero
            for t in [0.0,1.5,5.0,9.0,13.0,17.0,21.0,24.5,25.95] {
                let image=try gen.copyCGImage(at:CMTime(seconds:t,preferredTimescale:600),actualTime:nil);let tag=String(format:"%.2f",t);save(image,"encoded-\(tag).png")
                let crop=image.cropping(to:CGRect(x:474,y:0,width:332,height:720))!;save(crop,"mobile-\(tag).png")
            }
            let report:[String:Any]=["duration":duration.seconds,"width":size.width,"height":size.height,"fps":rate,"decodedFrames":count,"audioTracks":audios.count,"status":"revision v2; encoded verification","audioListening":"not performed","safeCenterWidth":310]
            try JSONSerialization.data(withJSONObject:report,options:.prettyPrinted).write(to:root.appendingPathComponent("qa.json"));print(String(data:try JSONSerialization.data(withJSONObject:report),encoding:.utf8)!);return
        }
        if CommandLine.arguments.count>2 && CommandLine.arguments[2]=="inspect" {
            let source=root.appendingPathComponent("original-intro.mp4"),asset=AVURLAsset(url:source)
            let duration=try await asset.load(.duration)
            let gen=AVAssetImageGenerator(asset:asset);gen.appliesPreferredTrackTransform=true
            for (i,t) in [0.5,min(4.0,duration.seconds/2),max(0,duration.seconds-1)].enumerated() {let image=try gen.copyCGImage(at:CMTime(seconds:t,preferredTimescale:600),actualTime:nil);save(image,"original-\(i).png")}
            print("Original duration \(duration.seconds)");return
        }
        let output=root.appendingPathComponent("intro-silent.mp4")
        let writer=try AVAssetWriter(outputURL:output,fileType:.mp4)
        let settings:[String:Any]=[AVVideoCodecKey:AVVideoCodecType.h264,AVVideoWidthKey:W,AVVideoHeightKey:H,AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:3_500_000,AVVideoExpectedSourceFrameRateKey:fps,AVVideoProfileLevelKey:AVVideoProfileLevelH264HighAutoLevel]]
        let input=AVAssetWriterInput(mediaType:.video,outputSettings:settings);input.expectsMediaDataInRealTime=false
        let adaptor=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:input,sourcePixelBufferAttributes:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32ARGB,kCVPixelBufferWidthKey as String:W,kCVPixelBufferHeightKey as String:H,kCVPixelBufferCGImageCompatibilityKey as String:true,kCVPixelBufferCGBitmapContextCompatibilityKey as String:true])
        writer.add(input);guard writer.startWriting() else {throw writer.error!};writer.startSession(atSourceTime:.zero)
        let captures:Set<Int>=[0,36,120,216,312,408,504,588,623]
        for frame in 0..<Int(length*Double(fps)) {
            while !input.isReadyForMoreMediaData {try await Task.sleep(nanoseconds:2_000_000)}
            try autoreleasepool {
                var buffer:CVPixelBuffer?;CVPixelBufferPoolCreatePixelBuffer(nil,adaptor.pixelBufferPool!,&buffer)
                guard let buffer=buffer else {throw NSError(domain:"pixelbuffer",code:1)}
                CVPixelBufferLockBaseAddress(buffer,[])
                let context=CGContext(data:CVPixelBufferGetBaseAddress(buffer),width:W,height:H,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(buffer),space:cs,bitmapInfo:CGImageAlphaInfo.noneSkipFirst.rawValue|CGBitmapInfo.byteOrder32Big.rawValue)!
                draw(context,Double(frame)/Double(fps))
                if captures.contains(frame) {save(context.makeImage()!,"frame-\(String(format:"%03d",frame)).png")}
                CVPixelBufferUnlockBaseAddress(buffer,[])
                if !adaptor.append(buffer,withPresentationTime:CMTime(value:Int64(frame),timescale:fps)) {throw writer.error!}
            }
            if frame%96==0 {print("Rendered \(frame)/\(Int(length*Double(fps)))")}
        }
        input.markAsFinished();await writer.finishWriting();guard writer.status == .completed else {throw writer.error!}
        let videoAsset=AVURLAsset(url:output),audioAsset=AVURLAsset(url:root.appendingPathComponent("score.wav"))
        let composition=AVMutableComposition(),video=composition.addMutableTrack(withMediaType:.video,preferredTrackID:kCMPersistentTrackID_Invalid)!,audio=composition.addMutableTrack(withMediaType:.audio,preferredTrackID:kCMPersistentTrackID_Invalid)!
        let duration=try await videoAsset.load(.duration)
        try video.insertTimeRange(CMTimeRange(start:.zero,duration:duration),of:try await videoAsset.loadTracks(withMediaType:.video)[0],at:.zero)
        try audio.insertTimeRange(CMTimeRange(start:.zero,duration:duration),of:try await audioAsset.loadTracks(withMediaType:.audio)[0],at:.zero)
        let export=AVAssetExportSession(asset:composition,presetName:AVAssetExportPresetHighestQuality)!
        export.outputURL=root.appendingPathComponent("intro-trailer-v2.mp4");export.outputFileType = .mp4;export.shouldOptimizeForNetworkUse=true
        await export.export();guard export.status == .completed else {throw export.error!}
        print("COMPLETE \(export.outputURL!.path)")
    }
}
