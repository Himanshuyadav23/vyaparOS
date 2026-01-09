/**
 * Environment Variable Validation
 * Ensures all required environment variables are set and valid
 */

interface EnvConfig {
  [key: string]: {
    required: boolean;
    validator?: (value: string) => boolean;
    default?: string;
  };
}

const envConfig: EnvConfig = {
  MONGODB_URI: {
    required: true,
    validator: (value) => {
      return value.startsWith('mongodb://') || value.startsWith('mongodb+srv://');
    },
  },
  JWT_SECRET: {
    required: true,
    validator: (value) => {
      return value.length >= 32 && value !== 'your-secret-key-change-in-production';
    },
  },
  NODE_ENV: {
    required: false,
    default: 'development',
    validator: (value) => {
      return ['development', 'production', 'test'].includes(value);
    },
  },
};

/**
 * Validate environment variables
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(envConfig)) {
    const value = process.env[key];
    
    if (config.required && !value) {
      errors.push(`Required environment variable ${key} is not set`);
      continue;
    }

    if (!value && config.default) {
      process.env[key] = config.default;
      continue;
    }

    if (value && config.validator && !config.validator(value)) {
      errors.push(`Environment variable ${key} has an invalid value`);
    }

    // Security warnings
    if (key === 'JWT_SECRET' && value === 'your-secret-key-change-in-production') {
      warnings.push('JWT_SECRET is using the default value. Change it in production!');
    }

    if (key === 'MONGODB_URI' && (value?.includes('<') || value?.includes('YOUR_'))) {
      warnings.push('MONGODB_URI appears to contain placeholder values');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get validated environment variable
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && defaultValue) {
    return defaultValue;
  }
  
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value;
}

// Validate on module load (only in production)
if (process.env.NODE_ENV === 'production') {
  const validation = validateEnvironment();
  if (!validation.valid) {
    console.error('Environment validation failed:', validation.errors);
    throw new Error('Invalid environment configuration');
  }
  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:', validation.warnings);
  }
}
