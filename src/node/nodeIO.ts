import { NodeIO } from "@gltf-transform/core";
import { EXTTextureWebP, KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3d";

const EXTENSIONS = [...KHRONOS_EXTENSIONS, EXTTextureWebP];

export async function nodeIO(): Promise<NodeIO> {
  return new NodeIO().registerExtensions(EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });
}
