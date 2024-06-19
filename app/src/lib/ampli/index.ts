/* tslint:disable */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// @ts-nocheck
/**
 * Ampli - A strong typed wrapper for your Analytics
 *
 * This file is generated by Amplitude.
 * To update run 'ampli pull app'
 *
 * Required dependencies: @amplitude/analytics-react-native@^0.4.0, @react-native-async-storage/async-storage@^1.17.9
 * Tracking Plan Version: 1
 * Build: 1.0.0
 * Runtime: react-native:typescript-ampli-v2
 *
 * [View Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest)
 *
 * [Full Setup Instructions](https://data.amplitude.com/zallo/Zallo/implementation/app)
 */

import * as amplitude from '@amplitude/analytics-react-native';

export type ReactNativeClient = amplitude.Types.ReactNativeClient;
export type BaseEvent = amplitude.Types.BaseEvent;
export type Event = amplitude.Types.Event;
export type EventOptions = amplitude.Types.EventOptions;
export type Result = amplitude.Types.Result;
export type ReactNativeOptions = amplitude.Types.ReactNativeOptions;

export type Environment = 'zallo';

export const ApiKey: Record<Environment, string> = {
  zallo: ''
};

/**
 * Default Amplitude configuration options. Contains tracking plan information.
 */
export const DefaultConfiguration: ReactNativeOptions = {
  plan: {
    version: '1',
    branch: 'main',
    source: 'app',
    versionId: 'c32a6255-e786-4628-acf8-49e4bcdc9835'
  },
  ...{
    ingestionMetadata: {
      sourceName: 'react-native-typescript-ampli',
      sourceVersion: '2.0.0'
    }
  }
};

export interface LoadOptionsBase { disabled?: boolean }

export type LoadOptionsWithEnvironment = LoadOptionsBase & { environment: Environment; client?: { configuration?: ReactNativeOptions; }; };
export type LoadOptionsWithApiKey = LoadOptionsBase & { client: { apiKey: string; configuration?: ReactNativeOptions; } };
export type LoadOptionsWithClientInstance = LoadOptionsBase & { client: { instance: ReactNativeClient; } };

export type LoadOptions = LoadOptionsWithEnvironment | LoadOptionsWithApiKey | LoadOptionsWithClientInstance;

export interface ApprovalProperties {
  /**
   * | Rule | Value |
   * |---|---|
   * | Enum Values | Device, Ledger, Google, Apple |
   */
  method: "Device" | "Ledger" | "Google" | "Apple";
  /**
   * | Rule | Value |
   * |---|---|
   * | Enum Values | Transaction, Message |
   */
  type: "Transaction" | "Message";
}

export interface LedgerLinkedProperties {
  model: string;
}

export interface ModifyPolicyProperties {
  new: boolean;
}

export interface NotificationPressedProperties {
  appOpened: boolean;
  pathname: string;
}

export interface RejectionProperties {
  /**
   * | Rule | Value |
   * |---|---|
   * | Enum Values | Device, Ledger, Google, Apple |
   */
  method: "Device" | "Ledger" | "Google" | "Apple";
  /**
   * | Rule | Value |
   * |---|---|
   * | Enum Values | Transaction, Message |
   */
  type: "Transaction" | "Message";
}

export interface ScreenViewProperties {
  params: any;
  pathname: string;
  previousPathname?: string;
}

export interface SocialLinkedProperties {
  /**
   * | Rule | Value |
   * |---|---|
   * | Enum Values | Apple, Google |
   */
  cloud: "Apple" | "Google";
}

export interface SwapProposalProperties {
  from: string;
  to: string;
}

export interface TransferProposalProperties {
  token: string;
}

export class Approval implements BaseEvent {
  event_type = 'Approval';

