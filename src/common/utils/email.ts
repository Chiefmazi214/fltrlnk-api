export function sanitizeEmailForDevelopment(email: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return email;
  }

  const devEmailPattern = /^([^+]+)\+dev[^@]*@(.+)$/;
  const match = email.match(devEmailPattern);

  if (match) {
    const baseEmail = `${match[1]}@${match[2]}`;
    return baseEmail;
  }

  return email;
}
