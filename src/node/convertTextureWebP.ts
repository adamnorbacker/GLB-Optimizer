/* eslint-disable @typescript-eslint/promise-function-async */
import { Document, vec2 } from "@gltf-transform/core";
import {
  FORCE_POWER_OF2,
  SHOULD_RESIZE,
  TEXTURE_ALPHA_QUALITY,
  TEXTURE_QUALITY,
  TEXTURE_RESOLUTION,
} from "../constants";

const getSize = (
  initialWidth: number,
  initialHeight: number,
  targetResolution: number
) => {
  let width = validTextureSize(initialWidth, targetResolution);
  let height = validTextureSize(initialHeight, targetResolution);

  if (FORCE_POWER_OF2) {
    const ratio = initialWidth / initialHeight;

    // forcing a new resolution could unintentionally make textures identical in size.
    const newRatio = width / height;

    if (ratio < 1 && newRatio === 1) {
      // Handle non-square textures
      width = validTextureSize(initialWidth, targetResolution) * ratio;
    } else if (ratio > 1 && newRatio === 1) {
      height = validTextureSize(initialHeight, targetResolution) / 2;
    }
  } else if (!FORCE_POWER_OF2 && SHOULD_RESIZE) {
    const ratio = Math.min(
      targetResolution / initialWidth,
      targetResolution / initialHeight
    );

    if (ratio > 1) {
      return { width, height };
    }

    width = validTextureSize(
      Math.round(initialWidth * ratio),
      targetResolution
    );
    height = validTextureSize(
      Math.round(initialHeight * ratio),
      targetResolution
    );
  }

  return { width, height };
};

export async function convertTextureWebP(doc: Document): Promise<void> {
  await Promise.all(
    doc
      .getRoot()
      .listTextures()
      .map((texture) => {
        const targetResolution = closestTextureSize(TEXTURE_RESOLUTION);

        const sizes = texture.getSize() as vec2;

        const initialWidth = closestTextureSize(sizes[0]);
        const initialHeight = closestTextureSize(sizes[1]);

        const { width, height } = getSize(
          initialWidth,
          initialHeight,
          targetResolution
        );

        if (width !== initialWidth || height !== initialHeight) {
          console.log("initialSize", ...sizes);
          console.log("New width and height:", width, height);
        }

        const sharp = require("sharp");
        return sharp(texture.getImage() as Uint8Array)
          .resize(width, height)
          .webp({
            quality: TEXTURE_QUALITY,
            alphaQuality: TEXTURE_ALPHA_QUALITY,
          })
          .toBuffer()
          .then((webp: Buffer) => {
            texture.copy(
              doc.createTexture().setMimeType("image/webp").setImage(webp)
            );
          });
      })
  );
}

const validTextureSize = (size: number, maxResolution: number) => {
  if (SHOULD_RESIZE) {
    if (size > maxResolution) {
      return closestTextureSize(maxResolution);
    }
  }
  return closestTextureSize(size);
};

const closestTextureSize = (size: number) => {
  if (!FORCE_POWER_OF2) {
    return size;
  }

  const powerOf2Up = nearestPowerOf2Up(size);
  const powerOf2Down = nearestPowerOf2Down(size);
  return [powerOf2Up, powerOf2Down].sort((a, b) => {
    return Math.abs(size - a) - Math.abs(size - b);
  })[0] as number;
};

const nearestPowerOf2Up = (size: number) => {
  return 2 << (31 - Math.clz32(size));
};

const nearestPowerOf2Down = (size: number) => {
  return 1 << (31 - Math.clz32(size));
};
