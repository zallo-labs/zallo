module default {
  type User {
    link primaryAccount: Account;
    multi link approvers := .<user[is Approver];
    multi link contacts := .<user[is Contact];
    multi link accounts := (select distinct .approvers.accounts);
  }

  scalar type MAC extending str { constraint regexp(r'^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$'); }
  scalar type CloudProvider extending enum<'Apple', 'Google'>;

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
    property label := .contact.label ?? .name;
    pushToken: str;
    bluetoothDevices: array<MAC>;
    cloud: tuple<provider: CloudProvider, subject: str>;
    link contact := (
      assert_single((
        with address := .address
        select Contact
        filter .address = address
      ))
    );
    link accounts := (select Account filter __source__ in .approvers);

    constraint exclusive on ((.user, .address));

    access policy anyone_select_insert
      allow select, insert;

    access policy user_select_update
      allow select, update
      using (.user ?= global current_user);
  }

  type Contact {
    required user: User { 
      default := (<User>(global current_user).id);
      on target delete delete source;
    }
    required address: UAddress;
    required label: Label;

    constraint exclusive on ((.user, .address));
    constraint exclusive on ((.user, .label));

    access policy user_all
      allow all
      using (.user ?= global current_user);
  }

  type Token {
    user: User { default := (<User>(global current_user).id); }
    required address: UAddress;
    ethereumAddress: Address;
    required name: Label;
    required symbol: Label;
    required decimals: uint16;
    iconUri: str;
    units: array<tuple<symbol: Label, decimals: uint16>>;
    required isFeeToken: bool { default := false; };
    pythUsdPriceId: Bytes32;
    required property chain := as_chain(.address);

    constraint exclusive on ((.user, .address));
    constraint exclusive on ((.user, .chain, .name));
    constraint exclusive on ((.user, .chain, .symbol));
    index on (.address);
    index on ((.address, .isFeeToken));

    access policy anyone_select_allowlisted
      allow select
      using (not exists .user);

    access policy user_all
      allow all
      using (.user ?= global current_user);
  }
}