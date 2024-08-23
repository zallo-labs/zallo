module default {
  scalar type Address extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{40}$');
  }

  scalar type UAddress extending str {
    constraint regexp(r'^[0-9a-zA-Z-]+?:0x[0-9a-fA-F]{40}$');
  }

  scalar type NonEmptyStr extending str { 
    constraint regexp(r'^\S');
  };

  scalar type BoundedStr extending str {
    constraint regexp(r'^(?![0oO][xX])[^\n\t]{2,70}$');
  }

  scalar type Bytes extending str {
    constraint regexp(r'0x(?:[0-9a-fA-F]{2})*$');
  }

  scalar type Bytes4 extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{8}$');
  }

  scalar type Bytes32 extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{64}$');
  }

  scalar type uint16 extending int32 {
    constraint min_value(0);
    constraint max_value(2 ^ 16 - 1);
  }

  scalar type uint32 extending int64 {
    constraint min_value(0);
    constraint max_value(2 ^ 32 - 1);
  }

  scalar type uint64 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 64n - 1n);
  }

  scalar type uint224 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 224n - 1n);
  }

  scalar type uint256 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 256n - 1n);
  }

  scalar type Amount extending decimal {
    constraint min_value(0.0n);
  }

  scalar type Url extending str {
    constraint regexp(r'^https?://');
  }
}