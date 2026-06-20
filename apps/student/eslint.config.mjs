import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            'JSXElement[name.name=/^(Button|button|Link|link|A|a)$/] > JSXText[value=/\\w/]',
          message:
            'Use a COPY constant instead of hardcoded text in interactive elements. Import COPY from "@learn-easy/ui" and use {COPY.keyName}.',
        },
      ],
    },
  },
];
