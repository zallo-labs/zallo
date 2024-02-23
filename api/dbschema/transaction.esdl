module default {
  type Operation {
    required to: Address;
    value: uint256;
    data: Bytes;
  }

  type PaymasterFees {
    required property total := .activation;
    required activation: decimal { constraint min_value(0); default := 0; }
  }

  type TransactionProposal extending Proposal {
    required multi operations: Operation {
      constraint exclusive;
      on source delete delete target;
    }
    required property nonce := <bigint>math::floor(datetime_get(.validFrom, 'epochseconds'));
    required gasLimit: uint256 { default := 0; }
    required feeToken: Token;
    required paymaster: Address;
    required maxPaymasterEthFees: PaymasterFees { constraint exclusive; default := (insert PaymasterFees {}); }
    simulation: Simulation { constraint exclusive; on target delete deferred restrict; }
    required submitted: bool { default := false; }
    multi link systxs := .<proposal[is SystemTx];
    # link systx: SystemTx { constraint exclusive; }  # Latest .submittedAt systx
    link systx := (select .systxs order by .submittedAt desc limit 1);
    multi link results := .<transaction[is Result];
    # link result: Result { constraint exclusive; } # Latest .timestamp result
    link result := (select .results order by .timestamp desc limit 1);
    required property status := (
      select assert_exists((
        TransactionProposalStatus.Pending if (not .submitted) else
        TransactionProposalStatus.Executing if (not exists .result) else
        TransactionProposalStatus.Successful if (.result is Successful) else
        TransactionProposalStatus.Failed if (.result is Failed) else
        TransactionProposalStatus.Scheduled if (not .result[is Scheduled].cancelled) else
        TransactionProposalStatus.Cancelled
      ))
    );

    constraint exclusive on (.hash);
  }

  scalar type TransactionProposalStatus extending enum<'Pending', 'Scheduled', 'Executing', 'Successful', 'Failed', 'Cancelled'>;

  type Simulation {
    required success: bool;
    required responses: array<Bytes>;
    multi transfers: TransferDetails {
      constraint exclusive;
      on source delete delete target;
    }
    required timestamp: datetime { default := datetime_of_statement(); }
  }

  type SystemTx {
    required hash: Bytes32 { constraint exclusive; }
    required proposal: TransactionProposal;
    required maxEthFeePerGas: decimal { constraint min_value(0); }
    required paymasterEthFees: PaymasterFees { constraint exclusive; default := (insert PaymasterFees {}); }
    required ethCreditUsed: decimal { constraint min_value(0); default := 0; }
    required property ethDiscount := .ethCreditUsed + (.proposal.maxPaymasterEthFees.total - .paymasterEthFees.total);
    required ethPerFeeToken: decimal { constraint min_value(0); }
    required usdPerFeeToken: decimal { constraint min_value(0); }
    required property maxNetworkEthFee := .maxEthFeePerGas * .proposal.gasLimit;
    required property maxEthFees := .maxNetworkEthFee + .paymasterEthFees.total - .ethDiscount;
    required submittedAt: datetime { default := datetime_of_statement(); }
    result := .<systx[is Result];

    access policy members_can_select_insert
      allow select, insert
      using (.proposal.account in global current_accounts);
  }

  abstract type Result {
    required transaction: TransactionProposal;
    required systx: SystemTx { constraint exclusive; };
    required timestamp: datetime { default := datetime_of_statement(); }
    multi link events := .<result[is Event];
    multi link transfers := .<result[is Transfer];
    multi link transferApprovals := .<result[is TransferApproval];
  }

  abstract type ReceiptResult extending Result {
    required block: bigint { constraint min_value(0); }
    required gasUsed: bigint { constraint min_value(0); }
    required ethFeePerGas: decimal { constraint min_value(0); }
  }

  type Successful extending ReceiptResult {
    required responses: array<Bytes>;
  }

  type Failed extending ReceiptResult {
    reason: Bytes;
  }

  type Scheduled extending Result {
    required scheduledFor: datetime;
    required cancelled: bool { default := false; }
  }

  type Refund {
    required link systx: SystemTx { constraint exclusive; }
    required ethAmount: decimal { constraint min_value(0); }
  }
}