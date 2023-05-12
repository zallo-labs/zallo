CREATE MIGRATION m1ov4fthysvf2aplr57zgr2qebxo2eun2omfqsblrztf5c5jmusayq
    ONTO m1grgeaa6ssnbdgbcjns37tsjbsqbqkz4k577fifkct77zo3zp2uja
{
  ALTER TYPE default::Target {
      DROP PROPERTY selectors;
      DROP CONSTRAINT std::exclusive ON ((.permissions, .to));
  };
  ALTER TYPE default::Account {
      DROP ACCESS POLICY members_only;
      DROP LINK policies;
      DROP LINK proposals;
      DROP LINK transactionProposals;
      DROP LINK transfers;
      DROP PROPERTY implementation;
      DROP PROPERTY isActive;
      DROP PROPERTY salt;
  };
  ALTER TYPE default::Policy {
      DROP ACCESS POLICY members_only;
      DROP LINK stateHistory;
  };
  ALTER TYPE default::PolicyState {
      DROP ACCESS POLICY members_only;
      DROP LINK approvers;
      DROP LINK policy;
      DROP PROPERTY threshold;
  };
  ALTER TYPE default::Proposal {
      DROP ACCESS POLICY members_only;
      DROP LINK approvals;
      DROP LINK account;
      DROP LINK policy;
      DROP PROPERTY hash;
  };
  DROP GLOBAL default::current_user_accounts;
  DROP GLOBAL default::current_user_accounts_array;
  ALTER TYPE default::Device {
      DROP ACCESS POLICY user_only;
      DROP PROPERTY pushToken;
  };
  DROP GLOBAL default::current_user_address;
  ALTER TYPE default::User {
      DROP LINK contacts;
      DROP PROPERTY address;
      DROP PROPERTY name;
  };
  DROP TYPE default::Policy;
  ALTER TYPE default::TransferDetails {
      DROP LINK account;
      DROP PROPERTY amount;
      DROP PROPERTY direction;
      DROP PROPERTY from;
      DROP PROPERTY to;
      DROP PROPERTY token;
  };
  DROP TYPE default::Account;
  DROP TYPE default::Contract;
  DROP TYPE default::Device;
  DROP TYPE default::Function;
  ALTER TYPE default::Permissions {
      DROP LINK targets;
  };
  DROP TYPE default::Target;
  DROP TYPE default::PolicyState;
  DROP TYPE default::Permissions;
  ALTER TYPE default::TransactionProposal {
      DROP LINK simulation;
      DROP LINK transaction;
      DROP LINK transactions;
      DROP PROPERTY data;
      DROP PROPERTY feeToken;
      DROP PROPERTY gasLimit;
      DROP PROPERTY nonce;
      DROP PROPERTY to;
      DROP PROPERTY value;
  };
  DROP TYPE default::Transaction;
  DROP TYPE default::TransactionProposal;
  DROP TYPE default::Proposal;
  ALTER TYPE default::Receipt {
      DROP LINK transfers;
      DROP PROPERTY blockNumber;
      DROP PROPERTY blockTimestamp;
      DROP PROPERTY response;
      DROP PROPERTY success;
  };
  DROP TYPE default::Transfer;
  DROP TYPE default::Receipt;
  DROP TYPE default::Simulation;
  DROP TYPE default::TransferDetails;
  DROP TYPE default::User;
  DROP SCALAR TYPE default::AbiSource;
  DROP SCALAR TYPE default::Address;
  DROP SCALAR TYPE default::Bytes;
  DROP SCALAR TYPE default::Bytes32;
  DROP SCALAR TYPE default::Bytes4;
  DROP SCALAR TYPE default::Name;
  DROP SCALAR TYPE default::TargetSelector;
  DROP SCALAR TYPE default::TransferDirection;
  DROP SCALAR TYPE default::uint128;
  DROP SCALAR TYPE default::uint16;
  DROP SCALAR TYPE default::uint256;
  DROP SCALAR TYPE default::uint32;
  DROP SCALAR TYPE default::uint64;
};
