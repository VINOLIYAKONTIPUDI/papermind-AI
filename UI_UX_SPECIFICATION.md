# Enterprise UI/UX Specification: PaperMind AI

This document establishes the UI/UX architecture, visual design system, page layouts, interactive components, navigation flows, and accessibility benchmarks for the **PaperMind AI** platform. It aligns with premium product design standards observed in flagship platforms like Notion, Linear, Perplexity AI, Figma, GitHub, and Arc Browser.

---

## 1. Visual Design System & Design Tokens

PaperMind AI employs a developer-centric, glassmorphic design system to minimize visual fatigue, optimize text readability, and create a premium workspace.

### 1.1 Color Tokens & Theming
The system operates on an "Obsidian Dark" default mode with an adaptive "Paper Light" secondary mode.

```
       Dark Theme Palette                         Light Theme Palette
┌───────────────────────────────┐           ┌───────────────────────────────┐
│ Base Background:   #09090b    │           │ Base Background:   #fafafa    │
│ Card Surface:      #18181b/65 │           │ Card Surface:      #ffffff/80 │
│ Active Border:     #8b5cf6    │           │ Active Border:     #7c3aed    │
│ Success Accent:    #10b981    │           │ Success Accent:    #059669    │
│ Primary Text:      #fafafa    │           │ Primary Text:      #18181b    │
│ Secondary Text:    #d4d4d8    │           │ Secondary Text:    #52525b    │
└───────────────────────────────┘           └───────────────────────────────┘
```

*   **Primary Brand Color:** Cyber Violet (`#8b5cf6` | `violet-500` / light: `#7c3aed` | `violet-600`).
*   **Secondary Brand Color:** Indigo Glow (`#6366f1` | `indigo-500` / light: `#4f46e5` | `indigo-600`).
*   **Success Indicator:** Electric Emerald (`#10b981` | `emerald-500` / light: `#059669` | `emerald-600`).
*   **Warning Indicator:** Amber Aura (`#f59e0b` | `amber-500` / light: `#d97706` | `amber-600`).
*   **Destructive Accent:** Crimson Pulse (`#ef4444` | `red-500` / light: `#dc2626` | `red-600`).
*   **Ledger/Muted Grays:**
    *   Dark: Slate-700 (`#3f3f46`), Slate-800 (`#27272a`), Obsidian-950 (`#09090b`).
    *   Light: Platinum (`#e4e4e7`), Zinc-200 (`#e4e4e7`), Off-White (`#f4f4f5`).

### 1.2 Typography Hierarchy
*   **Brand Font Family:** *Outfit* (Geometric Sans-Serif) for headings, landing page titles, and interface metrics.
*   **Reading Font Family:** *Inter* (Neo-Grotesque Sans-Serif) for controls, inputs, logs, and workspace navigation.
*   **Proportional Text Font Family:** *Merriweather* (Editorial Serif) option in the PDF Reader pane for heavy reading.
*   **Sizes & Scale (Modular Scale: 1.25):**
    *   `Display 2XL`: 48px / Line Height: 56px (Hero Headings)
    *   `Display XL`: 36px / Line Height: 44px (Page Titles)
    *   `Heading LG`: 24px / Line Height: 32px (Card Titles, Section Headers)
    *   `Body LG`: 16px / Line Height: 24px (Default text, chat dialogues)
    *   `Body MD`: 14px / Line Height: 20px (Metadata grids, input labels, tooltips)
    *   `Caption SM`: 12px / Line Height: 16px (Citations, system details, badge text)

### 1.3 Layout, Borders, & Elevation (Dark Mode Base)
*   **Border Radius Tokens:**
    *   `radius-xs`: 4px (Checkboxes, small indicators)
    *   `radius-sm`: 8px (Inner buttons, pills, badge chips)
    *   `radius-md`: 12px (Interactive controls, popovers, dropdown lists)
    *   `radius-lg`: 16px (Standard cards, modal frames, side panel sheets)
    *   `radius-xl`: 24px (Outer dialog containers, large dashboard grids)
*   **Elevation System (Box Shadows):**
    *   `elevation-flat`: Solid border (`1px solid rgba(63, 63, 70, 0.4)`), no shadow.
    *   `elevation-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)`
    *   `elevation-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)`
    *   `elevation-lg` (Glass Overlay): `0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)`
