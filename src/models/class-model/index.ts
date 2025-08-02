import type { FromSchema } from "json-schema-to-ts";
import { schema } from "./schema-object.ts";

export { schema as classModelSchema };

/**
 * Represents a specific conceptual class model containing a `Graph`.
 *
 * The type is automatically generated from the JSON schema.
 */
export type ClassModel = FromSchema<typeof schema>;

/**
 * TypeScript type for the graph portion of a class model.
 * Contains nodes (classes) and edges (relationships).
 */
export type ClassModelGraph = ClassModel["graph"];

/**
 * TypeScript type for a single node (class) in the model.
 * Represents a class, entity, or concept with optional metadata and attributes.
 */
export type ClassModelNode = NonNullable<ClassModelGraph["nodes"]>[string];

/**
 * TypeScript type for a single edge (relationship) in the model.
 * Represents connections between classes like composition, inheritance, etc.
 */
export type ClassModelEdge = NonNullable<ClassModelGraph["edges"]>[number];
