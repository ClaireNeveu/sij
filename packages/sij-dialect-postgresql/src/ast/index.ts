import { Expr, Ident } from "sij-core/ast";
import { Tagged, UnTag, tag } from "sij-core/util";
import { Extend } from "sij-core/builder";

interface Window
  extends Tagged<
    "Window",
    {
      name: Ident;
      partitionBy: Array<Expr<PostgreSqlExtension>>;
    }
  > {}
const Window = (args: UnTag<Window>): Window => tag("Window", args);

type PostgreSqlExtension = Extend<{
  Select: null | {
    window: Window | null;
  };
  Delete: {
    using: Array<Ident>;
  };
}>;

export { PostgreSqlExtension };