*   **Animation Durations & Curves:**
    *   `duration-instant`: 80ms (Hover state swaps, checkbox toggles)
    *   `duration-fast`: 150ms (Button scale impacts, badge animations)
    *   `duration-normal`: 250ms (Drawer slides, accordion expansions, view switches)
    *   `duration-slow`: 400ms (Modal transitions, graph layout rearrangements)
    *   *Easing:* Standard Curve (`cubic-bezier(0.4, 0, 0.2, 1)`), Spring Physics for Canvas (`stiffness: 120, damping: 20`).

---

## 2. Navigation Architecture & Global Elements

### 2.1 Navigation Layout Structure
The primary dashboard layout utilizes a persistent collapsible left sidebar combined with a context-dependent header.

```
┌────────────────────────────────────────────────────────┐
│ Global Top Header [Command Palette Ctrl+K]  [Profile]   │
├─────────────────┬──────────────────────────────────────┤
│ Col-Left Nav    │ Workspace / Dashboard Main Area      │
│ ├─ Dashboard    │                                      │
│ ├─ Upload       │                                      │
│ ├─ Graph Map    │                                      │
│ ├─ Analytics    │                                      │
│ └─ Collapse (◀) │                                      │
└─────────────────┴──────────────────────────────────────┘
```

#### Left Navigation Controls
*   **Default State:** Expanded (260px width) showing text labels next to icons.
*   **Collapsed State:** Condensed (68px width) showing icons with clean tooltips displaying titles on hover (`hover-delay: 300ms`).
*   **Navigation Links:** Dashboard, Upload Center, Research Graph, Study Analytics, Personal Notebook, Settings.
*   **Active Indicator:** Cyber Violet vertical pill on the left border of the active icon, with a subtle violet background glow fading right.

### 2.2 Global Command Palette (Ctrl + K)
An omnipresent keyboard-activated HUD allowing users to bypass standard navigation hierarchies.

```
┌────────────────────────────────────────────────────────┐
│  Search anything... [Esc to close]                     │
├────────────────────────────────────────────────────────┤
│  ⚡ Quick Actions                                      │
│  ↳ Search Notes                                        │
│  ↳ Open Mind Map                                       │
│  ↳ Generate Flashcards                                 │
│  ↳ Take Quiz                                           │
│                                                        │
│  📂 Recent Papers                                      │
│  ↳ Attention Is All You Need (Page 4)                  │
│  ↳ Deep Residual Learning for Image Recognition        │
└────────────────────────────────────────────────────────┘
```

*   **Design & Layout:** Centered overlay container (`backdrop-blur-lg` with `rgba(9, 9, 11, 0.8)` background), width 640px, rounded corners (`radius-xl`), suspended 15% from screen top.
*   **Functional List Integration:**
    *   *Search Input:* Top text box with autofocus, custom magnifying glass icon.
    *   *Categories:* Divided into "Quick Actions", "Recent Papers", "Saved Notebook Collections", and "Platform Navigation".
    *   *Interactive Navigation:* Arrow keys select items; `Enter` executes the command; `Esc` closes the overlay.
*   **Action support:**
    *   `/search [query]`: Searches through text inside all uploaded PDF documents.
    *   `/notes [query]`: Search through personal notes in the Research Notebook.
    *   `/quiz [paper_id]`: Instantly initiates a custom quiz on the specified document.

---

## 3. Micro-interactions & Visual Polish

*   **Button Ripple & Hover Glow:** 
    *   All primary action buttons feature an inner absolute-positioned hover state that follows the user's cursor within the button boundaries, creating a subtle dynamic glow.
    *   Clicking triggers a ripple expansion scaling from the click center point.
*   **Skeletons & Shimmer Loading:**
    *   Cards and grids that depend on data updates show skeleton structures styled as soft gray boxes with a left-to-right running gradient wave (`background: linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%)`) cycling every 1.5 seconds.
*   **Toast System:**
    *   Appears in the bottom-right corner.
    *   Supports sliding entry (upward slide of 24px) and exit animations.
    *   Types: Info (violet border), Success (green border), Error (red border), Warning (yellow border).
*   **Context Menus:**
    *   Triggered on right-click over papers, notebooks, or visual nodes.
    *   Animates outward from the cursor using a quick scale-up (`scale: 0.95 -> 1.0`).
*   **Drag & Drop States:**
    *   Dropping a PDF file creates a ripple animation spanning outward across the drag zone.
    *   Hovering files over the drop zone initiates a pulse on the dashed border (`border-dasharray` animations).

---

## 4. Page Specifications & UX Principles

### 4.1 Landing Page (Flagship SaaS Portal)

