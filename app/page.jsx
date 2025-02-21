"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [followingFile, setFollowingFile] = useState(null);
  const [followersFile, setFollowersFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const modalRef = useRef(null);
  const videoModalRef = useRef(null);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
      if (videoModalRef.current && !videoModalRef.current.contains(event.target)) {
        setShowVideoModal(false);
      }
    };

    if (showModal || showVideoModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal, showVideoModal]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'following' && file.name !== 'following.json') {
      alert('Please upload the correct file: following.json');
      return;
    } else if (type === 'followers' && file.name !== 'followers_1.json') {
      alert('Please upload the correct file: followers_1.json');
      return;
    }

    type === 'following' ? setFollowingFile(file) : setFollowersFile(file);
  };

  const handleSubmit = async () => {
    if (!followingFile || !followersFile) {
      alert('Please select both files before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    // Helper to read file content as text
    const readFileAsText = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

    try {
      const [followingText, followersText] = await Promise.all([
        readFileAsText(followingFile),
        readFileAsText(followersFile)
      ]);

      // Parse the JSON content
      const followingData = JSON.parse(followingText);
      const followersData = JSON.parse(followersText);

      // Send data to the server endpoint
      const response = await fetch("https://unfollowers-server.vercel.app/unique_hrefs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ json1: followingData, json2: followersData })
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();
      setOutput(result);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError("An error occurred while processing the files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Title */}
      <motion.h1
        className="text-6xl font-extrabold text-gray-900 mb-8 text-center drop-shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Unfollowers Checker
      </motion.h1>

      {/* How To Section - Changed to explanation card with button */}
      <motion.div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-gray-300 p-6 mb-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Getting Started
        </h2>
        <div className="text-lg text-gray-700 mb-6 px-4">
          <p className="mb-3">This tool helps you find accounts you follow on Instagram that don't follow you back. To use it, you'll need to download your following and followers data from Instagram.</p>
          <p className="mb-3">The files needed are <span className="font-semibold text-blue-600">following.json</span> and <span className="font-semibold text-blue-600">followers_1.json</span> from your Instagram data download.</p>
          <p>Once you have these files, upload them below and click submit to see who doesn't follow you back.</p>
        </div>
        <div className="flex justify-center">
          <motion.button
            onClick={() => setShowVideoModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition shadow-lg font-semibold flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Get JSON Files
          </motion.button>
        </div>
      </motion.div>

      {/* File Inputs */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {/* Upload for following.json */}
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border-2 border-gray-300 hover:border-blue-300 transition-all relative"
          whileHover={{ scale: 1.03 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="text-2xl font-semibold mb-4">
            Upload <span className="text-blue-500">following.json</span>
          </p>
          <label
            htmlFor="following"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-300 transition"
          >
            Choose File
          </label>
          <input
            id="following"
            type="file"
            accept=".json"
            onChange={(e) => handleFileChange(e, 'following')}
            className="hidden"
          />
          {followingFile && (
            <motion.p
              className="mt-4 text-green-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              File selected: {followingFile.name}
            </motion.p>
          )}
        </motion.div>

        {/* Upload for followers_1.json */}
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border-2 border-gray-300 hover:border-blue-300 transition-all relative"
          whileHover={{ scale: 1.03 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="text-2xl font-semibold mb-4">
            Upload <span className="text-blue-500">followers_1.json</span>
          </p>
          <label
            htmlFor="followers"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-300 transition"
          >
            Choose File
          </label>
          <input
            id="followers"
            type="file"
            accept=".json"
            onChange={(e) => handleFileChange(e, 'followers')}
            className="hidden"
          />
          {followersFile && (
            <motion.p
              className="mt-4 text-green-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              File selected: {followersFile.name}
            </motion.p>
          )}
        </motion.div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-8 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-400 transition shadow-lg font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : "Submit"}
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={videoModalRef}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {/* Video Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">How to Get Instagram JSON Files</h2>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Video Content */}
              <div className="p-6">
                <div className="relative rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/HYEnDw1mbKo?si=ciL-XbQFAvERIPUN"
                    title="How to Use Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Quick Steps:</h3>
                  <ol className="list-decimal pl-5 text-gray-700 space-y-2">
                    <li>Go to Instagram Settings → Privacy and Security → Data Download</li>
                    <li>Request data download in JSON format</li>
                    <li>Wait untill its downloaded (the time it takes range between couple of minutes to hours)</li>
                    <li>Download and extract the ZIP file</li>
                    <li>Find <span className="font-mono text-blue-600">following.json</span> and <span className="font-mono text-blue-600">followers_1.json</span> files</li>
                  </ol>
                </div>
              </div>
              
              {/* Video Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition shadow-sm text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {showModal && output && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Results Found: {output.count}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="mb-4 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <p className="text-gray-700 text-lg">
                    Found <span className="font-bold text-purple-600">{output.count}</span> unique references
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {output.unique_hrefs.map((href, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.02, backgroundColor: "#f3f4ff" }}
                    >
                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p className="text-gray-800 font-medium break-all">{href}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between">
                <p className="text-sm text-gray-500">Results retrieved at: {new Date().toLocaleTimeString()}</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition shadow-sm text-sm font-medium"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}