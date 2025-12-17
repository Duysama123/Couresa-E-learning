import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoadingDemo = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Loading Spinner Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Small Spinner */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Small (sm)</h2>
                    <LoadingSpinner size="sm" text="Loading..." />
                </div>

                {/* Medium Spinner */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Medium (md) - Default</h2>
                    <LoadingSpinner />
                </div>

                {/* Large Spinner */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Large (lg)</h2>
                    <LoadingSpinner size="lg" text="Please wait..." />
                </div>

                {/* No Text */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">No Text</h2>
                    <LoadingSpinner text="" />
                </div>

                {/* Custom Text */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Custom Text</h2>
                    <LoadingSpinner text="Fetching courses..." />
                </div>

                {/* In Context */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">In Real Context</h2>
                    <div className="border border-gray-200 rounded p-4">
                        <LoadingSpinner size="sm" text="Loading course details..." />
                    </div>
                </div>
            </div>

            {/* Usage Example */}
            <div className="mt-12 bg-blue-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">💡 Usage Example</h2>
                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                    {`import LoadingSpinner from '../components/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// Custom size
<LoadingSpinner size="lg" text="Loading courses..." />

// No text
<LoadingSpinner text="" />

// In conditional rendering
{isLoading ? <LoadingSpinner /> : <Content />}`}
                </pre>
            </div>
        </div>
    );
};

export default LoadingDemo;
