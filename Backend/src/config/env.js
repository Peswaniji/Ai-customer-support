const requiredEnv = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

const requiredInProduction = ["CLIENT_URL", "GEMINI_API_KEY"];

const weakSecretValues = new Set(["secret", "password", "changeme", "jwt_secret", "your_secret"]);

const isStrongSecret = (value) => {
  if (!value || value.length < 32) return false;
  return !weakSecretValues.has(value.toLowerCase());
};

export const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production") {
    missing.push(...requiredInProduction.filter((key) => !process.env[key]));
  }

  const weakSecrets = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"].filter(
    (key) => process.env[key] && !isStrongSecret(process.env[key])
  );

  if (missing.length > 0 || weakSecrets.length > 0) {
    const messages = [];
    if (missing.length > 0) {
      messages.push(`Missing required env vars: ${missing.join(", ")}`);
    }
    if (weakSecrets.length > 0) {
      messages.push(
        `Weak JWT secrets: ${weakSecrets.join(", ")} must be at least 32 characters and not a placeholder`
      );
    }
    throw new Error(messages.join(". "));
  }
};
