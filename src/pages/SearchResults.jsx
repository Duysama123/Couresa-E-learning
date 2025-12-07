import React, { useMemo } from 'react';
import Header from '../components/Header';
import { useSearchParams, Link } from 'react-router-dom';
import { COURSES } from '../data/courses';
import { Star, Clock, BarChart, BookOpen, Search } from 'lucide-react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Filter courses based on search query
    const filteredCourses = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return COURSES.filter(course =>
            course.title.toLowerCase().includes(lowerQuery) ||
            course.instructor.toLowerCase().includes(lowerQuery) ||
            course.category.toLowerCase().includes(lowerQuery)
        );
    }, [query]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {query ? `Results for "${query}"` : 'Search Courses'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {filteredCourses.length} {filteredCourses.length === 1 ? 'result' : 'results'} found
                    </p>
                </div>

                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map(course => (
                            <Link to={`/course/${course.id}`} key={course.id} className="block group h-full">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-1">
                                            <img src={course.logo} alt="Logo" className="w-4 h-4" /> {course.instructor}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">{course.category}</div>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                {course.rating} <Star size={10} className="fill-current" />
                                            </span>
                                            <span className="text-xs text-gray-500">({course.reviews})</span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <BarChart size={14} />
                                                <span>{course.level}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>{course.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Search size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No courses found</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We couldn't find any courses matching "{query}". Try adjusting your search terms or browse our popular categories.
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                Browse Catalog
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
