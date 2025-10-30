const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
    return (
      <footer className="bg-gray-900 text-gray-300 text-center py-6 mt-10">
        <p suppressHydrationWarning>© {CURRENT_YEAR} Gadgets Mela. All rights reserved.</p>
      </footer>
    );
  }
  