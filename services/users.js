const User = require('../models/User');
const Bcrypt = require('bcryptjs');

const signUp = async data => {

  const { username } = data;
  const hash = Bcrypt.hashSync(data.password, 10);

  const existingUser = await User
    .findOne({ username })
    .select({ username: true });

  if (!existingUser) {
    const newUser = await User.create({ username, password: hash })
    return newUser;
  }

  return null
};

const signIn = async data => {

  const user = await User
    .findOne({ username: data.username });

  if (!Bcrypt.compareSync(data.password, user.password)) {
    return null;
  }

  return { username: user.username };
};

module.exports = { signUp, signIn };
