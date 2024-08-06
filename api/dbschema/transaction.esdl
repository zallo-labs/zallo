module default {
  type Operation {
    required to: Address;
    value: uint256;
    data: Bytes;
    required position: uint16 { default := 0; }
  }

  type PaymasterFees {
    required property total := .activation;
    required activation: decimal { constraint min_value(0); default := 0; }
  }

  scalar type TransactionStatus extending enum<'Pending', 'Scheduled', 'Executing', 'Successful', 'Failed', 'Cancelled'>;

  type Transaction extending Proposal {
    required multi unorderedOperations: Operation {
      constraint exclusive;
      on source delete delete target;
    }
    required multi operations := (select .unorderedOperations order by .position asc);
    required gasLimit: uint256 { default := 0; }
    required feeToken: Token;
    required maxAmount: decimal;
    required property maxAmountFp := as_fixed(.maxAmount, .feeToken.decimals);
    required paymaster: Address;
    required paymasterEthFees: PaymasterFees { 
      constraint exclusive;
      on source delete delete target; 
      default := (insert PaymasterFees {}); 
    }
    multi link systxs := .<proposal[is SystemTx];
    link systx: SystemTx { constraint exclusive; } # Latest .timestamp
    multi link results := .<transaction[is Result];
    link result: Result { constraint exclusive; } # Latest .timestamp
    required property status := (
      with result := .result
      select assert_exists((
        TransactionStatus.Pending if (not exists result or result is SimulatedSuccess or result is SimulatedFailure) else
        TransactionStatus.Executing if (result is OptimisticSuccess) else
        TransactionStatus.Successful if (result is ConfirmedSuccess) else
        TransactionStatus.Failed if (result is ConfirmedFailure) else
        TransactionStatus.Scheduled if (not result[is Scheduled].cancelled) else
        TransactionStatus.Cancelled # result is Scheduled
      ))
    );
    required executable := (.result is SimulatedSuccess) ?? false;
  }

  type SystemTx {
    required hash: Bytes32 { constraint exclusive; }
    required proposal: Transaction;
    required maxEthFeePerGas: decimal { constraint min_value(0); }
    required ethPerFeeToken: decimal { constraint min_value(0); }
    required usdPerFeeToken: decimal { constraint min_value(0); }
    required property maxNetworkEthFee := .maxEthFeePerGas * .proposal.gasLimit;
    required property maxEthFees := .maxNetworkEthFee + .proposal.paymasterEthFees.total;
    required timestamp: datetime { default := datetime_of_statement(); }
    result := (select .<systx[is Result] order by .timestamp desc limit 1);
    
    trigger update_tx_systx after insert for each do (
      update __new__.proposal set { systx := __new__ } 
    );

    trigger update_activation_fee after insert for each
    when (__new__.proposal.account.activationEthFee > 0) do (
      with account := __new__.proposal.account,
           paymasterEthFees := __new__.proposal.paymasterEthFees
      update account set {
        activationEthFee := max({ 0, account.activationEthFee - paymasterEthFees.activation }) 
      } 
    );
  }

  abstract type Result {
    required transaction: Transaction;
    systx: SystemTx;
    required response: Bytes { default := '0x'; }
    required gasUsed: bigint { constraint min_value(0); }
    required timestamp: datetime { default := datetime_of_statement(); }
    multi link events := .<result[is Event];
    multi link transfers := .events[is Transfer];

    trigger update_tx_result after insert for each do (
      update __new__.transaction set { result := __new__ } 
    );
  }

  abstract type Success extending Result {}

  abstract type Failure extending Result {
    reason: str;
  }

  type SimulatedSuccess extending Success {}

  type SimulatedFailure extending Failure {
    required validationErrors: array<str> { default := <array<str>>[]; };
  }

  type OptimisticSuccess extending Success {}

  abstract type Confirmed extending Result {
    required block: bigint { constraint min_value(0); }
    required ethFeePerGas: decimal { constraint min_value(0); }
    required property networkEthFee := .ethFeePerGas * .gasUsed;
  }

  type ConfirmedSuccess extending Confirmed, Success {}

  type ConfirmedFailure extending Confirmed, Failure {}

  type Scheduled extending Result {
    required scheduledFor: datetime;
    required cancelled: bool { default := false; }
  }
}