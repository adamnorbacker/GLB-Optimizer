/* eslint-disable @typescript-eslint/promise-function-async */
import { Document, vec2 } from "@gltf-transform/core";
import {
  SHOULD_RESIZE,
  TEXTURE_ALPHA_QUALITY,
  TEXTURE_QUALITY,
} from "../constants";

// Returns the largest power-of-2 strictly below the given size.
// e.g. 2000 → 1024, 1000 → 512, 500 → 256
const largestPowerOf2Below = (size: number): number => {
  return 1 << (31 - Math.clz32(size) - 1);
};

const getSize = (
  initialWidth: number,
  initialHeight: number,
  targetResolution: number,
) => {
  if (SHOULD_RESIZE) {
    const scale = Math.min(
      targetResolution / initialWidth,
      targetResolution / initialHeight,
    );

    if (scale >= 1) {
      return { width: initialWidth, height: initialHeight };
    }

    return {
      width: Math.round(initialWidth * scale),
      height: Math.round(initialHeight * scale),
    };
  }

  return { width: initialWidth, height: initialHeight };
};

export async function convertTextureWebP(doc: Document): Promise<void> {
  await Promise.all(
    doc
      .getRoot()
      .listTextures()
      .map((texture) => {
        const sizes = texture.getSize() as vec2;

        const initialWidth = sizes[0];
        const initialHeight = sizes[1];

        const largestDim = Math.max(initialWidth, initialHeight);
        const targetResolution = largestPowerOf2Below(largestDim);

        const { width, height } = getSize(
          initialWidth,
          initialHeight,
          targetResolution,
        );

        const originalSize = (texture.getImage() as Uint8Array).byteLength;
        const textureName = texture.getName() || texture.getURI() || "unnamed";

        const sharp = require("sharp");
        return sharp(texture.getImage() as Uint8Array)
          .resize(width, height)
          .webp({
            quality: TEXTURE_QUALITY,
            alphaQuality: TEXTURE_ALPHA_QUALITY,
          })
          .toBuffer()
          .then((webp: Buffer) => {
            const compressedSize = webp.byteLength;
            const saving = (
              ((originalSize - compressedSize) / originalSize) *
              100
            ).toFixed(1);
            console.log(
              `[texture] "${textureName}" ${initialWidth}×${initialHeight} → ${width}×${height} | ${(originalSize / 1024).toFixed(1)} KB → ${(compressedSize / 1024).toFixed(1)} KB (${saving}% smaller)`,
            );
            texture.copy(
              doc.createTexture().setMimeType("image/webp").setImage(webp),
            );
          });
      }),
  );
}