#### UX Principles
*   **Purpose:** Explain the value proposition, showcase interactive visual capabilities, and convert visitors into registered users.
*   **Primary Action:** "Get Started for Free" CTA button (glowing violet gradient, bounces slightly to invite interactions).
*   **Secondary Action:** "Watch Demo Video" (opens a glassmorphic video dialog).
*   **Expected User Journey:** Read value statement $\rightarrow$ Hover over interactive paper preview $\rightarrow$ Scan features grid $\rightarrow$ Compare pricing models $\rightarrow$ Register.
*   **Error States:** Invalid email address on landing page newsletter input (inline validation, red shake animation).
*   **Loading States:** Features carousel items slide in smoothly with page progression.
*   **Empty States:** N/A.

#### Page Content & Sections
1.  **Hero Section:** 
    *   Bold header: *"Transform Static Research Into Interactive Mind Maps."*
    *   **Live Animated UI Mockup:** A visual mockup of the PaperMind Workspace. It loops through a simulation: a section of text is selected, a floating AI popover simplify command is chosen, and a flowchart branches out dynamically on the right pane.
2.  **Product Showcase (Interactive Demo):**
    *   Users can hover over a sample research document segment. An animated cursor demonstrates highlighting a paragraph, triggering a popover window that generates flashcards in real-time.
3.  **Feature Cards:**
    *   Interactive cards that expand on hover, featuring SVG micro-animations showing a concept graph re-arranging itself, flashcard deck flips, and adaptive progress meters.
4.  **Research Statistics Banner:**
    *   Rotating typography metrics showing: "3x faster paper synthesis", "85% retention improvement", "Over 2M papers mapped".
5.  **Architecture & Security Preview:**
    *   A high-level diagram illustrating the RAG vector search, local client wallet encryption, and AI pipeline isolation.
6.  **Pricing Tier Matrix:**
    *   *Free:* 3 PDFs/month, core RAG tutor access.
    *   *Pro ($12/month):* Unlimited uploads, full visual graph exports, offline file support, customizable API tokens.
    *   *Enterprise:* Custom team collections, central licensing, SSO/SAML auth.
7.  **FAQ Accordion:**
    *   Interactive questions expanding to detail data privacy, file safety, and model selection specifications.
8.  **Footer:** Simple links to terms, contact email, and active social badges.

---

### 4.2 Login / Register Pages

#### UX Principles
*   **Purpose:** Secure, friction-free login and user onboarding.
*   **Primary Action:** "Sign In" or "Create Account" button.
*   **Secondary Action:** "OAuth Login" via Google or GitHub.
*   **Expected User Journey:** Access login $\rightarrow$ Enter credentials (or use single sign-on) $\rightarrow$ Fast redirect to Dashboard.
*   **Error States:** Incorrect credentials trigger an error toast. Form validation errors (e.g. short password) are displayed as inline helper messages.
*   **Loading States:** Form values lock, sign-in button displays a spinner, and fields display a shimmer state.
*   **Empty States:** N/A.

#### Layout
*   **Split Layout (50/50 Screen Divider):**
    *   *Left Side:* Interactive, slow-spinning, force-directed network web of research papers. Users can click and drag nodes to watch relationships stretch with spring physics.
    *   *Right Side:* The authentication form container. Features standard inputs with floating borders that transition to active violet on focus.

---

### 4.3 Dashboard (The Research Command Center)

#### UX Principles
*   **Purpose:** Aggregate user statistics, present the library list, suggest study cards, and serve as the main navigation hub.
*   **Primary Action:** "Upload New Paper" button in the upper-right corner.
*   **Secondary Action:** Click a paper card to enter the workspace.
*   **Expected User Journey:** Check streak metrics $\rightarrow$ Review the current daily goal checklist $\rightarrow$ Select a paper to read or click due flashcards.
*   **Error States:** Database failure to retrieve files displays a retry button.
*   **Loading States:** Dashboard panels display skeleton components on initial page load.
*   **Empty States:** If no papers have been uploaded, the central grid is replaced by an upload illustration and a CTA: "Drag and Drop your first research paper to get started."

#### Dashboard Components
*   **Learning Streak Tracker:**
    *   A prominent header card showing the current daily streak (e.g., "7 Day Streak! 🔥").
    *   Weekly grid showing days completed with custom icon checks.
*   **Weekly Study Goals:**
    *   A card tracking target tasks (e.g., "Read 3 papers this week, 2/3 complete") with a dynamic progress bar.
*   **Study Heatmap:**
    *   A GitHub-style grid visualization mapping user study events over the past year (intensity of color represents hours spent reading or taking quizzes).
*   **Upcoming Flashcards Spaced Notification:**
    *   Alert detailing active cards due for review: "5 cards due from Attention Is All You Need". Clicking this initiates the review arena directly.
