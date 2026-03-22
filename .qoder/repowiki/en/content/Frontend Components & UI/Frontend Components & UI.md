# Frontend Components & UI

<cite>
**Referenced Files in This Document**
- [app.tsx](file://resources/js/app.tsx)
- [utils.ts](file://resources/js/lib/utils.ts)
- [components.json](file://components.json)
- [package.json](file://package.json)
- [tsconfig.json](file://tsconfig.json)
- [button.tsx](file://resources/js/components/ui/button.tsx)
- [input.tsx](file://resources/js/components/ui/input.tsx)
- [dialog.tsx](file://resources/js/components/ui/dialog.tsx)
- [card.tsx](file://resources/js/components/ui/card.tsx)
- [select.tsx](file://resources/js/components/ui/select.tsx)
- [table.tsx](file://resources/js/components/ui/table.tsx)
- [badge.tsx](file://resources/js/components/ui/badge.tsx)
- [avatar.tsx](file://resources/js/components/ui/avatar.tsx)
- [checkbox.tsx](file://resources/js/components/ui/checkbox.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the frontend component library and UI architecture built with React, Inertia, Radix UI, Tailwind CSS, and shadcn-inspired patterns. It covers reusable UI components, their props, styling, composition, state management, interactivity, responsive design, accessibility, and integration patterns. It also outlines testing approaches and the development workflow.

## Project Structure
The frontend is organized around a component library under resources/js/components/ui and page components under resources/js/pages. The application bootstraps via Inertia and Vite, with Tailwind CSS providing utility-first styling and a centralized alias configuration for imports.

```mermaid
graph TB
A["resources/js/app.tsx<br/>Inertia bootstrap"] --> B["resources/js/pages/*.tsx<br/>Pages"]
B --> C["resources/js/components/ui/*.tsx<br/>UI primitives"]
C --> D["resources/js/lib/utils.ts<br/>cn() helper"]
E["components.json<br/>shadcn config"] --> C
F["package.json<br/>deps & scripts"] --> A
G["tsconfig.json<br/>paths & JSX"] --> A
```

**Diagram sources**
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)
- [utils.ts:1-7](file://resources/js/lib/utils.ts#L1-L7)
- [components.json:1-26](file://components.json#L1-L26)
- [package.json:1-73](file://package.json#L1-L73)
- [tsconfig.json:111-116](file://tsconfig.json#L111-L116)

**Section sources**
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)
- [components.json:1-26](file://components.json#L1-L26)
- [package.json:1-73](file://package.json#L1-L73)
- [tsconfig.json:111-116](file://tsconfig.json#L111-L116)

## Core Components
This section documents the primary UI components and their capabilities.

- Button
  - Purpose: Action trigger with variants and sizes.
  - Key props: variant, size, asChild, className.
  - Variants: default, outline, secondary, ghost, destructive, link.
  - Sizes: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg.
  - Accessibility: Inherits native button semantics; supports focus-visible styles.
  - Composition: Uses Slot for semantic composition; integrates with icons.

- Input
  - Purpose: Text input with consistent styling and focus states.
  - Key props: type, className.
  - Accessibility: Supports aria-invalid for error states; focus-visible ring.
  - Styling: Tailwind-based with ring focus and destructive variants.

- Dialog
  - Purpose: Modal overlay with header, footer, and close controls.
  - Key parts: Root, Trigger, Portal, Overlay, Content, Header, Footer, Title, Description, Close.
  - Props: showCloseButton, size alignment, animation classes.
  - Accessibility: Focus trapping, backdrop blur, sr-only close label.

- Card
  - Purpose: Content container with header, title, description, action, content, and footer.
  - Key props: size (default, sm).
  - Layout: Grid-based header with optional action and description rows.

- Select
  - Purpose: Dropdown selection with groups, labels, items, and scroll buttons.
  - Key parts: Root, Group, Value, Trigger, Content, Label, Item, Separator, ScrollUp/Down Buttons.
  - Props: size (sm, default), position (item-aligned, popper), align.
  - Accessibility: Keyboard navigation, focus-visible, indicator for selected item.

- Table
  - Purpose: Responsive table wrapper with container and semantic cells.
  - Key parts: Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption.
  - Responsiveness: Horizontal scrolling container; hover and selected states.

- Badge
  - Purpose: Label or status indicator with variants.
  - Key props: variant, asChild.
  - Variants: default, secondary, destructive, outline, ghost, link.

- Avatar
  - Purpose: User identity with image, fallback, badge, and group utilities.
  - Key parts: Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount.
  - Props: size (default, sm, lg); group spacing and ring behavior.

- Checkbox
  - Purpose: Binary selection with visual indicator.
  - Props: className; integrates with focus-visible and invalid states.

**Section sources**
- [button.tsx:1-68](file://resources/js/components/ui/button.tsx#L1-L68)
- [input.tsx:1-20](file://resources/js/components/ui/input.tsx#L1-L20)
- [dialog.tsx:1-166](file://resources/js/components/ui/dialog.tsx#L1-L166)
- [card.tsx:1-104](file://resources/js/components/ui/card.tsx#L1-L104)
- [select.tsx:1-193](file://resources/js/components/ui/select.tsx#L1-L193)
- [table.tsx:1-115](file://resources/js/components/ui/table.tsx#L1-L115)
- [badge.tsx:1-50](file://resources/js/components/ui/badge.tsx#L1-L50)
- [avatar.tsx:1-111](file://resources/js/components/ui/avatar.tsx#L1-L111)
- [checkbox.tsx:1-34](file://resources/js/components/ui/checkbox.tsx#L1-L34)

## Architecture Overview
The UI architecture follows a layered pattern:
- Application bootstrap sets up Inertia and theme initialization.
- Page components import UI primitives from the local components/ui library.
- Styling is centralized via Tailwind and a cn() helper for merging classes.
- shadcn configuration defines style, icon library, and aliases.

```mermaid
graph TB
subgraph "Bootstrap"
APP["app.tsx<br/>createInertiaApp()"] --> THEME["use-appearance.ts<br/>initializeTheme()"]
end
subgraph "Components Library"
BTN["button.tsx"]
INP["input.tsx"]
DLG["dialog.tsx"]
CAR["card.tsx"]
SEL["select.tsx"]
TAB["table.tsx"]
BGD["badge.tsx"]
AVA["avatar.tsx"]
CHK["checkbox.tsx"]
CN["utils.ts<br/>cn()"]
end
subgraph "Config"
CFG["components.json"]
PKG["package.json"]
TSC["tsconfig.json"]
end
APP --> BTN
APP --> INP
APP --> DLG
APP --> CAR
APP --> SEL
APP --> TAB
APP --> BGD
APP --> AVA
APP --> CHK
BTN --> CN
INP --> CN
DLG --> CN
CAR --> CN
SEL --> CN
TAB --> CN
BGD --> CN
AVA --> CN
CHK --> CN
CFG --> BTN
CFG --> DLG
CFG --> SEL
PKG --> APP
TSC --> APP
```

**Diagram sources**
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)
- [utils.ts:1-7](file://resources/js/lib/utils.ts#L1-L7)
- [components.json:1-26](file://components.json#L1-L26)
- [package.json:1-73](file://package.json#L1-L73)
- [tsconfig.json:111-116](file://tsconfig.json#L111-L116)
- [button.tsx:1-68](file://resources/js/components/ui/button.tsx#L1-L68)
- [dialog.tsx:1-166](file://resources/js/components/ui/dialog.tsx#L1-L166)
- [select.tsx:1-193](file://resources/js/components/ui/select.tsx#L1-L193)

## Detailed Component Analysis

### Button Component
- Implementation highlights:
  - Uses class-variance-authority for variants and sizes.
  - Supports asChild to render a different tag while preserving styling.
  - Integrates focus-visible rings and disabled states.
- Props and behavior:
  - variant: selects background, borders, and hover effects.
  - size: controls height, padding, and icon sizing.
  - asChild: composes with parent semantics (e.g., Link).
- Accessibility:
  - Inherits button semantics; focus-visible ring applied via data attributes.
- Styling:
  - Merges Tailwind classes with cn() helper.

```mermaid
classDiagram
class Button {
+variant : "default"|"outline"|...
+size : "default"|"sm"|...
+asChild : boolean
+className : string
}
class Utils {
+cn(...inputs) : string
}
Button --> Utils : "merges classes"
```

**Diagram sources**
- [button.tsx:44-65](file://resources/js/components/ui/button.tsx#L44-L65)
- [utils.ts:4-6](file://resources/js/lib/utils.ts#L4-L6)

**Section sources**
- [button.tsx:1-68](file://resources/js/components/ui/button.tsx#L1-L68)
- [utils.ts:1-7](file://resources/js/lib/utils.ts#L1-L7)

### Dialog Component
- Implementation highlights:
  - Composed from Radix UI primitives with portal rendering.
  - Optional close button with icon and screen-reader label.
  - Overlay supports backdrop blur and fade animations.
- Props and behavior:
  - showCloseButton toggles close affordance.
  - Content centers with responsive max-width.
- Accessibility:
  - Focus trapping via Radix UI; sr-only text for close button.
- Composition:
  - DialogHeader/Footer for structured layouts; Title/Description for semantics.

```mermaid
sequenceDiagram
participant User as "User"
participant Trigger as "DialogTrigger"
participant Portal as "DialogPortal"
participant Overlay as "DialogOverlay"
participant Content as "DialogContent"
participant Close as "DialogClose"
User->>Trigger : Click
Trigger->>Portal : Open
Portal->>Overlay : Render overlay
Overlay->>Content : Render content
User->>Close : Click
Close-->>Portal : Close signal
```

**Diagram sources**
- [dialog.tsx:16-85](file://resources/js/components/ui/dialog.tsx#L16-L85)

**Section sources**
- [dialog.tsx:1-166](file://resources/js/components/ui/dialog.tsx#L1-L166)

### Select Component
- Implementation highlights:
  - Trigger with chevron icon; content with viewport and scroll buttons.
  - Item indicators and keyboard navigation via Radix UI.
  - Supports groups, labels, separators, and popper positioning.
- Props and behavior:
  - size affects trigger height.
  - position determines alignment and slide-in animation.
- Accessibility:
  - Focus-visible; keyboard navigation; selected item indicator.

```mermaid
flowchart TD
Start(["Open Select"]) --> Trigger["Click Trigger"]
Trigger --> Portal["Render Portal"]
Portal --> Content["Render Content"]
Content --> Viewport["Viewport with Items"]
Viewport --> Item["Select Item"]
Item --> Close(["Close & Apply Value"])
```

**Diagram sources**
- [select.tsx:34-91](file://resources/js/components/ui/select.tsx#L34-L91)

**Section sources**
- [select.tsx:1-193](file://resources/js/components/ui/select.tsx#L1-L193)

### Card Component
- Implementation highlights:
  - Structured layout with header, title, description, action, content, footer.
  - Size variant adjusts spacing and typography.
- Props and behavior:
  - size: default/sm toggles padding and typography.
- Composition:
  - Uses data attributes to coordinate child slots.

```mermaid
classDiagram
class Card {
+size : "default"|"sm"
+className : string
}
class CardHeader
class CardTitle
class CardDescription
class CardAction
class CardContent
class CardFooter
Card --> CardHeader
Card --> CardTitle
Card --> CardDescription
Card --> CardAction
Card --> CardContent
Card --> CardFooter
```

**Diagram sources**
- [card.tsx:5-21](file://resources/js/components/ui/card.tsx#L5-L21)
- [card.tsx:23-93](file://resources/js/components/ui/card.tsx#L23-L93)

**Section sources**
- [card.tsx:1-104](file://resources/js/components/ui/card.tsx#L1-L104)

### Table Component
- Implementation highlights:
  - Wraps table in horizontal scroll container.
  - Semantic head/body/footer with hover and selected states.
- Responsiveness:
  - Container ensures horizontal overflow visibility on small screens.

```mermaid
flowchart TD
Container["Table Container"] --> Table["Table Element"]
Table --> Header["TableHeader"]
Table --> Body["TableBody"]
Table --> Footer["TableFooter"]
Header --> Row["TableRow"]
Body --> Row
Footer --> Row
Row --> Cell["TableCell"]
```

**Diagram sources**
- [table.tsx:5-18](file://resources/js/components/ui/table.tsx#L5-L18)
- [table.tsx:20-103](file://resources/js/components/ui/table.tsx#L20-L103)

**Section sources**
- [table.tsx:1-115](file://resources/js/components/ui/table.tsx#L1-L115)

### Badge, Avatar, Checkbox
- Badge
  - Variant-based styling with optional child composition.
- Avatar
  - Image/fallback with optional badge and group utilities.
- Checkbox
  - Indicator with focus-visible and invalid states.

**Section sources**
- [badge.tsx:1-50](file://resources/js/components/ui/badge.tsx#L1-L50)
- [avatar.tsx:1-111](file://resources/js/components/ui/avatar.tsx#L1-L111)
- [checkbox.tsx:1-34](file://resources/js/components/ui/checkbox.tsx#L1-L34)

## Dependency Analysis
- Runtime dependencies:
  - @inertiajs/react for page rendering and navigation.
  - @radix-ui/* for accessible, headless UI primitives.
  - lucide-react for icons.
  - tailwind-merge and clsx for class merging.
  - next-themes for theme switching.
- Build-time dependencies:
  - Vite, TypeScript, ESLint/Prettier for tooling.
- Aliases and paths:
  - tsconfig.json maps @/* to resources/js/* for concise imports.

```mermaid
graph LR
P["package.json deps"] --> INERTIA["@inertiajs/react"]
P --> RADIX["@radix-ui/*"]
P --> LUCIDE["lucide-react"]
P --> TW["tailwind-merge / clsx"]
P --> THEME["next-themes"]
P --> VITE["vite"]
P --> TS["typescript"]
TSC["tsconfig.json"] --> INERTIA
TSC --> RADIX
```

**Diagram sources**
- [package.json:23-65](file://package.json#L23-L65)
- [tsconfig.json:111-116](file://tsconfig.json#L111-L116)

**Section sources**
- [package.json:1-73](file://package.json#L1-L73)
- [tsconfig.json:111-116](file://tsconfig.json#L111-L116)

## Performance Considerations
- Bundle size:
  - Prefer lazy-loading heavy pages and components.
  - Keep icon usage scoped; avoid importing entire icon libraries.
- Rendering:
  - Use asChild patterns to minimize DOM nodes.
  - Memoize expensive computations outside components.
- Styling:
  - Reuse shared variants and avoid excessive conditional classes.
- Tooling:
  - Leverage Vite’s fast dev server and tree-shaking.
  - Use ESLint and Prettier to maintain code quality and reduce regressions.

## Troubleshooting Guide
- Theming and SSR:
  - Ensure theme initialization runs on the client to prevent hydration mismatches.
- Accessibility:
  - Verify focus-visible rings and aria-* attributes for form controls.
  - Provide labels for icons and sr-only text for decorative icons.
- Styling conflicts:
  - Use the cn() helper to merge classes deterministically.
  - Avoid conflicting Tailwind utilities; prefer component variants.
- Build issues:
  - Confirm tsconfig paths and JSX settings.
  - Validate Vite and plugin versions.

**Section sources**
- [app.tsx:28-30](file://resources/js/app.tsx#L28-L30)
- [utils.ts:4-6](file://resources/js/lib/utils.ts#L4-L6)
- [tsconfig.json:111-116](file://tsconfig.json#L111-L116)

## Conclusion
The component library emphasizes accessibility, composability, and consistency through Radix UI primitives, Tailwind utilities, and a centralized cn() helper. The architecture supports rapid iteration, strong typing, and maintainable UI patterns. Following the documented props, variants, and composition guidelines ensures predictable behavior across pages and contexts.

## Appendices

### Component Composition Patterns
- Variant-driven styling with class-variance-authority.
- asChild composition for semantic correctness.
- Portal-based overlays for modularity.
- Data attributes for coordinated slot layouts.

### State Management and Interactivity
- Dialog and Select rely on Radix UI state machines; expose minimal props to consumers.
- Form controls integrate focus-visible and aria-invalid states.
- Theme initialization occurs on mount to avoid SSR mismatches.

### Responsive Design and Accessibility
- Responsive breakpoints via Tailwind utilities; horizontal scrolling for tables.
- Focus-visible rings and keyboard navigation supported by Radix UI.
- Screen-reader labels for icons and close buttons.

### Testing Approach and Workflow
- Unit testing:
  - Test component renders with variants and asChild behavior.
  - Validate accessibility attributes and focus states.
- Integration testing:
  - Simulate user interactions (open dialogs, select items).
- Development workflow:
  - Use Vite dev server for hot reload.
  - Run linting and formatting checks via npm scripts.
  - Commit with clear messages and review changes in pull requests.