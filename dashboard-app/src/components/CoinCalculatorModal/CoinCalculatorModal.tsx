import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { type TokenPrices } from '../../utils/priceService';
import styles from './CoinCalculatorModal.module.css';

interface CoinCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinPriceUsd: number;
  prices: TokenPrices;
}

export const CoinCalculatorModal: React.FC<CoinCalculatorModalProps> = ({
  isOpen,
  onClose,
  coinPriceUsd,
  prices
}) => {
  const [coinAmount, setCoinAmount] = useState<string>('1000');
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [tokenQuantity, setTokenQuantity] = useState<string>('100');

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync USD amount when COIN amount or price changes
  useEffect(() => {
    if (coinAmount && !isNaN(Number(coinAmount))) {
      setUsdAmount((Number(coinAmount) * coinPriceUsd).toFixed(4));
    } else {
      setUsdAmount('');
    }
  }, [coinAmount, coinPriceUsd]);

  // Handle entry animation with anime.js
  useEffect(() => {
    if (isOpen) {
      // Escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);

      // Animation
      anime.remove([overlayRef.current, modalRef.current]);
      
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });

      anime({
        targets: modalRef.current,
        scale: [0.92, 1],
        opacity: [0, 1],
        duration: 350,
        easing: 'easeOutBack'
      });

      return () => {
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCoinChange = (val: string) => {
    setCoinAmount(val);
    if (val && !isNaN(Number(val))) {
      setUsdAmount((Number(val) * coinPriceUsd).toFixed(4));
    } else {
      setUsdAmount('');
    }
  };

  const handleUsdChange = (val: string) => {
    setUsdAmount(val);
    if (val && !isNaN(Number(val)) && coinPriceUsd > 0) {
      setCoinAmount((Number(val) / coinPriceUsd).toFixed(2));
    } else {
      setCoinAmount('');
    }
  };

  const handleQuickAmount = (amount: number) => {
    handleCoinChange(amount.toString());
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Get tokens sorted alphabetically
  const tokenKeys = Object.keys(prices).sort();

  const selectedPriceData = selectedToken ? prices[selectedToken] : null;

  // Convert inputs to numbers
  const coinNum = Number(coinAmount) || 0;
  const tokenQtyNum = Number(tokenQuantity) || 0;

  // Formatting helpers
  const formatCoin = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const formatUsd = (num: number) => num.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>
            🪙 CALCULADORA DE DYNOCOINS
          </h2>
          <div className={styles.subtitle}>
            Precio de referencia: 1 COIN = {formatUsd(coinPriceUsd)} USD
          </div>
        </div>

        {/* Section 1: COIN <=> USD */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            🔄 Conversión de Divisas
          </h3>
          <div className={styles.converterRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Cantidad (COIN)</label>
              <input
                type="text"
                className={styles.inputField}
                value={coinAmount}
                onChange={(e) => handleCoinChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={styles.arrowSep}>⇄</div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Equivalente (USD)</label>
              <input
                type="text"
                className={styles.inputField}
                value={usdAmount}
                onChange={(e) => handleUsdChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className={styles.quickBtns}>
            {[100, 1000, 10000, 100000].map((amt) => (
              <button
                key={amt}
                className={`${styles.quickBtn} ${coinNum === amt ? styles.quickBtnActive : ''}`}
                onClick={() => handleQuickAmount(amt)}
              >
                {amt.toLocaleString()} COIN
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Token Selector & Price Details */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            📊 Valor de Recursos en el Mercado
          </h3>
          <select
            className={styles.tokenSelect}
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            <option value="">-- Selecciona un Recurso --</option>
            {tokenKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          {selectedPriceData ? (
            <>
              <div className={styles.priceGrid}>
                {/* Mid / Base Price */}
                <div className={styles.priceCard}>
                  <div className={styles.priceCardLabel}>Base (Mid)</div>
                  <div className={styles.priceCardCoin}>{formatCoin(selectedPriceData.mid)}</div>
                  <div className={styles.priceCardUsd}>{formatUsd(selectedPriceData.usdMid)}</div>
                </div>

                {/* Buy Price */}
                <div className={`${styles.priceCard} ${styles.priceBuy}`}>
                  <div className={styles.priceCardLabel}>Comprar (Buy)</div>
                  <div className={styles.priceCardCoin}>{formatCoin(selectedPriceData.buy)}</div>
                  <div className={styles.priceCardUsd}>{formatUsd(selectedPriceData.usdBuy)}</div>
                </div>

                {/* Sell Price */}
                <div className={`${styles.priceCard} ${styles.priceSell}`}>
                  <div className={styles.priceCardLabel}>Vender (Sell)</div>
                  <div className={styles.priceCardCoin}>{formatCoin(selectedPriceData.sell)}</div>
                  <div className={styles.priceCardUsd}>{formatUsd(selectedPriceData.usdSell)}</div>
                </div>
              </div>

              {/* Live calculations */}
              <div className={styles.section} style={{ marginTop: '16px', marginBottom: '0' }}>
                <div className={styles.converterRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Cantidad de {selectedToken}</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={tokenQuantity}
                      onChange={(e) => setTokenQuantity(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.arrowSep} style={{ color: 'var(--color-green)', textShadow: '0 0 8px rgba(57,255,20,0.5)' }}>⇄</div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Valor en COINs</label>
                    <div className={styles.inputField} style={{ background: 'rgba(57, 255, 20, 0.05)', borderColor: 'rgba(57, 255, 20, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {formatCoin(tokenQtyNum * selectedPriceData.mid)}
                    </div>
                  </div>
                </div>

                <div className={styles.conversionResult}>
                  <div className={styles.convResultLabel}>Simulación de Intercambio (VOYA Fee 2.5%):</div>
                  <div className={styles.convResultValue}>
                    • Costo para comprar {tokenQtyNum.toLocaleString()} {selectedToken}: {formatCoin(tokenQtyNum * selectedPriceData.buy)} COIN ({formatUsd(tokenQtyNum * selectedPriceData.usdBuy)})
                  </div>
                  <div className={styles.convResultValue}>
                    • Retorno por vender {tokenQtyNum.toLocaleString()} {selectedToken}: {formatCoin(tokenQtyNum * selectedPriceData.sell)} COIN ({formatUsd(tokenQtyNum * selectedPriceData.usdSell)})
                  </div>
                  {coinNum > 0 && (
                    <div className={styles.convResultSub} style={{ marginTop: '4px', borderTop: '1px solid rgba(57, 255, 20, 0.15)', paddingTop: '6px' }}>
                      Con tus {coinNum.toLocaleString()} COINs actuales, puedes COMPRAR aproximadamente{' '}
                      <strong style={{ color: 'var(--color-green)' }}>
                        {formatCoin(coinNum / selectedPriceData.buy)}
                      </strong>{' '}
                      unidades de {selectedToken}.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              Selecciona un recurso para ver la cotización y realizar cálculos de compra/venta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
