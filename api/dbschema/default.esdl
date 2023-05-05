module default {
  global current_user_id -> uuid;
  
  global current_user_acccounts -> array<uuid>;

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

  scalar type Bytes4 extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{10}$');
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

  scalar type uint128 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 128n - 1n);
  }

  scalar type uint256 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 256n - 1n);
  }

  abstract type User {
    required property address -> Address {
      constraint exclusive;
    }
    property name -> Name;
    multi link contacts -> User {
      property alias -> Name;
    }
  }

  type Device extending User {
    property pushToken -> str;
  }

  type Account extending User {
    required property isActive -> bool;
    required property implementation -> Address;
    required property salt -> Bytes32;
    multi link policies := .<account[is Policy];
    multi link proposals := .<account[is Proposal];
    multi link transfers := .<account[is Transfer];
  }

  type Policy {
    required link account -> Account;
    required property key -> uint16;
    link state -> PolicyState;
    link draft -> PolicyState;
    multi link stateHistory := .<policy[is PolicyState];

    constraint expression on (
      exists (.state, .draft)
    )
  }

  abstract type Permissions {
    multi link targets := .<permissions[is Target];
  }

  type PolicyState extending Permissions {
    required link policy -> Policy;
    multi link approvers -> User;
    required property threshold -> uint16;
  }

  scalar type TargetSelector extending str {
    constraint regexp(r'^*|(?:0x[0-9a-fA-F]{10})$'); # * | Bytes4
  }

  type Target {
    required link permissions -> Permissions;
    required property to -> str {
      constraint regexp(r'^*|(?:0x[0-9a-fA-F]{40}$)');  # * | Address
    };
    required property selectors -> array<TargetSelector>;

    constraint exclusive on ((.permissions, .to));
  }

  abstract type Proposal {
    required property hash -> Bytes32 {
      constraint exclusive;
    }
    required link account -> Account;
    link policy -> Policy;
    multi link approvals -> User {
      property signature -> Bytes;
      property createdAt -> datetime {
        readonly := true;
        default := datetime_of_statement();
      }
    }
  }

  type TransactionProposal extending Proposal {
    required property to -> Address;
    property value -> uint256;
    property data -> Bytes;
    required property nonce -> uint64 { default := 0n; }
    required property gasLimit -> uint256 { default := 0n; }
    required property feeToken -> Address;
    required link simulation -> Simulation;
    multi link transactions := .<proposal[is Transaction];
    link transaction := (
      select .transactions
      order by .submittedAt desc
      limit 1
    );
  }

  type Simulation {
    multi link transfers -> SimulatedTransfer;
  }

  type SimulatedTransfer {
    required property from -> Address;
    required property to -> Address;
    required property token -> Address;
    required property amount -> uint256;
  }

  scalar type TransferDirection extending enum<'In', 'Out'>;

  type Transfer {
    required link account -> Account;
    required link receipt -> Receipt;
    required property direction -> TransferDirection;
    required property from -> Address;
    required property to -> Address;
    required property token -> Address;
    required property amount -> uint256;
  }

  type Transaction {
    required property hash -> Bytes32 {
      constraint exclusive;
    }
    required link proposal -> TransactionProposal;
    required property gasPrice -> uint32;
    link receipt -> Receipt;
    property submittedAt -> datetime {
      readonly := true;
      default := datetime_of_statement();
    }
  }

  type Receipt {
    required property success -> bool;
    property response -> Bytes;
    multi link transfers := .<receipt[is Transfer];
    required property blockNumber -> bigint {
      constraint min_value(0n);
    }
    required property blockTimestamp -> datetime;
  }

  type Contract {
    required property address -> Address {
      constraint exclusive;
    }

    multi link functions -> Function;
  }

  scalar type AbiSource extending enum<'Verified', 'Asserted', 'Decompiled'>;

  type Function {
    required property selector -> Bytes4;
    required property abi -> json;
    required property source -> AbiSource;

    index on (.selector);
  }
}
