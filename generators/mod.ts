/**
 * @module generators
 *
 * Provides utilities for generating, mixing, and processing audio sample streams.
 *
 * - Waveform generators (sine, square, sawtooth, triangle)
 * - Volume, ramp, repeat, and loop utilities
 * - Mix, queue, chunk, and limit helpers
 * - Multi-channel and iterable utilities
 */
export * from "./alwaysIterable.ts";
export * from "./chunker.ts";
export * from "./limit.ts";
export * from "./loop.ts";
export * from "./mix.ts";
export * from "./multiChannel.ts";
export * from "./queue.ts";
export * from "./ramp.ts";
export * from "./repeat.ts";
export * from "./repeatLastWhenDone.ts";
export * from "./volume.ts";
export * from "./waves.ts";
