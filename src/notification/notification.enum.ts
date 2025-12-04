export interface ISendMail {
  email: string;
  subject: string;
  html?: string;
}

export interface ISendSms {
  to: string;
  content?: string;
}

export enum BroadcastType {
  EMAIL = 'email',
  PUSH = 'push',
}

export enum BroadcastTarget {
  INDIVIDUAL_USERS = 'individual_users',
  BUSINESS_USERS = 'business_users',
  FREE_BUSINESS = 'free_business',
  FLTRLITE_BASIC = 'fltrlite_basic',
  FLTRLITE_PRO = 'fltrlite_pro',
}