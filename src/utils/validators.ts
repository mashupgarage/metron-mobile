export const emailValidator = (email: string) => {
  return new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email);
};

export const validatePassword = (password: string) => {
  return new RegExp(
    /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{6,}$/
  ).test(password);
};
