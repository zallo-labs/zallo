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
    required address: Address { constraint exclusive; }
    required user: User {
      default := (insert User {});
      on source delete delete target if orphan;
    }
    name: BoundedStr;
    label := .name ?? .labelled.name;
    labelled := assert_single((
      with addr := .address
      select Labelled filter as_address(.address) = addr order by [is UserLabelled] limit 1
    ));
    pushToken: str;
    bluetoothDevices: array<MAC>;
    cloud: tuple<provider: CloudProvider, subject: str>;
    link accounts := (select Account filter __source__ in .approvers);

    constraint exclusive on ((.user, .address));

    access policy anyone_select_insert
      allow select, insert;

    access policy user_select_update
      allow select, update
      using (.user ?= global current_user);
  }

  type Token extending UserLabelled {
    overloaded required address: UAddress;
    user: User { 
      default := (<User>(global current_user).id);
      on target delete delete source;
    }
    required symbol: BoundedStr;
    required decimals: uint16;
    icon: Url;
    units: array<tuple<symbol: BoundedStr, decimals: uint16>>;
    required isFeeToken: bool { default := false; };
    pythUsdPriceId: Bytes32;
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
    select assert_single((
      select Token filter .address = address and (.isSystem or .user ?= user) order by .isSystem asc limit 1 
    ))
  );
}