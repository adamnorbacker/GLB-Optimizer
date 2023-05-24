import { NodeIO } from "@gltf-transform/core";
import { EXTTextureWebP, KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3d";

export async function nodeIO(): Promise<NodeIO> {
  return new NodeIO()
    .registerExtensions([...KHRONOS_EXTENSIONS, EXTTextureWebP])
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
      "draco3d.encoder": await draco3d.createEncoderModule(),
    });
}