*   **Knowledge Growth Chart:**
    *   A curved line graph tracking aggregate correct answers on quizzes over time, mapping progression toward subject mastery.
*   **Achievement Badges Showcase:**
    *   Grid of earned milestones: "Paper Shredder" (first upload), "Deep Thinker" (30-day streak), "RAG Champion" (scored 100% on 5 quizzes).
*   **Weekly Reports:**
    *   A download button to export a study summary report including concepts mastered, duration logs, and notes compiled.

---

### 4.4 Upload Page & Ingestion Pipeline

#### UX Principles
*   **Purpose:** Upload files into the system and monitor parsing status.
*   **Primary Action:** Selecting a PDF file via drag-and-drop or file selector.
*   **Secondary Action:** Cancel upload progress.
*   **Expected User Journey:** Drag PDF onto the active zone $\rightarrow$ Monitor the extraction stages $\rightarrow$ Click "Generate Study Plan" or "Open Research Overview".
*   **Error States:** Invalid file format (e.g., uploading an image or docx) displays a warning alert: "Invalid file type. Only PDF documents are supported."
*   **Loading States:** Progress bars update in real-time as background workers execute extraction tasks.
*   **Empty States:** N/A.

#### Ingestion Stepper & Pipeline
Once a file is dropped, the drop zone scales down into a pipeline panel containing:
1.  **File Ingest Check:** Verifies file integrity, runs checksum check.
2.  **Structural Ingest (PyMuPDF):** Extracts layout details, paragraphs, mathematical equations, and the reference bibliography.
3.  **Vector Processing Engine:** Chunks text and computes semantic embeddings.
4.  **Graph Synthesis Node Mapping:** Links key entities (concepts, methods) to Neo4j.
5.  **Output Preview:** Displays extracted title, first author, publication year, and abstract preview on completion.

#### AI Study Planner Integration
Immediately upon completion, an absolute panel slides into view: **"Your Personalized Study Plan Is Ready!"**

```
┌────────────────────────────────────────────────────────┐
│  AI Study Planner                                      │
│  Target Paper: Attention Is All You Need               │
├────────────────────────────────────────────────────────┤
│  [ ] Today's Goal: Core Concepts (Est: 25 mins)        │
│      ↳ Read Introduction & Section 3 (Self-Attention)  │
│      ↳ Review Generated Flashcards (5 Cards)           │
│      ↳ Pass Section 3 Practice Quiz                    │
│                                                        │
│  [ ] Tomorrow's Goal: Math & Mechanics (Est: 35 mins)  │
│      ↳ Read Section 4 & 5                              │
│      ↳ Interact with Formula Explainer                 │
└────────────────────────────────────────────────────────┘
```

*   **Interactive Checklist:** Users check off goals as they progress.
*   **Estimated Completion Time:** Dynamically calculated based on the user's historical reading rate.
*   **Difficulty Rating:** 1–5 stars depending on the vocabulary complexity and mathematical density of the document.
*   **Progress Tracker:** Visual progress circle filling up as items are checked off.

---

### 4.5 Research Overview Screen (Gateway to Reading)

Before entering the interactive paper workspace, users see the **Research Overview** screen. This dashboard serves as a high-level conceptual summary.

#### UX Principles
*   **Purpose:** Provide context, outline prerequisites, and set expectations before a user commits to a reading session.
*   **Primary Action:** "Start Reading" button (large, cyber-violet, launches the split-pane workspace).
*   **Secondary Action:** "Generate Study Roadmap" or "Generate Audio Summary".
*   **Expected User Journey:** Upload paper $\rightarrow$ Scan metadata indicators $\rightarrow$ Review mathematical and programming prerequisites $\rightarrow$ Click "Start Reading".
*   **Error States:** Missing metadata displays a warning icon next to placeholder text.
*   **Loading States:** Shimmer skeletons render over metadata grids.
*   **Empty States:** N/A.

#### Layout & Details
*   **Metadata Header:** Displays paper title, author list, publication date, research domain (e.g., Machine Learning, Quantum Computing), and paper type (e.g., Empirical Study, Literature Review, Theoretical Paper).
*   **Complexity Breakdown Grid:**
    *   *Reading Difficulty:* 1-5 star visualization.
    *   *Estimated Reading Time:* Displayed in minutes (e.g., "45 mins").
    *   *Mathematical Complexity:* Radar chart illustrating math complexity levels (e.g., Linear Algebra, Calculus, Statistics).
    *   *Programming Knowledge Required:* Required language badges (e.g., Python, C++, CUDA) and code density estimation.
    *   *Visual Complexity:* Indicator of figure, table, and flowchart counts.
