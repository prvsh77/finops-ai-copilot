# Contributing Guidelines

We welcome contributions to FinOps AI Copilot. Please adhere to these development standards to maintain code quality.

---

## 🛠️ Code Conventions & Design Style
1. **Repository Pattern**: Business services must not read or write data files directly. Write clean queries inside matching repositories inheriting from `BaseRepository`.
2. **Deterministic AI Fallbacks**: Ensure Mock providers remain reliable in test suites when active API keys are absent.
3. **No Unused CSS Rules**: Avoid Tailwind declarations unless explicitly requested. Custom widgets in `App.tsx` should use vanilla CSS styling or inline classes.

---

## 📝 Pull Request Workflow
1. **Create Branch**: Follow name naming rules: `feature/your-feature-name` or `bugfix/issue-description`.
2. **Write Tests**: Create new integration test files under `apps/api/test/` to cover new routing paths.
3. **Run Tests**: Verify all tests pass cleanly:
   ```bash
   npm test
   ```
4. **Format & Build**: Make sure Vite production build is fully successful:
   ```bash
   npm run build
   ```
5. **Open Pull Request**: Describe what changes were introduced and attach testing evidence.
