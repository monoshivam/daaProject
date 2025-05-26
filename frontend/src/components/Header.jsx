import { memo } from "react";

const Header = ({ title }) => {
  return (
    <header className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
    </header>
  );
};

export default memo(Header);