*   **Study Plan & Roadmap Card:**
    *   *Prerequisites List:* Concepts the user should understand before reading this paper (e.g., "Must know: Recurrent Neural Networks, Vector Dot Products"). If a user clicks a prerequisite, it expands a popup with a concise AI explanation.
    *   *Expected Learning Outcomes:* Bullet points describing key concepts the user will master (e.g., "Understand how Self-Attention mechanisms work without RNN components").
    *   *Reading Progress Prediction:* Chart forecasting expected reading duration over several days based on user history.

---

### 4.6 Interactive Paper Workspace (The Reading Suite)

The central hub for active reading and note-taking.

#### UX Principles
*   **Purpose:** Render the PDF document, support text selections/actions, and integrate notes and bookmarks.
*   **Primary Action:** Scroll and read PDF; select text to trigger action panels.
*   **Secondary Action:** Collapse/Expand sidebars, toggle notebook collections.
*   **Expected User Journey:** Read page $\rightarrow$ Highlight text $\rightarrow$ Add comment/note $\rightarrow$ Save flashcard $\rightarrow$ Toggle side comparison view.
*   **Error States:** PDF rendering failures trigger a warning toast: "PDF render failed. Please refresh or re-upload the document."
*   **Loading States:** PDF pages lazy-load with shimmer blocks indicating upcoming pages.
*   **Empty States:** Notebook starts blank with a callout: "Click anywhere on the document to write your first note or link a highlight."

#### Central PDF Canvas & Highlight Engine
*   **PDF Viewer:** Interactive PDF rendering. Pages snap into place cleanly as a user scrolls.
*   **Highlight Overlay:** Selecting text displays a floating menu containing buttons:
    *   `Simplify`: Explains complex jargon in simple terms in the AI companion pane.
    *   `Visualize`: Renders an interactive flowchart diagram mapping out dynamic processes.
    *   `Save Flashcard`: Auto-generates a concept question and answer for saving.
    *   `Ask Tutor`: Copies selected text directly to the AI chat input.
*   **Color Highlighting Tool:** Users can choose from five distinct highlight colors (representing different learning scopes: yellow for general, green for methodology, pink for metrics/results, blue for code references, purple for math definitions).

#### Integrated Research Notebook
A side-drawer or split-screen workspace where users can organize notes:
*   **Write Notes:** Text editor with markdown styling shortcuts (`Ctrl + B` for bold, `#` for headers, backticks for code blocks).
*   **Attach Notes to Highlights:** Drag-and-drop links that tie a specific text note to a highlighted coordinate in the PDF. Hovering over a note anchor scrolls the PDF viewer directly to the highlighted coordinate.
*   **Draw Diagrams:** An embedded whiteboard panel allowing hand-drawn sketches (using path brush strokes) that can be saved directly into note cards.
*   **Bookmarks & Collections:** Tab to save specific page markers, categorize them into custom collections, and organize folders by custom study topics.
*   **Search Notes:** Search input querying across all notes, highlights, and annotations.

---

### 4.7 AI Tutor Panel

#### UX Principles
*   **Purpose:** Answer conversational queries in real-time using context-aware RAG search.
*   **Primary Action:** Send chat message query.
*   **Secondary Action:** Toggle strict search modes, clear conversation logs.
*   **Expected User Journey:** Run into a confusing paragraph $\rightarrow$ Ask tutor $\rightarrow$ Click citation chips in response to verify source pages.
*   **Error States:** Backend timeout displays a warning with a "Resend Message" button.
*   **Loading States:** Animated pulsing dots indicate the model is generating a response.
*   **Empty States:** Panel starts with suggested template prompts (e.g., "What datasets were utilized?", "What are the limitations of this method?").

#### Panel Features & Interaction
*   **Citations:** Response bubbles contain inline clickable citation chips. Hovering highlights the page source block in the PDF viewer pane, and clicking scrolls the viewer directly to that source block.
*   **Strict Mode Toggle:** Ensures responses pull *only* from the active PDF document to prevent hallucinations.
*   **General Mode Toggle:** Synthesis option drawing from general scientific literature databases.

---

### 4.8 Split Paper Comparison Workspace

Users can open two research papers side-by-side to review and evaluate differences.

