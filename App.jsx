import { useState } from "react";
import { motion } from "framer-motion";
import WalletConnect from "./components/WalletConnect";
import TokenPoolInfo from "./components/TokenPoolInfo";
import BuyToken from "./components/BuyToken";
import Notification from "./components/Notification";
import Roadmap from "./components/Roadmap";
import SocialLinks from "./components/SocialLinks";
import FireAnnouncement from "./components/FireAnnouncement"; // ✅ নতুন FireAnnouncement import

export default function App() {
  const [account, setAccount] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleNotification = (notif) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4 py-10 flex flex-col items-center relative overflow-x-hidden">

      {/* ✨ Floating Background Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-green-500 opacity-20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] bg-lime-500 opacity-20 rounded-full blur-3xl animate-pulse -z-10"></div>

      {/* 🌿 Hero Section */}
      <motion.header
        className="text-center mb-12 max-w-2xl px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400 text-3xl sm:text-5xl md:text-6xl leading-tight drop-shadow-lg">
          🌿 GreenLeaf Presale 🌐
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-300">
          Connect your wallet and purchase GLF tokens now – become a part of the green future!
        </p>
      </motion.header>

      {/* 📦 Main Cards Section */}
      <main className="w-full max-w-4xl space-y-8">
        <motion.section
          className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-5 sm:p-8 transition duration-300 hover:shadow-2xl"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WalletConnect onConnected={setAccount} />
        </motion.section>

        {/* 🔥 Presale Announcement */}
        <FireAnnouncement /> {/* ✅ Fire animation component */}

        <motion.section
          className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-5 sm:p-8 transition duration-300 hover:shadow-2xl"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TokenPoolInfo />
        </motion.section>

        <motion.section
          className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-10 transition duration-300 hover:shadow-2xl"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BuyToken account={account} setNotification={handleNotification} />
        </motion.section>
      </main>

      {/* 🗺️ Roadmap Section */}
      <motion.div
        className="w-full max-w-4xl mt-16 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Roadmap />
      </motion.div>

      {/* 🔗 Social Links */}
      <motion.div
        className="w-full max-w-4xl mt-10 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <SocialLinks />
      </motion.div>

      {/* 🔔 Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50">
          <Notification type={notification.type} message={notification.message} />
        </div>
      )}
    </div>
  );
}