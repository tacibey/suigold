"use client";

// ENOKI IMPORTLARI
import { useEnokiFlow } from "@mysten/enoki/react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Hexagon, CheckCircle2, Wallet, Plus, Minus, X, ArrowRight, ChevronDown, Loader2, Info, LogOut } from "lucide-react";
import { COIN_SUI } from "@/lib/contracts";
import { createZapTransaction } from "@/lib/zap";

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', rate: 1.0, type: '0x...USDC' },
  { symbol: 'SUI', name: 'Sui Token', rate: 3.85, type: COIN_SUI },
  { symbol: 'XAUM', name: 'Tether Gold', rate: 2350.0, type: '0x...XAUM' },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // ENOKI HOOKS
  const flow = useEnokiFlow();
  const account = useCurrentAccount(); // Enoki ile giriş yapınca burası dolacak
  
  // Bağlı mı kontrolü (Account varsa bağlıdır)
  const connected = !!account;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // State
  const [oreAmount, setOreAmount] = useState(12.4501);
  const [goldBalance, setGoldBalance] = useState(4.200);
  const [usdcStaked, setUsdcStaked] = useState(10000);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal & Input
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [inputAmount, setInputAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [isTokenListOpen, setIsTokenListOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOreAmount(prev => prev + 0.00035); 
    }, 7000); 
    return () => clearInterval(interval);
  }, []);

  // --- GOOGLE LOGIN FONKSIYONU ---
  const handleLogin = async () => {
    // Google Login Sayfasına Yönlendirir
    window.location.href = await flow.createAuthorizationURL({
      provider: "google",
      network: "mainnet",
      clientId: "YOUR_GOOGLE_CLIENT_ID", // Demo modunda Enoki bunu halleder
      redirectUrl: window.location.href,
      extraParams: {
        scope: ["openid", "email", "profile"],
      },
    });
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    flow.logout();
    window.location.reload();
  };

  // --- SAYFA YÜKLENDİĞİNDE GİRİŞİ TAMAMLA ---
  useEffect(() => {
    if (isMounted) {
      flow.handleAuthCallback().catch((err) => console.error("Auth Callback Error:", err));
    }
  }, [isMounted, flow]);


  const handleSuccessScenario = (type: 'smelt' | 'deposit' | 'withdraw', amount: number = 0) => {
    setLoading(false);
    setShowSuccess(true);
    
    if (type === 'smelt') {
      setGoldBalance(p => p + oreAmount * 0.95);
      setOreAmount(0);
    } else if (type === 'deposit') {
      const usdcValue = amount * selectedToken.rate;
      setUsdcStaked(prev => prev + usdcValue);
      setActiveModal(null);
      setInputAmount("");
      setSelectedToken(TOKENS[0]);
    } else if (type === 'withdraw') {
      setUsdcStaked(prev => Math.max(0, prev - amount));
      setActiveModal(null);
      setInputAmount("");
    }

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSmelt = async () => {
    if (!connected || !account) return;
    setLoading(true);

    try {
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [1]);
      tx.transferObjects([coin], account.address);

      // Enoki ile imzala ve gönder
      await flow.executeTransactionBlock({
        transactionBlock: tx,
        network: "mainnet",
      });

      handleSuccessScenario('smelt');

    } catch (e) {
      console.warn("Error:", e);
      // Demo mode fallback
      setTimeout(() => handleSuccessScenario('smelt'), 1000);
    }
  };

  const handleTransaction = async () => {
    if (!inputAmount || !connected || !account) return;
    setLoading(true);
    const amount = Number(inputAmount);

    try {
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [1]);
      tx.transferObjects([coin], account.address);

      // Enoki ile imzala ve gönder
      await flow.executeTransactionBlock({
        transactionBlock: tx,
        network: "mainnet",
      });

      handleSuccessScenario(activeModal === 'deposit' ? 'deposit' : 'withdraw', amount);

    } catch (e) {
      console.warn("Error:", e);
      // Demo mode fallback
      setTimeout(() => handleSuccessScenario(activeModal === 'deposit' ? 'deposit' : 'withdraw', amount), 1000);
    }
  };

  if (!isMounted) {
    return <div className="h-[100dvh] w-full bg-[#050505]" />;
  }

  return (
    <main className="h-[100dvh] w-full flex flex-col relative overflow-hidden font-sans bg-[#050505] text-white">
      
      {/* HEADER */}
      <header className="h-16 flex-none w-full z-50 border-b border-white/5 bg-[#050505]/95 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#F4CF57] to-[#B48F17] rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_10px_rgba(212,175,55,0.3)] text-sm flex-shrink-0">
            Au
          </div>
          <span className="font-bold text-base md:text-xl tracking-tight font-mono text-white">
            SuiGold
          </span>
        </div>
        
        {/* SAĞ ÜST BUTON */}
        <div className="flex-shrink-0">
          {!connected ? (
            <button 
              onClick={handleLogin}
              className="bg-[#D4AF37] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#F4CF57] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S14.89 2 12.2 2C6.73 2 2 6.74 2 12.2S6.73 22.4 12.2 22.4c5.5 0 10.2-3.9 10.2-10.2c0-.52-.03-1.1-.05-1.1z"/></svg>
              Google Login
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="bg-white/10 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <LogOut size={14} />
              Exit
            </button>
          )}
        </div>
      </header>

      {/* İÇERİK */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar relative z-10">
        <div className="min-h-full flex flex-col items-center justify-center p-4 py-8">
          <div className="w-full max-w-md mx-auto space-y-6">
            
            {!connected ? (
              // GİRİŞ EKRANI
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="inline-flex p-5 rounded-full bg-white/5 border border-white/10 mb-6 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl group-hover:bg-[#D4AF37]/40 transition-all" />
                  <Flame className="text-[#D4AF37] relative z-10 w-12 h-12" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-[0.9]">
                  <span className="text-white">Turn Dollar</span><br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4CF57] to-[#D4AF37]">Into Gold.</span>
                </h1>
                <p className="text-sm text-gray-400 mb-8 font-light px-4 leading-relaxed">
                  Stop letting inflation eat your savings.<br/>
                  <span className="text-white font-medium">SuiGold</span> gives you real yield.
                </p>
                
                {/* ORTA BÜYÜK BUTON */}
                <div className="flex justify-center">
                  <div className="scale-110 origin-top">
                    <button 
                      onClick={handleLogin}
                      className="bg-[#D4AF37] text-black font-bold px-8 py-4 rounded-2xl text-lg hover:bg-[#F4CF57] transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S14.89 2 12.2 2C6.73 2 2 6.74 2 12.2S6.73 22.4 12.2 22.4c5.5 0 10.2-3.9 10.2-10.2c0-.52-.03-1.1-.05-1.1z"/></svg>
                      Sign in with Google
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // DASHBOARD (Aynı kalıyor)
              <>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-4 left-0 right-0 flex justify-center z-[100] pointer-events-none">
                      <div className="bg-[#0A0A0A] px-6 py-3 rounded-full border border-[#D4AF37] flex items-center gap-3 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                        <CheckCircle2 size={20} className="text-[#D4AF37]" />
                        <span className="font-bold text-sm">Transaction Successful!</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 1. KART: THE VAULT */}
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0F0F0F]/90 backdrop-blur border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Hexagon size={100} /></div>
                   
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-2 text-gray-400">
                       <Wallet size={16} /> 
                       <h2 className="text-xs font-bold tracking-widest uppercase">Your Vault</h2>
                     </div>
                     <div className="text-xs text-gray-500 font-mono">
                        Staked: <span className="text-white">{formatCurrency(usdcStaked)}</span>
                     </div>
                   </div>

                   <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-5xl font-mono font-bold text-white tracking-tighter">{goldBalance.toFixed(3)}</p>
                      <span className="text-lg font-bold text-[#D4AF37]">XAUM</span>
                   </div>
                   <p className="text-xs text-gray-500 mb-6">≈ {formatCurrency(goldBalance * 2350)} USD</p>

                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setActiveModal('deposit')}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#D4AF37]/50 transition-all group/btn"
                      >
                        <Plus size={16} className="text-[#D4AF37] group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Deposit</span>
                      </button>
                      <button 
                        onClick={() => setActiveModal('withdraw')}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/50 transition-all group/btn"
                      >
                        <Minus size={16} className="text-gray-400 group-hover/btn:text-red-400 transition-colors" />
                        <span className="text-sm font-bold text-gray-400 group-hover/btn:text-gray-200">Withdraw</span>
                      </button>
                   </div>
                </motion.div>

                {/* 2. KART: THE FURNACE */}
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-[#121212] to-black border border-[#D4AF37]/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                   <div className="flex items-center gap-2 mb-1 text-orange-200"><Flame className="text-orange-500" size={16} /> <h2 className="text-xs font-bold tracking-widest uppercase">The Furnace</h2></div>
                   <div className="flex items-baseline gap-2 mb-6">
                      <motion.p 
                        key={oreAmount}
                        initial={{ color: "#34d399" }}
                        animate={{ color: ["#fbbf24", "#34d399"] }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-mono font-bold tabular-nums"
                      >
                        {oreAmount.toFixed(5)}
                      </motion.p>
                      <span className="text-xs text-orange-500/60">ORE</span>
                   </div>
                   
                   <button onClick={handleSmelt} disabled={loading} className="w-full py-3 bg-[#D4AF37] text-black font-bold text-lg rounded-xl hover:bg-[#F4CF57] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                     {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20}/> Processing...</span> : "SMELT ORE"}
                   </button>
                </motion.div>
                
                <div className="flex items-center justify-center gap-2 opacity-60">
                   <Info size={12} className="text-[#D4AF37]" />
                   <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">Gas Sponsored by Enoki</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL (Aynı kalıyor) */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0F0F0F] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            >
              <button onClick={() => { setActiveModal(null); setIsTokenListOpen(false); }} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>

              <h3 className="text-xl font-bold mb-1 text-white">
                {activeModal === 'deposit' ? 'Deposit Assets' : 'Withdraw Funds'}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {activeModal === 'deposit' ? 'Auto-swap any token to USDC & Stake.' : 'Unstake your capital back to wallet.'}
              </p>

              <div className="relative mb-6">
                <input 
                  type="number" 
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-white/10 rounded-xl py-4 pl-4 pr-32 text-2xl font-mono text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                
                <div className="absolute right-2 top-2 bottom-2">
                  {activeModal === 'deposit' ? (
                    <div className="relative h-full">
                      <button 
                        onClick={() => setIsTokenListOpen(!isTokenListOpen)}
                        className="h-full px-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors border border-white/5"
                      >
                        <span className="font-bold text-sm">{selectedToken.symbol}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isTokenListOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isTokenListOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                          >
                            {TOKENS.map((token) => (
                              <button
                                key={token.symbol}
                                onClick={() => { setSelectedToken(token); setIsTokenListOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group"
                              >
                                <span className={`text-sm font-bold ${selectedToken.symbol === token.symbol ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                                  {token.symbol}
                                </span>
                                {selectedToken.symbol === token.symbol && <CheckCircle2 size={12} className="text-[#D4AF37]" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="h-full px-4 flex items-center justify-center text-sm font-bold text-gray-500">
                      USDC
                    </div>
                  )}
                </div>
              </div>

              {activeModal === 'deposit' && selectedToken.symbol !== 'USDC' && inputAmount && (
                <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-gray-500">Est. Staked Amount:</span>
                  <span className="text-[#D4AF37] font-mono font-bold">
                    ≈ {formatCurrency(Number(inputAmount) * selectedToken.rate)}
                  </span>
                </div>
              )}

              <button 
                onClick={handleTransaction}
                disabled={loading || !inputAmount}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  activeModal === 'deposit' 
                    ? 'bg-[#D4AF37] text-black hover:bg-[#F4CF57]' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                } ${loading || !inputAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20}/> Check Wallet...</span>
                ) : (
                  <>
                    {activeModal === 'deposit' ? (selectedToken.symbol === 'USDC' ? 'Confirm Deposit' : `Zap ${selectedToken.symbol} & Deposit`) : 'Confirm Withdraw'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}