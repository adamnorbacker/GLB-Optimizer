/* eslint-disable @typescript-eslint/promise-function-async */
import { Document } from "@gltf-transform/core";
import {
  TEXTURE_ALPHA_QUALITY,
  TEXTURE_QUALITY,
  TEXTURE_RESOLUTION,
} from "../constants";

export async function convertTextureWebP(doc: Document): Promise<void> {
  await Promise.all(
    doc
      .getRoot()
      .listTextures()
      .map((texture) => {
        const validResolution = closestTextureSize(TEXTURE_RESOLUTION);

        const initialWidth = closestTextureSize(
          texture.getSize()?.[0] as number
        );
        const initialHeight = closestTextureSize(
          texture.getSize()?.[1] as number
        );

        const ratio = initialWidth / initialHeight;

        let width = validTextureSize(initialWidth, validResolution);
        let height = validTextureSize(initialHeight, validResolution);

        // forcing a new resolution could unintentionally make textures identical in size.
        const newRatio = width / height;

        if (ratio < 1 && newRatio === 1) {
          // Handle non-square textures
          width = validTextureSize(initialWidth, validResolution) * ratio;
        } else if (ratio > 1 && newRatio === 1) {
          height = validTextureSize(initialHeight, validResolution) / 2;
        }

        console.log("Initial texture size:", texture.getSize());
        console.log("New width and height:", width, height);

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
  if (size > maxResolution) {
    return closestTextureSize(maxResolution);
  }
  return closestTextureSize(size);
};

const closestTextureSize = (size: number) => {
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
