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
    required property chain := as_chain(.address);
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
    required name: Label;
    required symbol: Label;
    required decimals: uint16;
    icon: Url;
    units: array<tuple<symbol: Label, decimals: uint16>>;
    required isFeeToken: bool { default := false; };
    pythUsdPriceId: Bytes32;
    required property chain := as_chain(.address);
    required property isSystem := (not exists .user);

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

  function token(address: str) -> optional Token using (
    select tokenForUser(address, global current_user)
  );

  function tokenForUser(addressParam: str, user: User) -> optional Token using (
    with address := <UAddress>addressParam
    select assert_single(
      (select Token filter .address = address and .user = user limit 1) ??
      (select Token filter .address = address limit 1)
    )
  );

  type GlobalLabel {
    required address: UAddress { constraint exclusive; }
    required label: Label;
  }

  function label(address: str) -> optional str using (
    select labelForUser(address, global current_user)
  );

  # TODO: use `address: UAddress` param when fixed - https://github.com/edgedb/edgedb-js/issues/893
  # TODO: use `user: optional User` param when fixed - https://github.com/edgedb/edgedb-js/issues/894
  function labelForUser(addressParam: str, user: User) -> optional str using (
    with address := <UAddress>addressParam 
    select assert_single(
      (select Contact filter .address = address and .user = user).label ??
      (select Account filter .address = address).label ??
      (select Token filter .address = address and .user = user).name ??
      (select Token filter .address = address).name ??
      (select Approver filter .address = as_address(address)).name ??
      (select GlobalLabel filter .address = address).label
    )
  );
}