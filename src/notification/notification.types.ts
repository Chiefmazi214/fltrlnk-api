export interface ISendMail {
  email: string;
  subject: string;
  html?: string;
}

export interface ISendSms {
  to: string;
  content?: string;
}