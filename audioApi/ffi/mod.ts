import { libSuffix } from "./utils.ts";

export default Deno.dlopen(
  new URL(`./bin/libportaudio${libSuffix()}`, import.meta.url),
  {
    Pa_Initialize: { parameters: [], result: "i32" },
    Pa_Terminate: { parameters: [], result: "i32" },

    // Pa_GetVersionInfo: { parameters: [], result: "buffer" },
    Pa_GetVersion: { parameters: [], result: "buffer" },
    Pa_GetVersionText: { parameters: [], result: "pointer" },

    Pa_GetErrorText: {
      parameters: ["i32"] as [errorCode: "i32"],
      result: "pointer",
    },

    Pa_GetHostApiCount: { parameters: [], result: "i32" },
    Pa_GetDefaultHostApi: { parameters: [], result: "i32" },
    Pa_GetHostApiInfo: {
      parameters: ["i32"] as [hostApi: "i32"],
      result: "pointer",
    },
    Pa_HostApiDeviceIndexToDeviceIndex: {
      parameters: ["i32", "i32"] as [
        hostApi: "i32",
        hostApiDeviceIndex: "i32"
      ],
      result: "i32",
    },
    
    Pa_GetDeviceCount: { parameters: [], result: "i32" },
    Pa_GetDefaultInputDevice: { parameters: [], result: "i32" },
    Pa_GetDefaultOutputDevice: { parameters: [], result: "i32" },
    Pa_GetDeviceInfo: {
      parameters: ["i32"] as [deviceIndex: "i32"],
      result: "pointer",
    },
    
    Pa_IsFormatSupported: {
      parameters: ["buffer", "buffer", "f64"] as [
        inputFormat: "buffer",
        outputFormat: "buffer",
        sampleRate: "f64"
      ],
      result: "i32",
    },

    Pa_OpenStream: {
      parameters: ["pointer", "pointer", "pointer", "f64", "u64", "u64", "function", "pointer"] as [
        stream: "pointer",
        inputParameters: "pointer",
        outputParameters: "pointer",
        sampleRate: "f64",
        framesPerBuffer: "u64",
        streamFlags: "u64",
        streamCallback: "function",
        userData: "pointer"
      ],
      result: "i32",
    },
    // Pa_OpenDefaultStream: {
    //   parameters: ["pointer", "i32", "i32", "u64", "f64", "u64", "pointer", "pointer"],
    //   result: "i32",
    // },
    Pa_CloseStream: {
      parameters: ["pointer"],
      result: "i32",
    },
    Pa_StartStream: {
      parameters: ["pointer"],
      result: "i32",
    },
    Pa_StopStream: {
      parameters: ["pointer"],
      result: "i32",
    },
    Pa_AbortStream: {
      parameters: ["pointer"],
      result: "i32",
    },
    Pa_IsStreamStopped: {
      parameters: ["pointer"],
      result: "i32",
    },
    Pa_IsStreamActive: {
      parameters: ["pointer"],
      result: "i32",
    },
    Pa_GetStreamInfo: {
      parameters: ["pointer"],
      result: "buffer",
    },
    Pa_GetStreamTime: {
      parameters: ["pointer"],
      result: "f64",
    },
    Pa_GetStreamCpuLoad: {
      parameters: ["pointer"],
      result: "f64",
    },
    Pa_ReadStream: {
      parameters: ["pointer", "buffer", "u64"] as [
        stream: "pointer",
        writeTo: "buffer",
        frames: "u64"
      ],
      result: "i32",
    },
    Pa_WriteStream: {
      parameters: ["pointer", "buffer", "u64"] as [
        stream: "pointer",
        readFrom: "buffer",
        frames: "u64"
      ],
      result: "i32",
      nonblocking: true,
    },
    Pa_GetStreamReadAvailable: {
      parameters: ["pointer"],
      result: "u64",
    },
    Pa_GetStreamWriteAvailable: {
      parameters: ["pointer"],
      result: "u64",
    },
    Pa_GetSampleSize: {
      parameters: ["u64"],
      result: "i32",
    },
    Pa_Sleep: {
      parameters: ["i32"],
      result: "void",
    },
  } as const,
);