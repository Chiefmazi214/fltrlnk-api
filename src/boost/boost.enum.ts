export enum BoostType {
  FLTR = 'fltr',
  LNK = 'lnk',
  MATCH = 'match',
  GPS = 'gps',
  LOC = 'loc',
  USERS = 'users',
  SEARCH = 'search',
}

export enum ActiveBoostStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  BOOST = 'boost',
}


export enum SubscriptionType {
  BASIC = 'basic',
  PRO = 'pro',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  SIX_MONTHS = '6_months',
  ANNUAL = 'annual',
  ALL_TIME = 'all_time',
}

export enum PromoCodeStatus {
  ACTIVE = 'active',
  USED = 'used',
}