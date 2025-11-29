/** @type {import('stylelint').Config} */
module.exports = {
  extends: ["stylelint-config-standard-scss"],
  plugins: ["stylelint-order"],
  rules: {
    // SCSS (@use/@forward…)
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,

    // ton besoin
    "max-nesting-depth": 4,
    "order/properties-alphabetical-order": true
  },
  ignoreFiles: ["**/dist/**", "**/node_modules/**"]
};
