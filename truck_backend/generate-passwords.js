const bcrypt = require('bcryptjs');

async function generateHashes() {
  const passwords = [
    { username: 'admin', password: 'admin123' },
    { username: 'driver1', password: 'driver123' }
  ];

  for (const user of passwords) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`Username: ${user.username}`);
    console.log(`Password: ${user.password}`);
    console.log(`Hash: ${hash}`);
    console.log('---------------------------------');
  }
}

generateHashes();