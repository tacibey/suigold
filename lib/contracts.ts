// lib/contracts.ts

// --- COIN ADRESLERİ (Mainnet) ---
// USDC: Native USDC on Sui
export const COIN_USDC = "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
// XAUM: Tether Gold on Sui
export const COIN_XAUM = "0x9d297676e7a4b771ab023291377b2adfaa4938fb9080b8d12430e4b108b836a9::xaum::XAUM";
// SUI: Native Sui Token
export const COIN_SUI = "0x2::sui::SUI";

// --- STEAMM AYARLARI (Getiri İçin) ---

// Steamm XAUM-USDC Havuz ID'si (Objenin kendisi)
export const STEAMM_POOL_XAUM_USDC = "0x99d4165502ff327de1af387e70bb15eb1ed25349605912af6ca98e3ecad0da3d";

// Steamm Paket ID'si (Verdiğin Type string'inin en başındaki adres)
// Bu adres, "deposit_liquidity" fonksiyonunun yaşadığı yerdir.
export const STEAMM_PACKAGE_ID = "0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261";

// Fonksiyon İsimleri (Steamm Pool Script modülündeki fonksiyonlar)
export const FUNC_DEPOSIT = "deposit_liquidity";
export const FUNC_REDEEM = "redeem_liquidity";