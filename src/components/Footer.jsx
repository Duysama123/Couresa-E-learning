import { Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand & Social */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div >
                                <img src="https://images.ctfassets.net/00atxywtfxvd/2QeS5ysKMhZ3ZjiU2rGRJA/e15df94b265053ce8ded4f5e630241c8/cropped-android-chrome-512x512-1.png" alt="Couresa" className="w-10" />
                            </div>
                            <span className="text-blue-600 font-bold text-xl tracking-tight">Couresa</span>
                        </Link>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                                <Youtube size={20} />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Couresa</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><a href="#" className="hover:underline">About</a></li>
                            <li><a href="#" className="hover:underline">What We Offer</a></li>
                            <li><a href="#" className="hover:underline">Leadership</a></li>
                            <li><a href="#" className="hover:underline">Careers</a></li>
                            <li><a href="#" className="hover:underline">Catalog</a></li>
                            <li><a href="#" className="hover:underline">Degrees</a></li>
                            <li><a href="#" className="hover:underline">Certificates</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Communication</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><a href="#" className="hover:underline">Learners</a></li>
                            <li><a href="#" className="hover:underline">Partners</a></li>
                            <li><a href="#" className="hover:underline">Blog</a></li>
                            <li><a href="#" className="hover:underline">Couresa Podcast</a></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><a href="#" className="hover:underline">Blog</a></li>
                            <li><a href="#" className="hover:underline">Best practices</a></li>
                            <li><a href="#" className="hover:underline">Colors</a></li>
                            <li><a href="#" className="hover:underline">Color wheel</a></li>
                            <li><a href="#" className="hover:underline">Support</a></li>
                            <li><a href="#" className="hover:underline">Developers</a></li>
                            <li><a href="#" className="hover:underline">Resource library</a></li>
                        </ul>
                    </div>

                    {/* Mobile App */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Mobile App</h3>
                        <div className="space-y-3">
                            <a href="#" className="block w-40">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Get it on Google Play"
                                    className="w-full"
                                />
                            </a>
                            <a href="#" className="block w-40">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="Download on the App Store"
                                    className="w-full"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© 2025 Couresa Inc. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-900">Privacy</a>
                        <a href="#" className="hover:text-gray-900">Terms</a>
                        <a href="#" className="hover:text-gray-900">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
