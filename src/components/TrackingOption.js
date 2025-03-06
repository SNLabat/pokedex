import React from 'react';
import Image from 'next/image';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const TrackingOption = ({ label, isActive, onClick, color = "green", icon = null, description = null }) => {
  const colorClasses = {
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-black",
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    purple: "bg-purple-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md flex items-center justify-between w-full transition-all ${
        isActive ? colorClasses[color] : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {icon && (
          <div className="w-4 h-4 flex items-center justify-center">
            <Image
              src={icon}
              alt={`${label} mark`}
              width={12}
              height={12}
              className="object-contain"
            />
          </div>
        )}
        {description && (
          <span className="text-xs opacity-75">({description})</span>
        )}
      </div>
      {isActive && <CheckIcon />}
    </button>
  );
};

export default TrackingOption; 