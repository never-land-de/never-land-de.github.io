#!/usr/bin/env python3
"""Convert the reviewed Machine Memory sources on macOS; originals are read-only.

Run: python3 tools/convert-machine-memory.py
Requires Python 3 and Apple's installed Swift command-line tools/Core Image.
No packages, installations, runtime site dependency or lossy palette reduction.
Unreviewed extra files are inventoried but never automatically published.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import tempfile
import zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/machine-memory-assets"
DEST = ROOT / "essentials/tech/machine-memory"
HELPER = Path(__file__).with_name("machine-memory-image.swift")
# Case-sensitive, deliberately reviewed mappings. Widths are after EXIF rotation.
ASSETS = {
    "machine_archives_cover.png": ("cover.png", 1920),
    "imacg3_2000.HEIC": ("imac-g3-01.png", 1200),
    "imac_g3_2000.HEIC": ("imac-g3-02.png", 900),
    "internet_explorer_4_cd.HEIC": ("internet-explorer-4-cd.png", 1000),
    "ibook_g4.heic": ("ibook-g4.png", 1200),
    "ibook_g4_2.DNG": ("ibook-g4-02.png", 1000),
    "ibook_g4_hdd_install.HEIC": ("ibook-g4-hdd-install.png", 1000),
    "macbook_pro_2015_windows11.jpg": ("macbook-pro-2015-windows11.png", 1200),
    "battlestation_lights.HEIC": ("battlestation.png", 800),
    "compaq_mini_311.HEIC": ("compaq-mini-311.png", 900),
    "windows98.HEIC": ("windows-98.png", 1000),
    "windowsvista_home_premium_upgrade.HEIC": ("windows-vista-upgrade.png", 1000),
    "windowsxp_ssl_de.HEIC": ("windows-xp-01.png", 1200),
    "windowsxp_ssl_de_2.HEIC": ("windows-xp-02.png", 1000),
    "IMG_5361.HEIC": (None, 1000),
    "IMG_0433.HEIC": (None, 1000),
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def chunk(kind, data):
    return (struct.pack(">I", len(data)) + kind + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff))


def optimize_png(source, destination):
    """Lossless IDAT recompression; retain alpha, strip GPS/EXIF/ICC/text.

    Pixels have already been converted to sRGB. The compact sRGB chunk replaces
    the large ICC profile. Decoded scanline bytes are checked before publishing.
    """
    data = source.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Decoder did not produce PNG")
    offset, chunks, idat = 8, {}, bytearray()
    while offset < len(data):
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        payload = data[offset + 8:offset + 8 + length]
        if kind == b"IDAT":
            idat.extend(payload)
        else:
            chunks[kind] = payload
        offset += length + 12
    scanlines = zlib.decompress(idat)
    if len(set(scanlines)) < 8:
        raise ValueError("Degenerate image pixels: retry with native macOS decoder access outside the sandbox")
    candidates = [bytes(idat)]
    for strategy in (zlib.Z_DEFAULT_STRATEGY, zlib.Z_FILTERED):
        compressor = zlib.compressobj(9, zlib.DEFLATED, 15, 9, strategy)
        candidates.append(compressor.compress(scanlines) + compressor.flush())
    compressed = min(candidates, key=len)
    if zlib.decompress(compressed) != scanlines:
        raise ValueError("PNG lossless verification failed")
    result = data[:8] + chunk(b"IHDR", chunks[b"IHDR"]) + chunk(b"sRGB", b"\x00")
    for kind in (b"PLTE", b"tRNS"):
        if kind in chunks:
            result += chunk(kind, chunks[kind])
    result += chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    # Only complete verified PNGs are copied to the public directory.
    destination.write_bytes(result)


def cover_variants(work):
    """Small local PNGs let narrow screens avoid downloading the full cover."""
    cover = DEST / "cover.png"
    native_width, native_height = struct.unpack(">II", cover.read_bytes()[16:24])
    variants = []
    for width in (480, 960):
        if width >= native_width:
            continue
        filename = f"cover-{width}.png"
        temporary = work / filename
        subprocess.run(["sips", "--resampleWidth", str(width), str(cover), "--out", str(temporary)],
                       capture_output=True, text=True, check=True, timeout=60)
        optimize_png(temporary, DEST / filename)
        dimensions = struct.unpack(">II", (DEST / filename).read_bytes()[16:24])
        variants.append({"output": filename, "output_dimensions": list(dimensions),
                         "output_bytes": (DEST / filename).stat().st_size})
        print(f"OK responsive cover -> {filename}: {dimensions}", flush=True)
    return variants


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path,
                        help="Optional JSON conversion log outside docs/ (for example /private/tmp/machine-memory-conversion.json)")
    parser.add_argument("--only", nargs="+", choices=ASSETS,
                        help="Convert only these exact source filenames; leave other public assets untouched")
    args = parser.parse_args()
    if args.manifest and args.manifest.resolve().is_relative_to((ROOT / "docs").resolve()):
        parser.error("The converter treats docs/ as read-only; choose a manifest path outside docs/")
    if not SOURCE.is_dir():
        sys.exit(f"Source directory missing: {SOURCE}")
    swift = Path("/Library/Developer/CommandLineTools/usr/bin/swift")
    if not swift.is_file():
        found = shutil.which("swift")
        if not found:
            sys.exit("Apple Swift command-line tools are required; install/configure them, then retry.")
        swift = Path(found)
    DEST.mkdir(parents=True, exist_ok=True)
    rows, errors = [], []
    inventory = [{"file": p.name, "bytes": p.stat().st_size}
                 for p in sorted(SOURCE.iterdir()) if p.is_file()]
    with tempfile.TemporaryDirectory(prefix="machine-memory-convert-") as work:
        work = Path(work)
        selected = {name: ASSETS[name] for name in args.only} if args.only else ASSETS
        for name, (filename, width) in selected.items():
            source = SOURCE / name
            if not source.is_file():
                rows.append({"source": name, "status": "missing"})
                print(f"MISSING {name}")
                continue
            if filename is None:
                rows.append({"source": name, "status": "needs visual review and descriptive mapping"})
                errors.append(name)
                print(f"SKIP {name}: inspect and assign a descriptive filename in ASSETS first")
                continue
            before = digest(source)
            row = {"source": name, "source_format": source.suffix[1:].upper(),
                   "source_bytes": source.stat().st_size, "source_sha256": before}
            try:
                intermediate = work / filename
                run = subprocess.run([str(swift), "-module-cache-path", str(work / "swift-cache"),
                                      str(HELPER), str(source), str(intermediate), str(width)],
                                     capture_output=True, text=True, check=True, timeout=180)
                row.update(json.loads(run.stdout.strip().splitlines()[-1]))
                optimize_png(intermediate, DEST / filename)
                row.update({"output": filename, "output_bytes": (DEST / filename).stat().st_size,
                            "compression": "lossless zlib level 9 / best retained IDAT; sRGB, no metadata",
                            "status": "converted"})
                row["output_to_original_ratio"] = round(row["output_bytes"] / row["source_bytes"], 4)
                print(f"OK {name} -> {filename}: {row['output_dimensions']}, {row['output_bytes']:,} bytes", flush=True)
            except (subprocess.SubprocessError, ValueError, OSError) as error:
                row.update({"status": "failed", "error": str(error)})
                if isinstance(error, subprocess.CalledProcessError):
                    row["error"] = error.stderr[-3000:]
                errors.append(name)
                print(f"FAILED {name}: {row['error']}", file=sys.stderr)
            if digest(source) != before:
                raise RuntimeError(f"Original changed unexpectedly: {source}")
            rows.append(row)
        for row in rows:
            if row.get("output") == "cover.png" and row["status"] == "converted":
                try:
                    row["variants"] = cover_variants(work)
                except (subprocess.SubprocessError, ValueError, OSError) as error:
                    errors.append("cover variants")
                    row["variant_error"] = str(error)
                    print(f"FAILED responsive cover: {error}", file=sys.stderr)
    extras = [p.name for p in SOURCE.iterdir() if p.is_file() and p.name not in ASSETS]
    for name in extras:
        print(f"SKIP extra file: {name} (not approved for publication)")
    if args.manifest:
        args.manifest.write_text(json.dumps({"inventory": inventory, "conversions": rows,
                                            "skipped_extra_files": extras}, indent=2) + "\n")
    print(f"Finished: {sum(r['status'] == 'converted' for r in rows)} sources converted; "
          f"{sum(r['status'] == 'missing' for r in rows)} missing; {len(errors)} errors")
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
