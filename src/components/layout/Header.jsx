// import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

// const Header = () => {
//     return (
//         <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#161B22]">
//             <div className="text-sm text-gray-400">
//                 <span>FinanceAI</span>
//                 <span className="mx-2">/</span>
//                 <span className="text-white">Dashboard</span>
//             </div>
//             <div className="flex items-center gap-4">
//                 <div className="relative">
//                     <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Ask AI anything about finance..."
//                         className="bg-[#0D1117] border border-gray-700 rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <span className="relative flex h-2 w-2">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                         <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                     </span>
//                     <span className="text-sm text-green-400 font-medium">Markets Open</span>
//                 </div>
//             </div>
//         </header>
//     );
// }

// export default Header;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Navigate to the AI assistant page with the query as a URL parameter
            navigate(`/ai-assistant?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#161B22]">
            <div className="text-sm text-gray-400">
                {/* This part can be dynamic in a full app, but is static for now */}
                <span>FinanceAI</span>
                <span className="mx-2">/</span>
                <span className="text-white">Dashboard</span>
            </div>
            <div className="flex items-center gap-6"> {/* Increased gap for more space */}

                {/* --- FUNCTIONAL SEARCH SECTION --- */}
                <div className="flex items-center">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask the AI anything..."
                            className="bg-[#0D1117] border border-gray-700 rounded-l-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-r-md text-sm border border-blue-600 -ml-px"
                    >
                        Search
                    </button>
                </div>
                {/* --- END SEARCH SECTION --- */}

                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-green-400 font-medium">Markets Open</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
