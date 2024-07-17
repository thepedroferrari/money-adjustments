export const isValidEmail = (
  email: string | null | undefined,
): email is string => {
  return typeof email === "string" && email.includes("@");
};
