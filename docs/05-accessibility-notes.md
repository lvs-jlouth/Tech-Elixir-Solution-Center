# Tech Elixir Solution Center – Accessibility Notes

This document describes the accessibility posture of the Tech Elixir Solution Center web part, the WCAG criteria it targets, known considerations, and guidance for contributors.

---

## Target Standard

The web part targets **WCAG 2.1 Level AA** compliance, consistent with Microsoft's SharePoint Online accessibility commitment and the [Microsoft Accessibility Standard](https://www.microsoft.com/en-us/accessibility).

---

## Technology and Built-in Accessibility Support

The web part is built on **Fluent UI v8**, Microsoft's design system for Microsoft 365. Fluent UI components ship with:

- Semantic HTML elements and landmark roles
- Built-in keyboard navigation (Tab, Shift+Tab, Arrow keys, Enter, Escape)
- ARIA attributes on interactive controls
- High-contrast theme support
- Focus indicators compliant with WCAG 2.4.7

This means a large portion of baseline accessibility is handled by the framework. Custom components must follow the same patterns.

---

## WCAG 2.1 AA Coverage

### Perceivable

| Criterion | Description | Status | Notes |
|---|---|---|---|
| 1.1.1 Non-text Content | Images and icons have text alternatives | ✅ Pass | Fluent UI icons expose `aria-label`; status badges include text labels. |
| 1.3.1 Info and Relationships | Structure conveyed through markup | ✅ Pass | Semantic headings (`h1`–`h3`), lists, and tables used throughout. |
| 1.3.3 Sensory Characteristics | Instructions do not rely on shape/color alone | ✅ Pass | Status badges show both color and text label. |
| 1.4.1 Use of Color | Color is not the only visual means of conveying information | ✅ Pass | All statuses (Active, Deprecated, etc.) include a text label. |
| 1.4.3 Contrast (Minimum) | Text has 4.5:1 contrast ratio (3:1 for large text) | ⚠️ Review | Contrast depends on the host page SharePoint theme. Verify custom themes meet the threshold. |
| 1.4.4 Resize Text | Text can be resized to 200% without loss of content | ✅ Pass | Fluent UI uses relative units (`em`/`rem`). |
| 1.4.10 Reflow | Content reflows at 320 CSS pixels wide | ⚠️ Review | Review on narrow viewports; some table columns may require horizontal scroll. |
| 1.4.11 Non-text Contrast | UI components have 3:1 contrast against background | ✅ Pass | Fluent UI components meet this in the default theme. |

### Operable

| Criterion | Description | Status | Notes |
|---|---|---|---|
| 2.1.1 Keyboard | All functionality available from keyboard | ✅ Pass | All interactive controls are keyboard-reachable via Tab/Enter/Space. |
| 2.1.2 No Keyboard Trap | Keyboard focus is never trapped | ⚠️ Review | Verify modal/panel focus traps implement correct Escape-to-close and focus restoration. |
| 2.4.1 Bypass Blocks | Mechanism to skip navigation | N/A | Navigation is scoped within the web part; skip links are a page-level concern. |
| 2.4.3 Focus Order | Focus order is logical | ✅ Pass | DOM order matches visual reading order. |
| 2.4.4 Link Purpose | Link purpose identifiable from context | ✅ Pass | All links include descriptive text or `aria-label`. |
| 2.4.7 Focus Visible | Keyboard focus is visible | ✅ Pass | Fluent UI provides a visible focus ring. |
| 2.5.3 Label in Name | Accessible name includes visible label text | ✅ Pass | Button labels match their visible text. |

### Understandable

| Criterion | Description | Status | Notes |
|---|---|---|---|
| 3.1.1 Language of Page | Language is set | N/A | Managed by SharePoint at the page level. |
| 3.2.2 On Input | User inputs do not trigger unexpected context changes | ✅ Pass | Toggling solutions updates only the detail panel, not the whole page. |
| 3.3.1 Error Identification | Errors identified in text | ✅ Pass | `ErrorState` component displays descriptive error messages. |

### Robust

| Criterion | Description | Status | Notes |
|---|---|---|---|
| 4.1.1 Parsing | Valid HTML | ✅ Pass | React generates valid DOM. |
| 4.1.2 Name, Role, Value | All UI components have accessible name, role, state | ✅ Pass | Fluent UI exposes ARIA roles and states. Custom interactive elements should follow the same pattern. |
| 4.1.3 Status Messages | Status messages programmatically determinable | ⚠️ Review | Loading and error states should use `aria-live` regions where appropriate. |

---

## Accessibility Dashboard Feature

The web part includes a built-in **Accessibility Dashboard** section (toggled via the `showAccessibilityDashboard` property pane setting). This section reads `IAccessibilityCheck` records — either from the **Solution Accessibility Checks** SharePoint list or from mock data — and displays them in a structured table with:

- WCAG reference (e.g. `WCAG 2.1.1`)
- Status: **Pass**, **NeedsAttention**, **Blocked**, **NotReviewed**
- Impact area (Visual, Keyboard Navigation, Screen Reader, etc.)
- Remediation guidance
- Owner and target date

This allows teams to track per-solution accessibility compliance directly within the dashboard.

---

## Screen Reader Testing

The following screen readers are recommended for manual testing:

| Screen reader | Browser | Platform |
|---|---|---|
| NVDA + Chrome | Chrome | Windows |
| JAWS + Edge | Microsoft Edge | Windows |
| VoiceOver + Safari | Safari | macOS / iOS |
| TalkBack | Chrome | Android |

Test the following interactions with each screen reader:

1. Navigating the solution list (left rail)
2. Selecting a solution and moving to the detail panel
3. Expanding/collapsing release notes
4. Reading the documentation completeness percentage
5. Activating quick links and GitHub links

---

## Keyboard Navigation Map

| Key | Action |
|---|---|
| `Tab` | Move focus forward through interactive elements |
| `Shift+Tab` | Move focus backward |
| `Enter` / `Space` | Activate buttons, links, and toggle controls |
| `Arrow keys` | Navigate within lists, pivot tabs, and dropdowns |
| `Escape` | Close panels and dropdowns |

---

## Contributing – Accessibility Guidelines

When adding or modifying components:

1. **Use Fluent UI components** wherever possible — they are pre-tested for accessibility.
2. **Add `aria-label`** to any interactive element that lacks a visible text label (e.g. icon-only buttons).
3. **Maintain heading hierarchy** — do not skip heading levels (h2 → h4).
4. **Do not rely on color alone** to communicate state — always pair color with text or icon.
5. **Test keyboard navigation** manually before submitting a pull request.
6. **Run automated checks** — consider integrating [axe-core](https://github.com/dequelabs/axe-core) or [jest-axe](https://github.com/nickcolley/jest-axe) in the test suite (planned — see [docs/08-roadmap.md](08-roadmap.md)).

---

## Known Gaps and Planned Improvements

| Gap | Planned fix |
|---|---|
| No automated accessibility scan in CI | Integrate `jest-axe` or `@axe-core/react` in test suite |
| Some table columns require horizontal scroll on narrow viewports | Implement responsive column hiding or vertical stacked layout |
| `aria-live` regions for loading/error states not consistently applied | Audit and add `aria-live="polite"` to loading and error state components |
| Modal focus trap and Escape handling not formally audited | Conduct dedicated keyboard audit against all panel/modal interactions |
