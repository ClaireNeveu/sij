import { Extension, NoExtension } from '../ast/util';

type BuilderExtension = Extension & {
    builder: {
        types: {
            numeric: number | bigint
        }
    }
};

type NoBuilderExtension = NoExtension & {
    builder: {
        types: {
            numeric: number | bigint
        }
    }
};

export {
    BuilderExtension,
    NoBuilderExtension,
};
