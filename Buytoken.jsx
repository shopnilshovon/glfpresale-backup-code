import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { USDT_TOKEN_ADDRESS, PRESALE_CONTRACT_ADDRESS } from "../utils/constants";
import ABI from "../abis/PresaleABI.json";
import { motion } from "framer-motion";

export default function BuyToken({ account, setNotification }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [usdtBalance, setUsdtBalance] = useState("0");

  const GLF_PRICE = 0.10;

  const fetchBalances = async () => {
    if (!account || !window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const usdt = new ethers.Contract(
      USDT_TOKEN_ADDRESS,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );

    const usdtBal = await usdt.balanceOf(account);
    setUsdtBalance(ethers.utils.formatUnits(usdtBal, 6));
  };

  useEffect(() => {
    fetchBalances();
  }, [account]);

  const estimateTokens = () => {
    const usdtValue = parseFloat(amount || "0");
    if (usdtValue && GLF_PRICE) return (usdtValue / GLF_PRICE).toFixed(2);
    return "0.00";
  };

  const setMaxAmount = () => {
    setAmount(usdtBalance);
  };

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
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) public view returns (uint256)"
        ],
        signer
      );

      const presale = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, ABI, signer);
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
      await fetchBalances();
    } catch (error) {
      console.error("Purchase failed:", error);
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
        <h2 className="text-xl sm:text-3xl font-bold mb-6 text-center text-green-300 drop-shadow">
          🚀 Buy GLF Tokens
        </h2>

        {/* USDT Balance */}
        <div className="mb-5">
          <p className="text-sm sm:text-base text-gray-300">🎯 Your USDT Balance</p>
          <p className="text-xl sm:text-2xl font-bold text-green-400">{usdtBalance} USDT</p>
        </div>

        {/* Presale Price */}
        <div className="mb-5">
          <p className="text-sm sm:text-base text-white font-semibold">
            🔔 <span className="text-green-300">Presale Price</span>
          </p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-400">1 GLF = 0.10$ USDT</p>
        </div>

        {/* Input with Max Button */}
        <div className="mb-6 relative">
          <input
            type="number"
            min="0"
            placeholder="Enter USDT Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 pr-24 rounded-lg bg-gray-800 text-white text-lg sm:text-xl placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <button
            onClick={setMaxAmount}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm sm:text-base font-medium shadow"
          >
            MAX
          </button>
        </div>

        {/* Estimated Tokens */}
        <div className="mb-6 text-base sm:text-lg text-gray-300">
          Estimated GLF:{" "}
          <span className="text-yellow-400 font-semibold">{estimateTokens()}</span>
        </div>

        {/* Loading Status */}
        {loading && (
          <div className="mb-4 text-base text-blue-400 flex items-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
            {status === "approve" && "Approving USDT..."}
            {status === "confirming" && "Confirming purchase..."}
          </div>
        )}

        {/* Buy Button */}
        <motion.button
          onClick={buy}
          disabled={loading || !amount}
          className={`w-full py-4 rounded-xl transition-all duration-300 font-semibold text-lg shadow-xl ${
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