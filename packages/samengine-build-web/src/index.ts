export type {
    SamengineWebOptions,
    SamengineResource,
    SamengineResourceMap,
    ViteLikePlugin,
} from "./vite.js";

export {
    DEFAULT_RESOURCE_MANIFEST_MODULE,
    normalizeResourcePath,
    samengineWeb,
    scanResources,
} from "./vite.js";

export type {
    NextConfigLike,
    SamengineNextOptions,
} from "./next.js";

export {
    DEFAULT_NEXT_RESOURCE_MANIFEST_MODULE,
    withSamengine,
} from "./next.js";
