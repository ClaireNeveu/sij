import CallableInstance from 'callable-instance';
import { BuilderExtension, makeLit } from './util';
import { Lit, NumLit } from '../ast';
import { CurrentDateDefault, CurrentTime, CurrentTimeStamp, CurrentUserDefault, NullDefault, SessionUserDefault, SystemUserDefault, UserDefault } from '../ast/schema-definition';

class DefaultBuilder<Ext extends BuilderExtension> extends CallableInstance<Array<never>, unknown> {
  constructor() {
    super('apply');
  }

  apply<
    Return extends
      | Ext['builder']['types']['numeric']
      | Ext['builder']['types']['string']
      | Ext['builder']['types']['boolean']
      | Ext['builder']['types']['date']
      | null,
  >(lit: Return): Lit {
    return makeLit(lit as any);
  }

  currentDate(): CurrentDateDefault {
    return CurrentDateDefault
  }

  currentTime(precision?: number): CurrentTime {
    return CurrentTime({
        precision: precision === undefined ? null : NumLit(precision)
    });
  }

  currentTimestamp(precision?: number): CurrentTimeStamp {
    return CurrentTimeStamp({
        precision: precision === undefined ? null : NumLit(precision)
    })
  }

  user(): UserDefault {
    return UserDefault
  }

  currentUser(): CurrentUserDefault {
    return CurrentUserDefault
  }

  sessionUser(): SessionUserDefault {
    return SessionUserDefault
  }

  systemUser(): SystemUserDefault {
    return SystemUserDefault;
  }

  null(): NullDefault {
    return NullDefault
  }
}

// Merges with above class to provide calling as a function
interface DefaultBuilder<Ext extends BuilderExtension> {
  <
    Return extends
      | Ext['builder']['types']['numeric']
      | Ext['builder']['types']['string']
      | Ext['builder']['types']['boolean']
      | Ext['builder']['types']['date']
      | null,
  >(
    lit: Return,
  ): Lit;
}

export { DefaultBuilder };
