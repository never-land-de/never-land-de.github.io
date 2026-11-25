// Native macOS decoder used by convert-machine-memory.py. No embedded RAW previews.
import Foundation
import CoreImage
import ImageIO

func require(_ condition: Bool, _ message: String) throws {
    if !condition { throw NSError(domain: "MachineMemory", code: 1,
                                 userInfo: [NSLocalizedDescriptionKey: message]) }
}

do {
    let args = CommandLine.arguments
    try require(args.count == 4, "Usage: decoder SOURCE OUTPUT.png MAX_WIDTH")
    let sourceURL = URL(fileURLWithPath: args[1])
    let outputURL = URL(fileURLWithPath: args[2])
    guard let maxWidth = Double(args[3]), maxWidth > 0,
          let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
          let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any]
    else { throw NSError(domain: "MachineMemory", code: 2) }
    var log: [String: Any] = [
        "source_width": properties[kCGImagePropertyPixelWidth] ?? 0,
        "source_height": properties[kCGImagePropertyPixelHeight] ?? 0,
        "source_orientation": properties[kCGImagePropertyOrientation] ?? 1
    ]
    let image: CIImage
    if sourceURL.pathExtension.lowercased() == "dng" {
        guard let raw = CIRAWFilter(imageURL: sourceURL) else {
            throw NSError(domain: "MachineMemory", code: 3,
                          userInfo: [NSLocalizedDescriptionKey: "Native full-resolution RAW decoder unavailable"])
        }
        raw.isDraftModeEnabled = false
        raw.scaleFactor = 1
        raw.sharpnessAmount = 0
        raw.contrastAmount = 0
        raw.detailAmount = 0
        guard let developed = raw.outputImage else {
            throw NSError(domain: "MachineMemory", code: 4)
        }
        let native = raw.nativeSize
        try require(abs(developed.extent.width * developed.extent.height - native.width * native.height) < 1,
                    "RAW development did not produce the full native resolution")
        log["raw_native"] = [Int(native.width), Int(native.height)]
        log["raw_developed"] = [Int(developed.extent.width), Int(developed.extent.height)]
        log["raw_decoder"] = raw.decoderVersion.rawValue
        image = developed // CIRAWFilter applies the recorded orientation itself.
    } else {
        guard let decoded = CIImage(contentsOf: sourceURL, options: [.applyOrientationProperty: true]) else {
            throw NSError(domain: "MachineMemory", code: 5)
        }
        image = decoded
    }
    let normalized = image.transformed(by: CGAffineTransform(translationX: -image.extent.minX,
                                                             y: -image.extent.minY))
    log["oriented_dimensions"] = [Int(normalized.extent.width), Int(normalized.extent.height)]
    let scale = min(1, maxWidth / normalized.extent.width)
    let width = Int((normalized.extent.width * scale).rounded())
    let height = Int((normalized.extent.height * scale).rounded())
    let resized = scale < 1
        ? normalized.applyingFilter("CILanczosScaleTransform", parameters: ["inputScale": scale, "inputAspectRatio": 1])
        : normalized
    let output = resized.cropped(to: CGRect(x: 0, y: 0, width: width, height: height))
    let context = CIContext(options: [.useSoftwareRenderer: true])
    try context.writePNGRepresentation(of: output, to: outputURL, format: .RGBA8,
                                      colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
    log["output_dimensions"] = [width, height]
    let data = try JSONSerialization.data(withJSONObject: log, options: [.sortedKeys])
    print(String(decoding: data, as: UTF8.self))
} catch {
    fputs("Conversion failed: \(error)\n", stderr)
    exit(1)
}
