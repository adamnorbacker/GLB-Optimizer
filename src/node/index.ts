import { EXTTextureWebP } from "@gltf-transform/extensions";
import { convertTextureWebP } from "./convertTextureWebP";
import { nodeIO } from "./nodeIO";
import { transform } from "./transform";

export async function node(glb: Uint8Array): Promise<Uint8Array> {
  const io = await nodeIO();
  const doc = await io.readBinary(glb);

  doc.createExtension(EXTTextureWebP).setRequired(true);

  await convertTextureWebP(doc);
  await transform(doc);

  return await io.writeBinary(doc);
}
