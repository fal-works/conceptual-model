import type { FromSchema } from "json-schema-to-ts";
import { schema } from "./schema-object.ts";

/**
 * JSON schema object for validating class model data.
 * This schema defines the structure for conceptual class models
 * based on a subset of JSON Graph Format v2.0.
 */
export { schema };

/**
 * Represents a specific conceptual class model containing a `Graph`.
 * 
 * The type is automatically generated from the JSON schema.
 */
export type Model = FromSchema<typeof schema>;

/**
 * TypeScript type for the graph portion of a class model.
 * Contains nodes (classes) and edges (relationships).
 */
export type Graph = Model["graph"];

/**
 * TypeScript type for a single node (class) in the model.
 * Represents a class, entity, or concept with optional metadata and attributes.
 */
export type Node = NonNullable<Graph["nodes"]>[string];

/**
 * TypeScript type for a single edge (relationship) in the model.
 * Represents connections between classes like composition, inheritance, etc.
 */
export type Edge = NonNullable<Graph["edges"]>[number];
