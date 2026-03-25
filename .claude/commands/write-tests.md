Write comprehensive tests for: $ARGUMENTS

Testing conventions:

- Use Vitetest with React Testing Library
- Place test files in a **test** directory in the same folder as the source file
- Name test files as [filename].test.ts(x)
- Use @/ prefix for imports

Coverage:

- Test happy paths
- Test edge cases
- Test error states
- For chatbot related functions, test that the response is able to pull chunks from the knowledgebase and respond
- Be able to answer high-level and detailed questions
- Focus on testing behavior and public API's rather than implementation details
