// Maps Clerk's default component styling onto the LearnPath AI tokens so
// the embedded auth forms feel native to the paper-side panel rather than
// like a stock widget.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#d68d22",
    colorText: "#2a2b26",
    colorTextSecondary: "#6b6a60",
    colorBackground: "#f3f1e9",
    colorInputBackground: "#ffffff",
    colorInputText: "#2a2b26",
    borderRadius: "0.375rem",
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  },
  elements: {
    card: "shadow-none bg-transparent p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "border border-[var(--paper-line)]",
    formButtonPrimary: "bg-[var(--waypoint-strong)] hover:bg-[var(--waypoint)] text-[#1c1a12] normal-case shadow-none",
    footerActionLink: "text-[var(--waypoint-strong)]",
    formFieldInput: "border-[var(--paper-line)]",
    dividerLine: "bg-[var(--paper-line)]",
    dividerText: "text-[var(--text-paper-muted)]",
  },
};
