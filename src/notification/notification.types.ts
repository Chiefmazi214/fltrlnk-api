export interface ISendMail {
  email: string;
  subject: string;
  content?: string;
  html?: string;
}