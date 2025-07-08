import React from 'react';

const SkeletonItem = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-300 dark:bg-gray-700 rounded animate-pulse ${className}`} />
);

export const SkeletonCard = ({ showImage = false, lines = 3 }) => (
  <div className="card-ios animate-pulse">
    {showImage && (
      <SkeletonItem className="mb-4" width="w-full" height="h-32" />
    )}
    
    <div className="space-y-2">
      <SkeletonItem width="w-3/4" height="h-5" />
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <SkeletonItem 
          key={index} 
          width={index === lines - 2 ? "w-1/2" : "w-full"} 
          height="h-4" 
        />
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 5, showImage = false }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonCard key={index} showImage={showImage} />
    ))}
  </div>
);

export const SkeletonButton = ({ width = 'w-full' }) => (
  <SkeletonItem className={`${width} h-12 rounded-ios`} />
);

export const SkeletonAvatar = ({ size = 'w-12 h-12' }) => (
  <div className={`${size} bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse`} />
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonItem 
            key={colIndex} 
            className="flex-1" 
            height="h-8"
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonItem 
        key={index}
        width={index === lines - 1 ? "w-2/3" : "w-full"}
        height="h-4"
      />
    ))}
  </div>
);

export default SkeletonCard; 