module default {
  type User {
    name: Label;
    multi link approvers := .<user[is Approver];
    multi link contacts := .<user[is Contact];
    multi link accounts := (select distinct .approvers.accounts);
  }

  type Approver {
    required address: Address {
      readonly := true;
      constraint exclusive; 
    }
    required user: User {
      default := (insert User {});
      on source delete delete target if orphan;
    }
    name: Label;
    property label := .contact.label ?? (.user.name ++ ': ' ++ .name if exists(.user) and exists(.name) else <str>{});
    pushToken: str;
    link contact := (
      assert_single((
        with address := .address
        select Contact
        filter .address = address
      ))
    );
    link accounts := (
      with id := .id
      select Account
      filter id in (.policies.state.approvers.id union .policies.draft.approvers.id)
    );

    constraint exclusive on ((.user, .address));
    constraint exclusive on ((.user, .name));

    access policy anyone_select_insert
      allow select, insert;

    access policy user_select_update
      allow select, update
      using (.user ?= global current_user);
  }

  type Contact {
    required user: User {
      default := (<User>(global current_user).id);
    }
    required address: Address;
    required label: Label;

    constraint exclusive on ((.user, .address));
    constraint exclusive on ((.user, .label));

    access policy user_all
      allow all
      using (.user ?= global current_user);
  }

  type Token {
    user: User { default := (<User>(global current_user).id); }
    required testnetAddress: Address;
    ethereumAddress: Address;
    required name: Label;
    required symbol: Label;
    required decimals: uint16;
    iconUri: str;
    units: array<tuple<symbol: Label, decimals: uint16>>;

    constraint exclusive on ((.user, .testnetAddress));
    constraint exclusive on ((.user, .name));
    constraint exclusive on ((.user, .symbol));

    access policy anyone_select_allowlisted
      allow select
      using (not exists .user);

    access policy user_all
      allow all
      using (.user ?= global current_user);
  }
}