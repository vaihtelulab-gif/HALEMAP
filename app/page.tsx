export default function RootPage() {
  // Redirect is handled in `middleware.ts`:
  // - signed-in: "/" -> "/home"
  // - signed-out: "/" -> "/about"
  return null;
}
