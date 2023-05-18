CREATE MIGRATION m1hqipsbwhufbiwl42rnz24lzjiricdasi4xdf7stq2vmqzxavqkpq
    ONTO m1t3neu2fnpbp2h2cerc7lkq2zrfmbithjwt3vb33jg2nota7xb2ha
{
  ALTER TYPE default::Target {
      DROP PROPERTY selectors;
      DROP PROPERTY to;
  };
  DROP GLOBAL default::current_user;
  ALTER TYPE default::ProposalResponse {
      DROP ACCESS POLICY members_can_select;
      DROP ACCESS POLICY user_all;
      DROP CONSTRAINT std::exclusive ON ((.proposal, .user));
  };
  ALTER TYPE default::TransferDetails {
      DROP ACCESS POLICY members_can_select_insert;
  };
  ALTER TYPE default::Account {
      DROP ACCESS POLICY members_can_select_update;
      DROP LINK policies;
      DROP LINK proposals;
      DROP LINK transactionProposals;
      DROP ACCESS POLICY anyone_can_insert;
      DROP LINK transfers;
      DROP PROPERTY implementation;
      DROP PROPERTY isActive;
      DROP PROPERTY salt;
  };
  ALTER TYPE default::Policy {
      DROP ACCESS POLICY members_only;
      DROP CONSTRAINT std::exclusive ON ((.account, .name));
      DROP CONSTRAINT std::exclusive ON ((.account, .key));
  };
  ALTER TYPE default::Proposal {
      DROP ACCESS POLICY members_only;
      DROP LINK approvals;
      DROP LINK proposedBy;
      DROP LINK rejections;
      DROP LINK responses;
  };
  ALTER TYPE default::PolicyState {
      DROP LINK policy;
      DROP PROPERTY isAccountInitState;
      DROP LINK approvers;
      DROP LINK proposal;
      DROP LINK targets;
      ALTER PROPERTY activationBlock {
          DROP CONSTRAINT std::min_value(0n);
      };
  };
  DROP GLOBAL default::current_user_accounts;
  DROP GLOBAL default::current_user_accounts_array;
  ALTER TYPE default::Contact {
      DROP ACCESS POLICY user_all;
      DROP CONSTRAINT std::exclusive ON ((.user, .name));
      DROP CONSTRAINT std::exclusive ON ((.user, .address));
  };
  ALTER TYPE default::Device {
      DROP ACCESS POLICY user_all;
      DROP PROPERTY pushToken;
  };
  ALTER TYPE default::User {
      DROP LINK contacts;
      DROP PROPERTY address;
      DROP PROPERTY name;
  };
  DROP GLOBAL default::current_user_address;
  ALTER TYPE default::Policy {
      DROP LINK account;
      DROP ACCESS POLICY can_not_be_deleted_when_active;
      DROP LINK draft;
      DROP PROPERTY isActive;
      DROP LINK state;
      DROP LINK stateHistory;
      DROP PROPERTY key;
      DROP PROPERTY name;
  };
  ALTER TYPE default::Proposal {
      DROP LINK account;
      DROP LINK policy;
      DROP PROPERTY createdAt;
      DROP PROPERTY hash;
  };
  ALTER TYPE default::TransferDetails {
      DROP LINK account;
      DROP PROPERTY amount;
      DROP PROPERTY direction;
      DROP PROPERTY from;
      DROP PROPERTY to;
      DROP PROPERTY token;
  };
  DROP TYPE default::Account;
  ALTER TYPE default::ProposalResponse {
      DROP LINK proposal;
      DROP LINK user;
      DROP PROPERTY createdAt;
  };
  DROP TYPE default::Approval;
  DROP TYPE default::Contact;
  DROP TYPE default::Contract;
  DROP TYPE default::Device;
  DROP TYPE default::Function;
  DROP TYPE default::Policy;
  DROP TYPE default::PolicyState;
  ALTER TYPE default::TransactionProposal {
      DROP LINK simulation;
      DROP PROPERTY status;
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
  DROP TYPE default::Rejection;
  DROP TYPE default::ProposalResponse;
  ALTER TYPE default::Receipt {
      DROP LINK transfers;
      DROP PROPERTY block;
      DROP PROPERTY fee;
      DROP PROPERTY gasUsed;
      DROP PROPERTY response;
      DROP PROPERTY success;
      DROP PROPERTY timestamp;
  };
  DROP TYPE default::Transfer;
  DROP TYPE default::Receipt;
  DROP TYPE default::Simulation;
  DROP TYPE default::Target;
  DROP TYPE default::TransferDetails;
  DROP TYPE default::User;
  DROP SCALAR TYPE default::AbiSource;
  DROP SCALAR TYPE default::Address;
  DROP SCALAR TYPE default::Bytes;
  DROP SCALAR TYPE default::Bytes32;
  DROP SCALAR TYPE default::Bytes4;
  DROP SCALAR TYPE default::Name;
  DROP SCALAR TYPE default::TargetSelector;
  DROP SCALAR TYPE default::TransactionProposalStatus;
  DROP SCALAR TYPE default::TransferDirection;
  DROP SCALAR TYPE default::uint16;
  DROP SCALAR TYPE default::uint256;
  DROP SCALAR TYPE default::uint64;
};
