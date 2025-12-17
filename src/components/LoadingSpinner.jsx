import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-3',
        lg: 'h-16 w-16 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
            <div className={`animate-spin rounded-full border-b-blue-600 border-t-transparent ${sizeClasses[size]}`}></div>
            {text && (
                <p className="text-gray-600 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
