import { AudioError } from "../err.ts";

export function libSuffix(): string {
  switch (Deno.build.os) {
    case "windows":
      return "64bit.dll";
    case "darwin":
      return ".dylib";
    case "linux":
      return ".so";
    default:
      throw new AudioError("Unsupported platform");
  }
}

export function unsafeString(pointer: bigint): string {
  const p = Deno.UnsafePointer.create(pointer);
  if (p === null) throw new AudioError("Failed to get string pointer");
  return new Deno.UnsafePointerView(p).getCString();
}