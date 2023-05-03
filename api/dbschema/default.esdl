module default {
  global current_user_id -> uuid;

  global current_user := (
    select User filter .id = global current_user_id
  );

  scalar type Address extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{40}$');
  }

  scalar type Name extending str {
    constraint min_len_value(1);
    constraint max_len_value(50);
  }

  scalar type Bytes extending str {
    constraint regexp(r'0x(?:[0-9a-fA-F]{2})*$');
  }

  scalar type Bytes32 extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{64}$');
  }

  type User {
    required property address -> Address {
      constraint exclusive;
    }
    property name -> Name;
    multi link contacts -> User;
  }
}