```
┌─────────────────────────────────┬─────────────────────────────────┐
│ Paper A: Attention Is All You   │ Paper B: Reformer: The Efficient│
│ Need                            │ Transformer                     │
├─────────────────────────────────┼─────────────────────────────────┤
│ [PDF Canvas View Left]          │ [PDF Canvas View Right]         │
│                                 │                                 │
├─────────────────────────────────┴─────────────────────────────────┤
│ AI Comparison Dashboard Panel                                     │
│ ├─ Methodology Comparison Matrix                                  │
│ ├─ Dataset Differences & Performance Metrics                      │
│ └─ Conflicting Conclusions Checklist                              │
└───────────────────────────────────────────────────────────────────┘
```

#### UX Principles
*   **Purpose:** Compare methodology, configurations, results, and limitations of two documents side-by-side.
*   **Primary Action:** Toggle comparative matrix cards.
*   **Secondary Action:** Sync scroll states (scrolling left paper scrolls right paper proportionally, if checked).
*   **Expected User Journey:** Load Paper A and Paper B $\rightarrow$ View side-by-side PDFs $\rightarrow$ Analyze the comparative matrix $\rightarrow$ Highlight conflicting conclusions.
*   **Error States:** Attempting to compare incompatible files (e.g., a biology paper and an AI paper) triggers a warning banner: "Topic divergence is high. Comparison metrics may be less accurate."
*   **Loading States:** Generating the matrix displays a skeleton loading table.
*   **Empty States:** N/A.

#### Panel Components
*   **Side-by-Side PDF Views:** Split viewport with independent scrolling and zoom controls.
*   **AI Comparison Matrix:**
    *   *Methodology Comparison:* Side-by-side comparison cards mapping target models, layers, and operational details.
    *   *Dataset Comparison:* Performance tables comparing metrics, accuracy curves, training sizes, and batch details.
    *   *Architectures Comparison:* Auto-draws architecture diagrams for both papers.
    *   *Limitations List:* Bulleted comparison of limitations cited by each paper.
    *   *Conflicting Conclusions:* Lists assumptions made by one paper that contradict the other (e.g., "Paper A states RNNs are obsolete; Paper B argues they are optimal for linear memory constraints").

---

### 4.9 AI Reviewer Screen

This view simulates an academic peer-review process (e.g., NeurIPS, ICLR peer reviews) for the uploaded paper.

#### UX Principles
*   **Purpose:** Evaluate the academic merit, methodology solidity, and novelty of the research document.
*   **Primary Action:** Export review report to Markdown or PDF.
*   **Secondary Action:** Regenerate review with different temperature parameters.
*   **Expected User Journey:** Click "AI Reviewer" tab $\rightarrow$ Read strengths/weaknesses breakdown $\rightarrow$ Review accepted simulation scorecard.
*   **Error States:** Parsing failure on complex scanned PDFs triggers a fallback error banner.
*   **Loading States:** Displays a simulated checklist checking off review criteria (e.g., "Reading bibliography...", "Checking equations...", "Verifying experiment consistency...").
*   **Empty States:** N/A.

#### Page Content
*   **Strengths & Weaknesses:** Organized as collapsible bullet points, with each point citing specific paragraphs or sections in the paper.
*   **Novel Contributions:** List of novel insights, architectures, or datasets introduced by the paper.
*   **Missing Experiments:** Identifies missing experiments or control groups that could improve the paper's findings.
*   **Reviewer Confidence Score:** Rating from 1 (low) to 5 (high) representing the system's confidence in its review.
*   **Acceptance Simulation Gauge:** A radial indicator showing the predicted outcome of a peer review process: `Accept`, `Weak Accept`, or `Reject`.
*   **Improvement Suggestions:** Actionable steps to address weaknesses and improve the paper.

---

### 4.10 Interactive Citation Explorer & Research Timeline

An interactive map replacing standard bibliographies, helping users trace research lineage.

#### UX Principles
*   **Purpose:** Map reference trees visually and explore the historical evolution of scientific concepts.
*   **Primary Action:** Click a citation node to view details or expand its references.
*   **Secondary Action:** Toggle timeline view filters.
*   **Expected User Journey:** Select node $\rightarrow$ View reference explanation popup $\rightarrow$ Follow path link to ancestor papers $\rightarrow$ Map evolution timeline.
*   **Error States:** Database disconnect displays a warning state.
*   **Loading States:** Graph nodes arrange themselves with spring animation effects during rendering.
*   **Empty States:** Displays "No references detected in this section" if a parsing error occurs.

#### Page Components
*   **Citation Tree Visualization:**
    *   Visual representation of the citation hierarchy:
        `Paper (Root) ──> Reference Nodes (Generation 1) ──> Referenced Papers (Generation 2)`
    *   Clicking a citation node displays a panel explaining **why the citation was referenced** (e.g., "Referenced in Section 3.1 to validate baseline accuracy metrics").
