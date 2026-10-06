import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const unsafeFrontendSyntax = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Render text through React escaping; dangerouslySetInnerHTML is not allowed.'
  },
  {
    selector: "Property[key.name='dangerouslySetInnerHTML']",
    message: 'Passing dangerouslySetInnerHTML through an object or spread is not allowed.'
  },
  {
    selector: "JSXAttribute[name.name='srcDoc']",
    message: 'Inline iframe HTML is not allowed.'
  },
  {
    selector: "AssignmentExpression[left.type='MemberExpression'][left.property.name=/^(innerHTML|outerHTML|srcdoc)$/]",
    message: 'Unsafe HTML assignment is not allowed; use textContent or React rendering.'
  },
  {
    selector: "CallExpression[callee.type='MemberExpression'][callee.property.name=/^(insertAdjacentHTML|setHTMLUnsafe|createContextualFragment)$/]",
    message: 'Unsafe HTML parsing or insertion is not allowed.'
  },
  {
    selector: "CallExpression[callee.type='MemberExpression'][callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
    message: 'document.write is an unsafe DOM sink and is not allowed.'
  },
  {
    selector: "CallExpression[callee.name='fetch']",
    message: 'Network access is deny-by-default; document and review an exception before adding fetch.'
  },
  {
    selector: "CallExpression[callee.type='MemberExpression'][callee.property.name='fetch']",
    message: 'Network access is deny-by-default; document and review an exception before adding fetch.'
  },
  {
    selector: "CallExpression[callee.type='MemberExpression'][callee.property.value='fetch']",
    message: 'Network access is deny-by-default; document and review an exception before adding fetch.'
  },
  {
    selector: "NewExpression[callee.name=/^(XMLHttpRequest|WebSocket|EventSource)$/]",
    message: 'Network access is deny-by-default; document and review an exception first.'
  },
  {
    selector: "NewExpression[callee.type='MemberExpression'][callee.property.name=/^(XMLHttpRequest|WebSocket|EventSource)$/]",
    message: 'Network access is deny-by-default; document and review an exception first.'
  },
  {
    selector: "CallExpression[callee.type='MemberExpression'][callee.object.name='navigator'][callee.property.name='sendBeacon']",
    message: 'Telemetry and network beacons are not allowed without an explicit reviewed exception.'
  }
];

const restrictedPersistenceSyntax = [
  {
    selector: "Identifier[name='localStorage']",
    message: 'localStorage is allowed only in src/store.ts through the versioned preference allowlist.'
  },
  {
    selector: "MemberExpression[property.value='localStorage']",
    message: 'localStorage is allowed only in src/store.ts through the versioned preference allowlist.'
  },
  {
    selector: "Identifier[name=/^(sessionStorage|indexedDB)$/]",
    message: 'Unreviewed browser persistence is not allowed.'
  },
  {
    selector: "MemberExpression[object.name='document'][property.name='cookie']",
    message: 'Client-side cookie access is not allowed in this static application.'
  }
];

/**
 * TypeScript alone does not catch the mistakes that actually break this app:
 * a hook called conditionally, a stale `useEffect` dependency list, or an
 * unstable list key. Those are what this configuration is here for.
 */
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Unused code is dead weight in a teaching codebase; an underscore marks intent.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // The content files are data, so object shapes are declared, never inferred as `any`.
      '@typescript-eslint/no-explicit-any': 'error',
      eqeqeq: ['error', 'smart'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-restricted-syntax': ['error', ...unsafeFrontendSyntax, ...restrictedPersistenceSyntax]
    }
  },
  {
    // SEC-08 owns the only approved persistence boundary. Its schema, migration,
    // merge and partialize allowlist are covered by store integration tests.
    files: ['src/store.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...unsafeFrontendSyntax, ...restrictedPersistenceSyntax.slice(2)]
    }
  },
  {
    // Tests may reach for Node globals and are not components.
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'react-refresh/only-export-components': 'off',
      // Tests may exercise browser storage in isolated jsdom instances. Runtime
      // source remains subject to the persistence restrictions above. Security
      // fixtures may also contain literal script URLs that must never ship.
      'no-script-url': 'off',
      'no-restricted-syntax': ['error', ...unsafeFrontendSyntax]
    }
  },
  {
    // ENG-12 end-to-end specs and the Playwright config are Node-run harness
    // code, not shipped components. They drive the browser through Playwright's
    // API and touch the DOM only inside `page.evaluate`, so they keep the unsafe
    // DOM-sink guardrails but drop the component and persistence restrictions.
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'react-refresh/only-export-components': 'off',
      'no-restricted-syntax': ['error', ...unsafeFrontendSyntax]
    }
  }
);
