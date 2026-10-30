# Self-hosted Typst PDF runtime

This directory is loaded only when a student chooses **시험지·풀이 PDF 저장**. The exam generator compiles the selected paper in the browser; no third-party CDN is required.

- `typst.js`: `@myriaddreamin/typst.ts` 0.7.0 (`dist/esm/contrib/all-in-one-lite.bundle.js`), Apache-2.0. [Source](https://github.com/Myriad-Dreamin/typst.ts), [package](https://registry.npmjs.org/@myriaddreamin/typst.ts/-/typst.ts-0.7.0.tgz). SHA-256 `9999a19a74f27810e8d951849f208a9b556fa36b5c0a726c052f1e5bb8ba9200`.
- `compiler.wasm`: `@myriaddreamin/typst-ts-web-compiler` 0.7.0 (`pkg/typst_ts_web_compiler_bg.wasm`), Apache-2.0. [Source](https://github.com/Myriad-Dreamin/typst.ts), [package](https://registry.npmjs.org/@myriaddreamin/typst-ts-web-compiler/-/typst-ts-web-compiler-0.7.0.tgz). SHA-256 `1fc968438a672366dfec39c96c842c26ed29caff4eb1bcaab19a6c60867de5fd`.
- `fonts/noto-serif-kr-*.ttf` and `fonts/pretendard.ttf`: converted from this repository's WOFF2 files for PDF embedding. See their OFL notices in `fonts/`.
- `fonts/stix-two-math.ttf`: converted from `@fontsource/stix-two-math` 5.3.0 `stix-two-math-latin-400-normal.woff2`. [Package](https://registry.npmjs.org/@fontsource/stix-two-math/-/stix-two-math-5.3.0.tgz), SIL OFL 1.1; see `fonts/OFL-STIXTwoMath.txt`. SHA-256 `7f40014cb217c4eff26753c4d9ca35bb97745534472f944c3bfe2fe462dba6d7`.

The source font files were decoded to TTF with FontTools without changing outlines, names, or license terms. The runtime and fonts are versioned together so print layout does not depend on a machine's installed fonts.
