import { memo } from "react";

const Footer = ({ text }) => {
  return (
    <footer className="bg-gradient-to-r from-orange-800 to-green-800 text-white py-3 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">{text}</p>
      </div>
    </footer>
  );
};

export default memo(Footer);