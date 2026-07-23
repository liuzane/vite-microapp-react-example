import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  globalIgnores(['dist', 'public', '@mf-types']),
  {
    files: ['**/*.{js,jsx,ts,mts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      stylistic.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    name: 'app/custom-rules',
    files: ['**/*.{js,jsx,ts,mts,tsx}'], // 可以指定文件，或者全局
    rules: {
      /* React Hooks */
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',

      /* TypeScript */
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false, // 数组解构强制类型注解
          arrowParameter: true, // 箭头函数参数不强制类型注解
          memberVariableDeclaration: true, // 类属性强制类型注解
          objectDestructuring: false, // 对象解构强制类型注解
          parameter: true, // 函数参数强制类型注解
          propertyDeclaration: true, // 类属性强制类型注解
          variableDeclaration: true, // 变量声明强制类型注解
          variableDeclarationIgnoreFunction: true, // 函数声明变量不强制类型注解
        },
      ],

      /* Stylistic */
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },
]);
