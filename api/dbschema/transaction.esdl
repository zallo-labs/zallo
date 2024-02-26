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

  scalar type TransactionStatus extending enum<'Pending', 'Scheduled', 'Executing', 'Successful', 'Failed', 'Cancelled'>;

  type Transaction extending Proposal {
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
    link systx: SystemTx { constraint exclusive; } # Latest .timestamp
    multi link results := .<transaction[is Result];
    link result: Result { constraint exclusive; } # Latest .timestamp
    required property status := (
      select assert_exists((
        TransactionStatus.Pending if (not .submitted) else
        TransactionStatus.Executing if (not exists .result) else
        TransactionStatus.Successful if (.result is Successful) else
        TransactionStatus.Failed if (.result is Failed) else
        TransactionStatus.Scheduled if (not .result[is Scheduled].cancelled) else
        TransactionStatus.Cancelled
      ))
    );

    constraint exclusive on (.hash);
  }

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
    required proposal: Transaction;
    required maxEthFeePerGas: decimal { constraint min_value(0); }
    required paymasterEthFees: PaymasterFees { constraint exclusive; default := (insert PaymasterFees {}); }
    required ethCreditUsed: decimal { constraint min_value(0); default := 0; }
    required property ethDiscount := .ethCreditUsed + (.proposal.maxPaymasterEthFees.total - .paymasterEthFees.total);
    required ethPerFeeToken: decimal { constraint min_value(0); }
    required usdPerFeeToken: decimal { constraint min_value(0); }
    required property maxNetworkEthFee := .maxEthFeePerGas * .proposal.gasLimit;
    required property maxEthFees := .maxNetworkEthFee + .paymasterEthFees.total - .ethDiscount;
    required timestamp: datetime { default := datetime_of_statement(); }
    result := .<systx[is Result];
    events := .<systx[is Event];

    access policy members_can_select_insert
      allow select, insert
      using (.proposal.account in global current_accounts);

    trigger update_tx_systx after insert for each do (
      update __new__.proposal set { systx := __new__ } 
    );
  }

  abstract type Result {
    required transaction: Transaction;
    systx: SystemTx { constraint exclusive; };
    required timestamp: datetime { default := datetime_of_statement(); }
    multi link events := .systx.events;
    multi link transfers := .events[is Transfer];
    multi link transferApprovals := .events[is TransferApproval];

    trigger update_tx_result after insert for each do (
      update __new__.transaction set { result := __new__ } 
    );
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
    reason: str;
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