import { Expr, Ident } from 'sij-core/ast';
import { Tagged, UnTag, tag } from 'sij-core/util';
import { Extend } from 'sij-core/builder';
import { PgAlterDomainAction } from './schema-manipulation';

interface Window
  extends Tagged<
    'Window',
    {
      name: Ident;
      partitionBy: Array<Expr<PgExtension>>;
    }
  > {}
const Window = (args: UnTag<Window>): Window => tag('Window', args);

type PgExtension = Extend<{
  Select: null | {
    window: Window | null;
  };
  Delete: {
    using: Array<Ident>;
  };
  DomainAction: PgAlterDomainAction;
  AddDomainConstraint: boolean;
  DropDomainConstraint: boolean;
}>;

export { PgExtension };
