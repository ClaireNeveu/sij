import { Ident } from 'sij-core/ast';

import { Tagged, UnTag, tag } from 'sij-core/dist/util';

type PgUtil = Vacuum;

/* VACUUM [ ( option [, ...] ) ] [ table_and_columns [, ...] ]
VACUUM [ FULL ] [ FREEZE ] [ VERBOSE ] [ ANALYZE ] [ table_and_columns [, ...] ]

where option can be one of:

    FULL [ boolean ]
    FREEZE [ boolean ]
    VERBOSE [ boolean ]
    ANALYZE [ boolean ]
    DISABLE_PAGE_SKIPPING [ boolean ]
    SKIP_LOCKED [ boolean ]
    INDEX_CLEANUP { AUTO | ON | OFF }
    PROCESS_MAIN [ boolean ]
    PROCESS_TOAST [ boolean ]
    TRUNCATE [ boolean ]
    PARALLEL integer
    SKIP_DATABASE_STATS [ boolean ]
    ONLY_DATABASE_STATS [ boolean ]
    BUFFER_USAGE_LIMIT size

and table_and_columns is:

    table_name [ ( column_name [, ...] ) ]
*/

interface Vacuum
  extends Tagged<
    'Vacuum',
    {
      readonly options: Array<VacuumOption>;
      readonly table: Ident;
      readonly columns: Array<Ident>;
    }
  > {}
const Vacuum = (args: UnTag<Vacuum>): Vacuum => tag('Vacuum', args);

type VacuumOption =
  | 'Full'
  | 'Freeze'
  | 'Verbose'
  | 'Analyze'
  | 'DisablePageSkipping'
  | 'SkipLocked'
  | IndexCleanup
  | 'ProcessMain'
  | 'ProcessToast'
  | 'Truncate'
  | Parallel
  | 'SkipDatabaseStats'
  | 'OnlyDatabaseStats'
  | BufferUsageLimit;

interface IndexCleanup
  extends Tagged<
    'IndexCleanup',
    {
      readonly mode: 'Auto' | 'On' | 'Off';
    }
  > {}
const IndexCleanup = (args: UnTag<IndexCleanup>): IndexCleanup => tag('IndexCleanup', args);

interface Parallel
  extends Tagged<
    'Parallel',
    {
      readonly workers: number;
    }
  > {}
const Parallel = (args: UnTag<Parallel>): Parallel => tag('Parallel', args);

interface BufferUsageLimit
  extends Tagged<
    'BufferUsageLimit',
    {
      readonly size: Size;
    }
  > {}
const BufferUsageLimit = (args: UnTag<BufferUsageLimit>): BufferUsageLimit => tag('BufferUsageLimit', args);

interface Size
  extends Tagged<
    'Size',
    {
      readonly value: number;
      readonly unit: 'B' | 'kB' | 'MB' | 'GB' | 'TB';
    }
  > {}
const Size = (args: UnTag<Size>): Size => tag('Size', args);

export { PgUtil, Vacuum };
