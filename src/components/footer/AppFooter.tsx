"use client";

import FooterMenu from "./FooterMenu";
import FooterSearch from "./FooterSearch";
import FooterActions from "./FooterActions";

const AppFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-12 border-t border-gray-200 bg-white">
      <div className="flex h-full items-center">
        {/* Left Menu */}
        <FooterMenu />

        {/* Search */}
        <div className="flex-1 border-l border-r border-gray-200">
          <FooterSearch />
        </div>

        {/* Right Actions */}
        <FooterActions />
      </div>
    </footer>
  );
};

export default AppFooter;