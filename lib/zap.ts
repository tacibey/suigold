import { Transaction } from "@mysten/sui/transactions";
import { Aftermath } from "aftermath-ts-sdk";
import { 
    COIN_USDC, 
    COIN_XAUM, 
    STEAMM_PACKAGE_ID, 
    STEAMM_POOL_XAUM_USDC,
    FUNC_DEPOSIT
} from "./contracts";

// Aftermath SDK Başlatma (Mainnet)
const afSdk = new Aftermath("MAINNET");

export async function createZapTransaction(
    userAddress: string,
    amountTotalUSDC: number, // Kullanıcının girdiği toplam USDC (Örn: 100)
    usdcCoinId: string // Cüzdandaki USDC objesi
) {
    await afSdk.init(); // SDK'yı hazırla
    const router = afSdk.Router(); // Router modülünü al

    const tx = new Transaction();

    // 1. MİKTAR HESAPLAMA
    // 100 USDC geldi. ~49'unu XAUM yapacağız (Biraz pay bırakıyoruz slippage için).
    const amountBigInt = BigInt(Math.floor(amountTotalUSDC * 1_000_000)); 
    const amountToSwap = (amountBigInt * 49n) / 100n; // %49'unu swapla
    const amountToKeep = amountBigInt - amountToSwap; // %51'i kalsın

    // 2. SPLIT (Parayı Böl)
    // usdcCoinId'den swaplanacak miktarı ayırıyoruz.
    // coinToSwap -> Swap'a gidecek
    // coinToKeep -> Olduğu yerde (ana objede) kalacak
    const [coinToSwap] = tx.splitCoins(tx.object(usdcCoinId), [tx.pure.u64(amountToSwap)]);

    // 3. SWAP (Aftermath Aggregator - Bluefin/Cetus/vs. üzerinden)
    // En iyi rotayı bul (USDC -> XAUM)
    const route = await router.getCompleteTradeRouteGivenAmountIn({
        coinInType: COIN_USDC,
        coinOutType: COIN_XAUM,
        coinInAmount: amountToSwap,
        referrer: userAddress, // Opsiyonel
    });

    // Swap işlemini Transaction Block'a ekle
    // Bu fonksiyon, coinToSwap'i alır, XAUM'a çevirir ve 'coinXAUM' olarak bize verir.
    const coinXAUM = await router.addTransactionForCompleteTradeRoute({
        tx: tx,
        walletAddress: userAddress,
        completeRoute: route,
        coinInId: coinToSwap, // Bizim ayırdığımız coin
        slippage: 0.01, // %1 Slippage toleransı
    });

    // 4. DEPOSIT (Steamm Havuzuna Ekleme)
    // Elimizde artık gerçek XAUM (coinXAUM) ve kalan USDC (usdcCoinId) var.
    tx.moveCall({
        target: `${STEAMM_PACKAGE_ID}::pool_script::${FUNC_DEPOSIT}`,
        typeArguments: [COIN_XAUM, COIN_USDC], // Sıralamaya dikkat: A, B
        arguments: [
            tx.object(STEAMM_POOL_XAUM_USDC), // Havuz
            coinXAUM, // Swap'tan gelen Altın
            tx.object(usdcCoinId), // Elimizde kalan USDC
            tx.pure.u64(0), // Min A (Steamm hesaplasın veya 0 geçelim şimdilik)
            tx.pure.u64(0), // Min B
        ]
    });

    // 5. SONUÇ
    // İşlem bitince LP token kullanıcıya gider.
    // Artan USDC veya XAUM varsa cüzdana iade edilir.

    return tx;
}