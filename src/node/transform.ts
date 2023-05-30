import { Document } from "@gltf-transform/core";
import { dedup, draco, prune } from "@gltf-transform/functions";

import { DRACO_METHOD } from "../constants";

export async function transform(doc: Document): Promise<Document> {
  const functions = new Set([
    // Remove unused nodes, textures, or other data.
    prune(),
    // Remove duplicate vertex or texture data, if any.
    dedup(),
    draco({ method: DRACO_METHOD }),
  ]);

  return await doc.transform(...Array.from(functions));
}