  constructor(
    public event_properties: ApprovalProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class LedgerLinked implements BaseEvent {
  event_type = 'Ledger Linked';

  constructor(
    public event_properties: LedgerLinkedProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class ModifyPolicy implements BaseEvent {
  event_type = 'Modify Policy';

  constructor(
    public event_properties: ModifyPolicyProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class NotificationPressed implements BaseEvent {
  event_type = 'Notification Pressed';

  constructor(
    public event_properties: NotificationPressedProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class Rejection implements BaseEvent {
  event_type = 'Rejection';

  constructor(
    public event_properties: RejectionProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class ScreenView implements BaseEvent {
  event_type = 'Screen View';

  constructor(
    public event_properties: ScreenViewProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class SocialLinked implements BaseEvent {
  event_type = 'Social Linked';

  constructor(
    public event_properties: SocialLinkedProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class SwapProposal implements BaseEvent {
  event_type = 'Swap Proposal';

  constructor(
    public event_properties: SwapProposalProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class TransferProposal implements BaseEvent {
  event_type = 'Transfer Proposal';

  constructor(
    public event_properties: TransferProposalProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export type PromiseResult<T> = { promise: Promise<T | void> };

const getVoidPromiseResult = () => ({ promise: Promise.resolve() });

// prettier-ignore
export class Ampli {
  private disabled: boolean = false;
  private amplitude?: ReactNativeClient;

  get client(): ReactNativeClient {
    this.isInitializedAndEnabled();
    return this.amplitude!;
  }

  get isLoaded(): boolean {
    return this.amplitude != null;
  }

  private isInitializedAndEnabled(): boolean {
    if (!this.amplitude) {
      console.error('ERROR: Ampli is not yet initialized. Have you called ampli.load() on app start?');
      return false;
    }
    return !this.disabled;
  }

  /**
   * Initialize the Ampli SDK. Call once when your application starts.
   *
   * @param options Configuration options to initialize the Ampli SDK with.
   */
  load(options: LoadOptions): PromiseResult<void> {
    this.disabled = options.disabled ?? false;

    if (this.amplitude) {
      console.warn('WARNING: Ampli is already initialized. Ampli.load() should be called once at application startup.');
      return getVoidPromiseResult();
    }

    let apiKey: string | null = null;
    if (options.client && 'apiKey' in options.client) {
      apiKey = options.client.apiKey;
    } else if ('environment' in options) {
      apiKey = ApiKey[options.environment];
    }

    if (options.client && 'instance' in options.client) {
      this.amplitude = options.client.instance;
    } else if (apiKey) {
      this.amplitude = amplitude.createInstance();
      const configuration = (options.client && 'configuration' in options.client) ? options.client.configuration : {};
      return this.amplitude.init(apiKey, undefined, { ...DefaultConfiguration, ...configuration });
    } else {
      console.error("ERROR: ampli.load() requires 'environment', 'client.apiKey', or 'client.instance'");
    }

    return getVoidPromiseResult();
  }

  /**
   * Identify a user and set user properties.
   *
   * @param userId The user's id.
   * @param options Optional event options.
   */
  identify(
    userId: string | undefined,
    options?: EventOptions,
  ): PromiseResult<Result> {
    if (!this.isInitializedAndEnabled()) {
      return getVoidPromiseResult();
    }

    if (userId) {
      options = {...options,  user_id: userId};
    }

    const amplitudeIdentify = new amplitude.Identify();

    return this.amplitude!.identify(amplitudeIdentify, options);
  }

  /**
   * Track event
   *
   * @param event The event to track.
   * @param options Optional event options.
   */
  track(event: Event, options?: EventOptions): PromiseResult<Result> {
    if (!this.isInitializedAndEnabled()) {
      return getVoidPromiseResult();
    }

    return this.amplitude!.track(event, undefined, options);
  }

  /**
   * Flush pending events.
   */
  flush(): PromiseResult<void> {
    if (!this.isInitializedAndEnabled()) {
      return getVoidPromiseResult();
    }

    return this.amplitude!.flush();
  }

  /**
   * Approval
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Approval)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. method)
   * @param options Amplitude event options.
   */
  approval(
    properties: ApprovalProperties,
    options?: EventOptions,
  ) {
    return this.track(new Approval(properties), options);
  }

  /**
   * Ledger Linked
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Ledger%20Linked)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. model)
   * @param options Amplitude event options.
   */
  ledgerLinked(
    properties: LedgerLinkedProperties,
    options?: EventOptions,
  ) {
    return this.track(new LedgerLinked(properties), options);
  }

  /**
   * Modify Policy
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Modify%20Policy)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. new)
   * @param options Amplitude event options.
   */
  modifyPolicy(
    properties: ModifyPolicyProperties,
    options?: EventOptions,
  ) {
    return this.track(new ModifyPolicy(properties), options);
  }

  /**
   * Notification Pressed
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Notification%20Pressed)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. appOpened)
   * @param options Amplitude event options.
   */
  notificationPressed(
    properties: NotificationPressedProperties,
    options?: EventOptions,
  ) {
    return this.track(new NotificationPressed(properties), options);
  }

  /**
   * Rejection
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Rejection)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. method)
   * @param options Amplitude event options.
   */
  rejection(
    properties: RejectionProperties,
    options?: EventOptions,
  ) {
    return this.track(new Rejection(properties), options);
  }

  /**
   * Screen View
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Screen%20View)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. params)
   * @param options Amplitude event options.
   */
  screenView(
    properties: ScreenViewProperties,
    options?: EventOptions,
  ) {
    return this.track(new ScreenView(properties), options);
  }

  /**
   * Social Linked
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Social%20Linked)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. cloud)
   * @param options Amplitude event options.
   */
  socialLinked(
    properties: SocialLinkedProperties,
    options?: EventOptions,
  ) {
    return this.track(new SocialLinked(properties), options);
  }

  /**
   * Swap Proposal
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Swap%20Proposal)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. from)
   * @param options Amplitude event options.
   */
  swapProposal(
    properties: SwapProposalProperties,
    options?: EventOptions,
  ) {
    return this.track(new SwapProposal(properties), options);
  }

  /**
   * Transfer Proposal
   *
   * [View in Tracking Plan](https://data.amplitude.com/zallo/Zallo/events/main/latest/Transfer%20Proposal)
   *
   * Event has no description in tracking plan.
   *
   * @param properties The event's properties (e.g. token)
   * @param options Amplitude event options.
   */
  transferProposal(
    properties: TransferProposalProperties,
    options?: EventOptions,
  ) {
    return this.track(new TransferProposal(properties), options);
  }
}

export const ampli = new Ampli();
