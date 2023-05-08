module default {
  scalar type Address extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{40}$');
  }

  global current_user_address -> Address;

  global current_user_accounts_array -> array<uuid>;
  global current_user_accounts := (
    select array_unpack(global current_user_accounts_array)
  );

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

    access policy user_only
      allow all
      using (.address ?= global current_user_address);
  }

  type Account extending User {
    required property isActive -> bool;
    required property implementation -> Address;
    required property salt -> Bytes32;
    multi link policies := .<account[is Policy];
    multi link proposals := .<account[is Proposal];
    multi link transactionProposals := .<account[is TransactionProposal];
    multi link transfers := .<account[is Transfer];

    access policy anyone_can_insert
      allow insert;
    
    access policy members_can_select_update
      allow select, update
      using (.id in global current_user_accounts);
  }

  type Policy {
    required link account -> Account;
    required property key -> uint16;
    link state -> PolicyState;
    link draft -> PolicyState;
    multi link stateHistory := .<policy[is PolicyState];

    constraint expression on (
      exists (.state, .draft)
    );

    access policy members_only
      allow all
      using (.account.id in global current_user_accounts);
  }

  abstract type Permissions {
    multi link targets := .<permissions[is Target];
  }

  type PolicyState extending Permissions {
    required link policy -> Policy;
    link proposal -> TransactionProposal;
    required property isAccountInitState := not exists .proposal;
    multi link approvers -> User;
    required property threshold -> uint16;

    access policy members_only
      allow all
      using (.policy.account.id in global current_user_accounts);
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

    access policy members_only
      allow all
      using (.account.id in global current_user_accounts);
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
    multi link transfers -> TransferDetails;
  }

  scalar type TransferDirection extending enum<'In', 'Out'>;

  type TransferDetails {
    required link account -> Account;
    required property direction -> TransferDirection;
    required property from -> Address;
    required property to -> Address;
    required property token -> Address;
    required property amount -> uint256;
  }

  type Transfer extending TransferDetails {
    required link receipt -> Receipt;
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
