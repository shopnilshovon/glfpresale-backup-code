import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  USDT_TOKEN_ADDRESS,
  PRESALE_CONTRACT_ADDRESS,
  GLF_TOKEN_ADDRESS,
} from "../utils/constants";
import PRESALE_ABI from "../abis/PresaleABI.json";
import GLF_ABI from "../abis/GLFTokenABI.json";
import { motion } from "framer-motion";

export default function BuyToken({ account, setNotification }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [glfBalance, setGlfBalance] = useState("0");

  const GLF_PRICE = 0.10;

  const fetchBalances = async () => {
    if (!account || !window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const usdt = new ethers.Contract(
      USDT_TOKEN_ADDRESS,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );

    const glf = new ethers.Contract(
      GLF_TOKEN_ADDRESS,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );

    try {
      const [usdtRaw, glfRaw] = await Promise.all([
        usdt.balanceOf(account),
        glf.balanceOf(account),
      ]);

      setUsdtBalance(ethers.utils.formatUnits(usdtRaw, 6));
      setGlfBalance(ethers.utils.formatUnits(glfRaw, 18));
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [account]);

  const estimateGLF = () => {
    const usdtValue = parseFloat(amount || "0");
    return usdtValue && GLF_PRICE
      ? (usdtValue / GLF_PRICE).toFixed(2)
      : "0.00";
  };

  const setMaxAmount = () => setAmount(usdtBalance);

  const buy = async () => {
    if (!account) {
      setNotification({ type: "error", message: "Wallet not connected" });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const usdt = new ethers.Contract(
        USDT_TOKEN_ADDRESS,
        [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)",
        ],
        signer
      );

      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer);
      const usdtAmount = ethers.utils.parseUnits(amount, 6);

      const allowance = await usdt.allowance(account, PRESALE_CONTRACT_ADDRESS);

      if (allowance.lt(usdtAmount)) {
        setStatus("approve");
        const approveTx = await usdt.approve(PRESALE_CONTRACT_ADDRESS, usdtAmount);
        await approveTx.wait();
      }

      setStatus("confirming");
      const buyTx = await presale.buyTokens(usdtAmount);
      await buyTx.wait();

      setNotification({ type: "success", message: "✅ Token purchase successful!" });
      setAmount("");
      fetchBalances();
    } catch (error) {
      console.error("Buy failed:", error);
      setNotification({
        type: "error",
        message: "❌ " + (error?.data?.message || error.message),
      });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <motion.div
      className="w-full px-4 sm:px-6 mt-10 flex justify-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-md sm:max-w-2xl bg-[#1c1e2b] border border-green-600/20 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-md text-white"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-green-300">
          🚀 Buy GLF Tokens
        </h2>

        {/* 💼 Balance Box */}
        <motion.div
          className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gradient-to-r from-green-800/60 to-green-600/40 rounded-xl p-5 shadow-lg border border-green-400/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-300">🎯 Your USDT Balance</p>
            <p className="text-2xl font-bold text-white">
              {parseFloat(usdtBalance).toFixed(2)} USDT
            </p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-300">🌿 Your GLF Balance</p>
            <p className="text-2xl font-bold text-green-400">
              {parseFloat(glfBalance).toFixed(2)} GLF
            </p>
          </div>
        </motion.div>

        {/* 🎯 Presale Price */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-base sm:text-lg text-white font-medium mb-1">
            🔔 <span className="text-green-300">Presale Price</span>
          </p>
          <p className="text-2xl sm:text-3xl font-bold">
            <span className="text-green-400">1 GLF</span>
            <span className="text-white"> = 0.10$ USDT</span>
          </p>
        </motion.div>

        {/* 💸 Input Field (fixed version) */}
        <div className="mb-4">
          <label className="block text-sm sm:text-base text-gray-300 mb-2">
            USDT Amount
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              placeholder="Enter USDT Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 text-white text-base sm:text-lg placeholder-gray-400 border border-gray-700 rounded-lg py-3 px-4 pr-20 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={setMaxAmount}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium"
            >
              MAX
            </button>
          </div>
          {/* 💲USDT amount below input */}
          <div className="mt-2 text-right text-sm sm:text-base text-gray-300">
            ~ ${parseFloat(amount || 0).toFixed(2)}
          </div>
        </div>

        {/* 📈 Estimated GLF */}
        <div className="mb-6 text-base text-gray-300">
          Estimated GLF:{" "}
          <span className="text-yellow-400 font-semibold">{estimateGLF()}</span>
        </div>

        {/* ⏳ Status */}
        {loading && (
          <div className="mb-4 text-base text-blue-400 flex items-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
            {status === "approve" && "Approving USDT..."}
            {status === "confirming" && "Confirming purchase..."}
          </div>
        )}

        {/* ✅ Buy Button */}
        <motion.button
          onClick={buy}
          disabled={loading || !amount}
          className={`w-full py-4 rounded-xl font-semibold text-lg shadow-xl transition-all ${
            loading || !amount
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Processing..." : "Buy Now"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}