*   **Research Timeline:**
    *   A linear timeline charting the publication dates of all referenced papers alongside the current paper.
    *   Highlights the **Evolution of Concepts** (e.g., illustrating how "Recurrent Neural Nets" in 2014 evolved into "Attention Mechanisms" in 2017 and "Sparse Transformers" in 2020).
    *   Identifies **Future Research Opportunities** (areas highlighted in the paper's "Future Work" section plotted as future extensions).

---

### 4.11 Mind Map Screen (Full-Screen Canvas)

#### UX Principles
*   **Purpose:** Provide an intuitive hierarchical breakdown of a single paper's structural contents.
*   **Primary Action:** Double-click a node to jump to its corresponding page inside the PDF viewer.
*   **Secondary Action:** Collapse/Expand sub-branches, adjust layout modes.
*   **Expected User Journey:** Expand methodology node $\rightarrow$ Examine key formula node $\rightarrow$ Click to view corresponding page in the PDF.
*   **Error States:** Render crashes fallback to standard list format.
*   **Loading States:** Canvas nodes load with a fade-in animation.
*   **Empty States:** N/A.

#### Design Specifications
*   Nodes are colored based on their hierarchy. Primary nodes are styled as large glassmorphic cards with rounded corners.
*   Connections use smooth bezier lines with active arrow directions indicating parent-child relationships.
*   Includes a mini-map in the bottom-right corner for navigation assistance when zoomed in.

---

### 4.12 Knowledge Graph Screen (Multi-Paper Network)

#### UX Principles
*   **Purpose:** Visualize structural linkages and concept overlaps across a user's entire library.
*   **Primary Action:** Hover over nodes to highlight relationship clusters.
*   **Secondary Action:** Filter graph nodes by type (Paper, Concept, Author, Dataset).
*   **Expected User Journey:** Filter by "Concept" $\rightarrow$ Identify cross-paper conceptual overlaps $\rightarrow$ Double-click paper node to open its workspace.
*   **Error States:** Search queries with zero matches show a warning state.
*   **Loading States:** Web network updates dynamically with force-directed physics.
*   **Empty States:** If a user only has one paper, displays: "Upload additional papers to visualize connections across your library."

#### Design Specifications
*   Uses a 3D force-directed simulation framework.
*   Supports dynamic search filters: Users can query concepts directly to focus the camera view on specific nodes.

---

### 4.13 Flashcards Study Arena

#### UX Principles
*   **Purpose:** Test concept retention using spaced-repetition (Leitner system) study.
*   **Primary Action:** Click card to flip it over.
*   **Secondary Action:** Select recall difficulty button: `Forgot`, `Knew Partially`, or `Mastered`.
*   **Expected User Journey:** Read question $\rightarrow$ Attempt recall $\rightarrow$ Click card to flip $\rightarrow$ Select recall feedback button.
*   **Error States:** Deck errors display a "Reload Deck" button.
*   **Loading States:** Cards slide in with smooth transition animations.
*   **Empty States:** Displays "No flashcards scheduled for review today!" with a celebration illustration.

#### Design Specifications
*   Card features a glassmorphic container with custom card-back styling.
*   Supports keyboard navigation: Spacebar flips the card, `1` maps to `Forgot`, `2` to `Knew Partially`, and `3` to `Mastered`.

---

### 4.14 Quiz Screen

#### UX Principles
*   **Purpose:** Test paper comprehension using structured, adaptive questions.
*   **Primary Action:** Select answer option.
*   **Secondary Action:** Submit quiz, view answer explanation.
*   **Expected User Journey:** Read question $\rightarrow$ Select option $\rightarrow$ Click submit $\rightarrow$ Read explanation $\rightarrow$ Move to next question $\rightarrow$ Review scorecard.
*   **Error States:** Quiz generation timeout shows a warning toast.
*   **Loading States:** Generates quiz items using a shimmer placeholder.
*   **Empty States:** N/A.

#### Design Specifications
*   Includes a persistent timer in the top-right corner.
*   Features immediate visual feedback (correct answers outline in green, incorrect answers in red).
*   The final review page offers a detailed scorecard with concept accuracy charts and recommended reading links.

---

### 4.15 Analytics Dashboard

#### UX Principles
*   **Purpose:** Track study habits, concept mastery, and learning progression over time.
*   **Primary Action:** Toggle chart date ranges (Week, Month, Year).
*   **Secondary Action:** Export study log history.
*   **Expected User Journey:** Analyze study metrics $\rightarrow$ Review weak concepts on the radar chart $\rightarrow$ Plan study focus for the week.
*   **Error States:** Database errors display a warning state on metrics charts.
*   **Loading States:** Charts render loading skeletons before displaying metrics.
*   **Empty States:** New users see blank charts with tooltip prompts ("Complete a quiz to populate analytics").

#### Design Specifications
*   Charts use clean vector elements with responsive tooltips on hover.
*   Data points fade in sequentially on load.

---

### 4.16 Profile & Settings Screen

#### UX Principles
*   **Purpose:** Manage account preferences, API credentials, and integration settings.
*   **Primary Action:** "Save Changes" button.
*   **Secondary Action:** Export Anki deck or markdown library.
*   **Expected User Journey:** Enter personal API tokens $\rightarrow$ Set default export preferences $\rightarrow$ Save.
*   **Error States:** Invalid API token validation errors display a warning.
*   **Loading States:** Displays save confirmation animations.
*   **Empty States:** N/A.

#### Design Specifications
*   Form layouts use structured field inputs with floating focus borders.
*   Includes quick links to privacy documentation and security settings.

---

## 5. Advanced AI Features

PaperMind AI includes a suite of advanced AI capabilities designed to streamline academic workflows.

### 5.1 AI Reading Assistant
*   An LLM agent that runs in the background as you read, suggesting related sections in the paper, defining complex terms, and proposing critical questions to help you synthesize the material.

### 5.2 Research Roadmap
*   Generates a structured reading path for complex topics, suggesting prerequisite papers, ordering chapters, and outlining core concepts to learn first.

### 5.3 Concept Explorer
*   Allows users to double-click any concept in a paper (e.g., "Transformer Models") to open a visualization showing its history, alternative names, key formulas, and primary authors.

### 5.4 Novelty Detector
*   Analyzes the paper to determine if its claims are truly novel, comparing it against similar papers in the database to highlight similarities and differences in methodology.

### 5.5 Research Gap Detector
*   Identifies unanswered questions, missing datasets, or unexplored hypotheses mentioned in the paper, suggesting future research opportunities.

### 5.6 Paper Recommendation Engine
*   Suggests papers based on reading history, using semantic vector similarity search over Qdrant to find relevant documents.

### 5.7 Automatic PPT Generator
*   Exports research papers as structured presentation slides, summarizing the abstract, methodology, results, and limitations in a clean format.

### 5.8 One-Click Research Summary
*   Generates a concise research brief (1-page overview) including core contributions, key figures, and critical limitations.

### 5.9 Interactive Formula Explainer
*   Hovering over mathematical equations displays an interactive popover detailing the definition of each variable and explaining the equation's purpose step-by-step.

### 5.10 Voice Tutor (Future Roadmap)
*   An audio interface allowing users to converse with the AI Tutor using natural voice commands, featuring realistic voice generation for study sessions.

---

## 6. Accessibility & Responsive Design

### 6.1 Accessibility Standards (WCAG 2.1 AA Compliance)
*   **Keyboard Navigation:** All actions (dropdown menus, tabs, card selectors, workspace panels) are fully keyboard-navigable.
    *   `Tab` navigates sequentially through interactive components.
    *   `Focus states` are styled with a dual-ring glow (inner white, outer cyber-violet).
*   **Screen Reader Support:** Complete ARIA labeling across all elements. Interactive elements use dynamic `aria-expanded` and `aria-selected` attributes.
*   **High Contrast & Accessibility Modes:**
    *   *High Contrast Mode:* Adjusts base backgrounds to pure black (`#000000`) and borders to solid white (`#ffffff`).
    *   *Reduced Motion Mode:* Disables non-essential transition animations, canvas physics, and 3D spinning models.

### 6.2 Responsive Breakpoints & Multi-Screen Support
*   **Mobile Viewport (up to 640px):**
    *   Left sidebar collapses into a bottom navigation bar.
    *   Workspace defaults to a single-panel layout, toggling between the PDF reader and the chat tutor via a floating button.
*   **Tablet Viewport (641px - 1024px):**
    *   Left sidebar collapses into a narrow icon-only format.
    *   Workspace adapts to a two-panel split (PDF viewer on left, collapsible AI panel on right).
*   **Desktop Viewport (1025px - 1440px):**
    *   Standard three-panel split-pane configuration with collapsible side sheets.
*   **Ultra-Wide Viewport (1441px and above):**
    *   Workspace expands to a four-panel layout, displaying the Left Navigation Outline, Center PDF Viewer, Right AI Tutor, and Research Notebook simultaneously.
