require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@microsoft/eslint-config-spfx/lib/profiles/react'],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    // PnPjs SharePoint REST responses are untyped by design; suppressed for service layer
    '@typescript-eslint/no-explicit-any': 'off',
    // Non-null assertions are used in test assertions
    '@typescript-eslint/no-non-null-assertion': 'off'
  }
};
