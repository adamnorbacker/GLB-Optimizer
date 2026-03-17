import { Document } from "@gltf-transform/core";
import { dedup, draco, prune } from "@gltf-transform/functions";
import { DRACO_METHOD } from "../constants";

export async function transform(doc: Document): Promise<Document> {
  const functions = new Set([
    // Remove unused nodes, textures, or other data.
    prune(),
    // Remove duplicate vertex or texture data, if any.
    dedup(),
    // Re-compress with Draco using high quantization bits to preserve UV precision.
    // Default quantizeTexcoord (12-bit) causes UV distortion; 14-bit is safe.
    draco({
      method: DRACO_METHOD,
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeColor: 8,
      quantizeTexcoord: 14,
      quantizeGeneric: 12,
    }),
  ]);

  return await doc.transform(...Array.from(functions));
}
