import * as bcrypt from 'bcryptjs';

const newPassword = 'fltr123.';
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(newPassword, salt);

console.log(hashedPassword);
